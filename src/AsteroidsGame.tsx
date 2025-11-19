import { randomId } from '@mantine/hooks';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { RefObject, createRef, useEffect, useState } from 'react';

export function AsteroidsGame() {
  const [score, setScore] = useState(0);

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

      <div
        style={{
          position: 'absolute',
          top: '5vh',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 40,
          color: 'yellow',
        }}
      >
        {score}
      </div>

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
        background: 'yellow',
        x,
        y,
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
    />
  );
}
