import React from "react";
import "./CustomAlert.css";

export default function CustomAlert({ message, onClose }) {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert">
        <p>{message}</p>
        <button onClick={onClose}>Ok</button>
      </div>
    </div>
  );
}
