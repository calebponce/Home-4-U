import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAmbience } from '../context/AmbienceContext';

const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(8px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)' },
  out: { opacity: 0, scale: 0.98, filter: 'blur(4px)' }
};

const pageTransition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1],
  duration: 0.5
};

const PageMotion = ({ children, className = '' }) => {
  const location = useLocation();
  const { playWhoosh } = useAmbience();

  useEffect(() => {
    playWhoosh();
  }, [location.pathname, playWhoosh]);

  return (
    <motion.div
      key={location.pathname}
      className={`page-motion ${className}`.trim()}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageMotion;
