import { User } from "@/context/AuthContext";

export type DashboardRole = "admin" | "staff" | "developer";

export interface RoleConfig{
    id: DashboardRole;
    label: string;
    description: string;
    badgeColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

}

export const ROLE_CONFIGS: Record<DashboardRole, RoleConfig> = {
    staff: {
        id: "staff",
        label: "Staff View",
        description: "Personal Document Management",
        badgeColor: "info",
    },
    admin: {
        id: "admin",
        label: "Admin View",
        description: "Admin Officer, Document Management",
        badgeColor: "primary",
    },
    developer: {
        id: "developer",
        label: "Super Admin View",
        description: "System Oversight & Engineering",
        badgeColor: "warning",
    },
};

export function getDefaultRole(user: User | null): DashboardRole {
    if (!user) {
        return "staff";
    }

    // 1. Role 1 and True Super User -> Super Admin / Developer
    if (user.system_role_id === 1 && user.is_superuser) {
        return "developer";
    }

    // 2. Role 1 and False Super User -> Admin
    if (user.system_role_id === 1 && !user.is_superuser) {
        return "admin";
    }

    // 3. Role 2 and False Super User -> Staff
    if (user.system_role_id === 2 && !user.is_superuser) {
        return "staff";
    }

    // Fallbacks
    if (user.is_superuser) {
        return "developer";
    }

    if (user.system_role_id === 1) {
        return "admin";
    }

    return "staff";
}
