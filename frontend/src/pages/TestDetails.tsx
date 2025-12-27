import React, { useEffect, useState } from "react";
import { Stack, Typography, Card } from "@mui/material";
import { api } from "../api/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Props = {
  userId: string;
  testName: string;
};

export default function TestDetails({ userId, testName }: Props) {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    api
      .get(`/report/test/${userId}/${testName}`)
      .then(res => setRecords(res.data.records));
  }, [userId, testName]);

  if (!records.length) return null;

  const latest = records[records.length - 1];

  return (
    <Stack spacing={3}>
      <Card sx={{ p: 2 }}>
        <Typography variant="h6">{testName}</Typography>
        <Typography>
          Latest Value: {latest.value} {latest.unit}
        </Typography>
        <Typography>
          Normal Range: {latest.normal_range}
        </Typography>
      </Card>

      <LineChart width={600} height={300} data={records}>
        <XAxis dataKey="report_date" />
        <YAxis />
        <Tooltip />
        <Line dataKey="value" strokeWidth={2} />
      </LineChart>
    </Stack>
  );
}
