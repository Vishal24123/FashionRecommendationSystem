import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./Tryon.css";

function Tryon() {
  const [image, setImage] = useState(localStorage.getItem("src"));
  const [capturedImage, setCapturedImage] = useState(null);
  const [tryonImage, setTryonImage] = useState(null); 
  let imageData = null;
  

  const handleFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCapturedImage(file);      
    }        
  };

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      const mediaStream = new MediaStream(stream);
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataURItoBlob(imageData));        
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  async function handleSubmit() {
    try {
      const formData = new FormData();
      formData.append('cloth_image', imageData);
      formData.append('person_image', capturedImage);

      const response = await axios.post("http://127.0.0.1:8000/image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Handle response here
      console.log(response.data);

      // Set the try-on image URL in state
      if (response.status === 200) {
        setTryonImage(response.data.result);
      } else {
        alert("Error: " + response.data.error_details);
      }
    } catch (error) {
      console.error('Error submitting images:', error);
      alert("Failed to submit images");
    }
  }

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  function getImageDataFromSrc(src) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', src);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error('Failed to fetch image data'));
        }
      };
      xhr.onerror = function () {
        reject(new Error('Failed to fetch image data'));
      };
      xhr.send();
    });
  }
  
  const src = localStorage.getItem("src");
    
  getImageDataFromSrc(src)
    .then(blob => {      
      imageData = blob;
    })
    .catch(error => {
      console.error("Error:", error);
    });
  

  return (
    <div className='text'>
      <Link to=".." relative='path' className='btn'>Back</Link>
      <div className="container">
        <div className="uploaded-image">  
          <h2>Selected Image For Tryon:</h2>
          {image && (
            <img src={image} alt="Preview" style={{ maxWidth: '100%' }} />
          )}
          <h2>Captured Image For Tryon:</h2>          
          {capturedImage && (
            <img src={URL.createObjectURL(capturedImage)} alt="Captured Image" style={{ maxWidth: '100%' }} />
          )}
        </div> 
        <div className="tryon-image-container">
          {tryonImage && (
            <div>
              <h2>Try-on Image:</h2>
              <img src={tryonImage} alt="Try-on Image" style={{ maxWidth: '100%' }} />
            </div>
          )}
        </div>                    
      </div> 
        
      <div className='image-uploader'>
        <input type="file" accept=".jpg, .jpeg, .png" onChange={handleFile} className="file-input" />
        <button onClick={handleCapture} className="capture-button">Capture from Camera </button>            
      </div> 
      <div className='sub'>     
        <button type='submit' onClick={handleSubmit} className='submit-button'>Submit</button>
      </div>     
    </div>          
  );
}

export default Tryon;
