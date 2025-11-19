import { Button, Container, Stack, Title } from '@mantine/core';

interface DashboardProps {
  onSelectApp: (appName: string) => void;
}

export function Dashboard({ onSelectApp }: DashboardProps) {
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
              size="xl"
              variant="filled"
              color="blue"
              onClick={() => onSelectApp('asteroids')}
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🚀 Asteroids
            </Button>

            <Button
              size="xl"
              variant="filled"
              color="teal"
              onClick={() => onSelectApp('germanstates')}
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🇩🇪 Deutsche Bundesländer
            </Button>

            {/* Placeholder for future apps */}
            <Button
              size="xl"
              variant="light"
              color="gray"
              disabled
              style={{ fontSize: '1.5rem', height: 80 }}
            >
              🎮 More Games Coming Soon...
            </Button>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
