from PIL import Image, ImageOps
import numpy as np
import tensorflow as tf

# Load pre-trained ResNet50 model for feature extraction
model = tf.keras.models.load_model('fashion_mnist_cnn_model.h5')
model.trainable = False

# Define the class labels for Fashion MNIST dataset
class_labels = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat', 'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']

def predict_cloth_from_image(img):
    try:
        # Convert image to grayscale
        img = img.convert('L')

        # Convert image to negative
        img = ImageOps.invert(img)

        # Resize image to match input size of the model
        img = img.resize((28, 28))

        # Convert image to numpy array and normalize pixel values
        img_array = np.array(img) / 255.0

        # Reshape image to match expected input shape of the model
        img_array = img_array.reshape((1, 28, 28, 1))

        # Perform prediction using the model
        prediction = model.predict(img_array)

        # Get the predicted class label index
        predicted_class_index = np.argmax(prediction)

        # Determine the output based on the predicted class label
        if predicted_class_index in [0, 2, 3, 4, 6, 8]:
            return "t-shirt"
        else:
            return "pant"
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# Example usage:
# img = Image.open('pant-3.jpg')
# cloth_name = predict_cloth_from_image(img)
# print(cloth_name)
