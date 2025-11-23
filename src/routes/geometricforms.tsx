import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { GeometricFormsGame } from '~/components/GeometricFormsGame';

export const Route = createFileRoute('/geometricforms')({
  component: GeometricFormsRoute,
});

function GeometricFormsRoute() {
  return (
    <>
      <GeometricFormsGame />
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
