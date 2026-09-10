import AppNavbar from "@/components/AppNavbar";
import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import { Box, Stack, Typography } from "@mui/material";
import React from "react";


export default function AiAssistanct(){
    return(
        <Box sx={{display: "flex"}}>
            <SideMenu currentRole="staff"/>
            <AppNavbar currentRole="staff"/>

            <Box
            component="main"
            sx={{
                flexGrow: 1,
                overflow: "auto",
            }}
            >
                <Stack
                spacing={2}
                sx={{
                    mx:3, //adds 24px margin on left and right sides, name: margin-x
                    pb:5, // adds 40px padding at the bottom inside the stack, name: padding-bottom
                    mt:{xs:8, md:2}, // Small screen: 64px top margin. & Medium+ screen: 16px top margin.
                }}
                >
                    <Header/>
                    <Typography variant="h5" sx={{fontWeight: 700, mb:1}}>
                        AI Assistance
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
}