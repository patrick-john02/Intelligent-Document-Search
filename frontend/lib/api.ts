const API_SOURCE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";


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

    delete: <T = any>(endpoint: string, option?: RequestOptions)=>
        fetchApi<T>(endpoint,{...option, method:"DELETE"}),
};