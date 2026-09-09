import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Marketing from "./pages/Marketing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Marketing />} />
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
    </BrowserRouter>
  );
}
