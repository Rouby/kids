import { useEffect, useRef, useState } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Sprite, Texture, Assets, Text, Graphics } from 'pixi.js';

// Register PixiJS components for use in JSX
extend({ Container, Sprite, Text, Graphics });

interface GameObject {
  id: string;
  x: number;
  y: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

export function AsteroidsGame() {
  const [gameSize, setGameSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('asteroidsHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const rocketXRef = useRef(window.innerWidth / 2);
  const collectStarSoundRef = useRef<HTMLAudioElement | null>(null);
  const collisionSoundRef = useRef<HTMLAudioElement | null>(null);

  // Load textures and sounds
  useEffect(() => {
    const loadTextures = async () => {
      await Assets.load(['/spaceship.svg', '/asteroid.svg', '/star.svg']);
      setTexturesLoaded(true);
    };
    loadTextures();

    // Load sound effects
    collectStarSoundRef.current = new Audio('/collect-star.mp3');
    collisionSoundRef.current = new Audio('/collision.mp3');
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
    return <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000814' }} />;
  }

  return (
    <div ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000814' }}>
      <Application
        resizeTo={ref}
        backgroundAlpha={1}
        background={0x000814}
      >
        <GameScene
          gameSize={gameSize}
          rocketXRef={rocketXRef}
          gameOver={gameOver}
          setGameOver={setGameOver}
          highScore={highScore}
          setHighScore={setHighScore}
          collectStarSoundRef={collectStarSoundRef}
          collisionSoundRef={collisionSoundRef}
        />
      </Application>
    </div>
  );
}

interface GameSceneProps {
  gameSize: { width: number; height: number };
  rocketXRef: React.MutableRefObject<number>;
  gameOver: boolean;
  setGameOver: (gameOver: boolean) => void;
  highScore: number;
  setHighScore: (score: number) => void;
  collectStarSoundRef: React.MutableRefObject<HTMLAudioElement | null>;
  collisionSoundRef: React.MutableRefObject<HTMLAudioElement | null>;
}

function GameScene({
  gameSize,
  rocketXRef,
  gameOver,
  setGameOver,
  highScore,
  setHighScore,
  collectStarSoundRef,
  collisionSoundRef,
}: GameSceneProps) {
  const [asteroids, setAsteroids] = useState<GameObject[]>([
    { id: '1', x: Math.random() * window.innerWidth, y: 0 }
  ]);
  const [stars, setStars] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [backgroundStars, setBackgroundStars] = useState<Star[]>([]);
  
  const nextStarTimeRef = useRef(Date.now() + 1000);
  const nextAsteroidTimeRef = useRef(Date.now() + 250 + Math.random() * 1000);

  // Generate background stars
  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        x: Math.random() * gameSize.width,
        y: Math.random() * gameSize.height,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }
    setBackgroundStars(newStars);
  }, [gameSize]);

  // Update high score when score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('asteroidsHighScore', score.toString());
    }
  }, [score, highScore, setHighScore]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setAsteroids([{ id: '1', x: Math.random() * gameSize.width, y: 0 }]);
    setStars([]);
    nextStarTimeRef.current = Date.now() + 1000;
    nextAsteroidTimeRef.current = Date.now() + 250 + Math.random() * 1000;
  };

  useTick(() => {
    if (gameOver) return; // Don't update if game is over
    
    const now = Date.now();
    const rocketWidth = 50;
    const rocketHeight = 60;
    const rocketY = gameSize.height - gameSize.height * 0.15 - rocketHeight;
    const rocketX = rocketXRef.current;

    // Difficulty progression: speed increases with score
    const baseSpeed = 2;
    const speedMultiplier = 1 + Math.floor(score / 10) * 0.1; // +10% every 10 points
    const gameSpeed = baseSpeed * speedMultiplier;

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

      // Update asteroid positions with difficulty scaling
      newAsteroids = newAsteroids.map(asteroid => {
        const newY = asteroid.y + gameSpeed;
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
          setGameOver(true);
          // Play collision sound
          if (collisionSoundRef.current) {
            collisionSoundRef.current.currentTime = 0;
            collisionSoundRef.current.play().catch(() => {
              // Ignore errors if sound can't play
            });
          }
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

      // Update star positions with difficulty scaling
      newStars = newStars.map(star => {
        const newY = star.y + gameSpeed;
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
        // Play collect star sound
        if (collectStarSoundRef.current) {
          collectStarSoundRef.current.currentTime = 0;
          collectStarSoundRef.current.play().catch(() => {
            // Ignore errors if sound can't play
          });
        }
      }

      return newStars;
    });
  });

  return (
    <pixiContainer>
      {/* Background Stars */}
      {backgroundStars.map((star, index) => (
        <pixiGraphics
          key={`bg-star-${index}`}
          draw={(g) => {
            g.clear();
            g.circle(star.x, star.y, star.size);
            g.fill({ color: 0xFFFFFF, alpha: star.alpha });
          }}
        />
      ))}

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

      {/* High Score Display */}
      <pixiText
        text={`High Score: ${highScore}`}
        x={gameSize.width / 2}
        y={100}
        anchor={{ x: 0.5, y: 0.5 }}
        style={{
          fontFamily: 'Arial',
          fontSize: 32,
          fontWeight: 'bold',
          fill: '#00ffff',
          dropShadow: {
            alpha: 0.6,
            angle: 45,
            blur: 3,
            color: '#000000',
            distance: 3,
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
        alpha={gameOver ? 0.5 : 1}
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

      {/* Game Over Overlay */}
      {gameOver && (
        <>
          {/* Semi-transparent background */}
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.rect(0, 0, gameSize.width, gameSize.height);
              g.fill({ color: 0x000000, alpha: 0.7 });
            }}
          />
          
          {/* Game Over Text */}
          <pixiText
            text="GAME OVER"
            x={gameSize.width / 2}
            y={gameSize.height / 2 - 100}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{
              fontFamily: 'Arial',
              fontSize: 72,
              fontWeight: 'bold',
              fill: '#ff0000',
              dropShadow: {
                alpha: 0.8,
                angle: 45,
                blur: 6,
                color: '#000000',
                distance: 8,
              },
            }}
          />

          {/* Final Score */}
          <pixiText
            text={`Final Score: ${score}`}
            x={gameSize.width / 2}
            y={gameSize.height / 2}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{
              fontFamily: 'Arial',
              fontSize: 48,
              fontWeight: 'bold',
              fill: '#ffffff',
              dropShadow: {
                alpha: 0.8,
                angle: 45,
                blur: 4,
                color: '#000000',
                distance: 5,
              },
            }}
          />

          {/* Restart Instructions */}
          <pixiText
            text="Click anywhere to restart"
            x={gameSize.width / 2}
            y={gameSize.height / 2 + 80}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{
              fontFamily: 'Arial',
              fontSize: 36,
              fontWeight: 'normal',
              fill: '#00ff00',
              dropShadow: {
                alpha: 0.6,
                angle: 45,
                blur: 3,
                color: '#000000',
                distance: 4,
              },
            }}
            eventMode="static"
            cursor="pointer"
            onPointerDown={resetGame}
          />
        </>
      )}
    </pixiContainer>
  );
}
