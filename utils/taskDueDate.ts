/**
 * Local wall-clock due instant for overdue / "missing" UI.
 * Avoids relying on Date(string) for "YYYY-MM-DD 2:50 AM" (inconsistent on Hermes).
 */
export function parseLocalDueDateTime(dueDate?: string, dueTime?: string): Date | null {
    if (!dueDate?.trim()) return null;
    const dateStr = dueDate.trim();

    const ok = (d: Date) => (!isNaN(d.getTime()) ? d : null);

    if (dateStr.length > 10 && (dateStr.includes("T") || /^\d{4}-\d{2}-\d{2}T/.test(dateStr))) {
        return ok(new Date(dateStr));
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const combined = [dateStr, dueTime].filter(Boolean).join(" ");
        return ok(new Date(combined));
    }

    const y = parseInt(dateStr.slice(0, 4), 10);
    const mo = parseInt(dateStr.slice(5, 7), 10);
    const day = parseInt(dateStr.slice(8, 10), 10);
    if (Number.isNaN(y) || Number.isNaN(mo) || Number.isNaN(day)) return null;

    const timePart = dueTime && dueTime.trim().length > 0 ? dueTime.trim() : "23:59";

    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/i.exec(timePart);
    if (m) {
        let hour = parseInt(m[1], 10);
        const minute = parseInt(m[2], 10);
        const mer = m[4]?.toUpperCase();
        if (mer === "PM" && hour !== 12) hour += 12;
        if (mer === "AM" && hour === 12) hour = 0;
        const local = new Date(y, mo - 1, day, hour, minute, 0, 0);
        if (!isNaN(local.getTime())) return local;
    }

    const withSpace = new Date(`${dateStr} ${timePart}`);
    if (!isNaN(withSpace.getTime())) return withSpace;

    const parsedIso = new Date(`${dateStr}T${timePart}`);
    return ok(parsedIso);
}

export function computeComputedTaskStatus(
    taskStatus: string,
    due: Date | null,
    nowMs: number,
): "pending" | "completed" | "missing" {
    const s = (taskStatus || "pending").toLowerCase().trim();
    if (s === "completed") return "completed";
    if (s === "missing" || s === "missed") return "missing";
    if (s === "pending" && due && due.getTime() < nowMs) {
        return "missing";
    }
    return "pending";
}
