import { Button } from '@mantine/core';
import { useState } from 'react';
import { AsteroidsGame } from './AsteroidsGame';
import { Dashboard } from './Dashboard';

export function App() {
  const [currentApp, setCurrentApp] = useState<string | null>(null);

  const handleBackToDashboard = () => {
    setCurrentApp(null);
  };

  return (
    <>
      {currentApp === null && <Dashboard onSelectApp={setCurrentApp} />}
      {currentApp === 'asteroids' && (
        <>
          <AsteroidsGame />
          <Button
            size="lg"
            variant="filled"
            color="grape"
            onClick={handleBackToDashboard}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 1000,
            }}
          >
            ← Back to Dashboard
          </Button>
        </>
      )}
    </>
  );
}
