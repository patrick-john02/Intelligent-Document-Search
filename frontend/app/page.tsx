"use client";

import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Link,
  Stack,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

// Minimalist Clean Light (White & Black) Theme
const lightMonochromeTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000",
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
            backgroundColor: "#FFFFFF",
            "& fieldset": {
              borderColor: "#E2E8F0",
            },
            "&:hover fieldset": {
              borderColor: "#94A3B8",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0F172A",
              borderWidth: "1.5px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#0F172A",
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
            color: "#0F172A",
          },
        },
      },
    },
  },
});

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Invalid credentials. Please verify and try again."
        );
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      alert("Login successful! Welcome.");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lightMonochromeTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 2.5,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 420,
            bgcolor: "background.paper",
            borderColor: "divider",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.04)",
            p: { xs: 3, sm: 4.5 },
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {/* Agency & System Title */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  display: "block",
                  fontSize: "0.7rem",
                  mb: 0.75,
                }}
              >
                
              </Typography>
              <Typography
                variant="h6"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.3,
                  mb: 1,
                }}
              >
                Document Archiving & Retrieval System
              </Typography>

            </Box>

            {/* Error Message */}
            {errorMsg && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  bgcolor: "#FEF2F2",
                  color: "#B91C1C",
                  border: "1px solid #FECACA",
                  fontSize: "0.85rem",
                  "& .MuiAlert-icon": {
                    color: "#DC2626",
                  },
                }}
              >
                {errorMsg}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} noValidate>
              <Stack spacing={2.5}>
                {/* Username */}
                <TextField
                  fullWidth
                  size="small"
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon
                            sx={{ color: "text.secondary", fontSize: 18 }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Password */}
                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon
                            sx={{ color: "text.secondary", fontSize: 18 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: "text.secondary" }}
                          >
                            {showPassword ? (
                              <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Options Row */}
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontSize: "0.82rem" }}
                      >
                        Remember me
                      </Typography>
                    }
                  />

                  <Link
                    href="#"
                    variant="body2"
                    underline="hover"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.82rem",
                      "&:hover": { color: "text.primary" },
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Please contact the System Administrator.");
                    }}
                  >
                    Forgot password?
                  </Link>
                </Stack>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3.5 }} />

            {/* Footer */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ShieldOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.75rem", letterSpacing: 0.2 }}
              >
                Authorized users
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
