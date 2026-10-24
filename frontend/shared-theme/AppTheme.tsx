"use client";

import * as React from "react";
import { ThemeProvider, createTheme, ThemeOptions } from "@mui/material/styles";
import { gray, brand } from "./themePrimitives";

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions["components"];
}

// Global compact / dense configuration for laptop screens and high-density dashboards
const compactDensityComponents: ThemeOptions["components"] = {
  MuiTable: {
    defaultProps: {
      size: "small",
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: "8px 12px",
        fontSize: "0.8125rem",
      },
      sizeSmall: {
        padding: "6px 10px",
        fontSize: "0.8rem",
      },
      head: {
        padding: "8px 12px",
        fontSize: "0.78rem",
        fontWeight: 700,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: "small",
    },
  },
  MuiOutlinedInput: {
    defaultProps: {
      size: "small",
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      input: {
        padding: "8px 12px",
      },
      sizeSmall: {
        fontSize: "0.85rem",
      },
    },
  },
  MuiInputBase: {
    defaultProps: {
      size: "small",
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: "small",
    },
  },
  MuiSelect: {
    defaultProps: {
      size: "small",
    },
  },
  MuiButton: {
    defaultProps: {
      size: "small",
    },
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        boxShadow: "none",
        borderRadius: 8,
      },
      sizeSmall: {
        padding: "5px 12px",
        fontSize: "0.8rem",
      },
      sizeMedium: {
        padding: "8px 16px",
        fontSize: "0.875rem",
      },
    },
  },
  MuiIconButton: {
    defaultProps: {
      size: "small",
    },
  },
};

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
            ...compactDensityComponents,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
