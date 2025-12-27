import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  setPage: (page: string) => void;
};

export default function Welcome({ setPage }: Props) {
  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Stack spacing={3} width={360}>
        <Typography variant="h4" fontWeight={700} align="center">
          Patient Portal
        </Typography>

        <Typography align="center" color="text.secondary">
          Secure healthcare access
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => setPage("login")}
        >
          Login
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={() => setPage("register")}
        >
          Create Account
        </Button>

        <Button
          variant="text"
          onClick={() => setPage("forgot")}
        >
          Forgot Password?
        </Button>
      </Stack>
    </Box>
  );
}
