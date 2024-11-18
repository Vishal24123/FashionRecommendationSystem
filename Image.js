import React,{useState, useEffect} from 'react';
import ThreeSixty from 'react-360-view';
import { Link } from 'react-router-dom';
import axios from "axios";
import "./Recommend.css";
import { useNavigate } from 'react-router-dom';

function Image() {

    const [file, setFile] = useState(null);
    const [displayImage, setDisplayImage] = useState(null);
    const [recommendedImages, setRecommendedImages] = useState([]);
    const navigate=useNavigate();

    useEffect(() => {
        const storedImages = localStorage.getItem("ri");
        setDisplayImage(localStorage.getItem("di"));
        if (storedImages) {
            try {
                const images = JSON.parse(storedImages);
                setRecommendedImages(images);
            } catch (error) {
                //console.error('Error parsing JSON from localStorage:', error);
                // Clear invalid data from localStorage
                localStorage.removeItem("ri");
            }
        }
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);        
      };

    async function handleSubmit(e){
        e.preventDefault();    
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await axios.post("http://127.0.0.1:5000/upload",formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        }); 
        setDisplayImage(response.data.display_image);
        localStorage.setItem("di",response.data.display_image);
        setRecommendedImages(response.data.recommended_images);
        localStorage.setItem("ri", JSON.stringify(response.data.recommended_images));
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }      
      }

  return (
    <div className="text1">
              <Link to=".." relative='path' className="btn" onClick={()=>{
                  localStorage.removeItem("ri");
                  localStorage.removeItem("di");
              }} >
                Back
              </Link>
            <input type="file" onChange={handleFileChange} accept=".jpg, .jpeg, .png" className="file-upload" required/>
            <button onClick={handleSubmit} className="submit-button">Submit</button>            
            {recommendedImages.length > 0 && (
                <div className="container">
                <div className="uploaded-images">  
                    <h2 className="title">Uploaded Image:</h2>
                    <img src={`data:image/jpeg;base64,${displayImage}`} alt="Uploaded Image" style={{ maxWidth: '100%' }} />
                </div>
               
                <div className="recommendations">
                  <h2 className="title">Recommended Fashion Items:</h2>
                  {recommendedImages.map((imageData1, index) => (
                    <div className="image-container">
                      <img key={index} src={`data:image/jpeg;base64,${imageData1}`} alt="Recommended Image"
                        onClick={()=>{
                          localStorage.setItem("src",`data:image/jpeg;base64,${imageData1}`);
                          navigate("\ttryon");
                        }}
                      />
                      <span className="try-on-text">Try-On</span>
                    </div>                  
                  ))}
                  
                </div>
                </div>
            )}
     </div>
  )
}

export default Image