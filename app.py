from flask import Flask, jsonify, request
from flask_marshmallow import Marshmallow 
from flask_cors import CORS, cross_origin 
from PIL import Image
import numpy as np
import cv2
import pickle
import tensorflow
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import GlobalMaxPooling2D
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from sklearn.neighbors import NearestNeighbors
from numpy.linalg import norm
from base64 import b64encode
import io
from io import BytesIO
from database import db, Users
import pandas as pd
import re
import requests
 
app = Flask(__name__)
 
app.config['SECRET_KEY'] = 'coders'

# Databse configuration 
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Vishal24@localhost/flaskreact'
 
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = True
  
CORS(app, supports_credentials=True)
 
db.init_app(app)
        
with app.app_context():
    db.create_all()
 
ma=Marshmallow(app)
 
class UserSchema(ma.Schema):
    class Meta:
        fields = ('id','name','email','password')
  
user_schema = UserSchema()
users_schema = UserSchema(many=True)
  
feature_list = np.array(pickle.load(open('embeddings.pkl', 'rb')))
filenames = pickle.load(open('filenames.pkl', 'rb'))

model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
model.trainable = False

model = tensorflow.keras.Sequential([
    model,
    GlobalMaxPooling2D()
])

train_text_data = pd.read_json("D:/Final_Year_Project/Dataset/train_data.json")
def is_phrase_in_text(phrase, text):
    pattern = re.compile(fr'\b{re.escape(phrase)}\b', re.IGNORECASE)
    return bool(pattern.search(text))


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
 
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')    
    user = Users.query.filter_by(email=email).first()
    if user :
        if user.password == password:
            return jsonify({'message': 'success','name':user.name})
        else:
            return jsonify({'message': 'Invalid credentials'})
    else:
        return jsonify({'message': 'Email does not exists'})
    
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    # Check if email already exists
    if Users.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'})
    # Create a new user
    new_user = Users(name=name, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'success'}), 200    

@app.route('/upload', methods=['POST'])
def upload():
    try:
        uploaded_file = request.files['file']
        if uploaded_file.filename != '':
            # Read the uploaded image directly
            display_image = Image.open(uploaded_file)
            
            # Resize the image to match the expected input shape of ResNet50
            display_image = display_image.resize((224, 224))

            # Perform feature extraction and recommendation
            features = feature_extraction(display_image, model)
            indices = recommend(features, feature_list)

            # Convert images to base64 format
            display_image_base64 = image_to_base64(display_image)
            recommended_images_base64 = [image_to_base64(Image.open(filenames[i])) for i in indices[0]]

            # Return recommendation data
            return jsonify({
                'display_image': display_image_base64,
                'recommended_images': recommended_images_base64
            })
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': str(e)}), 500

def image_to_base64(img):
    img_byte_array = io.BytesIO()
    img.save(img_byte_array, format='JPEG')
    img_base64 = b64encode(img_byte_array.getvalue()).decode('utf-8')
    return img_base64

def feature_extraction(img, model):
    img_array = image.img_to_array(img)
    expanded_img_array = np.expand_dims(img_array, axis=0)
    preprocessed_img = preprocess_input(expanded_img_array)
    result = model.predict(preprocessed_img).flatten()
    normalized_result = result / norm(result)
    return normalized_result

def recommend(features, feature_list):
    neighbors = NearestNeighbors(n_neighbors=10, algorithm='brute', metric='euclidean')
    neighbors.fit(feature_list)
    distances, indices = neighbors.kneighbors([features])
    return indices

@app.route('/search', methods=['POST'])
def search():
    # Get search query from form
    query = request.json.get('query')
    query_words = query.lower().split()
    phrase_to_search = ' '.join(query_words)
    
    # Filter results based on search query
    results = train_text_data[
        train_text_data.apply(lambda row: is_phrase_in_text(phrase_to_search, row['product_title']) or is_phrase_in_text(phrase_to_search, row['class_label']), axis=1)
    ]
    
    # Get top 10 results
    top_10_results = results.head(10)
    result_list = top_10_results.to_dict(orient='records')
    
    
    #Get the image url
    image_urls = [result['image_url'] for result in result_list]
    
    # Return obtained results and original query
    return jsonify({'results':image_urls, 'query':query})


def check_and_correct_channels(image_bytes):
    try:
        # Convert image bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # Transpose the image array to ensure consistent shape (height, width, channels)
        img_array = np.transpose(img_array, (1, 0, 2)) 
        if img_array is None:
            raise ValueError("Failed to decode image")
        
        print("Inside")
        print("Original image shape:", img_array.shape)
        
        # Check if the image has exactly three channels
        if len(img_array.shape) != 3 or img_array.shape[2] != 3:
            print("Image does not have exactly three channels. Correcting...")
            # Convert image to RGB format
            img_array = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
            print("Corrected image shape:", img_array.shape)
            # Encode the corrected image to bytes
            _, corrected_image_bytes = cv2.imencode('.jpg', img_array)
            return corrected_image_bytes.tobytes()
        else:
            return image_bytes
    except Exception as e:
        print("Error occurred:", e)
        return None

@app.route('/tryon',methods=['POST'])
def tryon():
    print("Here")
    try:
        print("cloth")
        clothing_image = request.files['uploaded_image']
        print("user")
        user_image = request.files['captured_image']
        print("received")

       # Convert images to bytes
        clothing_image_bytes = clothing_image.read()
        user_image_bytes = user_image.read()

        # Check and correct the number of channels for both images
        print("cloth check")
        clothing_image_bytes_corrected = check_and_correct_channels(clothing_image_bytes)
        print("user check")
        user_image_bytes_corrected = check_and_correct_channels(user_image_bytes)

        # Construct the payload
        files = {
            'person_image': ('user_image.jpg', user_image_bytes_corrected),
            'garment_image': ('clothing_image.jpg', clothing_image_bytes_corrected)
        }
        print("Making request")
        # Make a POST request to the FastAPI endpoint
        response = requests.post('http://localhost:8000/try-on/image', files=files)
        if response.status_code == 200:
            print("Success")
            result = response.json()['result']  
            return jsonify({
                    'message': "success",
                    'tryon_image': result
            })
        else:
            print("Failed")
            return jsonify({'message': 'error', 'error_details': response.text})
    except Exception as e:
         return jsonify({'message': 'error', 'error_details': str(e)})

if __name__ == "__main__":
    app.run(debug=True)