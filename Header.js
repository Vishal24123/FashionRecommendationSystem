import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import CustomLogoutAlert from "./CustomLogoutAlert";

export default function Header() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("name");
    navigate("/");
  };

  const handleButtonClick = () => {
    setShowAlert(true);
    setAlertMessage("Are you sure you want to logout?");
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleYesClick = () => {
    handleLogout();
    setShowAlert(false);
  };

  const handleNoClick = () => {
    setShowAlert(false);
  };

  return (
    <div className="header">
      {showAlert && (
        <CustomLogoutAlert
          message={alertMessage}
          onYes={handleYesClick}
          onNo={handleNoClick}
        />
      )}
      <h1 className="header-text">Recommendation System </h1>
      <button className="logout-button" onClick={handleButtonClick}>
        Logout
      </button>
    </div>
  );
}
