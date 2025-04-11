import React from 'react';
import { Route, Navigate } from 'react-router-dom';

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const loggedInRole = localStorage.getItem('role');

  if (token && loggedInRole === role) {
    return children;
  } else {
    return <Navigate to="/" />;
  }
}

export default PrivateRoute;