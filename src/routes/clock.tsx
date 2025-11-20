import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ClockLearningGame } from '~/components/ClockLearningGame';

export const Route = createFileRoute('/clock')({
  component: ClockRoute,
});

function ClockRoute() {
  return (
    <>
      <ClockLearningGame />
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
