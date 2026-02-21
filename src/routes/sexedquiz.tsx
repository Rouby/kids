import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { SexEdQuizGame } from '~/components/SexEdQuizGame';

export const Route = createFileRoute('/sexedquiz')({
  component: SexEdQuizRoute,
});

function SexEdQuizRoute() {
  return (
    <>
      <SexEdQuizGame />
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
