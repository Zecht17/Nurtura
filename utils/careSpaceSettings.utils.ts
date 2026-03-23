export type RoleLabel = "Owner" | "Editor" | "Viewer";

export type PersonWithRole = {
    memberId?: number;
    initial: string;
    name: string;
    role: RoleLabel;
    note?: string;
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

export const getParamValue = (value?: string | string[]) => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
};

export const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
};

export const parseDependentNames = (value?: string | string[]) => {
    const raw = getParamValue(value);

    if (!raw) {
        return ["Emma Johnson"];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return ["Emma Johnson"];
        }

        const normalized = parsed
            .filter((item): item is string => typeof item === "string")
            .map((name) => name.trim())
            .filter((name) => name.length > 0);

        return normalized;
    } catch {
        return ["Emma Johnson"];
    }
};

export const parsePeopleWithRole = (value: string | string[] | undefined, fallback: PersonWithRole[]) => {
    const raw = getParamValue(value);

    if (!raw) {
        return fallback;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return fallback;
        }

        const normalized = parsed
            .filter((item): item is PersonWithRole => typeof item === "object" && item !== null)
            .map((item) => ({
                memberId: typeof (item as { memberId?: unknown }).memberId === "number" ? (item as { memberId: number }).memberId : undefined,
                initial: typeof item.initial === "string" ? item.initial : getInitial(typeof item.name === "string" ? item.name : ""),
                name: typeof item.name === "string" ? item.name : "Unknown",
                role: item.role === "Owner" || item.role === "Editor" || item.role === "Viewer" ? item.role : "Viewer",
                note: typeof item.note === "string" ? item.note : undefined,
            }))
            .filter((item) => item.name.trim().length > 0);

        return normalized;
    } catch {
        return fallback;
    }
};

export const parseCareTasks = (value?: string | string[]) => {
    const raw = getParamValue(value);

    if (!raw) {
        return [] as CareSpaceTask[];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [] as CareSpaceTask[];
        }

        return parsed
            .filter((item): item is CareSpaceTask => typeof item === "object" && item !== null)
            .map((item, index) => ({
                id: typeof item.id === "string" ? item.id : `task-${index}`,
                title: typeof item.title === "string" ? item.title : "Untitled Task",
                dependent: typeof item.dependent === "string" ? item.dependent : "Unknown",
                description: typeof item.description === "string" ? item.description : "",
                status: item.status === "pending" || item.status === "completed" || item.status === "missing" ? item.status : "pending",
                dueDate: typeof item.dueDate === "string" ? item.dueDate : undefined,
                dueTime: typeof item.dueTime === "string" ? item.dueTime : undefined,
                priority: typeof item.priority === "string" ? item.priority : undefined,
                recurringPattern: typeof item.recurringPattern === "string" || item.recurringPattern === null ? item.recurringPattern : undefined,
            }));
    } catch {
        return [] as CareSpaceTask[];
    }
};
