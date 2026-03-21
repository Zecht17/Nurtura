import React, { ReactNode, createContext, useContext, useMemo, useState } from "react";

export type RoleLabel = "Owner" | "Editor" | "Viewer";

export type PersonWithRole = {
    initial: string;
    name: string;
    role: RoleLabel;
    note?: string;
};

export type DependentPerson = {
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
    familyMembers: PersonWithRole[];
    caregivers: PersonWithRole[];
    dependents: DependentPerson[];
    tasks: CareSpaceTask[];
};

type CreateCareSpacePayload = {
    name: string;
    description: string;
    type: string;
    selectedDependent: string | null;
};

type CareSpacesContextValue = {
    careSpaces: CareSpace[];
    createCareSpace: (payload: CreateCareSpacePayload) => void;
    updateCareSpaceInfo: (id: string, updates: { title?: string; description?: string }) => void;
    addDependentToCareSpace: (id: string, dependentName: string) => void;
    removeTaskFromCareSpace: (id: string, taskId: string) => void;
};

const CareSpacesContext = createContext<CareSpacesContextValue | undefined>(undefined);

const getInitialFromName = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
};

const defaultCareSpaces: CareSpace[] = [
    {
        id: "default-emma-care",
        title: "Emma's Care",
        description: "Emma Care",
        familyMembers: [
            { initial: "Y", name: "You", role: "Owner" },
            { initial: "R", name: "Ralph Jayrell", role: "Editor", note: "Backup" },
        ],
        caregivers: [
            { initial: "J", name: "John Doe", role: "Owner" },
            { initial: "R", name: "Ralph Jayrell", role: "Editor", note: "Backup" },
        ],
        dependents: [
            { initial: "J", name: "John Doe" },
            { initial: "R", name: "Ralph Jayrell" },
        ],
        tasks: [
            {
                id: "eat-lunch",
                title: "Eat Lunch",
                dependent: "Jirah Denisse",
                description: "Eat Lunch with Jirah at 12 PM",
                status: "pending",
                priority: "High",
                recurringPattern: "Weekly",
            },
        ],
    },
];

export function CareSpacesProvider({ children }: { children: ReactNode }) {
    const [careSpaces, setCareSpaces] = useState<CareSpace[]>(defaultCareSpaces);

    const createCareSpace = (payload: CreateCareSpacePayload) => {
        const trimmedName = payload.name.trim();
        const title = trimmedName.length > 0 ? trimmedName : "Untitled Care Space";
        const description = payload.description.trim() || "No description yet";
        const selectedDependentName = payload.selectedDependent?.trim() ?? "";

        const newCareSpace: CareSpace = {
            id: `care-space-${Date.now()}`,
            title,
            description,
            familyMembers: [{ initial: "Y", name: "You", role: "Owner" }],
            caregivers: [],
            dependents: selectedDependentName
                ? [{ initial: getInitialFromName(selectedDependentName), name: selectedDependentName }]
                : [],
            tasks: [],
        };

        setCareSpaces((prev) => [newCareSpace, ...prev]);
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

    const value = useMemo(
        () => ({
            careSpaces,
            createCareSpace,
            updateCareSpaceInfo,
            addDependentToCareSpace,
            removeTaskFromCareSpace,
        }),
        [careSpaces],
    );

    return <CareSpacesContext.Provider value={value}>{children}</CareSpacesContext.Provider>;
}

export function useCareSpaces() {
    const context = useContext(CareSpacesContext);

    if (!context) {
        throw new Error("useCareSpaces must be used within a CareSpacesProvider");
    }

    return context;
}
