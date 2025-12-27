// import React, { useEffect, useState } from "react";
// import { Stack, Typography, TextField, MenuItem } from "@mui/material";
// import { api } from "../api/client";
// import TestDetails from "./TestDetails";

// export default function ReportsDashboard({ userId }: { userId: string }) {
//   const [tests, setTests] = useState<string[]>([]);
//   const [selectedTest, setSelectedTest] = useState("");

//   useEffect(() => {
//     api.get(`/report/tests/${userId}`).then(res => {
//       setTests(res.data.tests);
//     });
//   }, [userId]);

//   return (
//     <Stack spacing={3}>
//       <Typography variant="h5" align="center">
//         Medical Reports
//       </Typography>

//       <TextField
//         select
//         label="Select Test"
//         value={selectedTest}
//         onChange={e => setSelectedTest(e.target.value)}
//         fullWidth
//       >
//         {tests.map(t => (
//           <MenuItem key={t} value={t}>
//             {t}
//           </MenuItem>
//         ))}
//       </TextField>

//       {selectedTest && (
//         <TestDetails userId={userId} testName={selectedTest} />
//       )}
//     </Stack>
//   );
// }


// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Chip,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Stack,
// } from "@mui/material";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import { api } from "../api/client";

// type Props = {
//   userId: string;
// };

// type TestData = {
//   unit: string;
//   normal_range: [number, number];
//   reports: { year: number; value: number }[];
// };

// export default function ReportsDashboard({ userId }: Props) {
//   const [tests, setTests] = useState<Record<string, TestData>>({});
//   const [selectedTest, setSelectedTest] = useState<string>("");

//   /* -----------------------------
//      FETCH REPORT SUMMARY
//   ----------------------------- */
//   useEffect(() => {
//     api
//       .get(`/report/summary/${userId}`)
//       .then((res) => {
//         setTests(res.data.tests || {});
//         const firstTest = Object.keys(res.data.tests || {})[0];
//         setSelectedTest(firstTest || "");
//       })
//       .catch((err) => {
//         console.error("Failed to load report summary", err);
//       });
//   }, [userId]);

//   /* -----------------------------
//      TABLE ROWS (ALL TESTS)
//   ----------------------------- */
//   const tableRows = useMemo(() => {
//     return Object.entries(tests).map(([name, test]) => {
//       const latest = test.reports[test.reports.length - 1];
//       const [min, max] = test.normal_range;

//       return {
//         name,
//         value: `${latest.value} ${test.unit}`,
//         range: `${min} – ${max} ${test.unit}`,
//         status:
//           latest.value < min || latest.value > max ? "Abnormal" : "Normal",
//       };
//     });
//   }, [tests]);

//   const selectedTestData = selectedTest ? tests[selectedTest] : null;

//   /* -----------------------------
//      RENDER
//   ----------------------------- */
//   return (
//     <Box maxWidth={1100} mx="auto" mt={6} pb={6}>
//       <Typography variant="h4" align="center" mb={4}>
//         Medical Reports Analysis
//       </Typography>

//       {/* =========================
//            ALL TESTS TABLE
//       ========================== */}
//       <Card sx={{ p: 3, mb: 4 }}>
//         <Typography variant="h6" mb={2}>
//           All Tests
//         </Typography>

//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><b>Test</b></TableCell>
//               <TableCell><b>Value</b></TableCell>
//               <TableCell><b>Normal Range</b></TableCell>
//               <TableCell><b>Status</b></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {tableRows.map((row) => (
//               <TableRow key={row.name}>
//                 <TableCell>{row.name}</TableCell>
//                 <TableCell>{row.value}</TableCell>
//                 <TableCell>{row.range}</TableCell>
//                 <TableCell>
//                   <Chip
//                     label={row.status}
//                     color={row.status === "Normal" ? "success" : "error"}
//                   />
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Card>

//       {/* =========================
//            TEST SELECTOR
//       ========================== */}
//       <FormControl fullWidth sx={{ mb: 4 }}>
//         <InputLabel>Select Test</InputLabel>
//         <Select
//           value={selectedTest}
//           label="Select Test"
//           onChange={(e) => setSelectedTest(e.target.value)}
//         >
//           {Object.keys(tests).map((test) => (
//             <MenuItem key={test} value={test}>
//               {test}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* =========================
//            DETAILED ANALYSIS
//       ========================== */}
//       {selectedTestData && (
//         <Card sx={{ p: 3 }}>
//           <Stack spacing={2}>
//             <Typography variant="h6">
//               {selectedTest} Trend Analysis
//             </Typography>

//             <Typography variant="body2" color="text.secondary">
//               Normal Range: {selectedTestData.normal_range[0]} –{" "}
//               {selectedTestData.normal_range[1]} {selectedTestData.unit}
//             </Typography>

//             {/* LINE CHART */}
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={selectedTestData.reports}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="year" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="value"
//                   stroke="#1976d2"
//                   strokeWidth={3}
//                   dot={{ r: 5 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </Stack>
//         </Card>
//       )}
//     </Box>
//   );
// }


// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Chip,
//   Select,
//   MenuItem,
//   Button,
//   Stack,
// } from "@mui/material";
// import { api } from "../api/client";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// type Props = {
//   userId: string;
//   onBack: () => void;
//   onGoDashboard: () => void;
//   onUploadReport: () => void;
// };

// export default function ReportsDashboard({
//   userId,
//   onBack,
//   onGoDashboard,
//   onUploadReport,
// }: Props) {
//   const [tests, setTests] = useState<any>({});
//   const [selectedTest, setSelectedTest] = useState<string>("");

//   useEffect(() => {
//     api.get(`/report/summary/${userId}`).then((res) => {
//       setTests(res.data.tests || {});
//     });
//   }, [userId]);

//   const testEntries = Object.entries(tests);

//   return (
//     <Box p={4}>
//       {/* HEADER + ACTIONS */}
//       <Stack
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={3}
//       >
//         <Typography variant="h4">
//           Medical Reports Analysis
//         </Typography>

//         <Stack direction="row" spacing={2}>
//           <Button onClick={onBack}>Back</Button>
//           <Button onClick={onGoDashboard}>Dashboard</Button>
//           <Button
//             variant="contained"
//             onClick={onUploadReport}
//           >
//             Upload New Report
//           </Button>
//         </Stack>
//       </Stack>

//       {/* TABLE */}
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>Test</TableCell>
//             <TableCell>Latest Value</TableCell>
//             <TableCell>Normal Range</TableCell>
//             <TableCell>Status</TableCell>
//           </TableRow>
//         </TableHead>

//         <TableBody>
//           {testEntries.map(([name, t]: any) => {
//             const latest = t.reports[t.reports.length - 1];
//             const [min, max] = t.normal_range;
//             const status =
//               latest.value >= min && latest.value <= max
//                 ? "Normal"
//                 : "Abnormal";

//             return (
//               <TableRow key={name}>
//                 <TableCell>{name}</TableCell>
//                 <TableCell>
//                   {latest.value} {t.unit}
//                 </TableCell>
//                 <TableCell>
//                   {min} – {max} {t.unit}
//                 </TableCell>
//                 <TableCell>
//                   <Chip
//                     label={status}
//                     color={status === "Normal" ? "success" : "error"}
//                   />
//                 </TableCell>
//               </TableRow>
//             );
//           })}
//         </TableBody>
//       </Table>

//       {/* DROPDOWN */}
//       <Select
//         fullWidth
//         sx={{ mt: 4 }}
//         value={selectedTest}
//         onChange={(e) => setSelectedTest(e.target.value)}
//         displayEmpty
//       >
//         <MenuItem value="">
//           Select test for detailed analytics
//         </MenuItem>
//         {testEntries.map(([name]) => (
//           <MenuItem key={name} value={name}>
//             {name}
//           </MenuItem>
//         ))}
//       </Select>

//       {/* LINE CHART */}
//       {selectedTest && (
//         <Box height={300} mt={4}>
//           <ResponsiveContainer>
//             <LineChart data={tests[selectedTest].reports}>
//               <XAxis dataKey="year" />
//               <YAxis />
//               <Tooltip />
//               <Line
//                 type="monotone"
//                 dataKey="value"
//                 stroke="#1976d2"
//                 strokeWidth={3}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </Box>
//       )}
//     </Box>
//   );
// }


import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Select,
  MenuItem,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { api } from "../api/client";
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

type Props = {
  userId: string;
  onBack: () => void;
  onGoDashboard: () => void;
  onUploadReport: () => void;
};

export default function ReportsDashboard({
  userId,
  onBack,
  onGoDashboard,
  onUploadReport,
}: Props) {
  const [tests, setTests] = useState<Record<string, any>>({});
  const [selectedTest, setSelectedTest] = useState<string>("");

  useEffect(() => {
    api
      .get(`/report/summary/${userId}`)
      .then((res) => {
        setTests(res.data?.tests || {});
      })
      .catch(() => {
        setTests({});
      });
  }, [userId]);

  const testEntries = Object.entries(tests);
  const activeTest = selectedTest ? tests[selectedTest] : null;

  return (
    <Box p={4}>
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">
          Medical Reports Analysis
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button onClick={onBack}>Back</Button>
          <Button onClick={onGoDashboard}>Dashboard</Button>
          <Button variant="contained" onClick={onUploadReport}>
            Upload New Report
          </Button>
        </Stack>
      </Stack>

      {/* SUMMARY TABLE */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Test</TableCell>
            <TableCell>Latest Value</TableCell>
            <TableCell>Normal Range</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {testEntries.map(([name, t]) => {
            if (!t.reports || t.reports.length === 0) return null;

            const latest = t.reports[t.reports.length - 1];
            const [min, max] = t.normal_range;
            const status =
              latest.value >= min && latest.value <= max
                ? "Normal"
                : "Abnormal";

            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>
                  {latest.value} {t.unit}
                </TableCell>
                <TableCell>
                  {min} – {max} {t.unit}
                </TableCell>
                <TableCell>
                  <Chip
                    label={status}
                    color={status === "Normal" ? "success" : "error"}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* TEST SELECT */}
      <Select
        fullWidth
        sx={{ mt: 4 }}
        value={selectedTest}
        onChange={(e) => setSelectedTest(e.target.value)}
        displayEmpty
      >
        <MenuItem value="">
          Select test for detailed analytics
        </MenuItem>
        {testEntries.map(([name]) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>

      {/* DETAILED ANALYTICS */}
      {activeTest && (
        <Box mt={5}>
          <Typography variant="h5" mb={2}>
            {selectedTest} — Detailed Analytics
          </Typography>

          {/* METRIC CARDS */}
          <Grid container spacing={2}>
            {(() => {
              const values = activeTest.reports.map((r: any) => r.value);
              const latest = values[values.length - 1];
              const min = Math.min(...values);
              const max = Math.max(...values);
              const avg =
                values.reduce((a: number, b: number) => a + b, 0) /
                values.length;

              return [
                { label: "Latest", value: latest },
                { label: "Minimum", value: min },
                { label: "Maximum", value: max },
                { label: "Average", value: avg.toFixed(2) },
              ].map((m) => (
                <Grid item xs={12} sm={6} md={3} key={m.label}>
                  <Card>
                    <CardContent>
                      <Typography variant="caption">
                        {m.label}
                      </Typography>
                      <Typography variant="h6">
                        {m.value} {activeTest.unit}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ));
            })()}
          </Grid>

          {/* LINE CHART */}
          <Box height={300} mt={4}>
            <Typography mb={1}>
              Trend Over Years
            </Typography>
            <ResponsiveContainer>
              <LineChart data={activeTest.reports}>
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
            <Typography mb={1}>
              Year-wise Comparison
            </Typography>
            <ResponsiveContainer>
              <BarChart data={activeTest.reports}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#42a5f5" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* TEXT ANALYSIS */}
          {/* <Box mt={4}>
            <Typography variant="subtitle1">
              Clinical Interpretation
            </Typography>
            <Typography color="text.secondary">
              The {selectedTest} values remain within the normal range
              of {activeTest.normal_range[0]}–
              {activeTest.normal_range[1]} {activeTest.unit}.
              Over the recorded years, the trend appears stable with
              no clinically significant deviations. This indicates
              good physiological regulation for this parameter.
            </Typography>
          </Box> */}
        </Box>
      )}
    </Box>
  );
}
