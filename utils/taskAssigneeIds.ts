/**
 * Normalize assignee identifiers from task list API payloads and from stored Task rows.
 * Backends vary: user_id, dependent_id, assigned_user_ids, nested user, etc.
 */

export function toPositiveInt(v: unknown): number | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "number" && Number.isInteger(v) && v > 0) return v;
    if (typeof v === "string" && v.trim()) {
        const n = parseInt(v.trim(), 10);
        if (Number.isInteger(n) && n > 0) return n;
    }
    return undefined;
}

export function collectIdsFromAssignmentLikeRow(row: any): number[] {
    if (!row || typeof row !== "object") return [];
    const out: number[] = [];
    const candidates = [
        row.user_id,
        row.user?.user_id,
        row.assigned_user_id,
        row.assignee_id,
        row.assignee_user_id,
        row.assignee?.user_id,
        row.dependent_id,
        row.dependent_profile_id,
        row.dependent_user_id,
        row.member_user_id,
        row.member_id,
        row.care_space_member_id,
        row.user?.id,
    ];
    for (const c of candidates) {
        const n = toPositiveInt(c);
        if (n) out.push(n);
    }
    return out;
}

/** Build `assignedUserIds` when mapping API → Task. */
export function extractAssigneeIdsFromApiPayload(apiTask: any): number[] | undefined {
    const ids = new Set<number>();
    const assignments = Array.isArray(apiTask?.assignments) ? apiTask.assignments : [];

    for (const a of assignments) {
        for (const n of collectIdsFromAssignmentLikeRow(a)) {
            ids.add(n);
        }
    }

    // List payloads often omit ids on assignments but include them on completions / schedules.
    if (Array.isArray(apiTask?.completions)) {
        for (const c of apiTask.completions) {
            for (const n of collectIdsFromAssignmentLikeRow(c)) {
                if (n) ids.add(n);
            }
            const n = toPositiveInt(c?.dependent_id ?? c?.dependent_profile_id ?? c?.user_id);
            if (n) ids.add(n);
        }
    }

    if (Array.isArray(apiTask?.schedules)) {
        for (const s of apiTask.schedules) {
            for (const n of collectIdsFromAssignmentLikeRow(s)) {
                if (n) ids.add(n);
            }
        }
    }

    const root = toPositiveInt(apiTask?.assigned_user_id);
    if (root) ids.add(root);

    if (Array.isArray(apiTask?.assigned_user_ids)) {
        for (const raw of apiTask.assigned_user_ids) {
            const n = toPositiveInt(raw);
            if (n) ids.add(n);
        }
    }

    // Task-level fields (list endpoints often put assignee ids here instead of inside `assignments`).
    const rootKeys = [
        "dependent_id",
        "dependent_profile_id",
        "dependent_user_id",
        "assignee_user_id",
        "assignee_id",
        "target_user_id",
        "recipient_user_id",
    ] as const;
    for (const k of rootKeys) {
        const n = toPositiveInt(apiTask?.[k]);
        if (n) ids.add(n);
    }
    const nestedUserId = toPositiveInt(apiTask?.user?.user_id ?? apiTask?.user?.id);
    if (nestedUserId) ids.add(nestedUserId);

    const out = [...ids];
    return out.length > 0 ? out : undefined;
}

/** Re-collect ids from a Task after merge (covers sparse `assignedUserIds` + raw `assignments`). */
export function collectAssigneeIdsFromTask(task: {
    assignedUserIds?: number[];
    assignments?: any[];
    completions?: any[];
    schedules?: any[];
}): number[] {
    const ids = new Set<number>();
    for (const x of task.assignedUserIds ?? []) {
        const n = toPositiveInt(x);
        if (n) ids.add(n);
    }
    if (Array.isArray(task.assignments)) {
        for (const a of task.assignments) {
            for (const n of collectIdsFromAssignmentLikeRow(a)) {
                ids.add(n);
            }
        }
    }
    if (Array.isArray(task.completions)) {
        for (const c of task.completions) {
            for (const n of collectIdsFromAssignmentLikeRow(c)) {
                ids.add(n);
            }
            const n = toPositiveInt(c?.dependent_id ?? c?.dependent_profile_id ?? c?.user_id);
            if (n) ids.add(n);
        }
    }
    if (Array.isArray(task.schedules)) {
        for (const s of task.schedules) {
            for (const n of collectIdsFromAssignmentLikeRow(s)) {
                ids.add(n);
            }
        }
    }
    return [...ids];
}
