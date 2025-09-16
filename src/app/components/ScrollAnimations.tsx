import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scaleIn';
  delay?: number;
  duration?: number;
  threshold?: number;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'slideUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.1
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: threshold 
  });

  const animations = {
    slideUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 }
    },
    slideLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 }
    },
    slideRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 }
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 }
    }
  };

  const selectedAnimation = animations[animation];

  return (
    <motion.div
      ref={ref}
      initial={selectedAnimation.initial}
      animate={isInView ? selectedAnimation.animate : selectedAnimation.initial}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scaleIn';
  duration?: number;
}

const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 0.1,
  animation = 'slideUp',
  duration = 0.6
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const animations = {
    slideUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 }
    },
    slideLeft: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 }
    },
    slideRight: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 }
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 }
    }
  };

  const selectedAnimation = animations[animation];

  return (
    <div ref={ref}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={selectedAnimation.initial}
          animate={isInView ? selectedAnimation.animate : selectedAnimation.initial}
          transition={{
            duration: duration,
            delay: isInView ? index * staggerDelay : 0,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  speed = 0.5,
  direction = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current!.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        
        switch (direction) {
          case 'up':
            setOffset(rate);
            break;
          case 'down':
            setOffset(-rate);
            break;
          case 'left':
            setOffset(rate);
            break;
          case 'right':
            setOffset(-rate);
            break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <div
      ref={ref}
      style={{
        transform: direction === 'up' || direction === 'down' 
          ? `translateY(${offset}px)` 
          : `translateX(${offset}px)`
      }}
    >
      {children}
    </div>
  );
};

export { ScrollAnimation, StaggeredAnimation, ParallaxScroll };
