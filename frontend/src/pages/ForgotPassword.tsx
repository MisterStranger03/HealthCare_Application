import React, { useState } from "react";
import { TextField, Button, Typography, Stack } from "@mui/material";
import AuthCard from "../components/AuthCard";
import { api } from "../api/client";

type Props = {
  setPage: (p: any) => void;
  setEmail: (e: string) => void;
};

export default function ForgotPassword({ setPage, setEmail }: Props) {
  const [email, setEmailLocal] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/auth/forgot", { email, phone });

      // 🔑 store email for reset step
      setEmail(email);

      // 👉 Streamlit equivalent: go to reset_password
      setPage("reset-password");

      alert("Reset token sent to your email (if account exists).");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to send reset token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <Stack spacing={3}>
        <Typography variant="h6">Forgot Password</Typography>

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmailLocal(e.target.value)}
          fullWidth
        />

        <TextField
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={submit}
          disabled={loading || !email}
        >
          Send Reset Token
        </Button>

        <Button onClick={() => setPage("login")}>
          Back to Login
        </Button>
      </Stack>
    </AuthCard>
  );
}
