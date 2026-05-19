import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./moduls/auth/login";
import Register from "./moduls/auth/register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import ProductListing from "./moduls/user/ProductListing";


function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register/>
          </PublicRoute>
        }/>
        
        <Route path="/productlist" element={
          <ProtectedRoute>
            <ProductListing/>
          </ProtectedRoute>
        }/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;