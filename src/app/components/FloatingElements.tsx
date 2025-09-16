import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

const FloatingElement: React.FC<FloatingElementProps> = ({ 
  delay = 0, 
  duration = 3, 
  children 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        y: [0, -20, 0],
        rotate: [0, 180, 360]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {children}
    </motion.div>
  );
};

export default function FloatingElements() {
  return (
    <>
      {/* Floating Jersey Icons */}
      <FloatingElement delay={0} duration={4}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          top: '20%',
          left: '10%'
        }}>
          ⚽
        </div>
      </FloatingElement>

      <FloatingElement delay={1} duration={5}>
        <div style={{
          width: '35px',
          height: '35px',
          background: 'rgba(215, 182, 134, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(215, 182, 134, 0.3)',
          top: '30%',
          right: '15%'
        }}>
          🏆
        </div>
      </FloatingElement>

      <FloatingElement delay={2} duration={3.5}>
        <div style={{
          width: '30px',
          height: '30px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          top: '60%',
          left: '20%'
        }}>
          ⚡
        </div>
      </FloatingElement>

      <FloatingElement delay={0.5} duration={4.5}>
        <div style={{
          width: '45px',
          height: '45px',
          background: 'rgba(215, 182, 134, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(215, 182, 134, 0.2)',
          top: '70%',
          right: '25%'
        }}>
          🔥
        </div>
      </FloatingElement>

      {/* Floating Geometric Shapes */}
      <FloatingElement delay={1.5} duration={6}>
        <div style={{
          width: '25px',
          height: '25px',
          background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
          borderRadius: '8px',
          transform: 'rotate(45deg)',
          top: '40%',
          left: '5%'
        }} />
      </FloatingElement>

      <FloatingElement delay={2.5} duration={4}>
        <div style={{
          width: '20px',
          height: '20px',
          background: 'linear-gradient(45deg, rgba(215, 182, 134, 0.4), rgba(255, 255, 255, 0.2))',
          borderRadius: '50%',
          top: '50%',
          right: '10%'
        }} />
      </FloatingElement>

      {/* Floating Text Elements */}
      <FloatingElement delay={3} duration={5.5}>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '12px',
          color: '#f8f8ff',
          fontWeight: '500',
          top: '15%',
          right: '30%'
        }}>
          Premium Quality
        </div>
      </FloatingElement>

      <FloatingElement delay={1.8} duration={4.2}>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(215, 182, 134, 0.2)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(215, 182, 134, 0.3)',
          fontSize: '11px',
          color: '#f8f8ff',
          fontWeight: '500',
          top: '80%',
          left: '15%'
        }}>
          Limited Edition
        </div>
      </FloatingElement>
    </>
  );
}
