import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export function App() {
  return (
    <>
      <Rocket />

      <Planet />
    </>
  );
}

function Rocket() {
  const x = useSpring(0);

  const rocketWidth = 50;
  const xPadding = 50;
  const yPadding = 50;

  return (
    <>
      <motion.div
        style={{
          position: 'absolute',
          background: 'red',
          pointerEvents: 'none',
          x,
          bottom: yPadding,
          width: rocketWidth,
          height: 60,
        }}
      />

      <div
        style={{
          position: 'absolute',
          background: 'transparent',
          touchAction: 'none',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
        onPointerMove={(evt) => {
          x.set(
            Math.min(
              document.body.clientWidth - xPadding - rocketWidth / 2,
              Math.max(
                xPadding - rocketWidth / 2,
                evt.clientX - rocketWidth / 2,
              ),
            ),
          );
        }}
      />
    </>
  );
}

function Planet() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const size = 80;

  useEffect(() => {
    const interval = setInterval(() => {
      y.set(y.get() + 2);
      if (y.get() > document.body.clientHeight) {
        x.set(Math.random() * document.body.clientWidth);
        y.set(0);
      }
    }, 1);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{
        position: 'absolute',
        background: 'red',
        x,
        y,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
