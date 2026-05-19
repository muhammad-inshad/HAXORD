import React from 'react';
import { Navigate } from 'react-router-dom';

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const accessToken = getCookie('accessToken');
  
  const storedUser = localStorage.getItem('user');
  let isAdmin = false;
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      isAdmin = parsedUser.isAdmin === true;
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }

  if (!accessToken || !isAdmin) {
  
    return <Navigate to={accessToken ? "/productlist" : "/"} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
