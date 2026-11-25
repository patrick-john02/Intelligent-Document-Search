"use client";

import React, {createContext, useContext, useState, useEffect, useRef, useCallback} from "react";
import { useRouter } from "next/navigation";



//imports
import { api } from "@/lib/api";
import {
    TokenResponse,
    clearSession,
    getAccessToken,
    getAccessTokenExpiresAt,
    getIdleTimeoutMs,
    getLastActivity,
    getLastRefreshAt,
    isIdleExpired,
    markActivity,
    onSessionEvent,
    refreshAccessToken,
    revokeSession,
    setSession,
} from "@/lib/session";
import IdleWarningDialog from "@/components/IdleWarningDialog";

//define
export interface User {
    username: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    employee_number: string;
    office: string;
    division: string;
    is_active: boolean;
    is_superuser: boolean;
    system_role_id?: number;
    position?: string;
    birth_date?: string;
    created_at?: string;
    last_login?: string;
    account_status?: string;
    // Google Auth & SSO extensions
    picture?: string;
    avatar_url?: string;
    auth_provider?: "local" | "google";
    google_id?: string;
    google_email?: string;
    email_verified?: boolean;
}

export type LogoutReason = "manual" | "idle" | "expired";

interface AuthContextType{
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: TokenResponse)=>Promise<void>;
    logout: (reason?: LogoutReason) => Promise<void>;
    refreshUser: () =>Promise<void>;
}

// --- idle settings ---
const WARNING_BEFORE_MS = 2 * 60 * 1000;      // show "still there?" 2 minutes before logout
const ACTIVITY_SYNC_MS = 5 * 60 * 1000;       // while active, tell the server at most every 5 minutes
const REFRESH_BEFORE_EXPIRY_MS = 60 * 1000;   // renew the access token 1 minute before it expires
const REFRESH_RETRY_MS = 15 * 1000;           // back-off after a failed (network) refresh
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"] as const;
export const LOGOUT_REASON_KEY = "src_logout_reason";


//create the context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//create provider component
export function AuthProvider({children}: {children: React.ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [warningOpen, setWarningOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const warningOpenRef = useRef(false);
    const lastRefreshAttemptRef = useRef(0);
    const router = useRouter();

    const fetchCurrentUser = async()=>{
        try{
            // After a page reload the in-memory token is gone: get a new one from the refresh cookie.
            if (!getAccessToken()){
                if (isIdleExpired()){
                    await revokeSession();
                    setUser(null);
                    return;
                }
                markActivity(); // opening the app counts as activity
                if (await refreshAccessToken() !== "ok"){
                    setUser(null);
                    return;
                }
            }
            const userData = await api.get<User>("/user/me");
            setUser(userData);
        }catch(err){
            console.error("Failed to load user session:", err);
            clearSession(false);
            setUser(null);
        }finally{
            setIsLoading(false);
        }
    };


    //restore the session (refresh cookie) on first load
    useEffect(() =>{
        fetchCurrentUser();
        // another tab logged out -> log out here too
        return onSessionEvent((event) => {
            if (event === "logout") {
                setUser(null);
                setWarningOpen(false);
                warningOpenRef.current = false;
            }
        });
    }, []);

    const login = async(token: TokenResponse)=>{
        setSession(token);
        markActivity(true);
        setIsLoading(true);
        try{
            const userData = await api.get<User>("/user/me");
            setUser(userData);
            router.push("/dashboard");
        }catch(err){
            console.error("Failed to fetch user after login.", err);
            throw err;

        }finally{
            setIsLoading(false);
        }
    };

    const logout = useCallback(async (reason: LogoutReason = "manual") =>{
        warningOpenRef.current = false;
        setWarningOpen(false);
        clearSession();          // also logs out the other tabs
        setUser(null);
        if (reason !== "manual" && typeof window !== "undefined") {
            sessionStorage.setItem(LOGOUT_REASON_KEY, reason);
        }
        router.push("/");
        await revokeSession();
    }, [router]);

    // Idle monitor: runs only while logged in.
    useEffect(() => {
        if (!user) return;

        const onActivity = () => {
            // Once the warning is up, only the "Stay signed in" button keeps the session.
            if (!warningOpenRef.current) markActivity();
        };
        ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

        const tick = async () => {
            const now = Date.now();
            const idleMs = now - getLastActivity();
            const timeoutMs = getIdleTimeoutMs();

            if (idleMs >= timeoutMs) {
                await logout("idle");
                return;
            }

            const showWarning = idleMs >= timeoutMs - WARNING_BEFORE_MS;
            if (showWarning !== warningOpenRef.current) {
                warningOpenRef.current = showWarning;
                setWarningOpen(showWarning);
            }
            if (showWarning) setSecondsLeft(Math.ceil((timeoutMs - idleMs) / 1000));

            // Keep the access token fresh, and report activity to the server every few minutes.
            const lastRefresh = getLastRefreshAt();
            const expiringSoon = getAccessTokenExpiresAt() - now < REFRESH_BEFORE_EXPIRY_MS;
            const activeSinceSync = getLastActivity() > lastRefresh && now - lastRefresh >= ACTIVITY_SYNC_MS;
            if ((expiringSoon || activeSinceSync) && now - lastRefreshAttemptRef.current >= REFRESH_RETRY_MS) {
                lastRefreshAttemptRef.current = now;
                const result = await refreshAccessToken();
                if (result === "unauthorized") await logout("expired");
            }
        };

        const id = window.setInterval(tick, 1000);
        // laptop wake / returning to the tab: check right away
        const onVisible = () => { if (document.visibilityState === "visible") void tick(); };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            window.clearInterval(id);
            ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [user, logout]);

    const staySignedIn = async () => {
        markActivity(true);
        warningOpenRef.current = false;
        setWarningOpen(false);
        lastRefreshAttemptRef.current = Date.now();
        if (await refreshAccessToken() === "unauthorized") await logout("expired");
    };

    return(
        <AuthContext.Provider
        value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshUser: fetchCurrentUser,
        }}
    >
        {children}
        <IdleWarningDialog
            open={warningOpen && !!user}
            secondsLeft={secondsLeft}
            onStay={staySignedIn}
            onLogout={() => logout("manual")}
        />
        </AuthContext.Provider>
    );

}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must use within an AuthProvider");
    }
    return context;
};
