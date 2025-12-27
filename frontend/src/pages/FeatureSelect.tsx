// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   Stack,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onBack: () => void;
// };

// export default function FeatureSelect({ userId, onBack }: Props) {
//   const [feature, setFeature] = useState<"image" | "report">("image");
//   const [loading, setLoading] = useState(false);

//   const useFeature = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/feature/use", {
//         user_id: userId,
//         selection: feature,
//       });

//       if (res.data.flag === "yes") {
//         alert(`Successfully used ${feature} feature`);
//         onBack();
//       } else {
//         alert(res.data.message || "Feature usage failed");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box p={5} maxWidth={500} mx="auto">
//       <Typography variant="h4" fontWeight={700} mb={3}>
//         Select Feature
//       </Typography>

//       <Card>
//         <CardContent>
//           <RadioGroup
//             value={feature}
//             onChange={(e) =>
//               setFeature(e.target.value as "image" | "report")
//             }
//           >
//             <FormControlLabel
//               value="image"
//               control={<Radio />}
//               label="Analyze Image"
//             />
//             <FormControlLabel
//               value="report"
//               control={<Radio />}
//               label="Analyze Report"
//             />
//           </RadioGroup>

//           <Stack direction="row" spacing={2} mt={3}>
//             <Button
//               variant="contained"
//               disabled={loading}
//               onClick={useFeature}
//             >
//               Use Feature
//             </Button>

//             <Button color="secondary" onClick={onBack}>
//               Back
//             </Button>
//           </Stack>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   Stack,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onBack: () => void;
//   onReportSelected: () => void; // 🔥 NEW — navigate to report upload
// };

// export default function FeatureSelect({
//   userId,
//   onBack,
//   onReportSelected,
// }: Props) {
//   const [feature, setFeature] = useState<"image" | "report">("image");
//   const [loading, setLoading] = useState(false);

//   const useFeature = async () => {
//     setLoading(true);

//     try {
//       const res = await api.post("/feature/use", {
//         user_id: userId,
//         selection: feature,
//       });

//       if (res.data.flag !== "yes") {
//         alert(res.data.message || "Feature usage failed");
//         return;
//       }

//       // ---------------------------------------
//       // FEATURE FLOW
//       // ---------------------------------------
//       if (feature === "image") {
//         alert("Image feature activated");
//         onBack(); // back to dashboard (or image page later)
//       }

//       if (feature === "report") {
//         onReportSelected(); // 👉 go to ReportUpload
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong while using feature");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box p={5} maxWidth={500} mx="auto">
//       <Typography variant="h4" fontWeight={700} mb={3}>
//         Select Feature
//       </Typography>

//       <Card>
//         <CardContent>
//           <RadioGroup
//             value={feature}
//             onChange={(e) =>
//               setFeature(e.target.value as "image" | "report")
//             }
//           >
//             <FormControlLabel
//               value="image"
//               control={<Radio />}
//               label="Analyze Image"
//             />

//             <FormControlLabel
//               value="report"
//               control={<Radio />}
//               label="Analyze Medical Report"
//             />
//           </RadioGroup>

//           <Stack direction="row" spacing={2} mt={3}>
//             <Button
//               variant="contained"
//               disabled={loading}
//               onClick={useFeature}
//             >
//               {loading ? "Processing..." : "Use Feature"}
//             </Button>

//             <Button color="secondary" onClick={onBack}>
//               Back
//             </Button>
//           </Stack>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


// import React, { useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   Stack,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onBack: () => void;
//   onSelectFeature: (feature: "image" | "report") => void;
// };

// export default function FeatureSelect({
//   userId,
//   onBack,
//   onSelectFeature,
// }: Props) {
//   const [feature, setFeature] = useState<"image" | "report">("image");
//   const [loading, setLoading] = useState(false);

//   const useFeature = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post("/feature/use", {
//         user_id: userId,
//         feature,
//       });

//       if (res.data.status === "success") {
//         onSelectFeature(feature);
//       } else {
//         alert(res.data.message || "Feature usage failed");
//       }
//     } catch {
//       alert("Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box p={5} maxWidth={500} mx="auto">
//       <Typography variant="h4" mb={3}>
//         Select Feature
//       </Typography>

//       <Card>
//         <CardContent>
//           <RadioGroup
//             value={feature}
//             onChange={(e) =>
//               setFeature(e.target.value as "image" | "report")
//             }
//           >
//             <FormControlLabel
//               value="image"
//               control={<Radio />}
//               label="Analyze Image"
//             />
//             <FormControlLabel
//               value="report"
//               control={<Radio />}
//               label="Analyze Report"
//             />
//           </RadioGroup>

//           <Stack direction="row" spacing={2} mt={3}>
//             <Button
//               variant="contained"
//               onClick={useFeature}
//               disabled={loading}
//             >
//               {loading ? "Processing..." : "Use Feature"}
//             </Button>

//             <Button onClick={onBack}>Back</Button>
//           </Stack>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { api } from "../api/client";

type Props = {
  userId: string;
  onNavigate: (page: "dashboard" | "upload-report") => void;
};

export default function FeatureSelect({ userId, onNavigate }: Props) {
  const [feature, setFeature] = useState<"image" | "report">("image");
  const [loading, setLoading] = useState(false);

  const useFeature = async () => {
    setLoading(true);
    try {
      const res = await api.post("/feature/use", {
        user_id: userId,
        selection: feature,
      });

      if (res.data.flag === "yes") {
        if (res.data.task === "report_done") {
          onNavigate("upload-report");
        } else {
          alert("Image feature activated");
          onNavigate("dashboard");
        }
      } else {
        alert(res.data.message || "Failed to use feature");
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} maxWidth={500} mx="auto">
      <Typography variant="h4" mb={3}>
        Select Feature
      </Typography>

      <Card>
        <CardContent>
          <RadioGroup
            value={feature}
            onChange={(e) =>
              setFeature(e.target.value as "image" | "report")
            }
          >
            <FormControlLabel
              value="image"
              control={<Radio />}
              label="Analyze Image"
            />
            <FormControlLabel
              value="report"
              control={<Radio />}
              label="Analyze Report"
            />
          </RadioGroup>

          <Stack direction="row" spacing={2} mt={3}>
            <Button
              variant="contained"
              onClick={useFeature}
              disabled={loading}
            >
              {loading ? "Processing..." : "Use Feature"}
            </Button>

            <Button onClick={() => onNavigate("dashboard")}>
              Back
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
