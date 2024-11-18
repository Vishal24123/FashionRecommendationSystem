import base64
from io import BytesIO
from pathlib import Path
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw
import numpy as np
import cv2

from service import TryonService
from utils import gdrive_download, url_download

app = Flask(__name__)
app.config['SECRET_KEY'] = 'coders'
CORS(app, supports_credentials=True)

UPLOAD_FOLDER = 'uploads'  # Folder to store uploaded images
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

CKPT_PATH = Path('model')
CKPT_PATH.mkdir(parents=True, exist_ok=True)

gdrive_download(
    url='https://drive.google.com/uc?id=1rbSTGKAE-MTxBYHd-51l2hMOQPT_7EPy',
    output=str(CKPT_PATH / 'u2netp.pt'),
)
gdrive_download(
    url='https://drive.google.com/uc?id=1KJNKjqBeUF9CLcCRFyjONmKzcqjNgj9z',
    output=str(CKPT_PATH / 'mobile_warp.pt'),
)
gdrive_download(
    url='https://drive.google.com/uc?id=1TP2OiEixy1WEjbJsdDYGL-214v_zkqUV',
    output=str(CKPT_PATH / 'mobile_gen.pt'),
)
url_download(
    url='https://github.com/WongKinYiu/yolov7/releases/download/v0.1/yolov7-w6-pose.pt',
    output=str(CKPT_PATH / 'yolov7-w6-pose.pt'),
)
url_download(
    url='https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
    output=str(CKPT_PATH / 'mediapipe_segmenter.tflite'),
)

tryon_service = TryonService(
    tryon_ckpt={'warp': CKPT_PATH / 'mobile_warp.pt', 'gen': CKPT_PATH / 'mobile_gen.pt'},
    edge_detect_ckpt=CKPT_PATH / 'u2netp.pt',
    yolo_ckpt=CKPT_PATH / 'yolov7-w6-pose.pt',
    mediapipe_segment_ckpt=CKPT_PATH / 'mediapipe_segmenter.tflite',
    device='cpu',
)


def cloth_extraction(image_path):
    # Load the cascade
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    # Load the image
    image = cv2.imread(image_path)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # Check if any faces are detected
    if len(faces) > 0:
        # Assume only one face is detected
        x, y, w, h = faces[0]

        # Calculate the bottom coordinate of the face
        bottom_face_y = y + h + 2

        # Resize the image from the bottom of the chin to the bottom of the image
        resized_image = image[bottom_face_y:, :]

        # Override the original image
        cv2.imwrite(image_path, resized_image)

    else:
        print("No face detected.")

def enhance_image(image_path):
    # Load the image
    image = cv2.imread(image_path)

    # Convert image to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)

    # Split the LAB image into L, A, and B channels
    l, a, b = cv2.split(lab)

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to the L channel
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced_l = clahe.apply(l)

    # Merge the enhanced L channel with the original A and B channels
    enhanced_lab = cv2.merge((enhanced_l, a, b))

    # Convert the LAB image back to RGB color space
    enhanced_rgb = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # Save the enhanced image back to the same path
    cv2.imwrite(image_path, enhanced_rgb)

@app.route("/")
def hello():
    return "<p>Hello!</p>"

@app.route('/image', methods=['POST'])
async def try_on_images1():
    try:
        print("Tryon")
        person_image = request.files['person_image']
        cloth_image = request.files['cloth_image']
        print("check")

        # Save the uploaded images to the upload folder
        person_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'person.jpg')
        cloth_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cloth.jpg')
        person_image.save(person_image_path)
        cloth_image.save(cloth_image_path)

        # Get the shape of the stored images
        person_img_shape = cv2.imread(person_image_path).shape
        cloth_img_shape = cv2.imread(cloth_image_path).shape
        print("Shape of person image:", person_img_shape)
        print("Shape of cloth image:", cloth_img_shape)
        '''
        person_image_content = person_image.read()
        cloth_image_content = cloth_image.read()
        pil_img = Image.open(BytesIO(person_image_content)).convert('RGB')
        pil_clothes = Image.open(BytesIO(cloth_image_content)).convert('RGB')

        pil_img = pil_img.convert('RGB')
        pil_clothes = pil_clothes.convert('RGB')
        '''
        # Remove the face region from the cloth image
        cloth_extraction(cloth_image_path)
        #enhance_image(cloth_image_path)
        #enhance_image(person_image_path)
        print("Before processing")
        # Open the images using PIL
        with open(person_image_path, 'rb') as f:
            pil_img = Image.open(BytesIO(f.read()))
        with open(cloth_image_path, 'rb') as f:
            pil_clothes = Image.open(BytesIO(f.read()))
        print("After processing")
        print("Before calling tryon_service.tryon_image")
        tryon_cv = tryon_service.tryon_image(pil_img, pil_clothes)
        print("After calling tryon_service.tryon_image")
        if tryon_cv is not None:
            # Enhance the image quality
            #tryon_cv = enhance_image(tryon_cv)
            pil_tryon = Image.fromarray(tryon_cv)
        else:
            pil_tryon = pil_img

        image_buffer = BytesIO()
        pil_tryon.save(image_buffer, 'JPEG')
        image_buffer.seek(0)

        base64_string = "data:image/jpeg;base64," + base64.b64encode(image_buffer.getvalue()).decode()

        return jsonify({'message': 'success', 'result': base64_string}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'error', 'error_details': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000)
