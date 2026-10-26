import { User } from "@/context/AuthContext";
import { DashboardRole } from "@/components/dashboard/types";

export interface GoogleAuthStatus {
  isLinked: boolean;
  googleEmail?: string;
  googleId?: string;
  avatarUrl?: string;
  lastSyncedAt?: string;
}

export interface ProfileViewProps {
  user: User | null;
  effectiveRole: DashboardRole;
}
