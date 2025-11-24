import { useState } from 'react';
import { Button, Container, Stack, Title, TextInput, Text, Alert } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { startRegistration } from '@simplewebauthn/browser';
import { useTRPCClient } from '~/utils/trpc';

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
  const trpcClient = useTRPCClient();

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
      const message = err instanceof Error ? err.message : 'Registrierung fehlgeschlagen. Bitte versuche es erneut.';
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
            Registrieren
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
                <Alert color="green" title="Erfolg!">
                  Konto erfolgreich erstellt! Weiterleitung zur Anmeldung...
                </Alert>
              ) : (
                <>
                  <TextInput
                    label="Benutzername"
                    placeholder="Gib deinen Benutzernamen ein"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    size="lg"
                  />

                  <TextInput
                    label="E-Mail (optional)"
                    placeholder="Gib deine E-Mail ein"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    size="lg"
                  />

                  {error && (
                    <Alert color="red" title="Fehler">
                      {error}
                    </Alert>
                  )}

                  <Text size="sm" c="dimmed">
                    Du wirst einen Passkey zum Anmelden verwenden. Stelle sicher, dass dein Gerät
                    Passkeys unterstützt (Face ID, Touch ID, Windows Hello oder Sicherheitsschlüssel).
                  </Text>

                  <Button type="submit" size="lg" loading={loading} fullWidth>
                    Konto mit Passkey erstellen
                  </Button>

                  <Button
                    variant="subtle"
                    size="md"
                    onClick={() => navigate({ to: '/signin' })}
                    disabled={loading}
                  >
                    Bereits ein Konto? Anmelden
                  </Button>

                  <Button
                    variant="subtle"
                    size="md"
                    onClick={() => navigate({ to: '/' })}
                    disabled={loading}
                  >
                    Zurück zur Startseite
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
