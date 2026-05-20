import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../redux/authService";
import { loginSuccess } from "../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { RootState } from "../redux/store.ts";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
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

  return <>{children}</>;
};

export default AdminRoute;