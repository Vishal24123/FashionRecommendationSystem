import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Signup from "./Signup";
import RootLayout from "./RootLayout";
import Tryon from "./Tryon";
import Image from "./Image";
import Text from "./Text";
import Wardrobe from "./Wardrobe";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/sign", element: <Signup /> },
      { path: "/home", element: <Home /> },      
      { path: "/home/text", element:<Text/>},
      { path: "/home/image", element:<Image/>},
      { path: "/home/wardrobe", element:<Wardrobe/>},
      { path: "/home/text/tryon", element:<Tryon/>},
      { path: "/home/image/tryon", element:<Tryon/>},
    ]
  }
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
