// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material";
// import { theme } from "./theme";

// /* Pages */
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ForgotPassword from "./pages/ForgotPassword";
// import VerifyOtp from "./pages/VerifyOtp";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";

// /**
//  * App-level navigation state.
//  * We intentionally do NOT use react-router yet
//  * to keep the auth + LangGraph flow explicit and debuggable.
//  */
// type Page =
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "complete-profile"
//   | "dashboard";

// export default function App() {
//   const [page, setPage] = useState<Page>("login");

//   // userId is assigned only after successful login / verification
//   const [userId, setUserId] = useState<string | null>(null);

//   // email is required across register → verify
//   const [email, setEmail] = useState<string>("");

//   /**
//    * Once userId exists and page is dashboard,
//    * we render the authenticated area.
//    */
//   if (page === "dashboard" && userId) {
//     return (
//       <ThemeProvider theme={theme}>
//         <Dashboard userId={userId} />
//       </ThemeProvider>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       {page === "login" && (
//         <Login
//           setPage={setPage}
//           onLogin={(uid: string) => {
//             setUserId(uid);
//             setPage("dashboard");
//           }}
//         />
//       )}

//       {page === "register" && (
//         <Register
//           setPage={setPage}
//           setEmail={(emailValue: string) => {
//             setEmail(emailValue);
//           }}
//         />
//       )}

//       {page === "verify" && (
//         <VerifyOtp
//           email={email}
//           setPage={setPage}
//           onVerified={(uid: string) => {
//             setUserId(uid);
//             setPage("complete-profile");
//           }}
//         //   setPage={setPage}
//         />
//       )}

//       {page === "complete-profile" && userId && (
//         <CompleteProfile
//           userId={userId}
//           onDone={() => setPage("dashboard")}
//         />
//       )}

//       {page === "forgot" && (
//         <ForgotPassword setPage={setPage} />
//       )}
//     </ThemeProvider>
//   );
// }


// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";

// import { theme } from "./theme";

// // pages
// import Welcome from "./pages/Welcome";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";

// type Page =
//   | "welcome"
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "complete-profile"
//   | "dashboard";

// export default function App() {
//   const [page, setPage] = useState<Page>("welcome");
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [email, setEmail] = useState("");

//   /* ==============================
//      AUTH GUARD
//      ============================== */
//   if (loggedIn && userId) {
//     return (
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <Dashboard
//           userId={userId}
//           onLogout={() => {
//             setLoggedIn(false);
//             setUserId(null);
//             setEmail("");
//             setPage("welcome");
//           }}
//         />
//       </ThemeProvider>
//     );
//   }

//   /* ==============================
//      ROUTES (NO REACT ROUTER)
//      ============================== */
//   const routes: Record<Page, JSX.Element> = {
//     welcome: <Welcome setPage={setPage} />,

//     login: (
//       <Login
//         setPage={setPage}
//         onLogin={(uid: string) => {
//           setUserId(uid);
//           setLoggedIn(true);
//           setPage("dashboard");
//         }}
//       />
//     ),

//     register: (
//       <Register
//         setPage={setPage}
//         setEmail={(e: string) => {
//           setEmail(e);
//         }}
//       />
//     ),

//     verify: (
//       <VerifyOtp
//         email={email}
//         onVerified={() => {
//           setPage("login");
//         }}
//         onBack={() => setPage("login")}
//       />
//     ),

//     forgot: <ForgotPassword setPage={setPage} />,

//     "complete-profile": (
//       <CompleteProfile
//         userId={userId}
//         onDone={() => {
//           setPage("dashboard");
//         }}
//       />
//     ),

//     dashboard: <></>, // guarded above
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {routes[page]}
//     </ThemeProvider>
//   );
// }



// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";

// import { theme } from "./theme";

// // pages
// import Welcome from "./pages/Welcome";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";

// // TODO: create these next (Streamlit equivalents)
// import Subscribe from "./pages/Subscribe"
// import FeatureSelection from "./pages/FeatureSelect";

// type Page =
//   | "welcome"
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "complete-profile"
//   | "dashboard"
//   | "subscribe"
//   | "selection";

// export default function App() {
//   const [page, setPage] = useState<Page>("welcome");
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [email, setEmail] = useState("");

//   /* ==============================
//      AUTH GUARD (Streamlit equivalent)
//      ============================== */
//   if (loggedIn && userId) {
//     if (page === "dashboard") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Dashboard
//             userId={userId}
//             onLogout={() => {
//               setLoggedIn(false);
//               setUserId(null);
//               setEmail("");
//               setPage("welcome");
//             }}
//             onSelectFeature={(type) => {
//               setPage("selection");
//             }}
//             onUpgrade={() => {
//               setPage("subscribe");
//             }}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "selection") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <FeatureSelection
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "subscribe") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Subscribe
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }
//   }

//   /* ==============================
//      ROUTES (NO REACT ROUTER)
//      ============================== */
//   const routes: Record<Page, JSX.Element> = {
//     welcome: <Welcome setPage={setPage} />,

//     login: (
//       <Login
//         setPage={setPage}
//         onLogin={(uid: string) => {
//           setUserId(uid);
//           setLoggedIn(true);
//           setPage("dashboard");
//         }}
//       />
//     ),

//     register: (
//       <Register
//         setPage={setPage}
//         setEmail={(e: string) => setEmail(e)}
//       />
//     ),

//     verify: (
//       <VerifyOtp
//         email={email}
//         onVerified={() => setPage("login")}
//         onBack={() => setPage("login")}
//       />
//     ),

//     forgot: <ForgotPassword setPage={setPage} />,

//     "complete-profile": (
//       <CompleteProfile
//         userId={userId}
//         onDone={() => setPage("dashboard")}
//       />
//     ),

//     dashboard: <></>, // guarded above
//     subscribe: <></>, // guarded above
//     selection: <></>, // guarded above
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {routes[page]}
//     </ThemeProvider>
//   );
// }


// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";

// import { theme } from "./theme";

// /* ======================
//    Pages
//    ====================== */
// import Welcome from "./pages/Welcome";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";
// import Subscribe from "./pages/Subscribe";
// import FeatureSelection from "./pages/FeatureSelect";

// /* ======================
//    Page Type
//    ====================== */
// type Page =
//   | "welcome"
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "reset-password"
//   | "complete-profile"
//   | "dashboard"
//   | "subscribe"
//   | "selection";

// /* ======================
//    App
//    ====================== */
// export default function App() {
//   const [page, setPage] = useState<Page>("welcome");
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [email, setEmail] = useState("");

//   /* ==================================================
//      AUTH GUARD (Streamlit-style)
//      ================================================== */
//   if (loggedIn && userId) {
//     if (page === "dashboard") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Dashboard
//             userId={userId}
//             onLogout={() => {
//               setLoggedIn(false);
//               setUserId(null);
//               setEmail("");
//               setPage("welcome");
//             }}
//             onSelectFeature={() => setPage("selection")}
//             onUpgrade={() => setPage("subscribe")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "selection") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <FeatureSelection
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "subscribe") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Subscribe
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }
//   }

//   /* ==================================================
//      ROUTES (NO REACT ROUTER)
//      ================================================== */
//   const routes: Record<Page, JSX.Element> = {
//     welcome: <Welcome setPage={setPage} />,

//     login: (
//       <Login
//         setPage={setPage}
//         onLogin={(uid: string) => {
//           setUserId(uid);
//           setLoggedIn(true);
//           setPage("dashboard");
//         }}
//       />
//     ),

//     register: (
//       <Register
//         setPage={setPage}
//         setEmail={(e: string) => setEmail(e)}
//       />
//     ),

//     // verify: (
//     //   <VerifyOtp
//     //     email={email}
//     //     onVerified={() => setPage("login")}
//     //     onBack={() => setPage("login")}
//     //   />
//     // ),

//     verify: (
//       <VerifyOtp
//         email={email}
//         setUserId={(uid: string) => setUserId(uid)}
//         setPage={setPage}
//       />
//     ),

//     forgot: (
//       <ForgotPassword
//         setPage={setPage}
//         setEmail={setEmail}
//       />
//     ),

//     "reset-password": (
//       <ResetPassword
//         email={email}
//         onSuccess={() => setPage("login")}
//         onBack={() => setPage("login")}
//       />
//     ),

//     "complete-profile": (
//       <CompleteProfile
//         userId={userId}
//         onDone={() => setPage("login")}
//       />
//     ),

//     /* guarded */
//     dashboard: <></>,
//     subscribe: <></>,
//     selection: <></>,
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {routes[page]}
//     </ThemeProvider>
//   );
// }


// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";

// import { theme } from "./theme";

// /* Pages */
// import Welcome from "./pages/Welcome";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";
// import Subscribe from "./pages/Subscribe";
// import FeatureSelect from "./pages/FeatureSelect";
// import UploadReport from "./pages/UploadReport";

// /* Page Type */
// type Page =
//   | "welcome"
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "reset-password"
//   | "complete-profile"
//   | "dashboard"
//   | "subscribe"
//   | "selection"
//   | "upload-report";

// export default function App() {
//   const [page, setPage] = useState<Page>("welcome");
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [email, setEmail] = useState("");

//   /* ================= AUTH GUARD ================= */
//   if (loggedIn && userId) {
//     if (page === "dashboard") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Dashboard
//             userId={userId}
//             onLogout={() => {
//               setLoggedIn(false);
//               setUserId(null);
//               setEmail("");
//               setPage("welcome");
//             }}
//             onSelectFeature={() => setPage("selection")}
//             onUpgrade={() => setPage("subscribe")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "selection") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <FeatureSelect
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//             onSelectFeature={(feature) => {
//               if (feature === "report") {
//                 setPage("upload-report");
//               } else {
//                 alert("Image analysis coming soon");
//               }
//             }}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "upload-report") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <UploadReport
//             userId={userId}
//             onDone={() => setPage("dashboard")}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "subscribe") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Subscribe
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }
//   }

//   /* ================= ROUTES ================= */
//   const routes: Record<Page, JSX.Element> = {
//     welcome: <Welcome setPage={setPage} />,

//     login: (
//       <Login
//         setPage={setPage}
//         onLogin={(uid: string) => {
//           setUserId(uid);
//           setLoggedIn(true);
//           setPage("dashboard");
//         }}
//       />
//     ),

//     register: (
//       <Register
//         setPage={setPage}
//         setEmail={(e: string) => setEmail(e)}
//       />
//     ),

//     verify: (
//       <VerifyOtp
//         email={email}
//         setUserId={(uid: string) => setUserId(uid)}
//         setPage={setPage}
//       />
//     ),

//     forgot: (
//       <ForgotPassword
//         setPage={setPage}
//         setEmail={setEmail}
//       />
//     ),

//     "reset-password": (
//       <ResetPassword
//         email={email}
//         onSuccess={() => setPage("login")}
//         onBack={() => setPage("login")}
//       />
//     ),

//     "complete-profile": (
//       <CompleteProfile
//         userId={userId}
//         onDone={() => setPage("login")}
//       />
//     ),

//     /* guarded */
//     dashboard: <></>,
//     subscribe: <></>,
//     selection: <></>,
//     "upload-report": <></>,
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {routes[page]}
//     </ThemeProvider>
//   );
// }


// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import { theme } from "./theme";

// /* Pages */
// import Welcome from "./pages/Welcome";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";
// import Subscribe from "./pages/Subscribe";
// import FeatureSelect from "./pages/FeatureSelect";
// import UploadReport from "./pages/UploadReport";
// import ReportsDashboard from "./pages/ReportsDashboard";

// type Page =
//   | "welcome"
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "reset-password"
//   | "complete-profile"
//   | "dashboard"
//   | "subscribe"
//   | "selection"
//   | "upload-report"
//   | "reports-dashboard"

// export default function App() {
//   const [page, setPage] = useState<Page>("welcome");
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [email, setEmail] = useState("");

//   if (loggedIn && userId) {
//     if (page === "dashboard") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Dashboard
//             userId={userId}
//             onLogout={() => {
//               setLoggedIn(false);
//               setUserId(null);
//               setEmail("");
//               setPage("welcome");
//             }}
//             onSelectFeature={() => setPage("selection")}
//             onUpgrade={() => setPage("subscribe")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "selection") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <FeatureSelect
//             userId={userId}
//             onNavigate={(p) => setPage(p)}
//           />
//         </ThemeProvider>
//       );
//     }

//     // if (page === "upload-report") {
//     //   return (
//     //     <ThemeProvider theme={theme}>
//     //       <CssBaseline />
//     //       <UploadReport userId={userId} />
//     //     </ThemeProvider>
//     //   );
//     // }

//     if (page === "upload-report") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <UploadReport
//             userId={userId}
//             onBack={() => setPage("selection")}
//             onGoDashboard={() => setPage("dashboard")}
//             onUploadSuccess={() => setPage("reports-dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "reports-dashboard") {
//     return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <ReportsDashboard userId={userId} />
//         </ThemeProvider>
//       );
//     }




//     if (page === "subscribe") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Subscribe userId={userId} onBack={() => setPage("dashboard")} />
//         </ThemeProvider>
//       );
//     }
//   }

//   const routes: Record<Page, JSX.Element> = {
//     welcome: <Welcome setPage={setPage} />,
//     login: (
//       <Login
//         setPage={setPage}
//         onLogin={(uid: string) => {
//           setUserId(uid);
//           setLoggedIn(true);
//           setPage("dashboard");
//         }}
//       />
//     ),
//     register: <Register setPage={setPage} setEmail={setEmail} />,
//     verify: <VerifyOtp email={email} setUserId={setUserId} setPage={setPage} />,
//     forgot: <ForgotPassword setPage={setPage} setEmail={setEmail} />,
//     "reset-password": (
//       <ResetPassword email={email} onSuccess={() => setPage("login")} onBack={() => setPage("login")} />
//     ),
//     "complete-profile": <CompleteProfile userId={userId} onDone={() => setPage("login")} />,

//     dashboard: <></>,
//     subscribe: <></>,
//     selection: <></>,
//     "upload-report": <></>,
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {routes[page]}
//     </ThemeProvider>
//   );
// }


// import React, { useState } from "react";
// import { ThemeProvider } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import { theme } from "./theme";

// /* Pages */
// import Welcome from "./pages/Welcome";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";
// import CompleteProfile from "./pages/CompleteProfile";
// import Dashboard from "./pages/Dashboard";
// import Subscribe from "./pages/Subscribe";
// import FeatureSelect from "./pages/FeatureSelect";
// import UploadReport from "./pages/UploadReport";
// import ReportsDashboard from "./pages/ReportsDashboard";
// import PatientOverview from "./pages/PatientOverview";

// type Page =
//   | "welcome"
//   | "login"
//   | "register"
//   | "verify"
//   | "forgot"
//   | "reset-password"
//   | "complete-profile"
//   | "dashboard"
//   | "subscribe"
//   | "selection"
//   | "upload-report"
//   | "reports-dashboard"
//   | "overview";

// export default function App() {
//   const [page, setPage] = useState<Page>("welcome");
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const [email, setEmail] = useState("");

//   /* =========================
//      AUTHENTICATED PAGES
//      ========================= */
//   if (loggedIn && userId) {
//     if (page === "dashboard") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Dashboard
//             userId={userId}
//             onLogout={() => {
//               setLoggedIn(false);
//               setUserId(null);
//               setEmail("");
//               setPage("welcome");
//             }}
//             onSelectFeature={() => setPage("selection")}
//             onUpgrade={() => setPage("subscribe")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "selection") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <FeatureSelect
//             userId={userId}
//             onNavigate={(p) => setPage(p)}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "overview") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <PatientOverview
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }

//     if (page === "upload-report") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <UploadReport
//             userId={userId}
//             onBack={() => setPage("selection")}
//             onGoDashboard={() => setPage("dashboard")}
//             onUploadSuccess={() => setPage("reports-dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }

//     // if (page === "reports-dashboard") {
//     //   return (
//     //     <ThemeProvider theme={theme}>
//     //       <CssBaseline />
//     //       <ReportsDashboard userId={userId} />
//     //     </ThemeProvider>
//     //   );
//     // }

//     if (page === "reports-dashboard") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <ReportsDashboard
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//             onGoDashboard={() => setPage("dashboard")}
//             onUploadReport={() => setPage("upload-report")}
//           />
//         </ThemeProvider>
//       );
//   }


//     if (page === "subscribe") {
//       return (
//         <ThemeProvider theme={theme}>
//           <CssBaseline />
//           <Subscribe
//             userId={userId}
//             onBack={() => setPage("dashboard")}
//           />
//         </ThemeProvider>
//       );
//     }
//   }

//   /* =========================
//      PUBLIC ROUTES
//      ========================= */
//   const routes: Record<Page, JSX.Element> = {
//     welcome: <Welcome setPage={setPage} />,
//     login: (
//       <Login
//         setPage={setPage}
//         onLogin={(uid: string) => {
//           setUserId(uid);
//           setLoggedIn(true);
//           setPage("dashboard");
//         }}
//       />
//     ),
//     register: <Register setPage={setPage} setEmail={setEmail} />,
//     verify: (
//       <VerifyOtp
//         email={email}
//         setUserId={setUserId}
//         setPage={setPage}
//       />
//     ),
//     forgot: <ForgotPassword setPage={setPage} setEmail={setEmail} />,
//     "reset-password": (
//       <ResetPassword
//         email={email}
//         onSuccess={() => setPage("login")}
//         onBack={() => setPage("login")}
//       />
//     ),
//     "complete-profile": (
//       <CompleteProfile
//         userId={userId}
//         onDone={() => setPage("login")}
//       />
//     ),

//     /* guarded placeholders */
//     dashboard: <></>,
//     subscribe: <></>,
//     selection: <></>,
//     "upload-report": <></>,
//     "reports-dashboard": <></>,
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       {routes[page]}
//     </ThemeProvider>
//   );
// }


import React, { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";

/* Pages */
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Subscribe from "./pages/Subscribe";
import FeatureSelect from "./pages/FeatureSelect";
import UploadReport from "./pages/UploadReport";
import ReportsDashboard from "./pages/ReportsDashboard";
import PatientOverview from "./pages/PatientOverview";

type Page =
  | "welcome"
  | "login"
  | "register"
  | "verify"
  | "forgot"
  | "reset-password"
  | "complete-profile"
  | "dashboard"
  | "subscribe"
  | "selection"
  | "upload-report"
  | "reports-dashboard"
  | "overview";

export default function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  /* =========================
     AUTHENTICATED FLOW
     ========================= */
  if (loggedIn && userId) {
    switch (page) {
      case "dashboard":
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Dashboard
              userId={userId}
              onLogout={() => {
                setLoggedIn(false);
                setUserId(null);
                setEmail("");
                setPage("welcome");
              }}
              onSelectFeature={(type) => {
                if (type === "overview") setPage("overview");
                else setPage("selection");
              }}
              onUpgrade={() => setPage("subscribe")}
            />
          </ThemeProvider>
        );

      case "selection":
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <FeatureSelect
              userId={userId}
              onNavigate={(p) => setPage(p)}
            />
          </ThemeProvider>
        );

      case "overview":
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <PatientOverview
              userId={userId}
              onBack={() => setPage("dashboard")}
            />
          </ThemeProvider>
        );

      case "upload-report":
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <UploadReport
              userId={userId}
              onBack={() => setPage("selection")}
              onGoDashboard={() => setPage("dashboard")}
              onUploadSuccess={() => setPage("reports-dashboard")}
            />
          </ThemeProvider>
        );

      case "reports-dashboard":
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ReportsDashboard
              userId={userId}
              onBack={() => setPage("dashboard")}
              onGoDashboard={() => setPage("dashboard")}
              onUploadReport={() => setPage("upload-report")}
            />
          </ThemeProvider>
        );

      case "subscribe":
        return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Subscribe
              userId={userId}
              onBack={() => setPage("dashboard")}
            />
          </ThemeProvider>
        );
    }
  }

  /* =========================
     PUBLIC ROUTES
     ========================= */
  const routes: Record<Page, JSX.Element> = {
    welcome: <Welcome setPage={setPage} />,
    login: (
      <Login
        setPage={setPage}
        onLogin={(uid) => {
          setUserId(uid);
          setLoggedIn(true);
          setPage("dashboard");
        }}
      />
    ),
    register: <Register setPage={setPage} setEmail={setEmail} />,
    verify: (
      <VerifyOtp
        email={email}
        setUserId={setUserId}
        setPage={setPage}
      />
    ),
    forgot: <ForgotPassword setPage={setPage} setEmail={setEmail} />,
    "reset-password": (
      <ResetPassword
        email={email}
        onSuccess={() => setPage("login")}
        onBack={() => setPage("login")}
      />
    ),
    "complete-profile": (
      <CompleteProfile
        userId={userId}
        onDone={() => setPage("login")}
      />
    ),

    /* unreachable placeholders */
    dashboard: <></>,
    subscribe: <></>,
    selection: <></>,
    "upload-report": <></>,
    "reports-dashboard": <></>,
    overview: <></>,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {routes[page]}
    </ThemeProvider>
  );
}
