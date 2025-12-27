import React from "react";
import { Card, Box } from "@mui/material";
import { motion } from "framer-motion";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)",
      }}
    >
      <Card sx={{ width: 420, p: 4 }}>{children}</Card>
    </Box>
  );
}
