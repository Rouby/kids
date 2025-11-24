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
    <Container size="sm" mt="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack align="center" gap="md">
          <Avatar size={120} radius={120} color="blue">
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Title order={2}>{user.username}</Title>
          <Text c="dimmed">{user.email || 'No email provided'}</Text>
          
          <Button 
            color="red" 
            variant="light" 
            onClick={() => logoutMutation.mutate()}
            loading={logoutMutation.isPending}
            mt="xl"
          >
            Logout
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
