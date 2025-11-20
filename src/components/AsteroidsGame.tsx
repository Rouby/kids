import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Sprite, Texture, Assets } from 'pixi.js';

// Register PixiJS components for use in JSX
extend({ Container, Sprite });

interface GameObject {
  id: string;
  x: number;
  y: number;
}

export function AsteroidsGame() {
  const [score, setScore] = useState(0);
  const [collectedStarPosition, setCollectedStarPosition] = useState<{ x: number; y: number } | null>(null);
  const [gameSize, setGameSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  
  const rocketXRef = useRef(window.innerWidth / 2);

  // Load textures
  useEffect(() => {
    const loadTextures = async () => {
      await Assets.load(['/spaceship.svg', '/asteroid.svg', '/star.svg']);
      setTexturesLoaded(true);
    };
    loadTextures();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setGameSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handlePointerMove = (evt: PointerEvent) => {
      const rocketWidth = 50;
      const xPadding = 50;
      rocketXRef.current = Math.min(
        gameSize.width - xPadding - rocketWidth / 2,
        Math.max(xPadding - rocketWidth / 2, evt.clientX - rocketWidth / 2)
      );
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [gameSize.width]);

  const handleScoreChange = useCallback((newScore: number | ((prev: number) => number)) => {
    setScore(newScore);
  }, []);

  const handleStarCollected = useCallback((x: number, y: number) => {
    setCollectedStarPosition({ x, y });
  }, []);

  if (!texturesLoaded) {
    return <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'black' }} />;
  }

  return (
    <>
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

      <Application
        width={gameSize.width}
        height={gameSize.height}
        backgroundAlpha={0}
      >
        <GameScene
          gameSize={gameSize}
          rocketXRef={rocketXRef}
          onScoreChange={handleScoreChange}
          onStarCollected={handleStarCollected}
        />
      </Application>
    </>
  );
}

interface GameSceneProps {
  gameSize: { width: number; height: number };
  rocketXRef: React.MutableRefObject<number>;
  onScoreChange: (score: number | ((prev: number) => number)) => void;
  onStarCollected: (x: number, y: number) => void;
}

function GameScene({
  gameSize,
  rocketXRef,
  onScoreChange,
  onStarCollected,
}: GameSceneProps) {
  const [asteroids, setAsteroids] = useState<GameObject[]>([
    { id: '1', x: Math.random() * window.innerWidth, y: 0 }
  ]);
  const [stars, setStars] = useState<GameObject[]>([]);
  
  const nextStarTimeRef = useRef(Date.now() + 1000);
  const nextAsteroidTimeRef = useRef(Date.now() + 250 + Math.random() * 1000);

  useTick(() => {
    const now = Date.now();
    const rocketWidth = 50;
    const rocketHeight = 60;
    const rocketY = gameSize.height - gameSize.height * 0.15 - rocketHeight;
    const rocketX = rocketXRef.current;

    setAsteroids(currentAsteroids => {
      let newAsteroids = [...currentAsteroids];

      // Spawn new asteroids
      if (now >= nextAsteroidTimeRef.current && newAsteroids.length < 5) {
        newAsteroids.push({
          id: `asteroid-${now}`,
          x: Math.random() * gameSize.width,
          y: 0,
        });
        nextAsteroidTimeRef.current = now + 250 + Math.random() * 1000;
      }

      // Update asteroid positions
      newAsteroids = newAsteroids.map(asteroid => {
        const newY = asteroid.y + 2;
        if (newY > gameSize.height) {
          return {
            ...asteroid,
            x: Math.random() * gameSize.width,
            y: 0,
          };
        }
        return { ...asteroid, y: newY };
      });

      // Check asteroid collisions
      newAsteroids.forEach(asteroid => {
        const asteroidSize = 80;
        if (
          asteroid.x < rocketX + rocketWidth &&
          asteroid.x + asteroidSize > rocketX &&
          asteroid.y < rocketY + rocketHeight &&
          asteroid.y + asteroidSize > rocketY
        ) {
          onScoreChange(0);
        }
      });

      return newAsteroids;
    });

    setStars(currentStars => {
      let newStars = [...currentStars];

      // Spawn new stars
      if (now >= nextStarTimeRef.current && newStars.length < 10) {
        newStars.push({
          id: `star-${now}`,
          x: Math.random() * gameSize.width,
          y: 0,
        });
        nextStarTimeRef.current = now + 1000;
      }

      // Update star positions
      newStars = newStars.map(star => {
        const newY = star.y + 2;
        if (newY > gameSize.height) {
          return {
            ...star,
            x: Math.random() * gameSize.width,
            y: 0,
          };
        }
        return { ...star, y: newY };
      });

      // Check star collisions
      const collectedStarIds: string[] = [];
      newStars.forEach(star => {
        const starSize = 40;
        if (
          star.x < rocketX + rocketWidth &&
          star.x + starSize > rocketX &&
          star.y < rocketY + rocketHeight &&
          star.y + starSize > rocketY
        ) {
          collectedStarIds.push(star.id);
          onStarCollected(star.x + starSize / 2, star.y + starSize / 2);
          onScoreChange(prev => prev + 1);
        }
      });

      if (collectedStarIds.length > 0) {
        newStars = newStars.filter(star => !collectedStarIds.includes(star.id));
      }

      return newStars;
    });
  });

  return (
    <pixiContainer>
      {/* Rocket */}
      <pixiSprite
        texture={Texture.from('/spaceship.svg')}
        x={rocketXRef.current}
        y={gameSize.height - gameSize.height * 0.15 - 60}
        width={50}
        height={60}
      />

      {/* Asteroids */}
      {asteroids.map(asteroid => (
        <pixiSprite
          key={asteroid.id}
          texture={Texture.from('/asteroid.svg')}
          x={asteroid.x}
          y={asteroid.y}
          width={80}
          height={80}
        />
      ))}

      {/* Stars */}
      {stars.map(star => (
        <pixiSprite
          key={star.id}
          texture={Texture.from('/star.svg')}
          x={star.x}
          y={star.y}
          width={40}
          height={40}
        />
      ))}
    </pixiContainer>
  );
}
