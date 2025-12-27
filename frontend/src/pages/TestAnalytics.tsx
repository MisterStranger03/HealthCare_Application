// import React from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
// } from "@mui/material";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceArea,
// } from "recharts";

// export default function TestAnalytics({
//   testName,
//   test,
// }: {
//   testName: string;
//   test: any;
// }) {
//   const reports = test.reports;
//   const latest = reports[reports.length - 1];
//   const previous = reports[reports.length - 2];
//   const [min, max] = test.normal_range;

//   const delta = previous
//     ? (latest.value - previous.value).toFixed(2)
//     : "N/A";

//   return (
//     <Box mt={5}>
//       <Typography variant="h5" mb={2}>
//         {testName} – Detailed Analysis
//       </Typography>

//       {/* METRIC CARDS */}
//       <Grid container spacing={2}>
//         <Grid item xs={3}>
//           <Card><CardContent>
//             <Typography>Latest Value</Typography>
//             <Typography variant="h6">{latest.value} {test.unit}</Typography>
//           </CardContent></Card>
//         </Grid>

//         <Grid item xs={3}>
//           <Card><CardContent>
//             <Typography>Normal Range</Typography>
//             <Typography variant="h6">
//               {min} – {max}
//             </Typography>
//           </CardContent></Card>
//         </Grid>

//         <Grid item xs={3}>
//           <Card><CardContent>
//             <Typography>Yearly Change</Typography>
//             <Typography variant="h6">
//               {delta}
//             </Typography>
//           </CardContent></Card>
//         </Grid>

//         <Grid item xs={3}>
//           <Card><CardContent>
//             <Typography>Status</Typography>
//             <Typography
//               variant="h6"
//               color={
//                 latest.value >= min && latest.value <= max
//                   ? "green"
//                   : "red"
//               }
//             >
//               {latest.value >= min && latest.value <= max
//                 ? "Normal"
//                 : "Abnormal"}
//             </Typography>
//           </CardContent></Card>
//         </Grid>
//       </Grid>

//       {/* LINE CHART */}
//       <Box height={280} mt={4}>
//         <Typography mb={1}>Trend Over Time</Typography>
//         <ResponsiveContainer>
//           <LineChart data={reports}>
//             <XAxis dataKey="year" />
//             <YAxis />
//             <Tooltip />
//             <ReferenceArea y1={min} y2={max} fill="#e3f2fd" />
//             <Line dataKey="value" stroke="#1976d2" strokeWidth={3} />
//           </LineChart>
//         </ResponsiveContainer>
//       </Box>

//       {/* BAR CHART */}
//       <Box height={280} mt={4}>
//         <Typography mb={1}>Year-wise Comparison</Typography>
//         <ResponsiveContainer>
//           <BarChart data={reports}>
//             <XAxis dataKey="year" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="value" fill="#64b5f6" />
//           </BarChart>
//         </ResponsiveContainer>
//       </Box>
//     </Box>
//   );
// }

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TestAnalytics({
  name,
  test,
}: {
  name: string;
  test: any;
}) {
  const reports = test.reports;

  const values = reports.map((r: any) => r.value);
  const latest = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg =
    values.reduce((a: number, b: number) => a + b, 0) / values.length;

  const [low, high] = test.normal_range;

  const trend =
    values[values.length - 1] > values[0]
      ? "increasing"
      : values[values.length - 1] < values[0]
      ? "decreasing"
      : "stable";

  return (
    <Box mt={5}>
      <Typography variant="h5" mb={2}>
        {name} — Detailed Analytics
      </Typography>

      {/* METRICS */}
      <Grid container spacing={2}>
        {[
          { label: "Latest", value: latest },
          { label: "Minimum", value: min },
          { label: "Maximum", value: max },
          { label: "Average", value: avg.toFixed(2) },
        ].map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.label}>
            <Card>
              <CardContent>
                <Typography variant="caption">{m.label}</Typography>
                <Typography variant="h6">
                  {m.value} {test.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* LINE CHART */}
      <Box height={300} mt={4}>
        <Typography mb={1}>Trend Over Time</Typography>
        <ResponsiveContainer>
          <LineChart data={reports}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1976d2"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* BAR CHART */}
      <Box height={300} mt={4}>
        <Typography mb={1}>Year-wise Comparison</Typography>
        <ResponsiveContainer>
          <BarChart data={reports}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#42a5f5" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* ANALYSIS TEXT */}
      <Box mt={4}>
        <Typography variant="subtitle1">Analysis</Typography>
        <Typography color="text.secondary">
          The {name} levels are <b>{trend}</b> over the recorded years.
          The latest value of <b>{latest} {test.unit}</b> is within the
          normal range of <b>{low}–{high} {test.unit}</b>.
          Overall, the test results indicate stable health for this parameter.
        </Typography>
      </Box>
    </Box>
  );
}
