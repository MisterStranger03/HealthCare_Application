// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Stack,
//   Link,
// } from "@mui/material";
// import AuthCard from "../components/AuthCard";
// import { api } from "../api/client";

// export default function Login({ setPage, onLogin }: any) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const submit = async () => {
//     const res = await api.post("/auth/login", {
//       email_or_phone: email,
//       password,
//     });

//     if (res.data.login_status === "success") {
//       onLogin(res.data.user_id);
//     } else {
//       alert(res.data.message || "Login failed");
//     }
//   };

//   return (
//     <AuthCard>
//       <Stack spacing={3}>
//         <Typography variant="h5" align="center">
//           Patient Login
//         </Typography>

//         <TextField
//           label="Email or Phone"
//           fullWidth
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <TextField
//           label="Password"
//           type="password"
//           fullWidth
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <Button
//           variant="contained"
//           size="large"
//           onClick={submit}
//         >
//           Login
//         </Button>

//         <Stack direction="row" justifyContent="space-between">
//           <Link component="button" onClick={() => setPage("forgot")}>
//             Forgot password?
//           </Link>
//           <Link component="button" onClick={() => setPage("register")}>
//             New here? Create account
//           </Link>
//         </Stack>
//       </Stack>
//     </AuthCard>
//   );
// }


import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Stack,
  Link,
} from "@mui/material";
import AuthCard from "../components/AuthCard";
import { api } from "../api/client";

export default function Login({ setPage, onLogin }: any) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email_or_phone: identifier,
        password,
      });

      if (res.data.login_status === "success") {
        onLogin(res.data.user_id);
      } else if (res.data.login_status === "verification_required") {
        alert("Please verify your account first.");
        setPage("verify");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <Stack spacing={3}>
        <Typography variant="h5" align="center">
          Patient Login
        </Typography>

        <TextField
          label="Email or Phone"
          fullWidth
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          size="large"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>

        <Stack direction="row" justifyContent="space-between">
          <Link component="button" onClick={() => setPage("forgot")}>
            Forgot password?
          </Link>
          <Link component="button" onClick={() => setPage("register")}>
            New here? Create account
          </Link>
        </Stack>
      </Stack>
    </AuthCard>
  );
}
