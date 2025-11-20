import { useEffect, useRef, useState } from 'react';
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
  
  
  const [gameSize, setGameSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  

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

  const ref = useRef<HTMLDivElement>(null);


  if (!texturesLoaded) {
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'black' }} />;
  }

  return (
    <div ref={ref}style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', }}>
      <Application
      resizeTo={ref}
        backgroundAlpha={0}
      >
        <GameScene
          gameSize={gameSize}
        />
      </Application>
    </div>
  );
}

interface GameSceneProps {
 gameSize: { width: number; height: number };
}

function GameScene({
  gameSize,
}:GameSceneProps) {
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
    const rocketX = 0;

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
          // todo reset score
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
          // todo handle star collected
          // todo handle score change
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
        x={0}
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
