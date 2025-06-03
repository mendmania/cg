// src/components/fundamentals/Loader/Loader.tsx
import React from "react";

export const Loader: React.FC = () => (
  <div style={{ textAlign: "center", padding: "16px" }}>
    <div className="spinner" />
    <style jsx>{`
      .spinner {
        width: 32px;
        height: 32px;
        border: 4px solid #eee;
        border-top-color: #0055ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg) } }
    `}</style>
  </div>
);
