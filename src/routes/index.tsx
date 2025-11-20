import { Button, Container, Stack, Title } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container size="sm">
        <Stack gap="xl" align="center">
          <Title order={1} size="h1" style={{ color: 'white', fontSize: '3rem' }}>
            Kids App Dashboard
          </Title>

          <Stack gap="md" style={{ width: '100%', maxWidth: 400 }}>
            <Button
              component={Link}
              to="/asteroids"
              size="xl"
              variant="filled"
              color="blue"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🚀 Asteroids
            </Button>

            <Button
              component={Link}
              to="/germanstates"
              size="xl"
              variant="filled"
              color="teal"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🇩🇪 Deutsche Bundesländer
            </Button>

            <Button
              component={Link}
              to="/clock"
              size="xl"
              variant="filled"
              color="orange"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🕐 Uhr Lernen
            </Button>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
