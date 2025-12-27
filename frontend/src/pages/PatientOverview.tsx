import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import ReactFlow, { Background, Controls, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

import { api } from "../api/client";
import { layoutGraph } from "../utils/layout";

type Props = {
  userId: string;
  onBack: () => void;
};

export default function PatientOverview({ userId, onBack }: Props) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    api.get(`/overview/${userId}`).then((res) => {
      const rawNodes: Node[] = res.data.nodes.map((n: any) => ({
        id: n.id,
        data: { label: `${n.label}${n.value ? `: ${n.value}` : ""}` },
        style: {
          padding: 10,
          borderRadius: 8,
          fontSize: 13,
          background:
            n.type === "patient"
              ? "#1976d2"
              : n.type === "condition"
              ? "#ffcdd2"
              : n.type === "medication"
              ? "#c8e6c9"
              : n.type === "allergy"
              ? "#ffecb3"
              : n.type === "report"
              ? "#e1bee7"
              : "#eeeeee",
          color: n.type === "patient" ? "#fff" : "#000",
        },
      }));

      const rawEdges: Edge[] = res.data.edges.map((e: any) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        labelStyle: { fontSize: 11 },
      }));

      const layouted = layoutGraph(rawNodes, rawEdges, "LR");

      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    });
  }, [userId]);

  return (
    <Box height="100vh" p={2}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">
          Patient Overview (Knowledge Graph)
        </Typography>
        <Button onClick={onBack}>Back</Button>
      </Stack>

      <Box height="90%" border="1px solid #ddd" borderRadius={2}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable
          nodesConnectable={false}
        >
          <Background gap={18} />
          <Controls />
        </ReactFlow>
      </Box>
    </Box>
  );
}
