import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { getCurrentUser } from "../redux/authService";
import { loginSuccess } from "../redux/slices/authSlice";

import { useAppDispatch, useAppSelector } from "../redux/hooks";

const AdminRoute = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const fetchUser = async () => {
      
      if (user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();

        dispatch(loginSuccess({ user: data.user }));

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/productlist" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;