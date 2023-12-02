import { motion, useSpring } from 'framer-motion';

export function App() {
  const x = useSpring(0);

  const xPadding = 50;
  const yPadding = 50;
  const rocketWidth = 50;

  return (
    <>
      <motion.div
        style={{
          background: 'red',
          position: 'absolute',
          pointerEvents: 'none',
          x,
          bottom: yPadding,
          width: rocketWidth,
          height: 60,
        }}
      />

      <div
        style={{
          background: 'transparent',
          touchAction: 'none',
          position: 'absolute',
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
