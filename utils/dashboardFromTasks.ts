import type { Task } from "@/context/tasksContext";
import { computeComputedTaskStatus, parseLocalDueDateTime } from "@/utils/taskDueDate";

/** Aligns with `WeekSummaryCard` / dashboard `filter` query values. */
export type DashboardTimeFilter = "today" | "week" | "month";

function getWeekRange(reference: Date): { start: Date; end: Date } {
    const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

/** Same calendar rules as the Home screen task list (`isDueInSelectedRange`). */
export function isDueInTimeFilter(due: Date | null, filter: DashboardTimeFilter, now: Date): boolean {
    if (!due) return false;
    if (filter === "today") {
        return (
            due.getFullYear() === now.getFullYear() &&
            due.getMonth() === now.getMonth() &&
            due.getDate() === now.getDate()
        );
    }
    if (filter === "week") {
        const { start, end } = getWeekRange(now);
        const t = due.getTime();
        return t >= start.getTime() && t <= end.getTime();
    }
    return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth();
}

/**
 * Derives totals and completion % from `TasksContext` so dashboard cards match the task list.
 */
export function computeDashboardMetricsFromTasks(
    tasks: Task[],
    filter: DashboardTimeFilter,
    nowMs: number,
): { totalTasks: number; completedTasks: number; completionPercentage: number } {
    const now = new Date(nowMs);
    const rows = tasks.map((task) => {
        const due = parseLocalDueDateTime(task.dueDate, task.dueTime);
        const computedStatus = computeComputedTaskStatus(task.status, due, nowMs);
        return { due, computedStatus };
    });

    const inRange = rows.filter(({ due }) => isDueInTimeFilter(due, filter, now));
    const totalTasks = inRange.length;
    const completedTasks = inRange.filter((x) => x.computedStatus === "completed").length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { totalTasks, completedTasks, completionPercentage };
}
