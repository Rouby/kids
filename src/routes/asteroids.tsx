import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AsteroidsGame } from '~/components/AsteroidsGame';

export const Route = createFileRoute('/asteroids')({
  component: AsteroidsRoute,
});

function AsteroidsRoute() {
  return (
    <>
      <AsteroidsGame />
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
        ← Back to Dashboard
      </Button>
    </>
  );
}
