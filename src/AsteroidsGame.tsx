import { randomId } from '@mantine/hooks';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { RefObject, createRef, useEffect, useState } from 'react';

export function AsteroidsGame() {
  const [score, setScore] = useState(0);
  const [collectedStarPosition, setCollectedStarPosition] = useState<{ x: number; y: number } | null>(null);

  const [planets, setPlanets] = useState<
    { id: string; ref: RefObject<HTMLDivElement>; initialX: number }[]
  >([
    {
      id: randomId(),
      ref: createRef(),
      initialX: Math.random() * document.body.clientWidth,
    },
  ]);
  const [coins, setCoins] = useState<
    { id: string; ref: RefObject<HTMLDivElement>; initialX: number }[]
  >([]);

  useEffect(() => {
    for (let i = 0; i < 1; i++) {
      setTimeout(() => {
        setPlanets((planets) => [
          ...planets,
          {
            id: randomId(),
            ref: createRef(),
            initialX: Math.random() * document.body.clientWidth,
          },
        ]);
      }, 250 + Math.random() * 1000);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((coins) =>
        coins.length > 10
          ? coins
          : [
              ...coins,
              {
                id: randomId(),
                ref: createRef(),
                initialX: Math.random() * document.body.clientWidth,
              },
            ],
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      planets.forEach((planet) => {
        const planetRect = planet.ref.current?.getBoundingClientRect();
        const rocketRect = document
          .querySelector('[style*="pointer-events: none"]')
          ?.getBoundingClientRect();

        if (
          planetRect &&
          rocketRect &&
          planetRect.left < rocketRect.right &&
          planetRect.right > rocketRect.left &&
          planetRect.top < rocketRect.bottom &&
          planetRect.bottom > rocketRect.top
        ) {
          // setPlanets((planets) => planets.filter((p) => p.id !== planet.id));
          setScore(0);
        }
      });

      coins.forEach((coin) => {
        const coinRect = coin.ref.current?.getBoundingClientRect();
        const rocketRect = document
          .querySelector('[style*="pointer-events: none"]')
          ?.getBoundingClientRect();

        if (
          coinRect &&
          rocketRect &&
          coinRect.left < rocketRect.right &&
          coinRect.right > rocketRect.left &&
          coinRect.top < rocketRect.bottom &&
          coinRect.bottom > rocketRect.top
        ) {
          // Set the position for the collection animation
          setCollectedStarPosition({
            x: coinRect.left + coinRect.width / 2,
            y: coinRect.top + coinRect.height / 2,
          });
          setCoins((coins) => coins.filter((c) => c.id !== coin.id));
          setScore((score) => score + 1);
        }
      });
    }, 1);

    return () => clearInterval(interval);
  }, [coins, planets]);

  return (
    <>
      <Background />

      {/* Score display with star icons */}
      <div
        style={{
          position: 'absolute',
          top: '5vh',
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          padding: '0 20px',
          zIndex: 100,
        }}
      >
        {/* Display collected stars */}
        {Array.from({ length: Math.min(score, 20) }).map((_, i) => (
          <motion.img
            key={i}
            src="/star.svg"
            alt="Collected star"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 15,
              delay: i * 0.05 
            }}
            style={{ 
              width: 40, 
              height: 40,
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 0, 0.8))'
            }}
          />
        ))}
        
        {/* Score number */}
        <motion.div
          key={score}
          initial={{ scale: 1.5, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            fontSize: 50,
            fontWeight: 'bold',
            color: 'yellow',
            textShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.5)',
            minWidth: 60,
            textAlign: 'center',
          }}
        >
          {score}
        </motion.div>
      </div>

      {/* Collection animation */}
      <AnimatePresence>
        {collectedStarPosition && (
          <motion.img
            src="/star.svg"
            alt="Collected"
            initial={{ 
              x: collectedStarPosition.x - 20,
              y: collectedStarPosition.y - 20,
              scale: 1,
              opacity: 1,
            }}
            animate={{ 
              x: window.innerWidth / 2 - 20,
              y: window.innerHeight * 0.05 - 20,
              scale: 0.5,
              opacity: 0.8,
            }}
            exit={{ 
              scale: 0,
              opacity: 0,
            }}
            transition={{ 
              duration: 0.6,
              ease: 'easeOut',
            }}
            onAnimationComplete={() => setCollectedStarPosition(null)}
            style={{
              position: 'absolute',
              width: 40,
              height: 40,
              filter: 'drop-shadow(0 0 15px rgba(255, 255, 0, 1))',
              zIndex: 200,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <Rocket />

      {planets.map((planet) => (
        <Planet
          key={planet.id}
          innerRef={planet.ref}
          initialX={planet.initialX}
        />
      ))}

      {coins.map((coin) => (
        <Coin key={coin.id} innerRef={coin.ref} initialX={coin.initialX} />
      ))}
    </>
  );
}

function Background() {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'black',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    />
  );
}

function Rocket() {
  const x = useSpring(0);

  const rocketWidth = 50;
  const xPadding = 50;
  const yPadding = '15vh';

  return (
    <>
      <motion.div
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          x,
          bottom: yPadding,
          width: rocketWidth,
          height: 60,
        }}
      >
        <img 
          src="/spaceship.svg" 
          alt="Spaceship" 
          style={{ width: '100%', height: '100%' }} 
        />
      </motion.div>

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

function Planet({
  innerRef,
  initialX,
}: {
  innerRef: RefObject<HTMLDivElement>;
  initialX: number;
}) {
  const x = useMotionValue(initialX);
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
  }, [x, y]);

  return (
    <motion.div
      ref={innerRef}
      style={{
        position: 'absolute',
        x,
        y,
        width: size,
        height: size,
      }}
    >
      <img 
        src="/asteroid.svg" 
        alt="Asteroid" 
        style={{ width: '100%', height: '100%' }} 
      />
    </motion.div>
  );
}

function Coin({
  innerRef,
  initialX,
}: {
  innerRef: RefObject<HTMLDivElement>;
  initialX: number;
}) {
  const x = useMotionValue(initialX);
  const y = useMotionValue(0);

  const size = 40;

  useEffect(() => {
    const interval = setInterval(() => {
      y.set(y.get() + 2);
      if (y.get() > document.body.clientHeight) {
        x.set(Math.random() * document.body.clientWidth);
        y.set(0);
      }
    }, 1);

    return () => clearInterval(interval);
  }, [x, y]);

  return (
    <motion.div
      ref={innerRef}
      style={{
        position: 'absolute',
        x,
        y,
        width: size,
        height: size,
      }}
    >
      <img 
        src="/star.svg" 
        alt="Star" 
        style={{ width: '100%', height: '100%' }} 
      />
    </motion.div>
  );
}
