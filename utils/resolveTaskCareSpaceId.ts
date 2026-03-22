import type { Task } from "@/context/tasksContext";

function firstPositiveInt(...vals: unknown[]): number | undefined {
    for (const v of vals) {
        if (v === null || v === undefined || v === "") continue;
        const n = typeof v === "number" ? v : Number(v);
        if (Number.isInteger(n) && n > 0) {
            return n;
        }
    }
    return undefined;
}

function careSpaceFromRows(rows: any[] | undefined): number | undefined {
    if (!Array.isArray(rows)) return undefined;
    for (const row of rows) {
        const n = Number(row?.care_space_id);
        if (Number.isInteger(n) && n > 0) {
            return n;
        }
    }
    return undefined;
}

/**
 * Resolves `care_space_id` for API calls (e.g. DELETE task) when the task row
 * omits top-level `care_space_id` but nested assignments/schedules/completions include it.
 */
export function resolveTaskCareSpaceId(
    task: Task | undefined,
    options?: {
        /** Route param from taskDetails / navigation */
        routeCareSpaceId?: string | number | null;
        /** Tasks screen: non-null when a single care space is selected in the filter */
        filterCareSpaceId?: number | null;
    },
): number | undefined {
    const rawRoute = options?.routeCareSpaceId;
    const parsedRoute =
        rawRoute === null || rawRoute === undefined || rawRoute === ""
            ? undefined
            : Number(rawRoute);
    const routeOk =
        parsedRoute !== undefined && Number.isInteger(parsedRoute) && parsedRoute > 0 ? parsedRoute : undefined;

    const f = options?.filterCareSpaceId;
    const filterOk = typeof f === "number" && Number.isInteger(f) && f > 0 ? f : undefined;

    return firstPositiveInt(
        task?.careSpaceId,
        routeOk,
        filterOk,
        careSpaceFromRows(task?.assignments),
        careSpaceFromRows(task?.completions),
    );
}
