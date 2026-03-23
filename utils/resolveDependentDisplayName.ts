import type { Dependent } from "@/context/DependentContext";
import type { Task } from "@/context/tasksContext";
import { collectAssigneeIdsFromTask, toPositiveInt } from "@/utils/taskAssigneeIds";

function firstNameFromAssignmentRows(assignments: any[] | undefined): string | undefined {
    if (!Array.isArray(assignments)) return undefined;
    for (const a of assignments) {
        if (!a || typeof a !== "object") continue;
        const u = a.user;
        if (u && typeof u === "object") {
            const fullName = [u.first_name, u.middle_name, u.last_name]
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();
            if (fullName) return fullName;
            if (typeof u.username === "string" && u.username.trim()) {
                return u.username.trim();
            }
        }
        const dep = a.dependent;
        if (dep && typeof dep === "object") {
            const nested = [dep.first_name, dep.middle_name, dep.last_name]
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();
            if (nested) return nested;
            if (typeof dep.name === "string" && dep.name.trim()) return dep.name.trim();
        }
        const direct = [a.dependent_name, a.assignee_name, a.member_name, a.full_name, a.display_name, a.name].find(
            (v) => typeof v === "string" && v.trim().length > 0,
        ) as string | undefined;
        if (direct?.trim()) return direct.trim();
    }
    return undefined;
}

function dependentMatchesAssigneeId(d: Dependent, uid: number): boolean {
    const u = Number(uid);
    if (!Number.isFinite(u) || u <= 0) return false;

    for (const x of [d.userId, d.dependentId]) {
        if (x == null) continue;
        const n = Number(x);
        if (Number.isFinite(n) && n > 0 && n === u) return true;
    }

    const fromDepString = typeof d.id === "string" && d.id.startsWith("dep-") ? toPositiveInt(d.id.slice(4)) : undefined;
    if (fromDepString !== undefined && fromDepString === u) return true;

    return false;
}

/**
 * Prefer a real assignee name when the task payload only had placeholders
 * (e.g. API returns assignments with user_id but no nested `user` object).
 */
export function resolveDependentDisplayName(task: Task, dependents: Dependent[]): string {
    const raw = (task.dependent ?? "").trim();
    if (raw && raw !== "Assigned Member") {
        return raw;
    }

    const fromAssignments = firstNameFromAssignmentRows(task.assignments);
    if (fromAssignments) {
        return fromAssignments;
    }

    const candidateIds = collectAssigneeIdsFromTask(task);
    for (const uid of candidateIds) {
        const match = dependents.find((d) => dependentMatchesAssigneeId(d, uid));
        if (match?.name?.trim()) {
            return match.name.trim();
        }
    }

    // Single-dependent households: list payloads sometimes omit ids we can match; if the task clearly
    // has assignee rows/ids but resolution failed, show the only dependent rather than a placeholder.
    const isPlaceholder = !raw || raw === "Assigned Member";
    if (isPlaceholder && dependents.length === 1) {
        const only = dependents[0];
        const name = only?.name?.trim();
        if (name) {
            const hasAssigneeStructure =
                (task.assignedUserIds && task.assignedUserIds.length > 0) ||
                (Array.isArray(task.assignments) && task.assignments.length > 0) ||
                (Array.isArray(task.completions) && task.completions.length > 0);
            if (hasAssigneeStructure) {
                return name;
            }
        }
    }

    return raw || "Assigned Member";
}
