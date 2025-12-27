import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#26a69a" },
    background: { default: "#f4f8fb" },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
  },
});
