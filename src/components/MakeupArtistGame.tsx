import { Button, Container, Group, Paper, Stack, Text, Title, ColorSwatch, Slider } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { usePoints } from '../hooks/usePoints';

// Makeup tool types
type MakeupToolType = 'lipstick' | 'eyeshadow' | 'blush' | 'eyeliner' | 'mascara' | 'foundation';

// Brush stroke for painting
interface BrushStroke {
  x: number;
  y: number;
  color: string;
  size: number;
  tool: MakeupToolType;
}

// Color palettes for each tool
const TOOL_COLORS: Record<MakeupToolType, string[]> = {
  lipstick: ['#D32F2F', '#C2185B', '#E91E63', '#FF4081', '#FF6B6B', '#AD1457', '#880E4F', '#B71C1C'],
  eyeshadow: ['#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#00796B', '#388E3C', '#F57C00', '#5D4037', '#E91E63', '#00BCD4'],
  blush: ['#FFCDD2', '#F8BBD9', '#FCE4EC', '#FFAB91', '#FFCCBC', '#E1BEE7'],
  eyeliner: ['#212121', '#3E2723', '#1A237E', '#4A148C', '#006064', '#1B5E20'],
  mascara: ['#212121', '#3E2723', '#000000'],
  foundation: ['#FDEBD0', '#F5CBA7', '#E8BEAC', '#D4A574', '#C68642', '#8D5524'],
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

// Brush sizes for each tool
const TOOL_BRUSH_SIZES: Record<MakeupToolType, number> = {
  lipstick: 8,
  eyeshadow: 15,
  blush: 25,
  eyeliner: 3,
  mascara: 4,
  foundation: 30,
};

// Realistic Avatar component with painting canvas
interface AvatarProps {
  brushStrokes: BrushStroke[];
  onPaint: (x: number, y: number) => void;
  isPainting: boolean;
  setIsPainting: (painting: boolean) => void;
}

function Avatar({ brushStrokes, onPaint, isPainting, setIsPainting }: AvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const getMousePosition = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 400 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };
  
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPainting(true);
    const pos = getMousePosition(e);
    if (pos) onPaint(pos.x, pos.y);
  };
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPainting) return;
    const pos = getMousePosition(e);
    if (pos) onPaint(pos.x, pos.y);
  };
  
  const handleMouseUp = () => {
    setIsPainting(false);
  };

  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 300 400" 
      width="300" 
      height="400" 
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
        cursor: 'crosshair',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        {/* Skin gradient for realistic look */}
        <radialGradient id="skinGradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE4C4" />
          <stop offset="50%" stopColor="#FFDAB9" />
          <stop offset="100%" stopColor="#DEB887" />
        </radialGradient>
        
        {/* Lip gradient */}
        <linearGradient id="lipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8A0A0" />
          <stop offset="50%" stopColor="#D88888" />
          <stop offset="100%" stopColor="#C87070" />
        </linearGradient>
        
        {/* Hair gradient */}
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A3728" />
          <stop offset="50%" stopColor="#3D2B1F" />
          <stop offset="100%" stopColor="#2C1810" />
        </linearGradient>
        
        {/* Eye shadow gradient */}
        <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        
        {/* Nose shadow */}
        <linearGradient id="noseShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.05)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </linearGradient>
        
        {/* Clip path for face area */}
        <clipPath id="faceClip">
          <ellipse cx="150" cy="180" rx="95" ry="120" />
        </clipPath>
      </defs>
      
      {/* Background/Neck */}
      <rect x="115" y="290" width="70" height="110" fill="url(#skinGradient)" />
      <ellipse cx="150" cy="295" rx="35" ry="15" fill="url(#skinGradient)" />
      
      {/* Neck shadow */}
      <ellipse cx="150" cy="300" rx="30" ry="10" fill="rgba(0,0,0,0.05)" />
      
      {/* Hair back */}
      <ellipse cx="150" cy="100" rx="100" ry="80" fill="url(#hairGradient)" />
      
      {/* Face base with realistic shape */}
      <ellipse cx="150" cy="180" rx="95" ry="120" fill="url(#skinGradient)" />
      
      {/* Jawline definition */}
      <path 
        d="M55 180 Q70 280 150 310 Q230 280 245 180" 
        fill="none" 
        stroke="rgba(180,140,100,0.3)" 
        strokeWidth="2"
      />
      
      {/* Ears */}
      <ellipse cx="55" cy="180" rx="12" ry="25" fill="url(#skinGradient)" />
      <ellipse cx="55" cy="180" rx="8" ry="18" fill="rgba(200,160,120,0.3)" />
      <ellipse cx="245" cy="180" rx="12" ry="25" fill="url(#skinGradient)" />
      <ellipse cx="245" cy="180" rx="8" ry="18" fill="rgba(200,160,120,0.3)" />
      
      {/* Hair front/bangs */}
      <path 
        d="M60 130 Q80 60 150 50 Q220 60 240 130 Q220 100 150 95 Q80 100 60 130" 
        fill="url(#hairGradient)"
      />
      <path 
        d="M65 140 Q85 80 150 70 Q215 80 235 140 Q200 110 150 105 Q100 110 65 140" 
        fill="url(#hairGradient)"
      />
      
      {/* Forehead highlight */}
      <ellipse cx="150" cy="120" rx="50" ry="25" fill="rgba(255,255,255,0.1)" />
      
      {/* Brush strokes layer - clipped to face */}
      <g clipPath="url(#faceClip)">
        {brushStrokes.map((stroke, index) => (
          <circle
            key={index}
            cx={stroke.x}
            cy={stroke.y}
            r={stroke.size}
            fill={stroke.color}
            opacity={stroke.tool === 'foundation' ? 0.15 : stroke.tool === 'blush' ? 0.25 : 0.5}
            style={{ mixBlendMode: 'multiply' }}
          />
        ))}
      </g>
      
      {/* Eyebrows - more natural shape */}
      <path 
        d="M95 145 Q105 138 120 140 Q130 142 135 145" 
        stroke="#3D2B1F" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M165 145 Q175 142 185 140 Q195 138 205 145" 
        stroke="#3D2B1F" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Eye sockets shadow */}
      <ellipse cx="115" cy="175" rx="28" ry="18" fill="rgba(0,0,0,0.03)" />
      <ellipse cx="185" cy="175" rx="28" ry="18" fill="rgba(0,0,0,0.03)" />
      
      {/* Eyes - more detailed */}
      {/* Left eye */}
      <ellipse cx="115" cy="175" rx="22" ry="14" fill="white" />
      <ellipse cx="115" cy="175" rx="22" ry="14" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <circle cx="115" cy="176" r="11" fill="#6B4423" />
      <circle cx="115" cy="176" r="6" fill="#2C1810" />
      <circle cx="118" cy="173" r="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="112" cy="178" r="1.5" fill="rgba(255,255,255,0.4)" />
      
      {/* Right eye */}
      <ellipse cx="185" cy="175" rx="22" ry="14" fill="white" />
      <ellipse cx="185" cy="175" rx="22" ry="14" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
      <circle cx="185" cy="176" r="11" fill="#6B4423" />
      <circle cx="185" cy="176" r="6" fill="#2C1810" />
      <circle cx="188" cy="173" r="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="182" cy="178" r="1.5" fill="rgba(255,255,255,0.4)" />
      
      {/* Upper eyelids */}
      <path 
        d="M93 175 Q115 162 137 175" 
        stroke="rgba(60,40,20,0.4)" 
        strokeWidth="1.5" 
        fill="none"
      />
      <path 
        d="M163 175 Q185 162 207 175" 
        stroke="rgba(60,40,20,0.4)" 
        strokeWidth="1.5" 
        fill="none"
      />
      
      {/* Lower eyelids */}
      <path 
        d="M93 178 Q115 188 137 178" 
        stroke="rgba(60,40,20,0.2)" 
        strokeWidth="1" 
        fill="none"
      />
      <path 
        d="M163 178 Q185 188 207 178" 
        stroke="rgba(60,40,20,0.2)" 
        strokeWidth="1" 
        fill="none"
      />
      
      {/* Eyelashes */}
      <path d="M93 172 L90 167" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 168 L98 162" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M108 165 L107 159" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M115 164 L115 158" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M122 165 L123 159" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M130 168 L132 162" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M137 172 L140 167" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      
      <path d="M163 172 L160 167" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M170 168 L168 162" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M178 165 L177 159" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M185 164 L185 158" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M192 165 L193 159" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M200 168 L202 162" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      <path d="M207 172 L210 167" stroke="#2C1810" strokeWidth="1" strokeLinecap="round" />
      
      {/* Nose - more realistic */}
      <path 
        d="M150 155 L150 210" 
        stroke="url(#noseShadow)" 
        strokeWidth="15" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M150 150 Q145 180 142 210 Q150 218 158 210 Q155 180 150 150" 
        fill="none" 
        stroke="rgba(180,140,100,0.3)" 
        strokeWidth="1.5"
      />
      {/* Nose tip highlight */}
      <ellipse cx="150" cy="212" rx="8" ry="5" fill="rgba(255,255,255,0.15)" />
      {/* Nostrils */}
      <ellipse cx="142" cy="215" rx="5" ry="3" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="158" cy="215" rx="5" ry="3" fill="rgba(0,0,0,0.08)" />
      
      {/* Natural cheek color */}
      <ellipse cx="85" cy="210" rx="25" ry="15" fill="rgba(255,180,180,0.15)" />
      <ellipse cx="215" cy="210" rx="25" ry="15" fill="rgba(255,180,180,0.15)" />
      
      {/* Lips - more realistic shape */}
      {/* Upper lip */}
      <path 
        d="M120 255 Q130 248 150 252 Q170 248 180 255 Q165 252 150 255 Q135 252 120 255" 
        fill="url(#lipGradient)"
      />
      {/* Cupid's bow */}
      <path 
        d="M140 252 Q145 248 150 250 Q155 248 160 252" 
        fill="url(#lipGradient)"
      />
      {/* Lower lip */}
      <path 
        d="M120 255 Q130 258 150 270 Q170 258 180 255 Q165 258 150 255 Q135 258 120 255" 
        fill="url(#lipGradient)"
      />
      {/* Lip line */}
      <path 
        d="M120 255 Q150 260 180 255" 
        stroke="rgba(150,80,80,0.4)" 
        strokeWidth="0.5" 
        fill="none"
      />
      {/* Lower lip highlight */}
      <ellipse cx="150" cy="262" rx="15" ry="5" fill="rgba(255,255,255,0.2)" />
      
      {/* Chin definition */}
      <ellipse cx="150" cy="295" rx="25" ry="8" fill="rgba(255,255,255,0.08)" />
      
      {/* Philtrum (groove between nose and lips) */}
      <path 
        d="M147 220 Q150 240 147 250" 
        stroke="rgba(180,140,100,0.15)" 
        strokeWidth="2" 
        fill="none"
      />
      <path 
        d="M153 220 Q150 240 153 250" 
        stroke="rgba(180,140,100,0.15)" 
        strokeWidth="2" 
        fill="none"
      />
    </svg>
  );
}

type GameMode = 'menu' | 'freeplay' | 'challenge' | 'results';

interface Challenge {
  name: string;
  description: string;
  hint: string;
  points: number;
}

const CHALLENGES: Challenge[] = [
  {
    name: 'Natürlicher Look',
    description: 'Erstelle einen natürlichen, dezenten Look.',
    hint: 'Verwende dezentes Rouge auf den Wangen und einen natürlichen Lippenstift.',
    points: 50,
  },
  {
    name: 'Abend-Glamour',
    description: 'Ein glamouröser Abendlook für besondere Anlässe.',
    hint: 'Dunkler Lidschatten, dramatische Wimpern und rote Lippen!',
    points: 75,
  },
  {
    name: 'Sommerfrisch',
    description: 'Ein leichter, frischer Sommerlook.',
    hint: 'Rosige Wangen und ein frischer, leichter Lidschatten.',
    points: 60,
  },
];

export function MakeupArtistGame() {
  const { points, addPoints } = usePoints();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [selectedTool, setSelectedTool] = useState<MakeupToolType>('lipstick');
  const [selectedColor, setSelectedColor] = useState<string>(TOOL_COLORS.lipstick[0]);
  const [brushSize, setBrushSize] = useState<number>(TOOL_BRUSH_SIZES.lipstick);
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const [isPainting, setIsPainting] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const resetMakeup = useCallback(() => {
    setBrushStrokes([]);
  }, []);

  const handleToolChange = useCallback((tool: MakeupToolType) => {
    setSelectedTool(tool);
    setSelectedColor(TOOL_COLORS[tool][0]);
    setBrushSize(TOOL_BRUSH_SIZES[tool]);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const handlePaint = useCallback((x: number, y: number) => {
    setBrushStrokes(prev => [...prev, {
      x,
      y,
      color: selectedColor,
      size: brushSize,
      tool: selectedTool,
    }]);
  }, [selectedColor, brushSize, selectedTool]);

  const startFreePlay = () => {
    setGameMode('freeplay');
    resetMakeup();
  };

  const startChallenge = () => {
    setGameMode('challenge');
    resetMakeup();
    setCurrentChallenge(CHALLENGES[completedChallenges % CHALLENGES.length]);
  };

  const finishLook = () => {
    if (currentChallenge && brushStrokes.length > 0) {
      // Improved scoring algorithm that considers variety and coverage
      const toolsUsed = new Set(brushStrokes.map(s => s.tool)).size;
      const uniquePositions = new Set(brushStrokes.map(s => `${Math.round(s.x/20)}-${Math.round(s.y/20)}`)).size;
      
      // Base points for using multiple tools (variety bonus)
      const varietyBonus = Math.min(toolsUsed * 10, 30);
      
      // Coverage bonus based on unique areas painted (max 40 points)
      const coverageBonus = Math.min(uniquePositions * 2, 40);
      
      // Base participation points
      const participationPoints = 5;
      
      // Total points (capped at challenge max)
      const totalPoints = Math.min(participationPoints + varietyBonus + coverageBonus, currentChallenge.points);
      
      setEarnedPoints(totalPoints);
      addPoints(totalPoints);
      setCompletedChallenges(prev => prev + 1);
    } else {
      setEarnedPoints(0);
    }
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
                  <Avatar 
                    brushStrokes={brushStrokes} 
                    onPaint={() => {}} 
                    isPainting={false} 
                    setIsPainting={() => {}}
                  />
                  
                  <Text size="xl" fw={700} ta="center">
                    Dein Look ist fertig!
                  </Text>
                  
                  {currentChallenge && earnedPoints > 0 && (
                    <Text size="lg" c="pink" fw={600} ta="center">
                      💎 +{earnedPoints} Punkte verdient!
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
                    <Text size="xs" c="pink" mt={4}>
                      💡 {currentChallenge.hint}
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
            {/* Avatar with painting */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px' }}>
                <Stack align="center" gap="md">
                  <Text size="lg" fw={700}>Male auf das Gesicht! 🎨</Text>
                  <Text size="xs" c="dimmed">Klicke und ziehe um Make-up aufzutragen</Text>
                  <Avatar 
                    brushStrokes={brushStrokes}
                    onPaint={handlePaint}
                    isPainting={isPainting}
                    setIsPainting={setIsPainting}
                  />
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
                          onClick={() => handleToolChange(tool)}
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
                              border: selectedColor === color ? '3px solid #E91E63' : '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          />
                        </motion.div>
                      ))}
                    </Group>
                  </div>

                  {/* Brush size slider */}
                  <div>
                    <Text size="sm" fw={500} mb="xs">Pinselgröße:</Text>
                    <Slider
                      value={brushSize}
                      onChange={setBrushSize}
                      min={2}
                      max={40}
                      color="pink"
                      marks={[
                        { value: 5, label: 'Klein' },
                        { value: 20, label: 'Mittel' },
                        { value: 35, label: 'Groß' },
                      ]}
                    />
                  </div>

                  {/* Brush preview */}
                  <Group justify="center">
                    <div style={{ 
                      width: brushSize * 2, 
                      height: brushSize * 2, 
                      borderRadius: '50%', 
                      backgroundColor: selectedColor,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }} />
                  </Group>

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
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="filled"
                        color="pink"
                        onClick={finishLook}
                      >
                        ✨ Fertig
                      </Button>
                    </motion.div>
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
