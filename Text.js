import React,{useState,useEffect} from 'react';
import "./Recommend.css";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Text() {

    const [recommendedImages1, setRecommendedImages1] = useState([]);
    const [query, setQuery] = useState('');
    const navigate=useNavigate();

    useEffect(() => {
        const storedImages = localStorage.getItem("ri1");
        if (storedImages) {
            try {
                const images = JSON.parse(storedImages);
                setRecommendedImages1(images);
            } catch (error) {
                //console.error('Error parsing JSON from localStorage:', error);
                // Clear invalid data from localStorage
                localStorage.removeItem("ri1");
            }
        }
    }, []);
    
    async function handleSearch (e){
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/search', { query:query });
            const images = response.data.results;
            setRecommendedImages1(images);
            localStorage.setItem("ri1", JSON.stringify(images));
          } catch (error) {
            //console.error('Error fetching search results:', error);
          }
      }

  return (
    <div className='text1'>
        <Link className="btn" to=".." relative="path" onClick={()=>localStorage.removeItem("ri1")}>
        Back
        </Link>
        <input type="text" className="textbox" placeholder="Enter your query" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={handleSearch} className="submit-button">Search</button>        
        {recommendedImages1.length > 0 && (
        <div className="container">
            <div className="recommendations">
            <h2 className="title">Recommended Fashion Items:</h2>
            {recommendedImages1.map((imageData, index) => (
                <div className="image-container1" key={index}>
                    <img key={index} src={imageData} alt="Recommended Image"  
                      onClick={()=>{
                        localStorage.setItem("src",imageData);
                        navigate("\ttryon");
                      }}
                    />
                    <span className="try-on-text">Try-on</span>
                </div>
            ))}
            </div>
        </div>  
    )} 
  </div>
  );
}

export default Text;