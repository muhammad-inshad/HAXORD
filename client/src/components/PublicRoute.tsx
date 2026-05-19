import React from 'react';
import { Navigate } from 'react-router-dom';

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const accessToken = getCookie('accessToken');
  
  if (accessToken) {
    const storedUser = localStorage.getItem('user');
    let isAdmin = false;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        isAdmin = parsed.isAdmin === true;
      } catch (e) {}
    }
    
    return <Navigate to={isAdmin ? "/admin" : "/productlist"} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
