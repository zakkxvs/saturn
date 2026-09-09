import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./lib/auth";
import Marketing from "./pages/Marketing";
import AppShell from "./components/AppShell";
import Converter from "./pages/Converter";
import Library from "./pages/Library";
import History from "./pages/History";
import Rules from "./pages/Rules";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Marketing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Converter />} />
            <Route path="library" element={<Library />} />
            <Route path="history" element={<History />} />
            <Route path="rules" element={<Rules />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#10121A",
              border: "1px solid #232738",
              color: "#F1F5F9",
              fontFamily: "Manrope, sans-serif",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
