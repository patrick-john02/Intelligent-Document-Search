"use client";

import * as React from "react";
import { ThemeProvider, createTheme, ThemeOptions } from "@mui/material/styles";
import { gray, brand } from "./themePrimitives";

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions["components"];
}

export default function AppTheme({
  children,
  disableCustomTheme,
  themeComponents,
}: AppThemeProps) {
  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          cssVariables: {
            colorSchemeSelector: "data-mui-color-scheme",
            cssVarPrefix: "template",
          },
          colorSchemes: {
            light: {
              palette: {
                primary: {
                  main: "#0F172A",
                  contrastText: "#FFFFFF",
                },
                background: {
                  default: "#FAFAFA",
                  paper: "#FFFFFF",
                },
                text: {
                  primary: "#0F172A",
                  secondary: "#64748B",
                },
                divider: "#E2E8F0",
              },
            },
            dark: {
              palette: {
                primary: {
                  main: "#F8FAFC",
                  contrastText: "#0F172A",
                },
                background: {
                  default: "#0B0F19",
                  paper: "#111827",
                },
                text: {
                  primary: "#F8FAFC",
                  secondary: "#94A3B8",
                },
                divider: "#1E293B",
              },
            },
          },
          typography: {
            fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            button: {
              textTransform: "none",
              fontWeight: 600,
            },
          },
          shape: {
            borderRadius: 8,
          },
          components: {
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
