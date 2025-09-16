import React from 'react';
import { motion } from 'framer-motion';
import { Box, Skeleton, Stack } from '@mui/material';

interface SkeletonCardProps {
  width?: number;
  height?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ width = 300, height = 430 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: width,
        height: height,
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height="70%" 
        animation="wave"
        sx={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" width="80%" height={30} animation="wave" />
        <Skeleton variant="text" width="60%" height={20} animation="wave" />
        <Skeleton variant="text" width="40%" height={20} animation="wave" />
      </Box>
    </motion.div>
  );
};

const PulseLoader: React.FC = () => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px auto',
        boxShadow: '0 0 30px rgba(102, 126, 234, 0.5)',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: '30px',
          height: '30px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
        }}
      />
    </motion.div>
  );
};

const BouncingDots: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            delay: index * 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
          }}
        />
      ))}
    </Box>
  );
};

const LoadingSpinner: React.FC = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        margin: '20px auto',
      }}
    />
  );
};

const ProductSkeletonGrid: React.FC = () => {
  return (
    <Stack 
      direction="row" 
      spacing={3} 
      justifyContent="space-between"
      sx={{ width: '100%', mt: 5 }}
    >
      {[1, 2, 3, 4].map((index) => (
        <SkeletonCard key={index} />
      ))}
    </Stack>
  );
};

const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="text" 
          width={`${Math.random() * 40 + 60}%`} 
          height={20} 
          animation="wave"
        />
      ))}
    </Stack>
  );
};

export {
  SkeletonCard,
  PulseLoader,
  BouncingDots,
  LoadingSpinner,
  ProductSkeletonGrid,
  TextSkeleton
};
