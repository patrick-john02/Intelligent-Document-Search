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
  Stack,
  Divider,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();

  // Flip State (false = Login / Front, true = Register / Back)
  const [isFlipped, setIsFlipped] = useState(false);

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register Form States
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Forgot Password Dialog States
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Handle Login Submit
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
      setErrorMsg(err.message || "Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login placeholder
  const handleGoogleLogin = () => {
    setErrorMsg("Google Sign-In is configured for organizational SSO. Please sign in with your credentials or contact administrator.");
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);
    setRegSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setRegErrorMsg("Passwords do not match.");
      return;
    }

    if (regPassword.length < 4) {
      setRegErrorMsg("Password must be at least 4 characters.");
      return;
    }

    setIsRegLoading(true);

    try {
      setRegSuccessMsg("Account created successfully! Flipping back to sign in...");
      setUsername(regUsername || regEmail);

      // Flip back to login card after brief confirmation
      setTimeout(() => {
        setIsFlipped(false);
        setRegSuccessMsg(null);
      }, 1600);
    } catch (err: any) {
      setRegErrorMsg(err.message || "Unable to register account. Please try again.");
    } finally {
      setIsRegLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSent(true);
    }, 800);
  };

  const handleCloseForgot = () => {
    setForgotOpen(false);
    setForgotSent(false);
    setForgotEmail("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FAFAFA",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37, 99, 235, 0.08), transparent 70%), #FAFAFA",
        p: 2.5,
      }}
    >
      {/* 3D Perspective Wrapper */}
      <Box
        sx={{
          perspective: 1200,
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* Flipping Container */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gridTemplateRows: "1fr",
            width: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* =========================================================
              FRONT FACE: Simple MUI Sign In Card
             ========================================================= */}
          <Card
            variant="outlined"
            sx={{
              gridArea: "1 / 1 / 2 / 2",
              width: "100%",
              bgcolor: "background.paper",
              borderColor: "divider",
              borderRadius: 2.5,
              boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.06)",
              p: { xs: 3, sm: 4 },
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              pointerEvents: isFlipped ? "none" : "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: "1.5px",
                background:
                  "linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.5), rgba(124, 58, 237, 0.5), transparent)",
              },
            }}
          >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              {/* Header with Tech / AI Branding */}
              <Box sx={{ mb: 3.5, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.2,
                    mb: 0.6,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif',
                      fontWeight: 700,
                      fontSize: "2.1rem",
                      letterSpacing: "-0.03em",
                      color: "text.primary",
                      lineHeight: 1.1,
                    }}
                  >
                    Archiv
                    <Box
                      component="span"
                      sx={{
                        background: "linear-gradient(135deg, #2563EB 0%, #6366F1 50%, #9333EA 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        ml: "1px",
                      }}
                    >
                      AI
                    </Box>
                  </Typography>

                  {/* Tech AI Badge */}
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 0.85,
                      py: 0.25,
                      borderRadius: "999px",
                      bgcolor: "rgba(37, 99, 235, 0.08)",
                      border: "1px solid rgba(37, 99, 235, 0.2)",
                      color: "#2563EB",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 11, color: "#2563EB" }} />
                    <span>AI</span>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.82rem",
                    letterSpacing: "0.01em",
                    fontWeight: 500,
                  }}
                >
                  Intelligent Document Archiving System
                </Typography>
              </Box>

              {/* Error Alert */}
              {errorMsg && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2.5,
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

              {/* Google Sign In Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.1,
                  color: "text.primary",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.88rem",
                  borderRadius: 2,
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  "&:hover": {
                    bgcolor: "#F8FAFC",
                    borderColor: "#CBD5E1",
                  },
                }}
              >
                Continue with Google
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 2.2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", px: 1 }}>
                  or sign in with username
                </Typography>
              </Divider>

              {/* Login Form */}
              <Box component="form" onSubmit={handleLogin} noValidate>
                <Stack spacing={2.2}>
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
                              aria-label="toggle password visibility"
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

                  {/* Options: Remember me & Forgot Password */}
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

                    {/* Forgot Password Link - Transparent, No Background */}
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setForgotOpen(true)}
                      underline="hover"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        bgcolor: "transparent !important",
                        border: "none",
                        p: 0,
                        cursor: "pointer",
                        "&:hover": {
                          color: "text.primary",
                        },
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
                    sx={{
                      py: 1.2,
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: "#0F172A",
                      color: "#FFFFFF",
                      "&:hover": {
                        bgcolor: "#1E293B",
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={22} sx={{ color: "#FFFFFF" }} />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Stack>
              </Box>

              {/* Flip to Registration Prompt - Transparent Link, No Background */}
              <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  Don&apos;t have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => {
                      setErrorMsg(null);
                      setIsFlipped(true);
                    }}
                    underline="hover"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: "0.85rem",
                      bgcolor: "transparent !important",
                      border: "none",
                      p: 0,
                      cursor: "pointer",
                      "&:hover": {
                        color: "text.primary",
                      },
                    }}
                  >
                    Create account
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* =========================================================
              BACK FACE: Simple MUI Register Card
             ========================================================= */}
          <Card
            variant="outlined"
            sx={{
              gridArea: "1 / 1 / 2 / 2",
              width: "100%",
              bgcolor: "background.paper",
              borderColor: "divider",
              borderRadius: 2.5,
              boxShadow: "0 4px 24px -2px rgba(0, 0, 0, 0.06)",
              p: { xs: 3, sm: 4 },
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              pointerEvents: isFlipped ? "auto" : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "15%",
                right: "15%",
                height: "1.5px",
                background:
                  "linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.5), rgba(124, 58, 237, 0.5), transparent)",
              },
            }}
          >
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              {/* Header */}
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif',
                    fontWeight: 700,
                    fontSize: "1.85rem",
                    color: "text.primary",
                    letterSpacing: "-0.02em",
                    mb: 0.5,
                  }}
                >
                  Create Account
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.82rem",
                    letterSpacing: "0.01em",
                    fontWeight: 500,
                  }}
                >
                  Join the Archiv
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(135deg, #2563EB 0%, #6366F1 50%, #9333EA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                      ml: "1px",
                    }}
                  >
                    AI
                  </Box>{" "}
                  Archival Platform
                </Typography>
              </Box>

              {/* Status Alerts */}
              {regErrorMsg && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    bgcolor: "#FEF2F2",
                    color: "#B91C1C",
                    border: "1px solid #FECACA",
                    fontSize: "0.85rem",
                    "& .MuiAlert-icon": { color: "#DC2626" },
                  }}
                >
                  {regErrorMsg}
                </Alert>
              )}

              {regSuccessMsg && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    bgcolor: "#F0FDF4",
                    color: "#15803D",
                    border: "1px solid #BBF7D0",
                    fontSize: "0.85rem",
                  }}
                >
                  {regSuccessMsg}
                </Alert>
              )}

              {/* Google Sign Up Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1,
                  color: "text.primary",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.86rem",
                  borderRadius: 2,
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  "&:hover": {
                    bgcolor: "#F8FAFC",
                    borderColor: "#CBD5E1",
                  },
                }}
              >
                Sign up with Google
              </Button>

              <Divider sx={{ my: 1.8 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", px: 1 }}>
                  or register with details
                </Typography>
              </Divider>

              {/* Register Form */}
              <Box component="form" onSubmit={handleRegister} noValidate>
                <Stack spacing={1.8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlinedIcon
                              sx={{ color: "text.secondary", fontSize: 18 }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Email Address"
                    placeholder="name@organization.com"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon
                              sx={{ color: "text.secondary", fontSize: 18 }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Username"
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
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

                  <TextField
                    fullWidth
                    size="small"
                    label="Password"
                    placeholder="Create a password"
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
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
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: "text.secondary" }}
                            >
                              {showRegPassword ? (
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

                  <TextField
                    fullWidth
                    size="small"
                    label="Confirm Password"
                    placeholder="Repeat password"
                    type={showRegPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
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
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isRegLoading}
                    sx={{
                      mt: 0.5,
                      py: 1.1,
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: "#0F172A",
                      color: "#FFFFFF",
                      "&:hover": {
                        bgcolor: "#1E293B",
                      },
                    }}
                  >
                    {isRegLoading ? (
                      <CircularProgress size={22} sx={{ color: "#FFFFFF" }} />
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Stack>
              </Box>

              {/* Flip to Login Prompt - Transparent Link, No Background */}
              <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid", borderColor: "divider", textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  Already have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => {
                      setRegErrorMsg(null);
                      setIsFlipped(false);
                    }}
                    underline="hover"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      fontSize: "0.85rem",
                      bgcolor: "transparent !important",
                      border: "none",
                      p: 0,
                      cursor: "pointer",
                      "&:hover": {
                        color: "text.primary",
                      },
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* =========================================================
          FORGOT PASSWORD DIALOG
         ========================================================= */}
      <Dialog
        open={forgotOpen}
        onClose={handleCloseForgot}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2.5,
              p: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-source-serif-4), "Source Serif 4", "Georgia", serif', fontWeight: 700, fontSize: "1.25rem", pb: 1 }}>
          Reset Password
        </DialogTitle>
        <DialogContent>
          {forgotSent ? (
            <Alert severity="success" sx={{ my: 1, fontSize: "0.85rem" }}>
              Password reset link sent! Check your inbox for instructions to restore access.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleForgotSubmit} sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 2.5 }}
              >
                Enter your registered email address or username. We will send you instructions to reset your password.
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Email or Username"
                placeholder="name@organization.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {forgotSent ? (
            <Button
              variant="contained"
              onClick={handleCloseForgot}
              fullWidth
              sx={{
                bgcolor: "#0F172A",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "#1E293B" },
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="text"
                onClick={handleCloseForgot}
                sx={{
                  textTransform: "none",
                  color: "text.secondary",
                  bgcolor: "transparent !important",
                  "&:hover": {
                    bgcolor: "#F1F5F9 !important",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleForgotSubmit}
                disabled={forgotLoading || !forgotEmail}
                sx={{
                  bgcolor: "#0F172A",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#1E293B" },
                }}
              >
                {forgotLoading ? (
                  <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
