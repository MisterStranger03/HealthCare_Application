// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Stack,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
//   Divider,
// } from "@mui/material";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
//   onBack: () => void;
// };

// export default function Subscribe({ userId, onBack }: Props) {
//   const [plan, setPlan] = useState("free");
//   const [cycle, setCycle] = useState("monthly");
//   const [price, setPrice] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);

//   /* -------------------------
//      Fetch price preview
//      ------------------------- */
//   useEffect(() => {
//     const fetchPrice = async () => {
//       try {
//         const res = await api.post("/subscription/preview", {
//           plan_id: plan,
//           billing_cycle: cycle,
//         });
//         setPrice(res.data.final_price);
//       } catch {
//         setPrice(null);
//       }
//     };

//     fetchPrice();
//   }, [plan, cycle]);

//   /* -------------------------
//      Subscribe
//      ------------------------- */
//   const subscribe = async (paid: boolean) => {
//     setLoading(true);
//     try {
//       const res = await api.post("/subscription/upgrade", {
//         user_id: userId,
//         new_plan_id: plan,
//         billing_cycle: cycle,
//         paid,
//       });

//       if (res.data.flag === "yes") {
//         alert("Subscription updated successfully");
//         onBack();
//       } else {
//         alert(res.data.message || "Subscription failed");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box p={5} maxWidth={600} mx="auto">
//       <Typography variant="h4" fontWeight={700} mb={3}>
//         Upgrade Subscription
//       </Typography>

//       <Card>
//         <CardContent>
//           {/* PLAN */}
//           <Typography fontWeight={600}>Choose Plan</Typography>
//           <RadioGroup
//             value={plan}
//             onChange={(e) => setPlan(e.target.value)}
//           >
//             <FormControlLabel value="free" control={<Radio />} label="Free" />
//             <FormControlLabel value="basic" control={<Radio />} label="Basic" />
//             <FormControlLabel value="pro" control={<Radio />} label="Pro" />
//           </RadioGroup>

//           <Divider sx={{ my: 2 }} />

//           {/* BILLING */}
//           <Typography fontWeight={600}>Billing Cycle</Typography>
//           <RadioGroup
//             value={cycle}
//             onChange={(e) => setCycle(e.target.value)}
//           >
//             <FormControlLabel
//               value="monthly"
//               control={<Radio />}
//               label="Monthly"
//             />
//             <FormControlLabel
//               value="quarterly"
//               control={<Radio />}
//               label="Quarterly"
//             />
//             <FormControlLabel
//               value="yearly"
//               control={<Radio />}
//               label="Yearly"
//             />
//           </RadioGroup>

//           <Divider sx={{ my: 2 }} />

//           {/* PRICE */}
//           <Typography>
//             Price:{" "}
//             <strong>
//               {price !== null ? `₹${price}` : "Calculating…"}
//             </strong>
//           </Typography>

//           <Stack direction="row" spacing={2} mt={3}>
//             <Button
//               variant="contained"
//               disabled={loading}
//               onClick={() => subscribe(true)}
//             >
//               Pay & Subscribe
//             </Button>

//             <Button
//               variant="outlined"
//               disabled={loading}
//               onClick={() => subscribe(false)}
//             >
//               Set Pending
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


import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { api } from "../api/client";

type Props = {
  userId: string;
  onBack: () => void;
};

export default function Subscribe({ userId, onBack }: Props) {
  const [plan, setPlan] = useState("free");
  const [cycle, setCycle] = useState<"monthly" | "quarterly" | "yearly">(
    "monthly"
  );
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* -------------------------
     Fetch price preview
     (EXACT Streamlit equivalent)
     ------------------------- */
  useEffect(() => {
    let cancelled = false;

    const fetchPrice = async () => {
      setPrice(null);
      try {
        const res = await api.post("/subscription/price", {
          plan_id: plan,
          billing_cycle: cycle,
        });

        if (!cancelled) {
          setPrice(res.data.final_price);
        }
      } catch (err) {
        console.error("Failed to fetch price", err);
        if (!cancelled) {
          setPrice(null);
        }
      }
    };

    fetchPrice();
    return () => {
      cancelled = true;
    };
  }, [plan, cycle]);

  /* -------------------------
     Subscribe / Upgrade
     ------------------------- */
  const subscribe = async (paid: boolean) => {
    if (price === null) {
      alert("Price not available yet");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/subscription/upgrade", {
        user_id: userId,
        new_plan_id: plan,
        billing_cycle: cycle,
        paid,
        price,
        transaction_id: crypto.randomUUID(),
      });

      if (res.data.flag === "yes") {
        alert("Subscription updated successfully");
        onBack();
      } else {
        alert(res.data.message || "Subscription failed");
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.detail || "Subscription failed unexpectedly"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} maxWidth={600} mx="auto">
      <Typography variant="h4" fontWeight={700} mb={3}>
        Upgrade Subscription
      </Typography>

      <Card>
        <CardContent>
          {/* PLAN */}
          <Typography fontWeight={600}>Choose Plan</Typography>
          <RadioGroup
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <FormControlLabel value="free" control={<Radio />} label="Free" />
            <FormControlLabel value="basic" control={<Radio />} label="Basic" />
            <FormControlLabel value="pro" control={<Radio />} label="Pro" />
          </RadioGroup>

          <Divider sx={{ my: 2 }} />

          {/* BILLING */}
          <Typography fontWeight={600}>Billing Cycle</Typography>
          <RadioGroup
            value={cycle}
            onChange={(e) =>
              setCycle(e.target.value as "monthly" | "quarterly" | "yearly")
            }
          >
            <FormControlLabel
              value="monthly"
              control={<Radio />}
              label="Monthly"
            />
            <FormControlLabel
              value="quarterly"
              control={<Radio />}
              label="Quarterly"
            />
            <FormControlLabel
              value="yearly"
              control={<Radio />}
              label="Yearly"
            />
          </RadioGroup>

          <Divider sx={{ my: 2 }} />

          {/* PRICE */}
          <Typography>
            Price:{" "}
            <strong>
              {price !== null ? `₹${price.toFixed(2)}` : "Calculating…"}
            </strong>
          </Typography>

          <Stack direction="row" spacing={2} mt={3} flexWrap="wrap">
            <Button
              variant="contained"
              disabled={loading || price === null}
              onClick={() => subscribe(true)}
            >
              Pay & Subscribe
            </Button>

            <Button
              variant="outlined"
              disabled={loading || price === null}
              onClick={() => subscribe(false)}
            >
              Set Pending
            </Button>

            <Button color="secondary" onClick={onBack}>
              Back
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
