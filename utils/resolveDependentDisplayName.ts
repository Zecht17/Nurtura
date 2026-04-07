import type { CareSpace } from "@/context/CareSpacesContext";
import type { Dependent } from "@/context/DependentContext";
import type { Task } from "@/context/tasksContext";
import { parseCareSpaceNumericIdFromString } from "@/utils/resolveTaskCareSpaceId";
import { collectAssigneeIdsFromTask, toPositiveInt } from "@/utils/taskAssigneeIds";

/** Logged-in user (e.g. dependent) — used when `/dependent-profiles/me/dependents` is empty. */
export type SelfDependentResolution = {
    userId: number;
    displayName: string;
};

export function selfDependentContextFromProfile(
    profile:
        | {
              user_id: number;
              first_name: string;
              middle_name?: string;
              last_name: string;
              role?: string;
          }
        | null
        | undefined,
): SelfDependentResolution | null {
    if (!profile || typeof profile.user_id !== "number" || !Number.isFinite(profile.user_id) || profile.user_id <= 0) {
        return null;
    }
    const role = (profile.role || "").trim().toLowerCase();
    if (role && role !== "dependent") {
        return null;
    }
    const displayName = [profile.first_name, profile.middle_name, profile.last_name]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    if (!displayName) return null;
    return { userId: profile.user_id, displayName };
}

function firstNameFromAssignmentRows(assignments: any[] | undefined): string | undefined {
    if (!Array.isArray(assignments)) return undefined;
    for (const a of assignments) {
        if (!a || typeof a !== "object") continue;
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
        const dependentDirect = [a.dependent_name, a.dependent_display_name].find(
            (v) => typeof v === "string" && v.trim().length > 0,
        ) as string | undefined;
        if (dependentDirect?.trim()) return dependentDirect.trim();
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

function hasAssigneeStructure(task: Task): boolean {
    return Boolean(
        (task.assignedUserIds && task.assignedUserIds.length > 0) ||
            (Array.isArray(task.assignments) && task.assignments.length > 0) ||
            (Array.isArray(task.completions) && task.completions.length > 0),
    );
}

/**
 * Prefer a real assignee name when the task payload only had placeholders
 * (e.g. API returns assignments with user_id but no nested `user` object).
 *
 * @param self — When set (from `/users/me`), tasks assigned to this user_id resolve to the profile name.
 *              Needed for `dependent` logins because `dependent-profiles/me/dependents` is empty for them.
 */
export function resolveDependentDisplayName(
    task: Task,
    dependents: Dependent[],
    self?: SelfDependentResolution | null,
    careSpaces?: CareSpace[],
): string {
    const raw = (task.dependent ?? "").trim();

    const fromAssignments = firstNameFromAssignmentRows(task.assignments);
    if (fromAssignments) {
        return fromAssignments;
    }

    const fromCompletions = firstNameFromAssignmentRows(task.completions);
    if (fromCompletions) {
        return fromCompletions;
    }

    const candidateIds = collectAssigneeIdsFromTask(task);

    if (self) {
        if (candidateIds.includes(self.userId)) {
            return self.displayName;
        }
        const isPlaceholder = !raw || raw === "Assigned Member";
        if (
            isPlaceholder &&
            dependents.length === 0 &&
            candidateIds.length === 0 &&
            hasAssigneeStructure(task)
        ) {
            return self.displayName;
        }
    }

    for (const uid of candidateIds) {
        const match = dependents.find((d) => dependentMatchesAssigneeId(d, uid));
        if (match?.name?.trim()) {
            return match.name.trim();
        }
    }

    if (Array.isArray(careSpaces) && typeof task.careSpaceId === "number" && task.careSpaceId > 0) {
        const careSpace = careSpaces.find(
            (item) => parseCareSpaceNumericIdFromString(item.id) === task.careSpaceId,
        );

        if (careSpace) {
            const careSpaceDependents = (careSpace.dependents || [])
                .map((dependent) => ({
                    userId: dependent.userId,
                    name: dependent.name?.trim() || "",
                }))
                .filter((dependent) => dependent.name.length > 0);

            for (const uid of candidateIds) {
                const matchedInCareSpace = careSpaceDependents.find(
                    (dependent) => typeof dependent.userId === "number" && dependent.userId === uid,
                );
                if (matchedInCareSpace) {
                    return matchedInCareSpace.name;
                }
            }

            const hasSingleCareSpaceDependent = careSpaceDependents.length === 1;
            if (hasSingleCareSpaceDependent && hasAssigneeStructure(task)) {
                const nonDependentMemberNames = [
                    ...(careSpace.familyMembers || []).map((member) => member.name),
                    ...(careSpace.caregivers || []).map((member) => member.name),
                ]
                    .map((name) => name.trim().toLowerCase())
                    .filter((name) => name.length > 0);

                const rawLower = raw.toLowerCase();
                const rawLooksLikeCaregiverOrOwner = rawLower.length > 0 && nonDependentMemberNames.includes(rawLower);
                const isPlaceholder = !raw || raw === "Assigned Member";

                if (isPlaceholder || rawLooksLikeCaregiverOrOwner) {
                    return careSpaceDependents[0].name;
                }
            }
        }
    }

    const isPlaceholder = !raw || raw === "Assigned Member";
    if (isPlaceholder && dependents.length === 1) {
        const only = dependents[0];
        const name = only?.name?.trim();
        if (name) {
            if (hasAssigneeStructure(task)) {
                return name;
            }
        }
    }

    return raw || "Assigned Member";
}
