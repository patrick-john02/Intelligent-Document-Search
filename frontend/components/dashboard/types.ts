import { User } from "@/context/AuthContext";

export type DashboardRole = "admin" | "staff" | "developer";

export interface RoleConfig{
    id: DashboardRole;
    label: string;
    description: string;
    badgeColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

}

export const ROLE_CONFIGS: Record<DashboardRole, RoleConfig>={
    staff:{
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
    developer:{
        id: "developer",
        label: "Developer View",
        description: "Oversee all of the Functions",
        badgeColor: "warning",

    }
    
};

export function getDefaultRole(user:User | null): DashboardRole{
    if(!user){
        return "staff";
    }

    const username = user.username?.toLowerCase() || "";

    if(user.is_superuser && (username.includes("dev") || username === "developer")){
        return "developer";
    }

    if(user.is_superuser){
        return "admin";
    }

    return "staff";
}


