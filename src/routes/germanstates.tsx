import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { GermanStatesGame } from '~/components/GermanStatesGame';

export const Route = createFileRoute('/germanstates')({
  component: GermanStatesRoute,
});

function GermanStatesRoute() {
  return (
    <>
      <GermanStatesGame />
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
