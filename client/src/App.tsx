import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./moduls/auth/login";
import Register from "./moduls/auth/register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
import ProductListing from "./moduls/user/ProductListing";
import AdminDashboard from "./moduls/admin/AdminDashboard";


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

        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;