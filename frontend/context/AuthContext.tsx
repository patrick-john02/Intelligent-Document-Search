"use client";

import React, {createContext, useContext, useState, useEffect} from "react";
import { useRouter, usePathname } from "next/navigation";



//imports
import { api, getStoredToken, removeStoredToken, setStoredToken } from "@/lib/api";

//define
export interface User{
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
}

interface AuthContextType{
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token:string)=>Promise<void>;
    logout: () => void;
    refreshUser: () =>Promise<void>;
}


//create the context object
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//create provider component
export function AuthProvider({children}: {children: React.ReactNode}){
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname=usePathname();

    const fetchCurrentUser = async()=>{
        const token = getStoredToken(); 
        if (!token){
            setUser(null);
            setIsLoading(false);
            return;
        }

        try{
            const userData = await api.get<User>("/user/me");
            setUser(userData);
        }catch(err){
            console.error("Failed to load user session:", err);
            removeStoredToken();
            setUser(null);
        }finally{
            setIsLoading(false);
        }
    };


    //check if the token exists in localstorage
    useEffect(() =>{
        fetchCurrentUser();

    }, []);

    const login = async(token:string)=>{
        setStoredToken(token);
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

    const logout = () =>{
        removeStoredToken();
        setUser(null);
        router.push("/");
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
