import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import './Wardrobe.css'; // Import the CSS file

function Wardrobe() {
  const [files, setFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0 && selectedFiles.length <= 25) {
      const validFiles = Array.from(selectedFiles).filter(file => file.name.toLowerCase().endsWith('.jpg'));
      setFiles(validFiles);
      setErrorMessage('');
    } else {
      setFiles([]);
      setErrorMessage('Please select 1 to 25 .jpg files.');
    }
  };

  const handleUpload = async () => {
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      try {
        const response = await axios.post("http://127.0.0.1:8080/wardrobe/upload", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(response.data); // Handle the response data as needed
        
        if (response.data.message === "success") {
          setUploadedImages(response.data.uploaded_filenames || []);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      setErrorMessage('Please select files before uploading.');
    }
  };

  const handleImageClick = (filename) => {
    setSelectedImage({ filename: filename });
    recommendImages(filename);
  }

  const recommendImages  = async (filename) => {
    try {
      const response = await axios.post("http://127.0.0.1:8080/wardrobe/recommend", { filename });
      console.log(response.data); // Handle the response data as needed
      if (response.data.message === "success")
        setRecommendations(response.data.opposite_results || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  return (
    <>
    <div className="wardrobe-container">
      <Link to=".." relative='path' className='btn'>Back</Link>
      <h1>Wardrobe Wonder Hub</h1>
      <h2 className="moving-text">Please upload maximum of 25 files and format must be JPG / JPEG</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="upload-section">
        <input type="file" accept=".jpg" multiple onChange={handleFileChange} className="file-upload" />
        <button onClick={handleUpload}>Upload</button>
      </div>
    
      {uploadedImages.length > 0 && (
        <div className="uploaded-images-section">
          {/*<p className="text-wardrobe">Uploaded Images</p>*/}
          <div className="image-container-wardrobe">
            {uploadedImages.map((filename, index) => (
              <div key={index} className='image-container-wardrobe'>
                <img
                  src={`http://127.0.0.1:8080/static/clothes/${filename}`}
                  alt={filename}
                  onClick={() => handleImageClick(filename)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/*selectedImage && (
        <div className="selected-image-container">
          <p className="text-wardrobe">Selected Image</p>
          <img
            src={`http://127.0.0.1:8080/static/clothes/${selectedImage.filename}`}
            alt={selectedImage.filename}
          />
        </div>
      )*/}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          {/*<p className="text-wardrobe">Recommendations</p>8?}
          {/*<div className="image-container-1">*/}
          <div className="result-container-wardrobe">
            {recommendations.map((image, index) => (
              <div key={index} className="result-container-wardrobe">
                <img 
                  src={`http://127.0.0.1:8080/static/clothes/${image.filename}`}
                  alt={image.filename}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Wardrobe;
