export const API_SOURCE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";


//helper function managing the auth token in localstorage
//TODO: I will change this soon into cookie
export const getStoredToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("src_tkn");
};

export const setStoredToken = (token: string): void => { 
    if(typeof window !== "undefined"){
        localStorage.setItem("src_tkn", token)
    }
};

export const removeStoredToken = ():void=>{
    if(typeof window !== "undefined") {
        return localStorage.removeItem("src_tkn")
    }
};

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

export async function fetchApi<T = any>(
    endpoint: string,
    option: RequestOptions = {}
): Promise<T>{
    const {data, headers, ...customConfig} = option;
    const token = getStoredToken();

    //prepare default headers
    const defaultHeaders: Record<string, string>={};
    
    if(token){
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    if(data && !(data instanceof FormData) && !(data instanceof URLSearchParams)){
        defaultHeaders["Content-Type"] = "application/json";
    }

    //merge headers
    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...defaultHeaders,
            ...headers,
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

    //do a network call
    const response = await fetch(url, config);

    if(response.status === 401){
        removeStoredToken();
        if(typeof window !== "undefined" && window.location.pathname !== "/"){
            window.location.href = "/"; // this will redirected to login page
        }
    }


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
    const token = getStoredToken();
    const res = await fetch(`${API_SOURCE}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
