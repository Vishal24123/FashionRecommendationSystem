import React from "react";
import "./CustomAlert.css";

export default function CustomLogoutAlert({ message, onYes, onNo }) {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert">
        <p>{message}</p>
        <div className="button-container">
          <button className="yes-button" onClick={onYes}>Yes</button>
          <button className="no-button" onClick={onNo}>No</button>
        </div>
      </div>
    </div>
  );
}
