import cv2
import pandas as pd
import numpy as np

def get_color_name_from_image(img_path):
    img = cv2.imread(img_path)

    # Calculate the center coordinates of the image
    height, width, _ = img.shape
    center_x = width // 2
    center_y = height // 2 - height // 4  # Move the center up by 1/10th of the image height

    # Radius of the circle (adjust this value as needed)
    radius = min(width, height) // 5  # Slightly reduced radius

    # Create a mask for the circle
    mask = np.zeros((height, width), dtype=np.uint8)
    cv2.circle(mask, (center_x, center_y), radius, (255, 255, 255), -1)

    # Reading csv file with pandas and giving names to each column
    index = ["color", "color_name", "hex", "R", "G", "B"]
    csv = pd.read_csv('colors.csv', names=index, header=None)

    # Function to calculate minimum distance from all colors and get the most matching color
    def get_color_name(R, G, B):
        minimum = 10000
        color_name = ""
        for i in range(len(csv)):
            d = abs(R - int(csv.loc[i, "R"])) + abs(G - int(csv.loc[i, "G"])) + abs(B - int(csv.loc[i, "B"]))
            if d < minimum:
                minimum = d
                color_name = csv.loc[i, "color_name"]
        return color_name

    # Get the color within the circle
    colors_in_circle = []
    for y in range(center_y - radius, center_y + radius + 1):  # Adjusted range for y coordinate
        for x in range(center_x - radius, center_x + radius + 1):  # Adjusted range for x coordinate
            if mask[y, x] == 255:
                b, g, r = img[y, x]
                colors_in_circle.append((r, g, b))

    # Count occurrences of each unique color within the circle
    color_counts = {}
    for color in colors_in_circle:
        color_str = f"{color[0]}, {color[1]}, {color[2]}"
        if color_str not in color_counts:
            color_counts[color_str] = 1
        else:
            color_counts[color_str] += 1

    # Sort the color counts by frequency in descending order
    sorted_color_counts = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)

    # Return the color name of the color that has occurred more frequently within the top 10
    for color_str, count in sorted_color_counts[:10]:
        color_name = get_color_name(*map(int, color_str.split(', ')))  # Get color name
        return color_name  # Return the first color from the top 10

# Example usage:
# color_name = get_color_name_from_image('pant-3.jpg')
# print(color_name)
