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
    fontFamily: 'var(--font-inter), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700 },
    h2: { fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700 },
    h3: { fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700 },
    h4: { fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700 },
    h5: { fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700 },
    h6: { fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700 },
    subtitle1: { fontFamily: 'var(--font-inter), "Inter", sans-serif' },
    subtitle2: { fontFamily: 'var(--font-inter), "Inter", sans-serif' },
    body1: { fontFamily: 'var(--font-inter), "Inter", sans-serif' },
    body2: { fontFamily: 'var(--font-inter), "Inter", sans-serif' },
    button: {
      fontFamily: 'var(--font-inter), "Inter", sans-serif',
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
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
    MuiOutlinedInput: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        input: {
          padding: "8.5px 12px",
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
          padding: "6px 14px",
          fontSize: "0.85rem",
          boxShadow: "none",
        },
        sizeSmall: {
          padding: "5px 12px",
          fontSize: "0.8rem",
        },
        sizeMedium: {
          padding: "8px 16px",
          fontSize: "0.875rem",
        },
        contained: {
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
        outlined: {
          borderColor: "#E2E8F0",
          color: "#0F172A",
          backgroundColor: "transparent",
          "&:hover": {
            borderColor: "#CBD5E1",
            backgroundColor: "#F8FAFC",
          },
        },
        text: {
          backgroundColor: "transparent",
          color: "#0F172A",
          padding: "4px 8px",
          "&:hover": {
            backgroundColor: "transparent",
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
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export default theme;
