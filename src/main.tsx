import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

// Safari を含む全ブラウザでプルリフレッシュを防ぐ
// passive: false が必要（preventDefault を呼ぶため）
document.addEventListener(
  "touchmove",
  (e) => {
    if (e.cancelable) e.preventDefault();
  },
  { passive: false }
);

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
