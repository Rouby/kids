import { useEffect, useRef, useState } from 'react';
import { Application, extend, useTick } from '@pixi/react';
import { Container, Sprite, Texture, Assets, Text, Graphics } from 'pixi.js';
import { useTRPC } from '../utils/trpc';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Register PixiJS components for use in JSX
extend({ Container, Sprite, Text, Graphics });

// Helper function to play audio
function playSound(audioRef: React.MutableRefObject<HTMLAudioElement | null>) {
  if (audioRef.current) {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Ignore errors if sound can't play (e.g., autoplay restrictions)
    });
  }
}

// Helper function for circle-based collision detection
function checkCircleCollision(
  x1: number,
  y1: number,
  radius1: number,
  x2: number,
  y2: number,
  radius2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = radius1 + radius2;
  return distanceSquared < radiusSum * radiusSum;
}

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
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [gameSize, setGameSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [localHighScore, setLocalHighScore] = useState(() => {
    const saved = localStorage.getItem('asteroidsHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const rocketXRef = useRef(window.innerWidth / 2);
  const collectStarSoundRef = useRef<HTMLAudioElement | null>(null);
  const collisionSoundRef = useRef<HTMLAudioElement | null>(null);

  // Fetch server-side high score for logged-in users
  const { data: serverHighScore } = useQuery({
    ...trpc.game.getHighScore.queryOptions({ game: 'asteroids' }),
    refetchOnWindowFocus: false,
  });

  // Fetch leaderboard (top 5 scores)
  const { data: leaderboard } = useQuery({
    ...trpc.game.getLeaderboard.queryOptions({ game: 'asteroids', limit: 5 }),
    refetchOnWindowFocus: false,
  });

  // Submit score mutation
  const submitScoreMutation = useMutation({
    ...trpc.game.submitScore.mutationOptions(),
    onSuccess: () => {
      // Invalidate queries to refetch leaderboard and high score
      queryClient.invalidateQueries({ queryKey: [['game', 'getLeaderboard']] });
      queryClient.invalidateQueries({ queryKey: [['game', 'getHighScore']] });
    },
  });

  // Use server high score if available, otherwise fall back to local storage
  const highScore = serverHighScore?.score ?? localHighScore;

  const updateHighScore = (score: number) => {
    // Only update if the new score is higher than the current high score
    if (score > highScore) {
      setLocalHighScore(score);
      localStorage.setItem('asteroidsHighScore', score.toString());
      // Also submit to server (will only save if user is logged in)
      submitScoreMutation.mutate({ game: 'asteroids', score });
    }
  };

  // Load textures and sounds
  useEffect(() => {
    const loadTextures = async () => {
      await Assets.load(['/spaceship.svg', '/asteroid.svg', '/star.svg']);
      setTexturesLoaded(true);
    };
    loadTextures();

    // Load sound effects
    collectStarSoundRef.current = new Audio('/collect-star.mp3');
    collectStarSoundRef.current.preload = 'auto';
    collisionSoundRef.current = new Audio('/collision.mp3');
    collisionSoundRef.current.preload = 'auto';
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
          updateHighScore={updateHighScore}
          collectStarSoundRef={collectStarSoundRef}
          collisionSoundRef={collisionSoundRef}
          leaderboard={leaderboard || []}
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
  updateHighScore: (score: number) => void;
  collectStarSoundRef: React.MutableRefObject<HTMLAudioElement | null>;
  collisionSoundRef: React.MutableRefObject<HTMLAudioElement | null>;
  leaderboard: Array<{ id: number; score: number; username: string; createdAt: Date }>;
}

function GameScene({
  gameSize,
  rocketXRef,
  gameOver,
  setGameOver,
  highScore,
  updateHighScore,
  collectStarSoundRef,
  collisionSoundRef,
  leaderboard,
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
      updateHighScore(score);
    }
  }, [score, highScore, updateHighScore]);

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
    
    // Pre-calculate rocket collision properties to avoid duplication
    const rocketRadius = Math.min(rocketWidth, rocketHeight) / 2;
    const rocketCenterX = rocketX + rocketWidth / 2;
    const rocketCenterY = rocketY + rocketHeight / 2;

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

      // Check asteroid collisions (using circle-based collision detection)
      newAsteroids.forEach(asteroid => {
        const asteroidSize = 80;
        const asteroidRadius = asteroidSize / 2;
        const asteroidCenterX = asteroid.x + asteroidRadius;
        const asteroidCenterY = asteroid.y + asteroidRadius;
        
        if (checkCircleCollision(
          rocketCenterX, rocketCenterY, rocketRadius,
          asteroidCenterX, asteroidCenterY, asteroidRadius
        )) {
          setGameOver(true);
          // Play collision sound
          playSound(collisionSoundRef);
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

      // Check star collisions (using circle-based collision detection)
      const collectedStarIds: string[] = [];
      newStars.forEach(star => {
        const starSize = 40;
        const starRadius = starSize / 2;
        const starCenterX = star.x + starRadius;
        const starCenterY = star.y + starRadius;
        
        if (checkCircleCollision(
          rocketCenterX, rocketCenterY, rocketRadius,
          starCenterX, starCenterY, starRadius
        )) {
          collectedStarIds.push(star.id);
          setScore(prev => prev + 1);
        }
      });

      if (collectedStarIds.length > 0) {
        newStars = newStars.filter(star => !collectedStarIds.includes(star.id));
        // Play collect star sound
        playSound(collectStarSoundRef);
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

      {/* Leaderboard Display */}
      {leaderboard.length > 0 && (
        <>
          <pixiText
            text="TOP 5"
            x={gameSize.width - 20}
            y={50}
            anchor={{ x: 1, y: 0.5 }}
            style={{
              fontFamily: 'Arial',
              fontSize: 28,
              fontWeight: 'bold',
              fill: '#ffa500',
              dropShadow: {
                alpha: 0.6,
                angle: 45,
                blur: 3,
                color: '#000000',
                distance: 3,
              },
            }}
          />
          {leaderboard.map((entry, index) => (
            <pixiText
              key={entry.id}
              text={`${index + 1}. ${entry.username}: ${entry.score}`}
              x={gameSize.width - 20}
              y={90 + index * 35}
              anchor={{ x: 1, y: 0.5 }}
              style={{
                fontFamily: 'Arial',
                fontSize: 20,
                fontWeight: 'normal',
                fill: '#ffffff',
                dropShadow: {
                  alpha: 0.5,
                  angle: 45,
                  blur: 2,
                  color: '#000000',
                  distance: 2,
                },
              }}
            />
          ))}
        </>
      )}

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
