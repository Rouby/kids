import { useState } from 'react';
import { Button, Container, Stack, Title, TextInput, Alert } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { startAuthentication } from '@simplewebauthn/browser';
import { trpcClient } from '~/utils/trpc';

export const Route = createFileRoute('/signin')({
  component: SigninPage,
});

function SigninPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Request authentication options from server
      const { options, userId } = await trpcClient.auth.generateAuthenticationOptions.mutate({
        username,
      });

      // Start WebAuthn authentication
      const authenticationResponse = await startAuthentication(options);

      // Verify authentication with server
      const { verified, user } = await trpcClient.auth.verifyAuthentication.mutate({
        userId,
        response: authenticationResponse,
      });

      if (verified) {
        // Store user info in localStorage
        // Note: For production, consider using secure session management
        // with HTTP-only cookies or a proper session store
        localStorage.setItem('currentUser', JSON.stringify(user));
        navigate({ to: '/' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
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
            Anmelden
          </Title>

          <form onSubmit={handleSignin}>
            <Stack
              gap="md"
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <TextInput
                label="Benutzername"
                placeholder="Gib deinen Benutzernamen ein"
                required
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                size="lg"
              />

              {error && (
                <Alert color="red" title="Fehler">
                  {error}
                </Alert>
              )}

              <Button type="submit" size="lg" loading={loading} fullWidth>
                Mit Passkey anmelden
              </Button>

              <Button
                variant="subtle"
                size="md"
                onClick={() => navigate({ to: '/signup' })}
                disabled={loading}
              >
                Noch kein Konto? Registrieren
              </Button>

              <Button
                variant="subtle"
                size="md"
                onClick={() => navigate({ to: '/' })}
                disabled={loading}
              >
                Zurück zur Startseite
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </div>
  );
}
