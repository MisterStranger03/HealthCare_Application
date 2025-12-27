import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AuthCard from "../components/AuthCard";
import { api } from "../api/client";

type Props = {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
};

export default function ResetPassword({
  email,
  onSuccess,
  onBack,
}: Props) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset", {
        email,
        reset_token: token,
        new_password: password,
      });

      alert("Password reset successful. Please login.");
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <Stack spacing={3}>
        <Typography variant="h6">Reset Password</Typography>

        <TextField
          label="Email"
          value={email}
          disabled
          fullWidth
        />

        <TextField
          label="Reset Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          fullWidth
        />

        <TextField
          label="New Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow(!show)}>
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirm New Password"
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={submit}
          disabled={loading || !token || !password}
        >
          Reset Password
        </Button>

        <Button onClick={onBack}>
          Back
        </Button>
      </Stack>
    </AuthCard>
  );
}
