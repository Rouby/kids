import { useEffect, useRef, useState } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Sprite, Texture, Assets, Text } from 'pixi.js';

// Register PixiJS components for use in JSX
extend({ Container, Sprite, Text });

interface GameObject {
  id: string;
  x: number;
  y: number;
}

export function AsteroidsGame() {
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

    const handleTouchMove = (evt: TouchEvent) => {
      if (evt.touches.length > 0) {
        const touch = evt.touches[0];
        handlePointerMove({ clientX: touch.clientX } as PointerEvent);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameSize.width]);

  const ref = useRef<HTMLDivElement>(null);

  if (!texturesLoaded) {
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'black' }} />;
  }

  return (
    <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Application
        resizeTo={ref}
        backgroundAlpha={0}
      >
        <GameScene
          gameSize={gameSize}
          rocketXRef={rocketXRef}
        />
      </Application>
    </div>
  );
}

interface GameSceneProps {
  gameSize: { width: number; height: number };
  rocketXRef: React.MutableRefObject<number>;
}

function GameScene({
  gameSize,
  rocketXRef,
}: GameSceneProps) {
  const [asteroids, setAsteroids] = useState<GameObject[]>([
    { id: '1', x: Math.random() * window.innerWidth, y: 0 }
  ]);
  const [stars, setStars] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  
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
          setScore(0);
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
          setScore(prev => prev + 1);
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
      {/* Score Display */}
      <pixiText
        text={`Score: ${score}`}
        x={gameSize.width / 2}
        y={50}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{
          fontFamily: 'Arial',
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#ffff00',
          dropShadow: {
            alpha: 0.8,
            angle: 45,
            blur: 4,
            color: '#000000',
            distance: 5,
          },
        }}
      />

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
