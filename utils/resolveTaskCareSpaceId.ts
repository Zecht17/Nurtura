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

function careSpaceFromRow(row: any): number | undefined {
    if (!row || typeof row !== "object") return undefined;
    const direct = Number(
        row.care_space_id ??
            row.careSpaceId ??
            row.care_space?.id ??
            row.care_space?.care_space_id,
    );
    if (Number.isInteger(direct) && direct > 0) {
        return direct;
    }
    return undefined;
}

function careSpaceFromRows(rows: any[] | undefined): number | undefined {
    if (!Array.isArray(rows)) return undefined;
    for (const row of rows) {
        const n = careSpaceFromRow(row);
        if (n !== undefined) return n;
    }
    return undefined;
}

/** Parse numeric task id for DELETE/detail APIs from route param or `task.id`. */
export function parseNumericTaskIdForApi(idParam?: string | null, taskId?: string | null): number | null {
    const raw = (idParam ?? taskId ?? "").trim();
    if (!raw) return null;
    const match = raw.match(/(\d+)/);
    if (!match) return null;
    const parsed = Number.parseInt(match[1], 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Numeric id from a Care Space context `id` string (e.g. `care-space-12` or trailing digits). */
export function parseCareSpaceNumericIdFromString(careSpaceIdStr: string): number | undefined {
    const match = careSpaceIdStr.match(/(\d+)$/);
    const n = match
        ? Number.parseInt(match[1], 10)
        : Number.parseInt(careSpaceIdStr.replace("care-space-", ""), 10);
    return Number.isInteger(n) && n > 0 ? n : undefined;
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
        /** When the user has exactly one care space, safe fallback if the task payload omitted `care_space_id`. */
        fallbackSingleCareSpaceNumericId?: number | null;
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

    const single = options?.fallbackSingleCareSpaceNumericId;
    const singleOk = typeof single === "number" && Number.isInteger(single) && single > 0 ? single : undefined;

    return firstPositiveInt(
        task?.careSpaceId,
        routeOk,
        filterOk,
        careSpaceFromRows(task?.assignments),
        careSpaceFromRows(task?.schedules),
        careSpaceFromRows(task?.completions),
        singleOk,
    );
}
