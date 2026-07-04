export const USER_ROLES = [
  "super_admin",
  "admin",
  "photographer",
  "editor",
  "receptionist",
  "viewer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type RbacUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: unknown;
  updatedAt: unknown;
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "super_admin" || role === "admin";
}
