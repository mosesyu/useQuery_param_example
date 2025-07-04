
import React from "react";
import { createRoot } from "react-dom/client";
import Root from "./example.jsx";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<Root />);
  } else {
    console.error("#root element not found");
  }
});
