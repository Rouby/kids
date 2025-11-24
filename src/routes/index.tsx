import { Button, Container, Stack, Title, Group, Text } from '@mantine/core';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

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
            {currentUser && (
              <Group gap="sm">
                <Text size="lg" style={{ color: 'white' }}>
                  Welcome, {currentUser.username}!
                </Text>
                <Button variant="light" color="white" size="xs" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </Group>
            )}
          </Stack>

          {!currentUser && (
            <Group gap="md">
              <Button
                component={Link}
                to="/signin"
                size="lg"
                variant="white"
                color="violet"
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/signup"
                size="lg"
                variant="filled"
                color="violet"
              >
                Sign Up
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
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
