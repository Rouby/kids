import { Button } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { MakeupArtistGame } from '~/components/MakeupArtistGame';

export const Route = createFileRoute('/makeup')({
  component: MakeupRoute,
});

function MakeupRoute() {
  return (
    <>
      <MakeupArtistGame />
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
