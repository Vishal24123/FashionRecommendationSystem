import React, { useState } from "react";
import "./Home.css";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import CustomAlert from "./CustomAlert";

export default function Home() {
 
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate=useNavigate();

  const handleButtonClick = (buttonValue) => {
    setShowAlert(true);
    setAlertMessage(buttonValue);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    // Navigate based on the button value captured in alertMessage
    if (alertMessage === "Search Product By Image is clicked") {
      navigate("\image");
    } else if (alertMessage === "Search Product By Name is clicked") {
      navigate("\ttext");
    } else if (alertMessage === "Wardrobe recommendation is clicked") {
      navigate("\wardrobe");
    }
  };  

  return (
    <>          
      <div className="text">       
        <Header/>
        {showAlert && (
        <CustomAlert message={alertMessage} onClose={handleCloseAlert} />
      )} 
        {(
          <>
          <p className="text-text">Welcome {localStorage.getItem("name")}</p>
          <p className="text-text">Choose an option</p>
          <div class="button-container">
           
              <button className="long-button one" onClick={() => handleButtonClick("Search Product By Image is clicked")}>
                Search Product By Image
              </button>
              <button className="long-button two" onClick={() => handleButtonClick("Search Product By Name is clicked")}>
                Search Product By Name
              </button>
              <button className="long-button three" onClick={() => handleButtonClick("Wardrobe recommendation is clicked")}>
                Wardrobe Wonder Hub
              </button>
       
          </div>
          </>
        )}
      </div>
    </>
  );
}
