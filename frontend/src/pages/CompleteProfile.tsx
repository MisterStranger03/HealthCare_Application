// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   MenuItem,
//   Stack,
//   Typography,
// } from "@mui/material";
// import AuthCard from "../components/AuthCard";
// import { api } from "../api/client";

// export default function CompleteProfile({ userId, onDone }: any) {
//   const [form, setForm] = useState({
//     plan_id: "free",
//     country: "India",
//     state: "",
//     dob: "1990-01-01",
//     language: "English",
//     gender: "Male",
//     user_type: "patient",
//   });

//   const submit = async () => {
//     const res = await api.post("/auth/complete-profile", {
//       user_id: userId,
//       ...form,
//     });

//     if (res.data.flag === "yes") {
//       onDone();
//     } else {
//       alert(res.data.message);
//     }
//   };

//   return (
//     <AuthCard>
//       <Stack spacing={3}>
//         <Typography variant="h5" align="center">
//           Complete Your Profile
//         </Typography>

//         <TextField
//           select
//           label="Plan"
//           value={form.plan_id}
//           onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
//         >
//           <MenuItem value="free">Free</MenuItem>
//           <MenuItem value="basic">Basic</MenuItem>
//           <MenuItem value="pro">Pro</MenuItem>
//         </TextField>

//         <TextField
//           label="Country"
//           value={form.country}
//           onChange={(e) => setForm({ ...form, country: e.target.value })}
//         />

//         <TextField
//           label="State"
//           value={form.state}
//           onChange={(e) => setForm({ ...form, state: e.target.value })}
//         />

//         <TextField
//           type="date"
//           label="Date of Birth"
//           InputLabelProps={{ shrink: true }}
//           value={form.dob}
//           onChange={(e) => setForm({ ...form, dob: e.target.value })}
//         />

//         <TextField
//           select
//           label="Language"
//           value={form.language}
//           onChange={(e) => setForm({ ...form, language: e.target.value })}
//         >
//           <MenuItem value="English">English</MenuItem>
//           <MenuItem value="Hindi">Hindi</MenuItem>
//         </TextField>

//         <TextField
//           select
//           label="Gender"
//           value={form.gender}
//           onChange={(e) => setForm({ ...form, gender: e.target.value })}
//         >
//           <MenuItem value="Male">Male</MenuItem>
//           <MenuItem value="Female">Female</MenuItem>
//           <MenuItem value="Other">Other</MenuItem>
//         </TextField>

//         <Button variant="contained" onClick={submit}>
//           Finish Setup
//         </Button>
//       </Stack>
//     </AuthCard>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {
//   TextField,
//   Button,
//   MenuItem,
//   Stack,
//   Typography,
// } from "@mui/material";
// import AuthCard from "../components/AuthCard";
// import { api } from "../api/client";

// import { Country, State } from "country-state-city";

// export default function CompleteProfile({ userId, onDone }: any) {
//   const countries = Country.getAllCountries();

//   const [states, setStates] = useState<any[]>([]);

//   const [form, setForm] = useState({
//     plan_id: "free",
//     country: "India",
//     countryCode: "IN",
//     state: "",
//     dob: "1990-01-01",
//     language: "English",
//     gender: "Male",
//     user_type: "patient",
//   });

//   // Update states when country changes
//   useEffect(() => {
//     const selectedCountry = countries.find(
//       (c) => c.name === form.country
//     );
//     if (selectedCountry) {
//       const s = State.getStatesOfCountry(selectedCountry.isoCode);
//       setStates(s);
//       setForm((f) => ({
//         ...f,
//         countryCode: selectedCountry.isoCode,
//         state: "",
//       }));
//     }
//   }, [form.country]);

//   const submit = async () => {
//     try {
//       const res = await api.post("/auth/complete-profile", {
//         user_id: userId,
//         plan_id: form.plan_id,
//         country: form.country,
//         state: form.state,
//         dob: form.dob,
//         language: form.language,
//         gender: form.gender,
//         user_type: form.user_type,
//       });

//       if (res.data.flag === "yes") {
//         onDone();
//       } else {
//         alert(res.data.message || "Failed to save profile");
//       }
//     } catch (err: any) {
//       alert(err?.response?.data?.message || "Server error");
//     }
//   };

//   return (
//     <AuthCard>
//       <Stack spacing={3}>
//         <Typography variant="h5" align="center">
//           Complete Your Profile
//         </Typography>

//         <TextField select label="Plan" value={form.plan_id}
//           onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
//         >
//           <MenuItem value="free">Free</MenuItem>
//           <MenuItem value="basic">Basic</MenuItem>
//           <MenuItem value="pro">Pro</MenuItem>
//         </TextField>

//         <TextField
//           select
//           label="Country"
//           value={form.country}
//           onChange={(e) => setForm({ ...form, country: e.target.value })}
//         >
//           {countries.map((c) => (
//             <MenuItem key={c.isoCode} value={c.name}>
//               {c.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         <TextField
//           select
//           label="State"
//           value={form.state}
//           onChange={(e) => setForm({ ...form, state: e.target.value })}
//           disabled={!states.length}
//         >
//           {states.map((s) => (
//             <MenuItem key={s.isoCode} value={s.name}>
//               {s.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         <TextField
//           type="date"
//           label="Date of Birth"
//           InputLabelProps={{ shrink: true }}
//           value={form.dob}
//           onChange={(e) => setForm({ ...form, dob: e.target.value })}
//         />

//         <TextField
//           select
//           label="Language"
//           value={form.language}
//           onChange={(e) => setForm({ ...form, language: e.target.value })}
//         >
//           <MenuItem value="English">English</MenuItem>
//           <MenuItem value="Hindi">Hindi</MenuItem>
//           <MenuItem value="Spanish">Spanish</MenuItem>
//           <MenuItem value="French">French</MenuItem>
//         </TextField>

//         <TextField
//           select
//           label="Gender"
//           value={form.gender}
//           onChange={(e) => setForm({ ...form, gender: e.target.value })}
//         >
//           <MenuItem value="Male">Male</MenuItem>
//           <MenuItem value="Female">Female</MenuItem>
//           <MenuItem value="Other">Other</MenuItem>
//         </TextField>

//         <Button variant="contained" onClick={submit}>
//           Finish Setup
//         </Button>
//       </Stack>
//     </AuthCard>
//   );
// }


// import React, { useMemo, useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Stack,
//   MenuItem,
// } from "@mui/material";
// import AuthCard from "../components/AuthCard";
// import { api } from "../api/client";

// import { Country, State } from "country-state-city";

// type Props = {
//   userId: string | null;
//   onDone: () => void; // go to LOGIN
// };

// const LANGUAGES = [
//   "English",
//   "Hindi",
//   "Spanish",
//   "French",
//   "German",
//   "Chinese",
//   "Japanese",
//   "Arabic",
// ];

// export default function CompleteProfile({ userId, onDone }: Props) {
//   const [countryCode, setCountryCode] = useState("IN");
//   const [stateCode, setStateCode] = useState("");
//   const [gender, setGender] = useState("");
//   const [language, setLanguage] = useState("English");
//   const [dob, setDob] = useState("");

//   /* -------------------------
//      Derived lists
//      ------------------------- */

//   const countries = useMemo(() => Country.getAllCountries(), []);
//   const states = useMemo(
//     () => State.getStatesOfCountry(countryCode),
//     [countryCode]
//   );

//   /* -------------------------
//      Submit
//      ------------------------- */

//   const submit = async () => {
//     if (!userId) {
//       alert("Missing user id. Please login again.");
//       return;
//     }

//     if (!gender || !dob || !language || !countryCode) {
//       alert("Please fill all required fields.");
//       return;
//     }

//     const country = countries.find(c => c.isoCode === countryCode)?.name;
//     const state = states.find(s => s.isoCode === stateCode)?.name;

//     try {
//       const res = await api.post("/auth/complete-profile", {
//         user_id: userId,
//         gender,
//         dob,              // ✅ ONLY dob — backend computes age
//         language,
//         country,
//         state,
//       });

//       if (res.data.flag === "yes") {
//         alert("Profile completed. Please login.");
//         onDone(); // 👉 LOGIN
//       } else {
//         alert(res.data.message || "Failed to complete profile");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Profile completion failed.");
//     }
//   };

//   /* -------------------------
//      UI
//      ------------------------- */

//   return (
//     <AuthCard>
//       <Stack spacing={3}>
//         <Typography variant="h6">Complete Profile</Typography>

//         {/* Gender */}
//         <TextField
//           select
//           label="Gender"
//           value={gender}
//           onChange={e => setGender(e.target.value)}
//           fullWidth
//         >
//           <MenuItem value="Male">Male</MenuItem>
//           <MenuItem value="Female">Female</MenuItem>
//           <MenuItem value="Other">Other</MenuItem>
//           <MenuItem value="Prefer not to say">
//             Prefer not to say
//           </MenuItem>
//         </TextField>

//         {/* DOB */}
//         <TextField
//           label="Date of Birth"
//           type="date"
//           InputLabelProps={{ shrink: true }}
//           value={dob}
//           onChange={e => setDob(e.target.value)}
//           fullWidth
//         />

//         {/* Country */}
//         <TextField
//           select
//           label="Country"
//           value={countryCode}
//           onChange={e => {
//             setCountryCode(e.target.value);
//             setStateCode("");
//           }}
//           fullWidth
//         >
//           {countries.map(c => (
//             <MenuItem key={c.isoCode} value={c.isoCode}>
//               {c.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* State */}
//         <TextField
//           select
//           label="State"
//           value={stateCode}
//           onChange={e => setStateCode(e.target.value)}
//           fullWidth
//           disabled={!states.length}
//         >
//           {states.map(s => (
//             <MenuItem key={s.isoCode} value={s.isoCode}>
//               {s.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* Language */}
//         <TextField
//           select
//           label="Language"
//           value={language}
//           onChange={e => setLanguage(e.target.value)}
//           fullWidth
//         >
//           {LANGUAGES.map(l => (
//             <MenuItem key={l} value={l}>
//               {l}
//             </MenuItem>
//           ))}
//         </TextField>

//         <Button variant="contained" onClick={submit}>
//           Save & Continue
//         </Button>
//       </Stack>
//     </AuthCard>
//   );
// }


// import React, { useMemo, useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Stack,
//   MenuItem,
// } from "@mui/material";
// import AuthCard from "../components/AuthCard";
// import { api } from "../api/client";

// import { Country, State } from "country-state-city";

// type Props = {
//   userId: string | null;
//   onDone: () => void; // redirect to LOGIN
// };

// const LANGUAGES = [
//   "English",
//   "Hindi",
//   "Spanish",
//   "French",
//   "German",
//   "Chinese",
//   "Japanese",
//   "Arabic",
// ];

// const BLOOD_GROUPS = [
//   "A+",
//   "A-",
//   "B+",
//   "B-",
//   "AB+",
//   "AB-",
//   "O+",
//   "O-",
// ];

// export default function CompleteProfile({ userId, onDone }: Props) {
//   /* -------------------------
//      State
//      ------------------------- */

//   const [countryCode, setCountryCode] = useState("IN");
//   const [stateCode, setStateCode] = useState("");
//   const [gender, setGender] = useState("");
//   const [language, setLanguage] = useState("English");
//   const [dob, setDob] = useState("");

//   // Medical
//   const [bloodGroup, setBloodGroup] = useState("");
//   const [heightCm, setHeightCm] = useState<string>("");
//   const [weightKg, setWeightKg] = useState<string>("");
//   const [allergies, setAllergies] = useState("");

//   /* -------------------------
//      Derived lists
//      ------------------------- */

//   const countries = useMemo(() => Country.getAllCountries(), []);
//   const states = useMemo(
//     () => State.getStatesOfCountry(countryCode),
//     [countryCode]
//   );

//   /* -------------------------
//      Submit
//      ------------------------- */

//   const submit = async () => {
//     if (!userId) {
//       alert("Missing user id. Please login again.");
//       return;
//     }

//     if (!gender || !dob || !language || !countryCode) {
//       alert("Please fill all required fields.");
//       return;
//     }

//     const country = countries.find(c => c.isoCode === countryCode)?.name;
//     const state = states.find(s => s.isoCode === stateCode)?.name;

//     try {
//       const res = await api.post("/auth/complete-profile", {
//         user_id: userId,

//         // Demographics
//         gender,
//         dob,                // backend computes age + age_group
//         language,
//         country,
//         state,

//         // Medical
//         blood_group: bloodGroup || null,
//         height: heightCm ? Number(heightCm) : null, // cm allowed
//         weight: weightKg ? Number(weightKg) : null, // kg
//         allergies: allergies || null,
//       });

//       if (res.data.status === "success" || res.data.flag === "yes") {
//         alert("Profile completed successfully. Please login.");
//         onDone(); // 👉 LOGIN
//       } else {
//         alert(res.data.message || "Failed to complete profile");
//       }
//     } catch (err: any) {
//       console.error(err);
//       alert(err?.response?.data?.message || "Profile completion failed.");
//     }
//   };

//   /* -------------------------
//      UI
//      ------------------------- */

//   return (
//     <AuthCard>
//       <Stack spacing={3}>
//         <Typography variant="h6" align="center">
//           Complete Your Profile
//         </Typography>

//         {/* Gender */}
//         <TextField
//           select
//           label="Gender"
//           value={gender}
//           onChange={e => setGender(e.target.value)}
//           fullWidth
//           required
//         >
//           <MenuItem value="Male">Male</MenuItem>
//           <MenuItem value="Female">Female</MenuItem>
//           <MenuItem value="Other">Other</MenuItem>
//           <MenuItem value="Prefer not to say">
//             Prefer not to say
//           </MenuItem>
//         </TextField>

//         {/* Date of Birth */}
//         <TextField
//           label="Date of Birth"
//           type="date"
//           InputLabelProps={{ shrink: true }}
//           value={dob}
//           onChange={e => setDob(e.target.value)}
//           fullWidth
//           required
//         />

//         {/* Country */}
//         <TextField
//           select
//           label="Country"
//           value={countryCode}
//           onChange={e => {
//             setCountryCode(e.target.value);
//             setStateCode("");
//           }}
//           fullWidth
//           required
//         >
//           {countries.map(c => (
//             <MenuItem key={c.isoCode} value={c.isoCode}>
//               {c.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* State */}
//         <TextField
//           select
//           label="State"
//           value={stateCode}
//           onChange={e => setStateCode(e.target.value)}
//           fullWidth
//           disabled={!states.length}
//         >
//           {states.map(s => (
//             <MenuItem key={s.isoCode} value={s.isoCode}>
//               {s.name}
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* Language */}
//         <TextField
//           select
//           label="Language"
//           value={language}
//           onChange={e => setLanguage(e.target.value)}
//           fullWidth
//           required
//         >
//           {LANGUAGES.map(l => (
//             <MenuItem key={l} value={l}>
//               {l}
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* Blood Group */}
//         <TextField
//           select
//           label="Blood Group"
//           value={bloodGroup}
//           onChange={e => setBloodGroup(e.target.value)}
//           fullWidth
//         >
//           {BLOOD_GROUPS.map(bg => (
//             <MenuItem key={bg} value={bg}>
//               {bg}
//             </MenuItem>
//           ))}
//         </TextField>

//         {/* Height */}
//         <TextField
//           label="Height (cm)"
//           type="number"
//           value={heightCm}
//           onChange={e => setHeightCm(e.target.value)}
//           fullWidth
//           inputProps={{ min: 50, max: 250 }}
//         />

//         {/* Weight */}
//         <TextField
//           label="Weight (kg)"
//           type="number"
//           value={weightKg}
//           onChange={e => setWeightKg(e.target.value)}
//           fullWidth
//           inputProps={{ min: 1, max: 400 }}
//         />

//         {/* Allergies */}
//         <TextField
//           label="Allergies (if any)"
//           value={allergies}
//           onChange={e => setAllergies(e.target.value)}
//           fullWidth
//           multiline
//           rows={2}
//           placeholder="e.g. peanuts, pollen"
//         />

//         <Button variant="contained" onClick={submit}>
//           Save & Continue
//         </Button>
//       </Stack>
//     </AuthCard>
//   );
// }



import React, { useMemo, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Stack,
  MenuItem,
} from "@mui/material";
import AuthCard from "../components/AuthCard";
import { api } from "../api/client";

import { Country, State } from "country-state-city";
import ISO6391 from "iso-639-1";

type Props = {
  userId: string | null;
  onDone: () => void; // redirect to LOGIN
};

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export default function CompleteProfile({ userId, onDone }: Props) {
  /* -------------------------
     State
     ------------------------- */

  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode] = useState("");
  const [gender, setGender] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const [dob, setDob] = useState("");

  // Medical
  const [bloodGroup, setBloodGroup] = useState("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [allergies, setAllergies] = useState("");

  /* -------------------------
     Derived lists
     ------------------------- */

  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => State.getStatesOfCountry(countryCode),
    [countryCode]
  );

  const languages = useMemo(
    () =>
      ISO6391.getAllCodes()
        .map(code => ({
          code,
          name: ISO6391.getName(code),
        }))
        .filter(l => l.name)
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  /* -------------------------
     Submit
     ------------------------- */

  const submit = async () => {
    if (!userId) {
      alert("Missing user id. Please login again.");
      return;
    }

    if (!gender || !dob || !languageCode || !countryCode) {
      alert("Please fill all required fields.");
      return;
    }

    const country = countries.find(c => c.isoCode === countryCode)?.name;
    const state = states.find(s => s.isoCode === stateCode)?.name;

    try {
      const res = await api.post("/auth/complete-profile", {
        user_id: userId,

        // Demographics
        gender,
        dob, // backend computes age + age_group
        language: languageCode, // ✅ store ISO code
        country,
        state,

        // Medical
        blood_group: bloodGroup || null,
        height: heightCm ? Number(heightCm) : null, // cm allowed
        weight: weightKg ? Number(weightKg) : null, // kg
        allergies: allergies || null,
      });

      if (res.data.status === "success" || res.data.flag === "yes") {
        alert("Profile completed successfully. Please login.");
        onDone(); // 👉 LOGIN
      } else {
        alert(res.data.message || "Failed to complete profile");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Profile completion failed.");
    }
  };

  /* -------------------------
     UI
     ------------------------- */

  return (
    <AuthCard>
      <Stack spacing={3}>
        <Typography variant="h6" align="center">
          Complete Your Profile
        </Typography>

        {/* Gender */}
        <TextField
          select
          label="Gender"
          value={gender}
          onChange={e => setGender(e.target.value)}
          fullWidth
          required
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
          <MenuItem value="Prefer not to say">
            Prefer not to say
          </MenuItem>
        </TextField>

        {/* Date of Birth */}
        <TextField
          label="Date of Birth"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dob}
          onChange={e => setDob(e.target.value)}
          fullWidth
          required
        />

        {/* Country */}
        <TextField
          select
          label="Country"
          value={countryCode}
          onChange={e => {
            setCountryCode(e.target.value);
            setStateCode("");
          }}
          fullWidth
          required
        >
          {countries.map(c => (
            <MenuItem key={c.isoCode} value={c.isoCode}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        {/* State */}
        <TextField
          select
          label="State"
          value={stateCode}
          onChange={e => setStateCode(e.target.value)}
          fullWidth
          disabled={!states.length}
        >
          {states.map(s => (
            <MenuItem key={s.isoCode} value={s.isoCode}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Language */}
        <TextField
          select
          label="Language"
          value={languageCode}
          onChange={e => setLanguageCode(e.target.value)}
          fullWidth
          required
        >
          {languages.map(l => (
            <MenuItem key={l.code} value={l.code}>
              {l.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Blood Group */}
        <TextField
          select
          label="Blood Group"
          value={bloodGroup}
          onChange={e => setBloodGroup(e.target.value)}
          fullWidth
        >
          {BLOOD_GROUPS.map(bg => (
            <MenuItem key={bg} value={bg}>
              {bg}
            </MenuItem>
          ))}
        </TextField>

        {/* Height */}
        <TextField
          label="Height (cm)"
          type="number"
          value={heightCm}
          onChange={e => setHeightCm(e.target.value)}
          fullWidth
          inputProps={{ min: 50, max: 250 }}
        />

        {/* Weight */}
        <TextField
          label="Weight (kg)"
          type="number"
          value={weightKg}
          onChange={e => setWeightKg(e.target.value)}
          fullWidth
          inputProps={{ min: 1, max: 400 }}
        />

        {/* Allergies */}
        <TextField
          label="Allergies (if any)"
          value={allergies}
          onChange={e => setAllergies(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="e.g. peanuts, pollen"
        />

        <Button variant="contained" onClick={submit}>
          Save & Continue
        </Button>
      </Stack>
    </AuthCard>
  );
}
