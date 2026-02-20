import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { HaydnMusicGame } from '~/components/HaydnMusicGame';

export const Route = createFileRoute('/haydn')({
  component: HaydnRoute,
});

function HaydnRoute() {
  return (
    <>
      <HaydnMusicGame />
      <Button
        component={Link}
        to="/"
        size="lg"
        variant="filled"
        color="grape"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        ← Zurück zum Dashboard
      </Button>
    </>
  );
}
