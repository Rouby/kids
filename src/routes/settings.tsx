import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Container, Title, Text, Button, Group, Paper, Avatar, Stack } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { useTRPC } from '../utils/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    ...trpc.auth.logout.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.auth.me.queryKey() });
      navigate({ to: '/' });
    },
  });

  if (isLoading) {
    return <Container>Loading...</Container>;
  }

  if (!user) {
    return (
      <Container mt="xl">
        <Paper p="xl" radius="md" withBorder>
          <Text ta="center">You are not logged in.</Text>
          <Group justify="center" mt="md">
            <Button onClick={() => navigate({ to: '/signin' })}>Sign In</Button>
          </Group>
        </Paper>
      </Container>
    );
  }

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
        <Paper radius="xl" p="xl" withBorder shadow="xl">
          <Stack align="center" gap="lg">
            <Avatar size={120} radius={120} color="blue" variant="filled">
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            
            <Stack gap={0} align="center">
              <Title order={2}>{user.username}</Title>
              <Text c="dimmed">{user.email || 'Keine E-Mail angegeben'}</Text>
            </Stack>
            
            <Group w="100%" grow>
              <Button 
                variant="default" 
                onClick={() => navigate({ to: '/' })}
                size="md"
              >
                Zurück
              </Button>
              <Button 
                color="red" 
                variant="light" 
                onClick={() => logoutMutation.mutate()}
                loading={logoutMutation.isPending}
                size="md"
              >
                Abmelden
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
