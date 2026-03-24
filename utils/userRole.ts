/** Aligns with signup/API role strings: `dependent` | `family_member` | `caregiver` */
export function normalizeUserRole(role: string | undefined | null): string {
  return (role ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function isDependentRole(role: string | undefined | null): boolean {
  return normalizeUserRole(role) === "dependent";
}
