import React, { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Login.css";
import CustomAlert from "./CustomAlert";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const photos = [
    require("./photo.jpg"),
    require("./photo1.jpg"),
    require("./photo2.jpg"),      
  ];

  useEffect(() => {    
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function formHandler(e) {
    e.preventDefault();    
    try{
      const response = await axios.post("http://127.0.0.1:5000/login", {
      email: username,
      password: password,
      });    
    
      if (response.data.message === "success" ) {
        localStorage.setItem('name',response.data.name)
        navigate("/home");
      } else {
        setPassword("");
        setUsername(""); 
        setAlertMessage(response.data.message);
        setShowAlert(true);      
      }
    }catch(error){
      console.log("Error:",error);
      setAlertMessage("Something went wrong");
      setShowAlert(true);  
    }
  }
  function userinput(event) {
    setUsername(event.target.value);
  }
  function passwordinput(event) {
    setPassword(event.target.value);
  }
  function signUp() {
    navigate("/sign");
  }

  return (
    <div className="containers">
      <div className="left-side">
        <img src={photos[currentPhotoIndex]}  alt="Fashion" className="image" />
        <div className="content">
          <h2 className="h2-text">Fashion Recommendation System for Indian Wear</h2>
          <p>Discover the latest trends and styles in traditional Indian wear tailored just for you. From elegant sarees to chic kurta sets,
            embark on your fashion journey and elevate your style with our curated collection. Let our personalized recommendations guide 
            you in creating stunning looks that reflect the rich heritage and cultural diversity of India.</p>
          <p>Your fashion journey starts here!</p>
        </div>
      </div>
      <div className="right-side">
        <div className="header1">
          <button className="signUpbtn" onClick={signUp}>
            SignUp
          </button>
        </div>          
          <p className="formtext">
            Sign-In To Search Products / Get Recommendations
          </p>
          <form className="form1" onSubmit={formHandler}>
            <label>Username:</label>
            <input
              type="email"
              placeholder="Enter the username"
              onChange={userinput}
              value={username}
              required
            />
            <label>Password:</label>
            <input
              type="text"
              placeholder="Enter the password"
              onChange={passwordinput}
              value={password}
              required
            />
            <button type="submit">LogIn</button>
          </form>
        </div>
        {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
