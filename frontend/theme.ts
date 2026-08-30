"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-mui-color-scheme",
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
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "background.paper",
            "& fieldset": {
              borderColor: "divider",
            },
            "&:hover fieldset": {
              borderColor: "text.secondary",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
              borderWidth: "1.5px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "text.primary",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 16px",
          fontSize: "0.9rem",
          boxShadow: "none",
          backgroundColor: "#0F172A",
          color: "#FFFFFF",
          "&:hover": {
            boxShadow: "none",
            backgroundColor: "#1E293B",
          },
          "&.Mui-disabled": {
            backgroundColor: "#E2E8F0",
            color: "#94A3B8",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#CBD5E1",
          "&.Mui-checked": {
            color: "primary.main",
          },
        },
      },
    },
  },
});

export default theme;