// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   LinearProgress,
//   Stack,
//   Divider,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onLogout: () => void;
//   onSelectFeature: (type: "image" | "report") => void;
//   onUpgrade: () => void;
// };

// export default function Dashboard({
//   userId,
//   onLogout,
//   onSelectFeature,
//   onUpgrade,
// }: Props) {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const res = await api.get(`/dashboard/${userId}`);
//         setData(res.data);
//       } catch (err) {
//         console.error("Failed to load dashboard", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, [userId]);

//   if (loading) {
//     return <Box p={5}>Loading dashboard…</Box>;
//   }

//   if (!data) {
//     return <Box p={5}>Unable to load dashboard.</Box>;
//   }

//   /* ---------------- Derived values ---------------- */

//   const user = data.user || {};
//   const subscription = data.subscription || {};
//   const usage = data.usage || {};

//   const planId = subscription.plan_id || "free";
//   const planName = subscription.plan_name || "Free";

//   const limit = subscription.usage_limit ?? 0;
//   const used = usage.current_usage ?? 0;
//   const remaining = Math.max(0, limit - used);

//   const percent =
//     limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

//   const expiresAt = subscription.expires_at;

//   /* ---------------- UI ---------------- */

//   return (
//     <Box p={5}>
//       {/* Header */}
//       <Box mb={4}>
//         <Typography variant="h4" fontWeight={700}>
//           Patient Dashboard
//         </Typography>
//         <Typography color="text.secondary">
//           Welcome {user.full_name || "Patient"}
//         </Typography>
//       </Box>

//       {/* Summary Cards */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Subscription Plan
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {planName}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Usage Today
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {used} / {limit}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Remaining
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {remaining}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Usage Progress */}
//       <Box mb={4}>
//         <Typography mb={1}>Daily Usage</Typography>
//         <LinearProgress
//           variant="determinate"
//           value={percent}
//           sx={{ height: 10, borderRadius: 5 }}
//         />
//         <Typography mt={1} color="text.secondary">
//           {percent}% used today
//         </Typography>
//       </Box>

//       {/* Actions */}
//       <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
//         <Button
//           variant="contained"
//           size="large"
//           onClick={() => onSelectFeature("image")}
//         >
//           Analyze Image
//         </Button>

//         <Button
//           variant="outlined"
//           size="large"
//           onClick={() => onSelectFeature("report")}
//         >
//           Analyze Report
//         </Button>

//         <Button
//           color="secondary"
//           size="large"
//           onClick={onUpgrade}
//         >
//           Upgrade Plan
//         </Button>

//         <Button
//           color="error"
//           size="large"
//           onClick={onLogout}
//         >
//           Logout
//         </Button>
//       </Stack>

//       {/* Subscription Details */}
//       <Card>
//         <CardContent>
//           <Typography color="text.secondary">
//             Subscription Details
//           </Typography>

//           <Divider sx={{ my: 1 }} />

//           <Typography>
//             Plan ID: <strong>{planId}</strong>
//           </Typography>

//           <Typography>
//             Valid Until:{" "}
//             <strong>{expiresAt || "N/A"}</strong>
//           </Typography>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   LinearProgress,
//   Stack,
//   Divider,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onLogout: () => void;
//   onSelectFeature: (type: "image" | "report") => void;
//   onUpgrade: () => void;
// };

// export default function Dashboard({
//   userId,
//   onLogout,
//   onSelectFeature,
//   onUpgrade,
// }: Props) {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const res = await api.get(`/dashboard/${userId}`);
//         setData(res.data);
//       } catch (err) {
//         console.error("Failed to load dashboard", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, [userId]);

//   if (loading) {
//     return <Box p={5}>Loading dashboard…</Box>;
//   }

//   if (!data) {
//     return <Box p={5}>Unable to load dashboard.</Box>;
//   }

//   /* ---------------- Derived values ---------------- */

//   const user = data.user || {};
//   const subscription = data.subscription || {};
//   const usage = data.usage || {};
//   const validity = data.validity || {};

//   const planId = subscription.plan_id || "free";
//   const planName = subscription.plan_name || "Free";

//   const limit = subscription.usage_limit ?? 0;
//   const used = usage.current_usage ?? 0;
//   const remaining = Math.max(0, limit - used);

//   const percent =
//     limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

//   const expiresAt = validity.expires_at;
//   const daysLeft = validity.days_left;

//   const isLimitReached = limit > 0 && used >= limit;

//   /* ---------------- UI ---------------- */

//   return (
//     <Box p={5}>
//       {/* Header */}
//       <Box mb={4}>
//         <Typography variant="h4" fontWeight={700}>
//           Patient Dashboard
//         </Typography>
//         <Typography color="text.secondary">
//           Welcome {user.full_name || "Patient"}
//         </Typography>
//       </Box>

//       {/* Summary Cards */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Subscription Plan
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {planName}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Usage Today
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {used} / {limit}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Remaining
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {remaining}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Usage Progress */}
//       <Box mb={4}>
//         <Typography mb={1}>Daily Usage</Typography>
//         <LinearProgress
//           variant="determinate"
//           value={percent}
//           sx={{ height: 10, borderRadius: 5 }}
//         />
//         <Typography mt={1} color="text.secondary">
//           {percent}% used today
//         </Typography>
//       </Box>

//       {/* Actions */}
//       <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
//         <Button
//           variant="contained"
//           size="large"
//           disabled={isLimitReached}
//           onClick={() => onSelectFeature("image")}
//         >
//           Analyze Image
//         </Button>

//         <Button
//           variant="outlined"
//           size="large"
//           disabled={isLimitReached}
//           onClick={() => onSelectFeature("report")}
//         >
//           Analyze Report
//         </Button>

//         <Button
//           color="secondary"
//           size="large"
//           onClick={onUpgrade}
//         >
//           Upgrade Plan
//         </Button>

//         <Button
//           color="error"
//           size="large"
//           onClick={onLogout}
//         >
//           Logout
//         </Button>
//       </Stack>

//       {/* Subscription Details */}
//       <Card>
//         <CardContent>
//           <Typography color="text.secondary">
//             Subscription Details
//           </Typography>

//           <Divider sx={{ my: 1 }} />

//           <Typography>
//             Plan ID: <strong>{planId}</strong>
//           </Typography>

//           <Typography>
//             Valid Until:{" "}
//             <strong>{expiresAt || "N/A"}</strong>
//           </Typography>

//           {daysLeft !== null && daysLeft !== undefined && (
//             <Typography color="text.secondary">
//               Days Remaining: <strong>{daysLeft}</strong>
//             </Typography>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   LinearProgress,
//   Stack,
//   Divider,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onLogout: () => void;
//   onSelectFeature: (type: "image" | "report" | "overview") => void;
//   onUpgrade: () => void;
// };

// export default function Dashboard({
//   userId,
//   onLogout,
//   onSelectFeature,
//   onUpgrade,
// }: Props) {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const res = await api.get(`/dashboard/${userId}`);
//         setData(res.data);
//       } catch (err) {
//         console.error("Failed to load dashboard", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, [userId]);

//   if (loading) {
//     return <Box p={5}>Loading dashboard…</Box>;
//   }

//   if (!data) {
//     return <Box p={5}>Unable to load dashboard.</Box>;
//   }

//   /* ---------------- Derived values ---------------- */

//   const user = data.user ?? {};
//   const subscription = data.subscription ?? {};
//   const usage = data.usage ?? {};

//   const planId = subscription.plan_id ?? "free";
//   const planName = subscription.plan_name ?? "Free";

//   const limit = subscription.usage_limit ?? 0;
//   const used = usage.current_usage ?? 0;
//   const remaining = Math.max(0, limit - used);

//   const percent =
//     limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

//   const expiresAt = subscription.expires_at;
//   const daysLeft = subscription.days_left;

//   const isLimitReached = limit > 0 && used >= limit;

//   /* ---------------- UI ---------------- */

//   return (
//     <Box p={5}>
//       {/* Header */}
//       <Box mb={4}>
//         <Typography variant="h4" fontWeight={700}>
//           Patient Dashboard
//         </Typography>
//         <Typography color="text.secondary">
//           Welcome {user.full_name || "Patient"}
//         </Typography>
//       </Box>

//       {/* Summary Cards */}
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Subscription Plan
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {planName}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Usage Today
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {used} / {limit}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <Card>
//             <CardContent>
//               <Typography color="text.secondary">
//                 Remaining
//               </Typography>
//               <Typography variant="h5" fontWeight={600}>
//                 {remaining}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Usage Progress */}
//       <Box mb={4}>
//         <Typography mb={1}>Daily Usage</Typography>
//         <LinearProgress
//           variant="determinate"
//           value={percent}
//           sx={{ height: 10, borderRadius: 5 }}
//         />
//         <Typography mt={1} color="text.secondary">
//           {percent}% used today
//         </Typography>
//       </Box>

//       {/* Actions */}
//       <Stack direction="row" spacing={2} mb={4} flexWrap="wrap">
//         <Button
//           variant="contained"
//           size="large"
//           disabled={isLimitReached}
//           onClick={() => onSelectFeature("image")}
//         >
//           Analyze Image
//         </Button>

//         <Button
//           variant="outlined"
//           size="large"
//           onClick={() => onSelectFeature("overview")}
//         >
//           Patient Overview
//         </Button>


//         <Button
//           variant="outlined"
//           size="large"
//           disabled={isLimitReached}
//           onClick={() => onSelectFeature("report")}
//         >
//           Analyze Report
//         </Button>

//         <Button
//           color="secondary"
//           size="large"
//           onClick={onUpgrade}
//         >
//           Upgrade Plan
//         </Button>

//         <Button
//           color="error"
//           size="large"
//           onClick={onLogout}
//         >
//           Logout
//         </Button>
//       </Stack>

//       {/* Subscription Details */}
//       <Card>
//         <CardContent>
//           <Typography color="text.secondary">
//             Subscription Details
//           </Typography>

//           <Divider sx={{ my: 1 }} />

//           <Typography>
//             Plan ID: <strong>{planId}</strong>
//           </Typography>

//           <Typography>
//             Valid Until:{" "}
//             <strong>
//               {expiresAt
//                 ? new Date(expiresAt).toLocaleString()
//                 : "N/A"}
//             </strong>
//           </Typography>

//           {daysLeft !== null && daysLeft !== undefined && (
//             <Typography color="text.secondary">
//               Days Remaining: <strong>{daysLeft}</strong>
//             </Typography>
//           )}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Stack,
  Divider,
} from "@mui/material";
import { api } from "../api/client";

type Props = {
  userId: string;
  onLogout: () => void;
  onSelectFeature: (type: "image" | "report" | "overview") => void;
  onUpgrade: () => void;
};

export default function Dashboard({
  userId,
  onLogout,
  onSelectFeature,
  onUpgrade,
}: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get(`/dashboard/${userId}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  if (loading) return <Box p={5}>Loading dashboard…</Box>;
  if (!data) return <Box p={5}>Unable to load dashboard.</Box>;

  const user = data.user ?? {};
  const subscription = data.subscription ?? {};
  const usage = data.usage ?? {};

  const limit = subscription.usage_limit ?? 0;
  const used = usage.current_usage ?? 0;
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isLimitReached = limit > 0 && used >= limit;

  return (
    <Box p={5}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Patient Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome {user.full_name || "Patient"}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Subscription Plan
              </Typography>
              <Typography variant="h5">
                {subscription.plan_name || "Free"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Usage Today
              </Typography>
              <Typography variant="h5">
                {used} / {limit}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Remaining
              </Typography>
              <Typography variant="h5">
                {Math.max(0, limit - used)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Bar */}
      <Box mb={4}>
        <Typography mb={1}>Daily Usage</Typography>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Button
          variant="contained"
          disabled={isLimitReached}
          onClick={() => onSelectFeature("image")}
        >
          Analyze Image
        </Button>

        <Button
          variant="contained"
          disabled={isLimitReached}
          onClick={() => onSelectFeature("report")}
        >
          Analyze Report
        </Button>

        <Button
          variant="outlined"
          onClick={() => onSelectFeature("overview")}
        >
          Patient Overview
        </Button>

        <Button color="secondary" onClick={onUpgrade}>
          Upgrade Plan
        </Button>

        <Button color="error" onClick={onLogout}>
          Logout
        </Button>
      </Stack>

      {/* Subscription Info */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography color="text.secondary">
            Subscription Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography>
            Valid Until:{" "}
            <strong>
              {subscription.expires_at
                ? new Date(subscription.expires_at).toLocaleString()
                : "N/A"}
            </strong>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

