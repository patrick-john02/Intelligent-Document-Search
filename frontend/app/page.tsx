"use client";

import React, { useState } from "react";
import {
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
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
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

      const data = await api.post("/token", formData);

      // Log in through AuthContext (stores token, fetches user, and redirects to /dashboard)
      await login(data.access_token);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to connect to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                    alert("Please contact the System Administrator to reset your password.");
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
        </CardContent>
      </Card>
    </Box>
  );
}
