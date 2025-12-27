// import React, { useState } from "react";
// import { Stack, Typography, TextField, Button } from "@mui/material";
// import { api } from "../api/client";

// export default function UploadReport({ userId }: { userId: string }) {
//   const [reportName, setReportName] = useState("");

//   const submit = async () => {
//     if (!reportName) {
//       alert("Enter report name");
//       return;
//     }

//     await api.post("/report/upload", {
//       user_id: userId,
//       report_name: reportName,
//     });

//     alert("Report uploaded successfully");
//     setReportName("");
//   };

//   return (
//     <Stack spacing={3}>
//       <Typography variant="h6">Upload Medical Report</Typography>

//       <TextField
//         label="Report Name"
//         value={reportName}
//         onChange={e => setReportName(e.target.value)}
//         fullWidth
//       />

//       <Button variant="contained" onClick={submit}>
//         Upload
//       </Button>
//     </Stack>
//   );
// }


// import React, { useState } from "react";
// import { Stack, Typography, TextField, Button } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onDone: () => void;
//   onBack: () => void;
// };

// export default function UploadReport({ userId, onDone, onBack }: Props) {
//   const [reportName, setReportName] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     if (!reportName) {
//       alert("Enter report name");
//       return;
//     }

//     try {
//       setLoading(true);

//       await api.post("/report/upload", {
//         user_id: userId,
//         report_name: reportName,
//       });

//       alert("Report uploaded successfully");
//       setReportName("");
//       onDone();
//     } catch {
//       alert("Failed to upload report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Stack spacing={3} maxWidth={500} mx="auto" mt={5}>
//       <Typography variant="h6">Upload Medical Report</Typography>

//       <TextField
//         label="Report Name"
//         value={reportName}
//         onChange={(e) => setReportName(e.target.value)}
//         fullWidth
//       />

//       <Stack direction="row" spacing={2}>
//         <Button variant="contained" onClick={submit} disabled={loading}>
//           {loading ? "Uploading..." : "Upload"}
//         </Button>
//         <Button onClick={onBack}>Back</Button>
//       </Stack>
//     </Stack>
//   );
// }


// import React, { useState } from "react";
// import {
//   Stack,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Divider,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onBack: () => void;
//   onGoDashboard: () => void;
//   onUploadSuccess: () => void;
// };

// export default function UploadReport({
//   userId,
//   onBack,
//   onGoDashboard,
//   onUploadSuccess,
// }: Props) {
//   const [reportName, setReportName] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ✅ JSON ONLY — matches backend perfectly
//   const submit = async () => {
//     if (!reportName.trim()) {
//       alert("Please enter a report name");
//       return;
//     }

//     if (files.length === 0) {
//       alert("Please select at least one PDF (UI only for now)");
//       return;
//     }

//     setLoading(true);
//     try {
//       await api.post("/report/upload", {
//         user_id: userId,
//         report_name: reportName,
//       });

//       alert(
//         `Report processed successfully.\nDummy test data loaded for ${files.length} PDF(s).`
//       );

//       setReportName("");
//       setFiles([]);

//       // ✅ Go directly to reports dashboard
//       onUploadSuccess();
//     } catch (err: any) {
//       alert(err?.response?.data?.detail || "Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box maxWidth={600} mx="auto" mt={6}>
//       <Stack spacing={4}>
//         <Typography variant="h4" align="center" fontWeight={600}>
//           Upload Medical Report
//         </Typography>

//         <TextField
//           label="Report Name"
//           placeholder="Eg: Annual Blood Test 2024"
//           value={reportName}
//           onChange={(e) => setReportName(e.target.value)}
//           fullWidth
//         />

//         {/* MULTI PDF SELECT (UI ONLY – Phase 1) */}
//         <Button variant="outlined" component="label">
//           {files.length > 0
//             ? `${files.length} PDF(s) selected`
//             : "Select PDF Reports"}
//           <input
//             type="file"
//             hidden
//             multiple
//             accept="application/pdf"
//             onChange={(e) => {
//               if (e.target.files) {
//                 setFiles(Array.from(e.target.files));
//               }
//             }}
//           />
//         </Button>

//         {/* FILE LIST */}
//         {files.length > 0 && (
//           <Stack spacing={1}>
//             {files.map((f, i) => (
//               <Typography key={i} variant="body2">
//                 • {f.name}
//               </Typography>
//             ))}
//           </Stack>
//         )}

//         <Divider />

//         <Button
//           variant="contained"
//           size="large"
//           onClick={submit}
//           disabled={loading}
//         >
//           {loading ? "Uploading..." : "Upload & Analyze"}
//         </Button>

//         {/* NAVIGATION */}
//         <Stack direction="row" justifyContent="space-between">
//           <Button onClick={onBack}>Back</Button>
//           <Button onClick={onGoDashboard}>Dashboard</Button>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// }


import React, { useState } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import { api } from "../api/client";

type Props = {
  userId: string;
  onBack: () => void;
  onGoDashboard: () => void;
  onUploadSuccess: () => void;
};

export default function UploadReport({
  userId,
  onBack,
  onGoDashboard,
  onUploadSuccess,
}: Props) {
  const [reportName, setReportName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reportName.trim()) {
      alert("Enter report name");
      return;
    }

    setLoading(true);
    try {
      await api.post("/report/upload", {
        user_id: userId,
        report_name: reportName,
      });

      onUploadSuccess();
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Stack spacing={4}>
        <Typography variant="h4" align="center">
          Upload Medical Report
        </Typography>

        <TextField
          label="Report Name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
        />

        <Button
          variant="contained"
          size="large"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload & Analyze"}
        </Button>

        <Stack direction="row" justifyContent="space-between">
          <Button onClick={onBack}>Back</Button>
          <Button onClick={onGoDashboard}>Dashboard</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
