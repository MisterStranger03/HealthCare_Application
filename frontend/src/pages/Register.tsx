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

// export default function Register({ setPage, setEmail }: any) {
//   const [form, setForm] = useState<any>({});

//   const submit = async () => {
//   const res = await api.post("/auth/register", {
//     ...form,
//     plan_id: "free",
//   });

//   if (res.data.flag === "yes") {
//     setEmail(form.email);
//     setPage("verify");
//   } else {
//     alert(res.data.message);
//   }
// };


//   return (
//     <AuthCard>
//       <Stack spacing={2}>
//         <Typography variant="h5" align="center">
//           Create Patient Account
//         </Typography>

//         <TextField label="Full Name" onChange={e => setForm({ ...form, full_name: e.target.value })} />
//         <TextField label="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
//         <TextField label="Phone" onChange={e => setForm({ ...form, phone: e.target.value })} />
//         <TextField label="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />

//         <Button variant="contained" onClick={submit}>
//           Create Account
//         </Button>

//         <Link component="button" onClick={() => setPage("login")} alignSelf="center">
//           Already have an account? Login
//         </Link>
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

export default function Register({ setPage, setEmail }: any) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await api.post("/auth/register", {
        ...form,
        plan_id: "free",
      });

      if (res.data.flag === "yes") {
        setEmail(form.email);
        setPage("verify"); 
      } else {
        alert(res.data.message || "Registration failed");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Server error");
    }
  };

  return (
    <AuthCard>
      <Stack spacing={2}>
        <Typography variant="h5" align="center">
          Create Patient Account
        </Typography>

        <TextField
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        <TextField
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <TextField
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button variant="contained" onClick={submit}>
          Create Account
        </Button>

        <Link component="button" onClick={() => setPage("login")} alignSelf="center">
          Already have an account? Login
        </Link>
      </Stack>
    </AuthCard>
  );
}
