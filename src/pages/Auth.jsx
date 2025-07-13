// pages/Auth.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForms from '@/components/AuthForms';

const Auth = () => {
  const navigate = useNavigate();

  const handleAuthSuccess = (userData) => {
    console.log('Authentication successful:', userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/');
  };

  return <AuthForms onAuthSuccess={handleAuthSuccess} />;
};

export default Auth;
