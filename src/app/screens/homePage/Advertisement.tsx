import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useHistory } from "react-router-dom";

export default function Advertisement() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const history = useHistory();
  
  const jerseyPromotions = [
    {
      title: "Premier League Collection",
      subtitle: "Authentic 2024/25 Jerseys",
      description: "Get the latest official Premier League jerseys with authentic badges and premium quality materials.",
      image: "/img/premier-league.webp",
      color: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
    },
    {
      title: "Champions League",
      subtitle: "Elite European Football",
      description: "Show your support for the greatest club competition with our exclusive Champions League collection.",
      image: "/img/champions-league.webp", 
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "World Cup Edition",
      subtitle: "International Glory",
      description: "Celebrate the beautiful game with our World Cup collection featuring national team jerseys.",
      image: "/img/world-cup.webp",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Retro Classics",
      subtitle: "Vintage Football Heritage",
      description: "Step back in time with our collection of classic football jerseys from legendary teams and eras.",
      image: "/img/retro-classics.webp",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % jerseyPromotions.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [jerseyPromotions.length]);

  return (
    <div className="ads-restaurant-frame">
      <Box className="jersey-promotion-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="promotion-slide"
            style={{
              background: jerseyPromotions[currentSlide].color,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <Box className="promotion-content">
              <Stack spacing={3} className="promotion-text">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography variant="h2" className="promotion-title">
                    {jerseyPromotions[currentSlide].title}
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Typography variant="h4" className="promotion-subtitle">
                    {jerseyPromotions[currentSlide].subtitle}
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Typography variant="body1" className="promotion-description">
                    {jerseyPromotions[currentSlide].description}
                  </Typography>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button 
                    variant="contained" 
                    className="promotion-button"
                    size="large"
                    onClick={() => {
                      history.push('/products');
                      window.scrollTo(0, 0);
                    }}
                  >
                    Shop Now
                  </Button>
                </motion.div>
              </Stack>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="promotion-visual"
              >
                <Box className="ronaldo-showcase">
                  <div className="ronaldo-celebration">
                    {/* Ronaldo's Real Photo */}
                    <div className="ronaldo-photo-container">
                      <img
                        src="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                        alt="Cristiano Ronaldo"
                        className="ronaldo-photo"
                        onError={(e) => {
                          e.currentTarget.src = "/img/logo.webp";
                        }}
                      />
                      
                      {/* Overlay Text */}
                      <div className="ronaldo-text-overlay">
                        <h2 className="ronaldo-main-text">
                          Own the Game
                        </h2>
                        
                        <h3 className="ronaldo-sub-text">
                          Wear the Republic
                        </h3>
                      </div>
                      
                      {/* Jersey Number Overlay */}
                      <div className="jersey-number-overlay">
                        <span className="jersey-number">7</span>
                      </div>
                    </div>
                    
                    {/* Background Effects */}
                    <div className="celebration-effects">
                      <div className="effect-circle effect-1"></div>
                      <div className="effect-circle effect-2"></div>
                      <div className="effect-circle effect-3"></div>
                    </div>
                  </div>
                </Box>
              </motion.div>
            </Box>
            
            {/* Slide Indicators */}
            <Box className="slide-indicators">
              {jerseyPromotions.map((_, index) => (
                <motion.div
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </div>
  );
}