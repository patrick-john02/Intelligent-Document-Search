"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface IdleWarningDialogProps {
  open: boolean;
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}

// Shown shortly before the idle auto-logout.
export default function IdleWarningDialog({ open, secondsLeft, onStay, onLogout }: IdleWarningDialogProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <Dialog open={open} onClose={onStay} maxWidth="xs" fullWidth>
      <DialogTitle>Are you still there?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You&apos;ve been inactive for a while. For security, you&apos;ll be logged out in{" "}
          <strong>
            {minutes}:{seconds}
          </strong>
          .
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="inherit">
          Log out
        </Button>
        <Button onClick={onStay} variant="contained" autoFocus>
          Stay signed in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
