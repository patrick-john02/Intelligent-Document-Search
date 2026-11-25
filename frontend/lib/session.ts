// Session handling for the browser:
//  - the access token lives in memory only (never localStorage), so XSS can't steal a long-lived credential
//  - the refresh token is an httpOnly cookie the backend sets on /api/token/*
//  - real user activity (mouse/keyboard/scroll/touch) is tracked here and shared across tabs
//
// Background polling never counts as activity. Every refresh tells the backend how long
// the user has been idle, so the backend can enforce the idle timeout as well.

export const API_SOURCE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;   // seconds
    idle_timeout?: number; // seconds
}

export type RefreshResult = "ok" | "unauthorized" | "error";

const LAST_ACTIVITY_KEY = "src_last_activity";
const LEGACY_TOKEN_KEY = "src_tkn";
const CHANNEL_NAME = "src_auth";
const REFRESH_LOCK = "src_auth_refresh";
const ACTIVITY_WRITE_THROTTLE_MS = 5_000;

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let idleTimeoutMs = 60 * 60 * 1000; // replaced by the server's value after login/refresh
let lastRefreshAt = 0;
let lastActivityMem = 0;
let lastActivityWrittenAt = 0;
let refreshInFlight: Promise<RefreshResult> | null = null;

type Listener = (event: "logout") => void;
const listeners = new Set<Listener>();

// ---------- cross-tab channel ----------
type ChannelMessage =
    | { type: "token"; token: string; expiresAt: number; idleTimeoutMs: number; refreshedAt: number }
    | { type: "logout" };

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
    if (!channel) {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.onmessage = (e: MessageEvent<ChannelMessage>) => {
            const msg = e.data;
            if (msg.type === "token") {
                accessToken = msg.token;
                accessTokenExpiresAt = msg.expiresAt;
                idleTimeoutMs = msg.idleTimeoutMs;
                lastRefreshAt = msg.refreshedAt;
            } else if (msg.type === "logout") {
                clearSession(false);
                listeners.forEach((fn) => fn("logout"));
            }
        };
    }
    return channel;
}
if (typeof window !== "undefined") {
    getChannel();
    localStorage.removeItem(LEGACY_TOKEN_KEY); // old localStorage token is no longer used
}

export function onSessionEvent(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

// ---------- token store ----------
export const getAccessToken = () => accessToken;
export const getAccessTokenExpiresAt = () => accessTokenExpiresAt;
export const getIdleTimeoutMs = () => idleTimeoutMs;
export const getLastRefreshAt = () => lastRefreshAt;

export function setSession(data: TokenResponse, broadcast = true): void {
    const now = Date.now();
    accessToken = data.access_token;
    accessTokenExpiresAt = now + (data.expires_in ?? 15 * 60) * 1000;
    if (data.idle_timeout) idleTimeoutMs = data.idle_timeout * 1000;
    lastRefreshAt = now;
    if (broadcast) {
        getChannel()?.postMessage({
            type: "token",
            token: accessToken,
            expiresAt: accessTokenExpiresAt,
            idleTimeoutMs,
            refreshedAt: now,
        } satisfies ChannelMessage);
    }
}

export function clearSession(broadcast = true): void {
    accessToken = null;
    accessTokenExpiresAt = 0;
    lastRefreshAt = 0;
    if (broadcast) getChannel()?.postMessage({ type: "logout" } satisfies ChannelMessage);
}

// ---------- activity tracking (shared by all tabs through localStorage) ----------
export function getLastActivity(): number {
    if (typeof window === "undefined") return lastActivityMem;
    const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
    return Math.max(lastActivityMem, stored);
}

export function isIdleExpired(): boolean {
    const last = getLastActivity();
    return last > 0 && Date.now() - last >= idleTimeoutMs;
}

/** Record real user activity. Ignored once the idle limit has passed (the session is already dead). */
export function markActivity(force = false): void {
    if (typeof window === "undefined") return;
    if (!force && isIdleExpired()) return;
    const now = Date.now();
    lastActivityMem = now;
    if (force || now - lastActivityWrittenAt >= ACTIVITY_WRITE_THROTTLE_MS) {
        lastActivityWrittenAt = now;
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    }
}

// ---------- refresh / revoke ----------
async function doRefresh(tokenBefore: string | null): Promise<RefreshResult> {
    // Another tab may have refreshed while we waited for the lock; its token arrives via BroadcastChannel.
    if (accessToken && accessToken !== tokenBefore && accessTokenExpiresAt - Date.now() > 30_000) {
        return "ok";
    }
    const last = getLastActivity();
    const idleMs = last > 0 ? Math.max(0, Date.now() - last) : 0;
    try {
        const res = await fetch(`${API_SOURCE}/token/refresh`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idle_ms: idleMs }),
        });
        if (res.status === 401) {
            clearSession();
            return "unauthorized";
        }
        if (!res.ok) return "error";
        setSession((await res.json()) as TokenResponse);
        return "ok";
    } catch {
        return "error"; // network problem: keep the session, try again later
    }
}

/** Get a new access token using the refresh cookie. Only one refresh runs at a time, even across tabs. */
export function refreshAccessToken(): Promise<RefreshResult> {
    if (refreshInFlight) return refreshInFlight;
    const tokenBefore = accessToken;
    const run = () => doRefresh(tokenBefore);
    const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
    const pending = (async (): Promise<RefreshResult> =>
        locks ? await locks.request(REFRESH_LOCK, run) : run())();
    const tracked = pending.finally(() => {
        refreshInFlight = null;
    });
    refreshInFlight = tracked;
    return tracked;
}

/** End the session on the server (clears the refresh cookie). */
export async function revokeSession(): Promise<void> {
    try {
        await fetch(`${API_SOURCE}/token/revoke`, { method: "POST", credentials: "include" });
    } catch {
        /* offline: the session will still die from the idle/absolute timeout */
    }
}
