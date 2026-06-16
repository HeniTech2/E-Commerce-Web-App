import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { ShopProvider } from "./context/ShopContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ShopProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "inherit",
              fontSize: "14px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            },
          }}
        />
        <App />
      </ShopProvider>
    </BrowserRouter>
  </React.StrictMode>
);