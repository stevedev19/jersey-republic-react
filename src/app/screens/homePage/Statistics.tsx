import React, { useRef, useEffect } from "react";
import { Box, Container, Stack } from "@mui/material";
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import Divider from "../../components/divider";


interface CountingStaticBoxProps {
  targetNumber: number;
  text: string;
  displaySuffix?: string;
}

const CountingStaticBox: React.FC<CountingStaticBoxProps> = ({ targetNumber, text, displaySuffix = '' }) => {
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, Math.round); // roundedCount is still a MotionValue
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.75 });

  useEffect(() => {
    if (isInView) {
      count.set(targetNumber);
    }
  }, [isInView, count, targetNumber]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      <Stack className="static-box">
          <Box className="static-num">
              {/* FIX: Use motion.span to render the MotionValue directly */}
              <motion.span>{roundedCount}</motion.span>
              {displaySuffix}
          </Box>
          <Box className="static-text">{text}</Box>
      </Stack>
    </motion.div>
  );
};


// --- Main Statistics Component ---
export default function Statistics () {
    const statsData = [
        { id: 1, number: 4, label: 'Web Stores' },
        { id: 2, number: 8, label: 'Experience' },
        { id: 3, number: 50, label: 'Jersey Types', suffix: '+' },
        { id: 4, number: 200, label: 'Clients', suffix: '+' },
    ];

    return(
        <div className={"static-frame"}>
            <Container>
                <Stack className="info">
                    {statsData.map((stat, index) => (
                        <React.Fragment key={stat.id}>
                            <CountingStaticBox
                                targetNumber={stat.number}
                                text={stat.label}
                                displaySuffix={stat.suffix}
                            />
                            {index < statsData.length - 1 && (
                                <Divider height="64" width="2" bg="#E3C08D"/>
                            )}
                        </React.Fragment>
                    ))}
                </Stack>
            </Container>
        </div>
    );
}