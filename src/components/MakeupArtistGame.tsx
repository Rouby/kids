import { Button, Container, Group, Paper, Stack, Text, Title, ColorSwatch, Slider } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { usePoints } from '../hooks/usePoints';

// Makeup tool types
type MakeupToolType = 'lipstick' | 'eyeshadow' | 'blush' | 'eyeliner' | 'mascara' | 'foundation';

interface MakeupState {
  lipstick: { color: string; intensity: number };
  eyeshadow: { color: string; intensity: number };
  blush: { color: string; intensity: number };
  eyeliner: { color: string; intensity: number };
  mascara: { intensity: number };
  foundation: { color: string; intensity: number };
}

// Color palettes for each tool
const TOOL_COLORS: Record<MakeupToolType, string[]> = {
  lipstick: ['#FF6B6B', '#E91E63', '#FF4081', '#F44336', '#D32F2F', '#C62828', '#8E24AA', '#7B1FA2'],
  eyeshadow: ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#8BC34A', '#FFEB3B', '#FF9800', '#795548'],
  blush: ['#FFCDD2', '#F8BBD9', '#FCE4EC', '#FFAB91', '#FFCCBC', '#D7CCC8'],
  eyeliner: ['#212121', '#424242', '#5D4037', '#1565C0', '#6A1B9A', '#2E7D32'],
  mascara: ['#212121'], // Only intensity matters for mascara
  foundation: ['#FFDBAC', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#5C4033'],
};

const TOOL_ICONS: Record<MakeupToolType, string> = {
  lipstick: '💄',
  eyeshadow: '🎨',
  blush: '🌸',
  eyeliner: '✏️',
  mascara: '🖌️',
  foundation: '🧴',
};

const TOOL_NAMES: Record<MakeupToolType, string> = {
  lipstick: 'Lippenstift',
  eyeshadow: 'Lidschatten',
  blush: 'Rouge',
  eyeliner: 'Eyeliner',
  mascara: 'Wimperntusche',
  foundation: 'Grundierung',
};

// Avatar SVG component
function Avatar({ makeup }: { makeup: MakeupState }) {
  return (
    <svg viewBox="0 0 200 280" width="200" height="280" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
      {/* Foundation/Skin base */}
      <ellipse 
        cx="100" 
        cy="120" 
        rx="70" 
        ry="90" 
        fill={makeup.foundation.intensity > 0 ? makeup.foundation.color : '#FFDBAC'}
        opacity={makeup.foundation.intensity > 0 ? 0.3 + (makeup.foundation.intensity / 100) * 0.7 : 1}
      />
      
      {/* Blush - left cheek */}
      <ellipse 
        cx="55" 
        cy="140" 
        rx="20" 
        ry="12" 
        fill={makeup.blush.color}
        opacity={makeup.blush.intensity / 100 * 0.6}
      />
      
      {/* Blush - right cheek */}
      <ellipse 
        cx="145" 
        cy="140" 
        rx="20" 
        ry="12" 
        fill={makeup.blush.color}
        opacity={makeup.blush.intensity / 100 * 0.6}
      />

      {/* Hair background */}
      <ellipse cx="100" cy="50" rx="65" ry="45" fill="#5D4037" />
      <rect x="35" y="50" width="130" height="50" fill="#5D4037" rx="10" />
      
      {/* Ears */}
      <ellipse cx="30" cy="120" rx="10" ry="15" fill="#FFDBAC" />
      <ellipse cx="170" cy="120" rx="10" ry="15" fill="#FFDBAC" />
      
      {/* Face outline */}
      <ellipse cx="100" cy="120" rx="70" ry="90" fill="none" stroke="#D4A574" strokeWidth="2" />
      
      {/* Eyebrows */}
      <path d="M55 80 Q70 72 85 80" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M115 80 Q130 72 145 80" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Eye whites */}
      <ellipse cx="70" cy="100" rx="18" ry="12" fill="white" />
      <ellipse cx="130" cy="100" rx="18" ry="12" fill="white" />
      
      {/* Eye shadow - left */}
      <ellipse 
        cx="70" 
        cy="92" 
        rx="20" 
        ry="10" 
        fill={makeup.eyeshadow.color}
        opacity={makeup.eyeshadow.intensity / 100 * 0.7}
      />
      
      {/* Eye shadow - right */}
      <ellipse 
        cx="130" 
        cy="92" 
        rx="20" 
        ry="10" 
        fill={makeup.eyeshadow.color}
        opacity={makeup.eyeshadow.intensity / 100 * 0.7}
      />
      
      {/* Irises */}
      <circle cx="70" cy="100" r="8" fill="#6B4423" />
      <circle cx="130" cy="100" r="8" fill="#6B4423" />
      
      {/* Pupils */}
      <circle cx="70" cy="100" r="4" fill="#212121" />
      <circle cx="130" cy="100" r="4" fill="#212121" />
      
      {/* Eye highlights */}
      <circle cx="72" cy="98" r="2" fill="white" />
      <circle cx="132" cy="98" r="2" fill="white" />
      
      {/* Eyeliner - left */}
      <path 
        d="M52 100 Q70 112 88 100" 
        stroke={makeup.eyeliner.color}
        strokeWidth={makeup.eyeliner.intensity > 0 ? 1 + (makeup.eyeliner.intensity / 100) * 2 : 0}
        fill="none"
        strokeLinecap="round"
        opacity={makeup.eyeliner.intensity / 100}
      />
      
      {/* Eyeliner - right */}
      <path 
        d="M112 100 Q130 112 148 100" 
        stroke={makeup.eyeliner.color}
        strokeWidth={makeup.eyeliner.intensity > 0 ? 1 + (makeup.eyeliner.intensity / 100) * 2 : 0}
        fill="none"
        strokeLinecap="round"
        opacity={makeup.eyeliner.intensity / 100}
      />
      
      {/* Eyelashes/Mascara - left */}
      {makeup.mascara.intensity > 0 && (
        <>
          <line x1="55" y1="93" x2="52" y2="86" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="62" y1="90" x2="60" y2="83" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="70" y1="88" x2="70" y2="81" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="78" y1="90" x2="80" y2="83" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="85" y1="93" x2="88" y2="86" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
        </>
      )}
      
      {/* Eyelashes/Mascara - right */}
      {makeup.mascara.intensity > 0 && (
        <>
          <line x1="115" y1="93" x2="112" y2="86" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="122" y1="90" x2="120" y2="83" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="130" y1="88" x2="130" y2="81" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="138" y1="90" x2="140" y2="83" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
          <line x1="145" y1="93" x2="148" y2="86" stroke="#212121" strokeWidth={1 + makeup.mascara.intensity / 50} strokeLinecap="round" />
        </>
      )}
      
      {/* Nose */}
      <path d="M100 105 L95 135 Q100 140 105 135 L100 105" fill="none" stroke="#D4A574" strokeWidth="1.5" />
      
      {/* Lips */}
      <path 
        d="M80 165 Q90 160 100 165 Q110 160 120 165" 
        fill="none" 
        stroke={makeup.lipstick.intensity > 0 ? makeup.lipstick.color : '#E57373'}
        strokeWidth="2"
        opacity={makeup.lipstick.intensity > 0 ? 0.8 : 0.6}
      />
      <path 
        d="M80 165 Q100 180 120 165" 
        fill={makeup.lipstick.intensity > 0 ? makeup.lipstick.color : '#E57373'}
        opacity={makeup.lipstick.intensity > 0 ? 0.3 + (makeup.lipstick.intensity / 100) * 0.7 : 0.4}
      />
      
      {/* Neck */}
      <rect x="80" y="200" width="40" height="80" fill="#FFDBAC" />
    </svg>
  );
}

type GameMode = 'menu' | 'freeplay' | 'challenge' | 'results';

interface Challenge {
  name: string;
  description: string;
  target: Partial<MakeupState>;
  points: number;
}

const CHALLENGES: Challenge[] = [
  {
    name: 'Natürlicher Look',
    description: 'Erstelle einen natürlichen, dezenten Look mit leichtem Blush und natürlichen Lippen.',
    target: {
      blush: { color: '#FFCDD2', intensity: 30 },
      lipstick: { color: '#FF6B6B', intensity: 40 },
    },
    points: 50,
  },
  {
    name: 'Abend-Glamour',
    description: 'Ein glamouröser Abendlook mit dunklem Lidschatten und roten Lippen.',
    target: {
      eyeshadow: { color: '#673AB7', intensity: 70 },
      lipstick: { color: '#C62828', intensity: 80 },
      mascara: { intensity: 80 },
    },
    points: 75,
  },
  {
    name: 'Sommerfrisch',
    description: 'Ein leichter Sommerlook mit rosigen Wangen und dezenten Farben.',
    target: {
      blush: { color: '#FFAB91', intensity: 50 },
      lipstick: { color: '#F44336', intensity: 50 },
      eyeshadow: { color: '#00BCD4', intensity: 30 },
    },
    points: 60,
  },
];

const initialMakeupState: MakeupState = {
  lipstick: { color: '#FF6B6B', intensity: 0 },
  eyeshadow: { color: '#9C27B0', intensity: 0 },
  blush: { color: '#FFCDD2', intensity: 0 },
  eyeliner: { color: '#212121', intensity: 0 },
  mascara: { intensity: 0 },
  foundation: { color: '#FFDBAC', intensity: 0 },
};

export function MakeupArtistGame() {
  const { points, addPoints } = usePoints();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [selectedTool, setSelectedTool] = useState<MakeupToolType>('lipstick');
  const [makeup, setMakeup] = useState<MakeupState>(initialMakeupState);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [score, setScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<number>(0);

  const resetMakeup = useCallback(() => {
    setMakeup(initialMakeupState);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setMakeup(prev => ({
      ...prev,
      [selectedTool]: { ...prev[selectedTool], color },
    }));
  }, [selectedTool]);

  const handleIntensityChange = useCallback((intensity: number) => {
    setMakeup(prev => ({
      ...prev,
      [selectedTool]: { ...prev[selectedTool], intensity },
    }));
  }, [selectedTool]);

  const startFreePlay = () => {
    setGameMode('freeplay');
    resetMakeup();
  };

  const startChallenge = () => {
    setGameMode('challenge');
    resetMakeup();
    setCurrentChallenge(CHALLENGES[completedChallenges % CHALLENGES.length]);
  };

  const checkChallenge = () => {
    if (!currentChallenge) return;

    let earnedPoints = 0;
    const target = currentChallenge.target;

    // Simple scoring based on how close the makeup is to the target
    Object.entries(target).forEach(([tool, targetValue]) => {
      const currentValue = makeup[tool as MakeupToolType];
      if (targetValue && currentValue) {
        const intensityDiff = Math.abs((targetValue.intensity ?? 0) - (currentValue.intensity ?? 0));
        if (intensityDiff < 20) {
          earnedPoints += currentChallenge.points / Object.keys(target).length;
        } else if (intensityDiff < 40) {
          earnedPoints += (currentChallenge.points / Object.keys(target).length) * 0.5;
        }
      }
    });

    const roundedPoints = Math.round(earnedPoints);
    setScore(prev => prev + roundedPoints);
    addPoints(roundedPoints);
    setCompletedChallenges(prev => prev + 1);
    setGameMode('results');
  };

  const tools: MakeupToolType[] = ['lipstick', 'eyeshadow', 'blush', 'eyeliner', 'mascara', 'foundation'];

  if (gameMode === 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Container size="md">
          <Stack gap="xl" align="center">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                💄 Make-up Artist Studio
              </Title>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Text size="xl" style={{ color: 'white', textAlign: 'center', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                Werde der beste Make-up Artist!
              </Text>
            </motion.div>

            <Stack gap="md" style={{ width: '100%', maxWidth: 500, marginTop: '2rem' }}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="xl"
                  variant="filled"
                  color="pink"
                  onClick={startFreePlay}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🎨 Freies Spielen
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Kreiere deinen eigenen Look
                  </Text>
                </Button>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="xl"
                  variant="filled"
                  color="grape"
                  onClick={startChallenge}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🏆 Herausforderung
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Erfülle Make-up Aufträge
                  </Text>
                </Button>
              </motion.div>
            </Stack>

            {points !== null && points > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1, type: 'spring', bounce: 0.5 }}
              >
                <Paper p="md" style={{ background: 'rgba(255,255,255,0.9)', marginTop: '2rem' }}>
                  <Text size="lg" fw={700} ta="center">
                    💎 Deine Punkte: {points}
                  </Text>
                </Paper>
              </motion.div>
            )}
          </Stack>
        </Container>
      </motion.div>
    );
  }

  if (gameMode === 'results') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Container size="sm">
          <Stack gap="xl" align="center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6, duration: 0.8 }}
              style={{ fontSize: '6rem' }}
            >
              🌟
            </motion.div>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                Toll gemacht!
              </Title>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <Stack gap="lg" align="center">
                  <Avatar makeup={makeup} />
                  
                  <Text size="xl" fw={700} ta="center">
                    Dein Look ist fertig!
                  </Text>
                  
                  {currentChallenge && (
                    <Text size="lg" c="pink" fw={600} ta="center">
                      💎 +{score} Punkte verdient!
                    </Text>
                  )}

                  <Group mt="md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="filled"
                        color="pink"
                        onClick={() => setGameMode('menu')}
                      >
                        ✨ Zurück zum Menü
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="filled"
                        color="grape"
                        onClick={startChallenge}
                      >
                        🏆 Nächste Herausforderung
                      </Button>
                    </motion.div>
                  </Group>
                </Stack>
              </Paper>
            </motion.div>
          </Stack>
        </Container>
      </motion.div>
    );
  }

  // Freeplay or Challenge mode
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '80px',
      }}
    >
      <Container size="lg" style={{ height: '100%' }}>
        <Stack gap="md" style={{ height: '100%' }}>
          {/* Challenge info */}
          {gameMode === 'challenge' && currentChallenge && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Paper p="md" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="lg" fw={700} c="grape">
                      🏆 {currentChallenge.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {currentChallenge.description}
                    </Text>
                  </div>
                  <Text size="lg" fw={700} c="pink">
                    {currentChallenge.points} Punkte möglich
                  </Text>
                </Group>
              </Paper>
            </motion.div>
          )}

          {/* Main content */}
          <Group align="flex-start" justify="center" gap="xl" style={{ flex: 1 }}>
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px' }}>
                <Stack align="center" gap="md">
                  <Text size="lg" fw={700}>Dein Model</Text>
                  <Avatar makeup={makeup} />
                </Stack>
              </Paper>
            </motion.div>

            {/* Tools panel */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <Paper p="lg" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', minWidth: 320 }}>
                <Stack gap="lg">
                  <Text size="lg" fw={700} ta="center">🎨 Werkzeuge</Text>
                  
                  {/* Tool selection */}
                  <Group gap="xs" justify="center">
                    {tools.map((tool) => (
                      <motion.div key={tool} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant={selectedTool === tool ? 'filled' : 'light'}
                          color="pink"
                          onClick={() => setSelectedTool(tool)}
                          style={{ 
                            width: 50, 
                            height: 50, 
                            padding: 0,
                            fontSize: '1.5rem',
                          }}
                          title={TOOL_NAMES[tool]}
                        >
                          {TOOL_ICONS[tool]}
                        </Button>
                      </motion.div>
                    ))}
                  </Group>

                  <Text size="md" fw={600} ta="center" c="grape">
                    {TOOL_ICONS[selectedTool]} {TOOL_NAMES[selectedTool]}
                  </Text>

                  {/* Color selection */}
                  {selectedTool !== 'mascara' && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">Farbe wählen:</Text>
                      <Group gap="xs" justify="center">
                        {TOOL_COLORS[selectedTool].map((color) => (
                          <motion.div key={color} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <ColorSwatch
                              color={color}
                              onClick={() => handleColorChange(color)}
                              style={{ 
                                cursor: 'pointer',
                                border: makeup[selectedTool].color === color ? '3px solid #E91E63' : '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              }}
                            />
                          </motion.div>
                        ))}
                      </Group>
                    </div>
                  )}

                  {/* Intensity slider */}
                  <div>
                    <Text size="sm" fw={500} mb="xs">Intensität:</Text>
                    <Slider
                      value={makeup[selectedTool].intensity}
                      onChange={handleIntensityChange}
                      min={0}
                      max={100}
                      color="pink"
                      marks={[
                        { value: 0, label: '0' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' },
                      ]}
                    />
                  </div>

                  {/* Action buttons */}
                  <Group justify="center" mt="md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="light"
                        color="gray"
                        onClick={resetMakeup}
                      >
                        🔄 Neu starten
                      </Button>
                    </motion.div>
                    
                    {gameMode === 'challenge' ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="filled"
                          color="grape"
                          onClick={checkChallenge}
                        >
                          ✅ Abgeben
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="filled"
                          color="pink"
                          onClick={() => setGameMode('results')}
                        >
                          ✨ Fertig
                        </Button>
                      </motion.div>
                    )}
                  </Group>
                </Stack>
              </Paper>
            </motion.div>
          </Group>
        </Stack>
      </Container>
    </motion.div>
  );
}
