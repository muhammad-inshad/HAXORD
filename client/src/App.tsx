import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./moduls/auth/login";
import Register from "./moduls/auth/register";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";

import ProductListing from "./moduls/user/ProductListing";
import AdminDashboard from "./moduls/admin/AdminDashboard";
import { FRONTEND_URL } from "./constance/frontend/url";
import UserManagement from "./moduls/admin/Usermangement";
import ProductManagement from "./moduls/admin/ProductManagement";
import SuccessPage from "./moduls/user/Successpage";

import Orders from "./moduls/admin/Orders";
import CartPage from "./moduls/user/Cart";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path={FRONTEND_URL.SUCCESSPAGE} element={<SuccessPage/>}/>

        {/* LOGIN */}
        <Route
          path={FRONTEND_URL.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* REGISTER */}
        <Route
          path={FRONTEND_URL.REGISTER}
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

<Route element={<ProtectedRoute />}>
  <Route path={FRONTEND_URL.PRODUCT_LIST} element={<ProductListing />} />
  <Route path={FRONTEND_URL.CART} element={<CartPage />} />
</Route>

        {/* ADMIN */}
    <Route element={<AdminRoute />}>
    <Route path={FRONTEND_URL.ADMIN_DASHBOARD} element={<AdminDashboard />} />
    <Route path={FRONTEND_URL.ADMIN_USERS} element={<UserManagement />} />
    <Route path={FRONTEND_URL.ADMIN_ADD_PRODUCT} element={<ProductManagement />} />
     <Route path={FRONTEND_URL.ADMIN_ORDERS} element={<Orders/>} />
   
  </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;