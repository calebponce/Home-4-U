import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAmbience } from '../context/AmbienceContext';

const PageMotion = ({ children, className = '' }) => {
  const location = useLocation();
  const { playWhoosh } = useAmbience();

  useEffect(() => {
    playWhoosh();
  }, [location.pathname, playWhoosh]);

  return (
    <div key={location.pathname} className={`page-motion ${className}`.trim()}>
      {children}
    </div>
  );
};

export default PageMotion;
