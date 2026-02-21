import { Button, Container, Stack, Title, Group, Text, Badge } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { usePoints } from '../hooks/usePoints';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { points } = usePoints();

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
          <Stack gap="sm" align="center">
            <Title order={1} size="h1" style={{ color: 'white', fontSize: '3rem' }}>
              Kids App Dashboard
            </Title>
            {user && (
              <Stack gap="xs" align="center">
                <Group gap="sm">
                  <Text size="lg" style={{ color: 'white' }}>
                    Willkommen, {user.username}!
                  </Text>
                  <Button component={Link} to="/settings" variant="light" color="white" size="xs">
                    Einstellungen
                  </Button>
                </Group>
                {points !== null && (
                  <Badge size="xl" variant="filled" color="yellow" style={{ fontSize: '1rem' }}>
                    💎 {points} Punkte
                  </Badge>
                )}
              </Stack>
            )}
          </Stack>

          {!user && (
            <Group gap="md">
              <Button
                component={Link}
                to="/signin"
                size="lg"
                variant="white"
                color="violet"
              >
                Anmelden
              </Button>
              <Button
                component={Link}
                to="/signup"
                size="lg"
                variant="filled"
                color="violet"
              >
                Registrieren
              </Button>
            </Group>
          )}

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

            <Button
              component={Link}
              to="/geometricforms"
              size="xl"
              variant="filled"
              color="pink"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🔷 Geometrische Formen
            </Button>

            <Button
              component={Link}
              to="/makeup"
              size="xl"
              variant="filled"
              color="grape"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              💄 Make-up Artist
            </Button>

            <Button
              component={Link}
              to="/haydn"
              size="xl"
              variant="filled"
              color="indigo"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🎼 Joseph Haydn &amp; Orchester
            </Button>

            <Button
              component={Link}
              to="/sexedquiz"
              size="xl"
              variant="filled"
              color="pink"
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🌸 Körper &amp; Gefühle
            </Button>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
