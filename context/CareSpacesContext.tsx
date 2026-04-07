import { API_URL, useAuth } from "@/context/AuthContext";
import { useDependents } from "@/context/DependentContext";
import { useUser } from "@/context/UserContext";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

export type RoleLabel = "Owner" | "Editor" | "Viewer";

export type PersonWithRole = {
    memberId?: number;
    userId?: number;
    initial: string;
    name: string;
    role: RoleLabel;
    note?: string;
};

export type DependentPerson = {
    userId?: number;
    initial: string;
    name: string;
};

export type CareSpaceTask = {
    id: string;
    title: string;
    dependent: string;
    description: string;
    status: "pending" | "completed" | "missing";
    dueDate?: string;
    dueTime?: string;
    priority?: string;
    recurringPattern?: string | null;
};

export type CareSpace = {
    id: string;
    title: string;
    description: string;
    currentUserRole?: RoleLabel;
    familyMembers: PersonWithRole[];
    caregivers: PersonWithRole[];
    dependents: DependentPerson[];
    tasks: CareSpaceTask[];
};

export type CreateCareSpacePayload = {
    name: string;
    description: string;
    dependent_user_ids: number[];
};

export type UpdateCareSpacePayload = {
    name: string;
    description: string;
};

export type UpdateCareSpaceMemberPayload = {
    role_in_space: "viewer" | "editor" | "owner";
};

type CareSpacesContextValue = {
    careSpaces: CareSpace[];
    loadingCareSpaces: boolean;
    careSpacesError: string | null;
    fetchMyCareSpaces: () => Promise<void>;
    createCareSpace: (payload: CreateCareSpacePayload) => Promise<void>;
    updateCareSpace: (careSpaceId: number, payload: UpdateCareSpacePayload) => Promise<void>;
    deleteCareSpace: (careSpaceId: number) => Promise<string>;
    addMembersToCareSpaceBulk: (careSpaceId: number, userIds: number[]) => Promise<void>;
    updateCareSpaceMember: (memberId: number, payload: UpdateCareSpaceMemberPayload) => Promise<void>;
    removeCareSpaceMember: (memberId: number) => Promise<string>;
    joinCareSpaceViaCode: (code: string) => Promise<void>;
    generateJoinCode: (careSpaceId: number, role: string) => Promise<string>;
    updateCareSpaceInfo: (id: string, updates: { title?: string; description?: string }) => void;
    addDependentToCareSpace: (id: string, dependentName: string) => void;
    removeTaskFromCareSpace: (id: string, taskId: string) => void;
};

const CareSpacesContext = createContext<CareSpacesContextValue | undefined>(undefined);

const getInitialFromName = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
};

const toRoleLabel = (roleInSpace?: string): RoleLabel => {
    const normalized = (roleInSpace || "").toLowerCase();

    if (normalized === "owner") {
        return "Owner";
    }

    if (normalized === "editor") {
        return "Editor";
    }

    return "Viewer";
};

const isDependentMember = (member: { user?: { role?: string } }) => {
    return (member?.user?.role || "").toLowerCase() === "dependent";
};

const buildDisplayName = (user?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    username?: string;
}) => {
    const fullName = [user?.first_name, user?.middle_name, user?.last_name]
        .filter((part) => !!part)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

    return fullName || user?.username || "Unknown Member";
};

const parseApiError = (responsePayload: any): string => {
    if (Array.isArray(responsePayload?.detail)) {
        return responsePayload.detail.map((item: any) => item?.msg).filter(Boolean).join(", ");
    }

    if (typeof responsePayload?.detail === "string") {
        return responsePayload.detail;
    }

    if (typeof responsePayload?.message === "string") {
        return responsePayload.message;
    }

    return "Unable to process care spaces request.";
};

const defaultCareSpaces: CareSpace[] = [];

type CareSpaceApiUser = {
    user_id?: number;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    username?: string;
    role?: string;
};

type CareSpaceApiMember = {
    member_id?: number;
    role_in_space?: string;
    user_id?: number;
    user?: CareSpaceApiUser;
};

type CareSpaceApiItem = {
    care_space_id?: number;
    creator_id?: number;
    name?: string;
    description?: string;
    creator?: CareSpaceApiUser;
    members?: CareSpaceApiMember[];
};

const getMemberUserId = (member: CareSpaceApiMember) => {
    return member.user?.user_id ?? member.user_id;
};

export function CareSpacesProvider({ children }: { children: ReactNode }) {
    const [careSpaces, setCareSpaces] = useState<CareSpace[]>(defaultCareSpaces);
    const [loadingCareSpaces, setLoadingCareSpaces] = useState(false);
    const [careSpacesError, setCareSpacesError] = useState<string | null>(null);
    const { user, authChecking, refreshAccessToken, logout } = useAuth();
    const { profileData } = useUser();
    const { dependents } = useDependents();

    const mapApiCareSpaceToState = (item: CareSpaceApiItem): CareSpace => {
        const members = Array.isArray(item.members) ? item.members : [];
        const creatorUserId = item.creator?.user_id ?? item.creator_id;

        const ownerMember = members.find((member) => (member?.role_in_space || "").toLowerCase() === "owner");
        const ownerName = ownerMember ? buildDisplayName(ownerMember.user) : buildDisplayName(item.creator);

        const currentUserMember = members.find((member) => {
            const memberUserId = getMemberUserId(member);
            return typeof profileData?.user_id === "number" && memberUserId === profileData.user_id;
        });

        const currentUserRole = currentUserMember
            ? toRoleLabel(currentUserMember.role_in_space)
            : typeof profileData?.user_id === "number" && typeof creatorUserId === "number" && profileData.user_id === creatorUserId
                ? "Owner"
                : undefined;

        const caregivers: PersonWithRole[] = members
            .filter((member) => (member?.role_in_space || "").toLowerCase() !== "owner")
            .filter((member) => !isDependentMember(member))
            .map((member) => {
                const displayName = buildDisplayName(member.user);

                return {
                    memberId: member.member_id,
                    userId: getMemberUserId(member),
                    initial: getInitialFromName(displayName),
                    name: displayName,
                    role: toRoleLabel(member.role_in_space),
                };
            });

        const dependentMembers = members.filter((member) => isDependentMember(member));

        const localDependentsByUserId = new Map(
            dependents
                .map((dependent) => {
                    const dependentUserId = dependent.userId ?? dependent.dependentId;
                    return typeof dependentUserId === "number" ? [dependentUserId, dependent.name] : null;
                })
                .filter((item): item is [number, string] => !!item),
        );

        const dependentEntries = dependentMembers
            .map((member) => {
                const memberUserId = getMemberUserId(member);
                const localName = typeof memberUserId === "number" ? localDependentsByUserId.get(memberUserId) : undefined;
                const fallbackName = buildDisplayName(member.user);
                const name = (localName || fallbackName).trim();

                return {
                    userId: typeof memberUserId === "number" ? memberUserId : undefined,
                    name,
                };
            })
            .filter((entry) => entry.name.length > 0);

        const dependentMap = new Map<string, DependentPerson>();
        dependentEntries.forEach((entry) => {
            const key = typeof entry.userId === "number" ? `id-${entry.userId}` : `name-${entry.name.toLowerCase()}`;
            if (dependentMap.has(key)) {
                return;
            }

            dependentMap.set(key, {
                userId: entry.userId,
                initial: getInitialFromName(entry.name),
                name: entry.name,
            });
        });

        const careSpaceDependents: DependentPerson[] = Array.from(dependentMap.values());

        return {
            id: `care-space-${item.care_space_id ?? Date.now()}`,
            title: (item.name || "Untitled Care Space").trim(),
            description: (item.description || "No description yet").trim(),
            currentUserRole,
            familyMembers: [
                {
                    memberId: ownerMember?.member_id,
                    userId: ownerMember ? getMemberUserId(ownerMember) : creatorUserId,
                    initial: getInitialFromName(ownerName),
                    name: ownerName,
                    role: "Owner",
                },
            ],
            caregivers,
            dependents: careSpaceDependents,
            tasks: [],
        };
    };

    const fetchMyCareSpaces = async () => {
        if (!user?.access_token) {
            setCareSpaces([]);
            setCareSpacesError(null);
            return;
        }

        setLoadingCareSpaces(true);
        setCareSpacesError(null);

        const sendFetchRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-spaces/my-care-spaces`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        };

        try {
            let response = await sendFetchRequest(user.access_token);

            if (response.status === 401) {
                const refreshedToken = await refreshAccessToken();

                if (!refreshedToken) {
                    await logout();
                    setCareSpaces([]);
                    setCareSpacesError("Session expired. Please log in again.");
                    return;
                }

                response = await sendFetchRequest(refreshedToken);
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(parseApiError(data));
            }

            const items: CareSpaceApiItem[] = Array.isArray(data) ? data : [];
            setCareSpaces(items.map((item) => mapApiCareSpaceToState(item)));
        } catch (error) {
            setCareSpacesError((error as Error).message || "Unable to fetch care spaces.");
        } finally {
            setLoadingCareSpaces(false);
        }
    };

    const createCareSpace = async (payload: CreateCareSpacePayload) => {
        const trimmedName = payload.name.trim();
        if (!trimmedName) {
            throw new Error("Care space name is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to create a care space.");
        }

        const requestBody: CreateCareSpacePayload = {
            name: trimmedName,
            description: payload.description.trim(),
            dependent_user_ids: payload.dependent_user_ids.filter(
                (id, index, ids) => Number.isInteger(id) && id > 0 && ids.indexOf(id) === index,
            ),
        };

        const sendCreateRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-spaces/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendCreateRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendCreateRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        const selectedDependents: DependentPerson[] = dependents
            .filter((dependent) => {
                const dependentUserId = dependent.userId ?? dependent.dependentId;
                return typeof dependentUserId === "number" && requestBody.dependent_user_ids.includes(dependentUserId);
            })
            .map((dependent) => ({
                userId: dependent.userId ?? dependent.dependentId,
                initial: getInitialFromName(dependent.name),
                name: dependent.name,
            }));

        const creatorName = buildDisplayName(data?.creator);
        const ownerFromMembers = Array.isArray(data?.members)
            ? data.members.find((member: any) => (member?.role_in_space || "").toLowerCase() === "owner")
            : null;

        const ownerName = ownerFromMembers ? buildDisplayName(ownerFromMembers.user) : creatorName;

        const caregivers: PersonWithRole[] = Array.isArray(data?.members)
            ? data.members
                  .filter((member: any) => (member?.role_in_space || "").toLowerCase() !== "owner")
                  .filter((member: any) => !isDependentMember(member))
                  .map((member: any) => {
                      const displayName = buildDisplayName(member?.user);

                      return {
                          memberId: typeof member?.member_id === "number" ? member.member_id : undefined,
                          initial: getInitialFromName(displayName),
                          name: displayName,
                          role: toRoleLabel(member?.role_in_space),
                      };
                  })
            : [];

        const newCareSpace: CareSpace = {
            id: `care-space-${data?.care_space_id ?? Date.now()}`,
            title: (data?.name || trimmedName).trim(),
            description: (data?.description || requestBody.description || "No description yet").trim(),
            currentUserRole: "Owner",
            familyMembers: [
                {
                    memberId: typeof ownerFromMembers?.member_id === "number" ? ownerFromMembers.member_id : undefined,
                    userId: typeof ownerFromMembers?.user?.user_id === "number"
                        ? ownerFromMembers.user.user_id
                        : typeof ownerFromMembers?.user_id === "number"
                            ? ownerFromMembers.user_id
                            : typeof data?.creator?.user_id === "number"
                                ? data.creator.user_id
                                : undefined,
                    initial: getInitialFromName(ownerName),
                    name: ownerName,
                    role: "Owner",
                },
            ],
            caregivers,
            dependents: selectedDependents,
            tasks: [],
        };

        setCareSpaces((prev) => [newCareSpace, ...prev]);
    };

    const updateCareSpace = async (careSpaceId: number, payload: UpdateCareSpacePayload) => {
        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("Invalid care space ID.");
        }

        const trimmedName = payload.name.trim();
        if (!trimmedName) {
            throw new Error("Care space name is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to update this care space.");
        }

        const requestBody: UpdateCareSpacePayload = {
            name: trimmedName,
            description: payload.description.trim(),
        };

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-spaces/${careSpaceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        setCareSpaces((prev) =>
            prev.map((space) => {
                const numericId = Number.parseInt(space.id.replace("care-space-", ""), 10);
                if (numericId !== careSpaceId) {
                    return space;
                }

                return {
                    ...space,
                    title: (data?.name || requestBody.name).trim(),
                    description: (data?.description || requestBody.description || "No description yet").trim(),
                };
            }),
        );
    };

    const deleteCareSpace = async (careSpaceId: number) => {
        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("Invalid care space ID.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to delete this care space.");
        }

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-spaces/${careSpaceId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        setCareSpaces((prev) =>
            prev.filter((space) => Number.parseInt(space.id.replace("care-space-", ""), 10) !== careSpaceId),
        );

        if (typeof data === "string") {
            return data;
        }

        if (typeof data?.message === "string") {
            return data.message;
        }

        return "Care space deleted.";
    };

    const addMembersToCareSpaceBulk = async (careSpaceId: number, userIds: number[]) => {
        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("Invalid care space ID.");
        }

        const sanitizedUserIds = userIds.filter(
            (id, index, ids) => Number.isInteger(id) && id > 0 && ids.indexOf(id) === index,
        );

        if (sanitizedUserIds.length === 0) {
            throw new Error("At least one member user ID is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to add members.");
        }

        const requestBody = {
            care_space_id: careSpaceId,
            user_ids: sanitizedUserIds,
        };

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-space-members/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        await fetchMyCareSpaces();
    };

    const updateCareSpaceMember = async (memberId: number, payload: UpdateCareSpaceMemberPayload) => {
        if (!Number.isInteger(memberId) || memberId <= 0) {
            throw new Error("Invalid member ID.");
        }

        const normalizedRole = payload.role_in_space.trim().toLowerCase();
        if (normalizedRole !== "viewer" && normalizedRole !== "editor" && normalizedRole !== "owner") {
            throw new Error("Invalid role selected.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to update this member.");
        }

        const requestBody: UpdateCareSpaceMemberPayload = {
            role_in_space: normalizedRole,
        };

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-space-members/${memberId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        await fetchMyCareSpaces();
    };

    const removeCareSpaceMember = async (memberId: number) => {
        if (!Number.isInteger(memberId) || memberId <= 0) {
            throw new Error("Invalid member ID.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to remove this member.");
        }

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-space-members/${memberId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        await fetchMyCareSpaces();

        if (typeof data === "string") {
            return data;
        }

        if (typeof data?.message === "string") {
            return data.message;
        }

        return "Member removed.";
    };

    const generateJoinCode = async (careSpaceId: number, role: string) => {
        if (!Number.isInteger(careSpaceId) || careSpaceId <= 0) {
            throw new Error("Invalid care space ID.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to generate an invite code.");
        }

        const normalizedRole = role.trim().toLowerCase();
        if (!normalizedRole) {
            throw new Error("Role is required.");
        }

        const requestBody = {
            care_space_id: careSpaceId,
            role: normalizedRole,
        };

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-spaces/${careSpaceId}/generate-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        if (typeof data === "string") {
            return data;
        }

        if (typeof data?.code === "string") {
            return data.code;
        }

        throw new Error("Unable to generate invite code.");
    };

    const joinCareSpaceViaCode = async (code: string) => {
        const normalizedCode = code.trim();

        if (!normalizedCode) {
            throw new Error("Care space code is required.");
        }

        if (!user?.access_token) {
            throw new Error("Please log in again to join a care space.");
        }

        const requestBody = { code: normalizedCode };

        const sendRequest = async (accessToken: string) => {
            return fetch(`${API_URL}/api/v1/care-spaces/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
        };

        let response = await sendRequest(user.access_token);

        if (response.status === 401) {
            const refreshedToken = await refreshAccessToken();

            if (!refreshedToken) {
                await logout();
                throw new Error("Session expired. Please log in again.");
            }

            response = await sendRequest(refreshedToken);
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(parseApiError(data));
        }

        await fetchMyCareSpaces();
    };

    const updateCareSpaceInfo = (id: string, updates: { title?: string; description?: string }) => {
        setCareSpaces((prev) =>
            prev.map((space) => (space.id === id ? { ...space, ...updates } : space)),
        );
    };

    const addDependentToCareSpace = (id: string, dependentName: string) => {
        const trimmedName = dependentName.trim();
        if (!trimmedName) {
            return;
        }

        setCareSpaces((prev) =>
            prev.map((space) => {
                if (space.id !== id) {
                    return space;
                }

                const exists = space.dependents.some(
                    (dependent) => dependent.name.toLowerCase() === trimmedName.toLowerCase(),
                );

                if (exists) {
                    return space;
                }

                return {
                    ...space,
                    dependents: [
                        ...space.dependents,
                        {
                            initial: getInitialFromName(trimmedName),
                            name: trimmedName,
                        },
                    ],
                };
            }),
        );
    };

    const removeTaskFromCareSpace = (id: string, taskId: string) => {
        setCareSpaces((prev) =>
            prev.map((space) =>
                space.id === id
                    ? { ...space, tasks: space.tasks.filter((task) => task.id !== taskId) }
                    : space,
            ),
        );
    };

    useEffect(() => {
        if (authChecking) {
            return;
        }

        if (!user?.access_token) {
            setCareSpaces([]);
            setCareSpacesError(null);
            return;
        }

        fetchMyCareSpaces();
    }, [authChecking, user?.access_token, dependents, profileData?.user_id]);

    const value = {
        careSpaces,
        loadingCareSpaces,
        careSpacesError,
        fetchMyCareSpaces,
        createCareSpace,
        updateCareSpace,
        deleteCareSpace,
        addMembersToCareSpaceBulk,
        updateCareSpaceMember,
        removeCareSpaceMember,
        joinCareSpaceViaCode,
        generateJoinCode,
        updateCareSpaceInfo,
        addDependentToCareSpace,
        removeTaskFromCareSpace,
    };

    return <CareSpacesContext.Provider value={value}>{children}</CareSpacesContext.Provider>;
}

export function useCareSpaces() {
    const context = useContext(CareSpacesContext);

    if (!context) {
        throw new Error("useCareSpaces must be used within a CareSpacesProvider");
    }

    return context;
}
