import {
    API_SOURCE,
    clearSession,
    getAccessToken,
    markActivity,
    refreshAccessToken,
} from "./session";

export { API_SOURCE };

// Kept for existing imports: the token now lives in memory (see lib/session.ts).
export const getStoredToken = (): string | null => getAccessToken();

//error class
export class ApiError extends Error{
    status: number;
    data: any;

    constructor(status: number, message: string, data?: any){
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}


//api fetcher
interface RequestOptions extends RequestInit{
    data?: any;
}

const isAuthEndpoint = (url: string) => url.startsWith(`${API_SOURCE}/token`);

// Session is gone for good: drop the token and go to the login page.
function handleUnauthorized() {
    clearSession();
    if(typeof window !== "undefined" && window.location.pathname !== "/"){
        window.location.href = "/"; // this will redirected to login page
    }
}

// fetch() + Bearer token. On a 401 it refreshes the access token once and retries.
export async function authorizedFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const send = () => {
        const token = getAccessToken();
        const headers = new Headers(init.headers);
        if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
        return fetch(url, {
            ...init,
            headers,
            credentials: isAuthEndpoint(url) ? "include" : init.credentials,
        });
    };

    let response = await send();
    if (response.status !== 401 || isAuthEndpoint(url)) return response;

    const result = await refreshAccessToken();
    if (result === "ok") {
        response = await send();
    }
    if (response.status === 401 && result !== "error") {
        handleUnauthorized();
    }
    return response;
}

export async function fetchApi<T = any>(
    endpoint: string,
    option: RequestOptions = {}
): Promise<T>{
    const {data, headers, ...customConfig} = option;

    //prepare default headers
    const defaultHeaders: Record<string, string>={};

    if(data && !(data instanceof FormData) && !(data instanceof URLSearchParams)){
        defaultHeaders["Content-Type"] = "application/json";
    }

    //merge headers
    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...defaultHeaders,
            ...(headers as Record<string, string> | undefined),
        },
    };

    //attach body
    if(data){
        if(data instanceof FormData || data instanceof URLSearchParams){
            config.body = data;

        }else{
            config.body = JSON.stringify(data);
        }
    }

    const cleanEndpoint = endpoint.startsWith("/")? endpoint : `/${endpoint}`;
    const url = `${API_SOURCE}${cleanEndpoint}`;

    //do a network call (refreshes + retries once on 401)
    const response = await authorizedFetch(url, config);

    //handle other errrors
    if(!response.ok){
        let errorMesssage = "Error while fetching data";
        let errorData = null;

        try{
            errorData = await response.json()
            errorMesssage = errorData.detail || errorData.message || errorMesssage;

        }catch{
            errorMesssage = response.statusText || errorMesssage;
        }

        throw new ApiError(response.status, errorMesssage, errorData);
    }

    if (response.status==204){
        return {} as T;
    }

    //Will return a parsed JSON 
    return(await response.json()) as T;
    
}


export const api = {
    get: <T = any>(endpoint: string, options?: RequestOptions)=>
        fetchApi<T>(endpoint, {...options, method: "GET"}),

    
    post: <T = any>(endpoint: string, data?:any, options?:RequestOptions)=>
        fetchApi<T>(endpoint, {...options, method:"POST", data}),

    put: <T = any>(endpoint: string, data?:any, options?: RequestOptions)=>
        fetchApi<T>(endpoint, {...options, method: "PUT", data}),

    patch: <T = any>(endpoint: string, data?:any, options?: RequestOptions)=>
        fetchApi<T>(endpoint, {...options, method: "PATCH", data}),

    delete: <T = any>(endpoint: string, option?: RequestOptions)=>
        fetchApi<T>(endpoint,{...option, method:"DELETE"}),
};


// Streams Server-Sent Events from a POST endpoint (e.g. /chat/talk/stream).
// EventSource can't send a POST body or an Authorization header, so we read the stream with fetch.
export async function streamApi(
    endpoint: string,
    body: unknown,
    onEvent: (event: string, data: any) => void,
    signal?: AbortSignal
): Promise<void> {
    const res = await authorizedFetch(`${API_SOURCE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
    });

    if (!res.ok || !res.body) {
        let data: any;
        try { data = await res.json(); } catch {}
        throw new ApiError(res.status, data?.detail || res.statusText, data);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        markActivity(); // a streaming AI answer counts as activity
        buffer += decoder.decode(value, { stream: true });

        // each SSE event ends with a blank line
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);

            let event = "message";
            let data = "";
            for (const line of raw.split("\n")) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                else if (line.startsWith("data:")) data += line.slice(5).trim();
            }
            if (data) onEvent(event, JSON.parse(data));
        }
    }
}
