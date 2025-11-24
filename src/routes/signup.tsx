import { useState } from 'react';
import { Button, Container, Stack, Title, TextInput, Text, Alert } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { startRegistration } from '@simplewebauthn/browser';
import { trpcClient } from '~/utils/trpc';

export const Route = createFileRoute('/signup')({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Request registration options from server
      const { options, userId } = await trpcClient.auth.generateRegistrationOptions.mutate({
        username,
        email: email || undefined,
      });

      // Start WebAuthn registration
      const registrationResponse = await startRegistration(options);

      // Verify registration with server
      await trpcClient.auth.verifyRegistration.mutate({
        userId,
        response: registrationResponse,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate({ to: '/signin' });
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
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
      <Container size="xs">
        <Stack gap="xl">
          <Title order={1} size="h1" style={{ color: 'white', textAlign: 'center' }}>
            Sign Up
          </Title>

          <form onSubmit={handleSignup}>
            <Stack
              gap="md"
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              {success ? (
                <Alert color="green" title="Success!">
                  Account created successfully! Redirecting to sign in...
                </Alert>
              ) : (
                <>
                  <TextInput
                    label="Username"
                    placeholder="Enter your username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    size="lg"
                  />

                  <TextInput
                    label="Email (optional)"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    size="lg"
                  />

                  {error && (
                    <Alert color="red" title="Error">
                      {error}
                    </Alert>
                  )}

                  <Text size="sm" c="dimmed">
                    You'll use a passkey to sign in. Make sure your device supports passkeys (Face ID,
                    Touch ID, Windows Hello, or security keys).
                  </Text>

                  <Button type="submit" size="lg" loading={loading} fullWidth>
                    Create Account with Passkey
                  </Button>

                  <Button
                    variant="subtle"
                    size="md"
                    onClick={() => navigate({ to: '/signin' })}
                    disabled={loading}
                  >
                    Already have an account? Sign In
                  </Button>

                  <Button
                    variant="subtle"
                    size="md"
                    onClick={() => navigate({ to: '/' })}
                    disabled={loading}
                  >
                    Back to Home
                  </Button>
                </>
              )}
            </Stack>
          </form>
        </Stack>
      </Container>
    </div>
  );
}
