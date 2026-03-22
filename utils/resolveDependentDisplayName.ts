import type { Dependent } from "@/context/DependentContext";
import type { Task } from "@/context/tasksContext";

/**
 * Prefer a real assignee name when the task payload only had placeholders
 * (e.g. API returns assignments with user_id but no nested `user` object).
 */
export function resolveDependentDisplayName(task: Task, dependents: Dependent[]): string {
    const raw = (task.dependent ?? "").trim();
    if (raw && raw !== "Assigned Member") {
        return raw;
    }
    const uid = task.assignedUserIds?.[0];
    if (typeof uid === "number" && uid > 0) {
        const match = dependents.find((d) => d.userId === uid);
        if (match?.name?.trim()) {
            return match.name.trim();
        }
    }
    return raw || "Assigned Member";
}
