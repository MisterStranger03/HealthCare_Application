// import React, { useState } from "react";
// import { TextField, Button, Typography, Stack } from "@mui/material";
// import AuthCard from "../components/AuthCard";
// import { api } from "../api/client";

// export default function VerifyOtp({ email, setPage, onVerified }: any) {
//   const [otp, setOtp] = useState("");

//   const verify = async () => {
//     if (!email) {
//       alert("Missing email.");
//       return;
//     }

//     const res = await api.post("/auth/verify", {
//       email: email,           // ✅ EXPLICITLY PASS EMAIL
//       otp_code: otp,
//     });

//     if (res.data.flag === "yes") {
//       onVerified(res.data.user_id);   // returned by LangGraph
//     } else {
//       alert(res.data.message || "Invalid OTP");
//     }
//   };

//   return (
//     <AuthCard>
//       <Stack spacing={3}>
//         <Typography variant="h5" align="center">
//           Verify Your Account
//         </Typography>

//         <Typography variant="body2" align="center">
//           OTP sent to <b>{email}</b>
//         </Typography>

//         <TextField
//           label="OTP Code"
//           fullWidth
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//         />

//         <Button variant="contained" size="large" onClick={verify}>
//           Verify
//         </Button>
//       </Stack>
//     </AuthCard>
//   );
// }


import React, { useState } from "react";
import { TextField, Button, Typography, Stack } from "@mui/material";
import AuthCard from "../components/AuthCard";
import { api } from "../api/client";

type Page =
  | "welcome"
  | "login"
  | "register"
  | "verify"
  | "forgot"
  | "reset-password"
  | "complete-profile"
  | "dashboard"
  | "subscribe"
  | "selection";

type Props = {
  email: string;
  setUserId: (id: string) => void;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
};

export default function VerifyOtp({ email, setUserId, setPage }: Props) {
  const [otp, setOtp] = useState("");

  const verify = async () => {
    const res = await api.post("/auth/verify", {
      email,
      otp_code: otp,
    });

    if (res.data.flag === "yes" && res.data.user_id) {
      setUserId(res.data.user_id);
      setPage("complete-profile"); // ✅ KEY CHANGE
    } else {
      alert(res.data.message || "Verification failed");
    }
  };

  return (
    <AuthCard>
      <Stack spacing={3}>
        <Typography variant="h6">Verify OTP</Typography>
        <TextField label="OTP Code" onChange={e => setOtp(e.target.value)} />
        <Button variant="contained" onClick={verify}>
          Verify
        </Button>
      </Stack>
    </AuthCard>
  );
}
