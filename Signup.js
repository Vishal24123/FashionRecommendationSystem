import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";
import axios from "axios";
import CustomAlert from "./CustomAlert";

export default function Signup() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  function resetFormData(){
    setFormData({
      name: "",
      email: "",
      password: ""
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  async function handleSubmit(e){
    e.preventDefault();    
    try{
      const response= await axios.post("http://127.0.0.1:5000/signup",formData);
      if(response.data.message==="success"){
        setAlertMessage("Successfully signed-up!!");
        setShowAlert(true);
        resetFormData();       
        navigate("/");
      }
      else if(response.data.message==="Email already exists"){
        setAlertMessage("Email already exists");
        setShowAlert(true); 
        resetFormData();
        navigate("/sign");
      }
      else{
        setAlertMessage("Could not sign-up,try again later");
        setShowAlert(true);
        resetFormData();
        navigate("/sign");
      }
    }catch(error){
      setAlertMessage("Something went wrong,try again later");
      setShowAlert(true);
      resetFormData();
      console.log(error);
    } 
  }

  function btnHandler(){
    navigate("/");
  }

  return (
    <div className="Container1">
      {showAlert && <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />}
      <div className="left-side1">
      <img src={require("./photo.jpg")} alt="Fashion" className="image" />
        <div className="content">
          <h2>Fashion Recommendation System for Indian Wear</h2>
          <p>Discover the latest trends and styles in traditional Indian wear tailored just for you. From elegant sarees to chic kurta sets,
            embark on your fashion journey and elevate your style with our curated collection. Let our personalized recommendations guide 
            you in creating stunning looks that reflect the rich heritage and cultural diversity of India.</p>
          <p>Your fashion journey starts here!</p>
        </div>
      </div>
      <div className="right-side1">
          <p className="formtext1">Sign Up Page  <button className="formbutton" onClick={btnHandler}>Back</button></p>
            <form onSubmit={handleSubmit} className="form1">
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter the name"
                required
              />
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter the email"
                required
              />
              Password:
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter the password"
                required
              />
              <button type="submit">Sign Up</button>
            </form>          
        </div>  
    </div>
  );
}
