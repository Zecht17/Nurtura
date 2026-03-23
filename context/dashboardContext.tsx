import { API_URL, useAuth } from "@/context/AuthContext";
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type DashboardFilter = "today" | "week" | "month";

export type DashboardSummary = {
    totalTasks: number;
    completedTasks: number;
    /** 0–100 */
    completionPercentage: number;
};

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === "number" && Number.isFinite(v)) {
            return Math.round(v);
        }
        if (typeof v === "string" && v.trim() !== "") {
            const n = parseFloat(v.replace(/%/g, "").trim());
            if (Number.isFinite(n)) {
                return Math.round(n);
            }
        }
    }
    return null;
}

/** Normalize various backend shapes; computes % from counts when rate is missing. */
export function normalizeDashboardPayload(raw: unknown): DashboardSummary | null {
    if (raw == null) {
        return null;
    }

    let data: unknown = raw;
    if (typeof raw === "string") {
        try {
            data = JSON.parse(raw);
        } catch {
            return null;
        }
    }

    if (typeof data !== "object" || data === null) {
        return null;
    }

    const o = data as Record<string, unknown>;
    const nested =
        o.data && typeof o.data === "object" && o.data !== null
            ? (o.data as Record<string, unknown>)
            : o;

    let total = pickNumber(nested, [
        "total_tasks",
        "totalTasks",
        "total_count",
        "total",
        "tasks_total",
        "tasks_count",
        "all_tasks",
        "task_count",
    ]);
    let completed = pickNumber(nested, [
        "completed_tasks",
        "completedTasks",
        "completed_count",
        "completed",
        "tasks_completed",
        "done",
        "finished",
    ]);
    let pct = pickNumber(nested, [
        "completion_rate",
        "completion_percentage",
        "success_rate",
        "percentage",
        "progress",
        "completion_percent",
        "percent",
        "rate",
    ]);

    if (pct === null && total !== null && total > 0 && completed !== null) {
        pct = Math.round((completed / total) * 100);
    }
    if (pct === null) {
        pct = 0;
    }
    if (total === null) {
        total = 0;
    }
    if (completed === null) {
        completed = 0;
    }

    return {
        totalTasks: Math.max(0, total),
        completedTasks: Math.max(0, completed),
        completionPercentage: Math.min(100, Math.max(0, pct)),
    };
}

function parseApiError(responsePayload: unknown): string {
    if (responsePayload && typeof responsePayload === "object") {
        const d = responsePayload as { detail?: unknown; message?: unknown };
        if (Array.isArray(d.detail)) {
            return d.detail
                .map((item: { msg?: string }) => item?.msg)
                .filter(Boolean)
                .join(", ");
        }
        if (typeof d.detail === "string") {
            return d.detail;
        }
        if (typeof d.message === "string") {
            return d.message;
        }
    }
    return "Unable to load dashboard summary.";
}

type DashboardContextValue = {
    /** Cached summary per filter so Today / Week / Month cards do not overwrite each other */
    summaries: Partial<Record<DashboardFilter, DashboardSummary>>;
    loadingFilter: DashboardFilter | null;
    errors: Partial<Record<DashboardFilter, string | null>>;
    activeFilter: DashboardFilter | null;
    getSummary: (filter: DashboardFilter) => DashboardSummary | undefined;
    isLoadingFilter: (filter: DashboardFilter) => boolean;
    getError: (filter: DashboardFilter) => string | null | undefined;
    fetchSummary: (filter: DashboardFilter) => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { user, refreshAccessToken, logout } = useAuth();
    const [summaries, setSummaries] = useState<Partial<Record<DashboardFilter, DashboardSummary>>>({});
    const [loadingFilter, setLoadingFilter] = useState<DashboardFilter | null>(null);
    const [errors, setErrors] = useState<Partial<Record<DashboardFilter, string | null>>>({});
    const [activeFilter, setActiveFilter] = useState<DashboardFilter | null>(null);

    const getSummary = useCallback((filter: DashboardFilter) => summaries[filter], [summaries]);

    const isLoadingFilter = useCallback(
        (filter: DashboardFilter) => loadingFilter === filter,
        [loadingFilter],
    );

    const getError = useCallback(
        (filter: DashboardFilter) => errors[filter],
        [errors],
    );

    const fetchSummary = useCallback(
        async (filter: DashboardFilter) => {
            if (!user?.access_token) {
                setSummaries((prev) => ({ ...prev, [filter]: undefined }));
                setErrors((prev) => ({ ...prev, [filter]: null }));
                return;
            }

            setActiveFilter(filter);
            setLoadingFilter(filter);
            setErrors((prev) => ({ ...prev, [filter]: null }));

            const url = `${API_URL}/api/v1/dashboard/dashboard/summary?filter=${encodeURIComponent(filter)}`;

            const send = async (token: string) =>
                fetch(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

            try {
                let response = await send(user.access_token);

                if (response.status === 401) {
                    const refreshed = await refreshAccessToken();
                    if (!refreshed) {
                        await logout();
                        setErrors((prev) => ({
                            ...prev,
                            [filter]: "Session expired. Please log in again.",
                        }));
                        setSummaries((prev) => {
                            const next = { ...prev };
                            delete next[filter];
                            return next;
                        });
                        return;
                    }
                    response = await send(refreshed);
                }

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(parseApiError(data));
                }

                const normalized = normalizeDashboardPayload(data);
                if (normalized) {
                    setSummaries((prev) => ({ ...prev, [filter]: normalized }));
                    setErrors((prev) => ({ ...prev, [filter]: null }));
                } else {
                    setSummaries((prev) => {
                        const next = { ...prev };
                        delete next[filter];
                        return next;
                    });
                    setErrors((prev) => ({
                        ...prev,
                        [filter]: "Unexpected dashboard response format.",
                    }));
                }
            } catch (e) {
                setSummaries((prev) => {
                    const next = { ...prev };
                    delete next[filter];
                    return next;
                });
                setErrors((prev) => ({
                    ...prev,
                    [filter]: e instanceof Error ? e.message : parseApiError(null),
                }));
            } finally {
                setLoadingFilter((current) => (current === filter ? null : current));
            }
        },
        [user?.access_token, refreshAccessToken, logout],
    );

    const value = useMemo(
        () => ({
            summaries,
            loadingFilter,
            errors,
            activeFilter,
            getSummary,
            isLoadingFilter,
            getError,
            fetchSummary,
        }),
        [summaries, loadingFilter, errors, activeFilter, getSummary, isLoadingFilter, getError, fetchSummary],
    );

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) {
        throw new Error("useDashboard must be used within DashboardProvider");
    }
    return ctx;
}
