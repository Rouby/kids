import { Button, Container, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

type GameMode = 'menu' | 'readAnalog' | 'setAnalog' | 'results';

interface QuizQuestion {
  hours: number;
  minutes: number;
  options?: string[];
  correctAnswer?: string;
}

// SVG Clock Component
interface AnalogClockProps {
  hours: number;
  minutes: number;
  size?: number;
}

function AnalogClock({ hours, minutes, size = 300 }: AnalogClockProps) {
  // Convert to 12-hour format for display
  const displayHours = hours % 12;
  
  // Calculate angles (0 degrees is at 12 o'clock, clockwise)
  const minuteAngle = (minutes / 60) * 360;
  const hourAngle = ((displayHours + minutes / 60) / 12) * 360;
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  // Hour hand length and width
  const hourHandLength = radius * 0.5;
  const hourHandWidth = 8;
  
  // Minute hand length and width
  const minuteHandLength = radius * 0.75;
  const minuteHandWidth = 6;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Clock face */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="white"
        stroke="#333"
        strokeWidth="4"
      />
      
      {/* Hour markers */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x1 = centerX + radius * 0.85 * Math.cos(rad);
        const y1 = centerY + radius * 0.85 * Math.sin(rad);
        const x2 = centerX + radius * 0.95 * Math.cos(rad);
        const y2 = centerY + radius * 0.95 * Math.sin(rad);
        
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#333"
            strokeWidth="3"
          />
        );
      })}
      
      {/* Hour numbers */}
      {[...Array(12)].map((_, i) => {
        const hour = i === 0 ? 12 : i;
        const angle = (i / 12) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radius * 0.7 * Math.cos(rad);
        const y = centerY + radius * 0.7 * Math.sin(rad);
        
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.08}
            fontWeight="bold"
            fill="#333"
          >
            {hour}
          </text>
        );
      })}
      
      {/* Hour hand */}
      <motion.line
        x1={centerX}
        y1={centerY}
        x2={centerX}
        y2={centerY - hourHandLength}
        stroke="#333"
        strokeWidth={hourHandWidth}
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: hourAngle }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      />
      
      {/* Minute hand */}
      <motion.line
        x1={centerX}
        y1={centerY}
        x2={centerX}
        y2={centerY - minuteHandLength}
        stroke="#1c7ed6"
        strokeWidth={minuteHandWidth}
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: minuteAngle }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      />
      
      {/* Center dot */}
      <circle cx={centerX} cy={centerY} r={10} fill="#333" />
    </svg>
  );
}

// Format time in German style (24-hour format)
function formatTimeGerman(hours: number, minutes: number): string {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} Uhr`;
}

export function ClockLearningGame() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const generateQuestions = (): QuizQuestion[] => {
    const numQuestions = 10;
    const questionsList: QuizQuestion[] = [];
    
    for (let i = 0; i < numQuestions; i++) {
      // Generate random time
      const hours = Math.floor(Math.random() * 24);
      const minuteOptions = [0, 15, 30, 45];
      const minutes = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
      
      // Generate correct answer
      const correctAnswer = formatTimeGerman(hours, minutes);
      
      // Generate wrong answers
      const wrongAnswers: string[] = [];
      while (wrongAnswers.length < 3) {
        const wrongHours = Math.floor(Math.random() * 24);
        const wrongMinutes = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
        const wrongAnswer = formatTimeGerman(wrongHours, wrongMinutes);
        
        if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
          wrongAnswers.push(wrongAnswer);
        }
      }
      
      // Shuffle options
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      questionsList.push({
        hours,
        minutes,
        options,
        correctAnswer,
      });
    }
    
    return questionsList;
  };

  const startGame = (mode: 'readAnalog') => {
    setGameMode(mode);
    setQuestions(generateQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameMode('results');
    }
  };

  const getButtonColor = (option: string) => {
    if (!showFeedback) return 'blue';
    if (option === questions[currentQuestion].correctAnswer) return 'green';
    if (option === selectedAnswer) return 'red';
    return 'gray';
  };

  const getEmoji = (percentage: number) => {
    if (percentage >= 90) return '🌟';
    if (percentage >= 70) return '😊';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  // Menu screen
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center' }}>
                🕐 Uhr Lernen
              </Title>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Text size="xl" style={{ color: 'white', textAlign: 'center' }}>
                Lerne die Uhr zu lesen und verstehe die Zeit!
              </Text>
            </motion.div>

            {/* Example clock */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', bounce: 0.4 }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <AnalogClock hours={9} minutes={15} size={250} />
              </Paper>
            </motion.div>

            <Stack gap="md" style={{ width: '100%', maxWidth: 500, marginTop: '1rem' }}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="xl"
                  variant="filled"
                  color="teal"
                  onClick={() => startGame('readAnalog')}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🕐 Uhr ablesen
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Lese die Uhrzeit ab und wähle die richtige Zeit
                  </Text>
                </Button>
              </motion.div>
            </Stack>

            <AnimatePresence>
              {bestStreak > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 1.1, type: 'spring', bounce: 0.5 }}
                >
                  <Paper p="md" style={{ background: 'rgba(255,255,255,0.9)', marginTop: '1rem' }}>
                    <Text size="lg" fw={700} ta="center">
                      🔥 Beste Serie: {bestStreak} richtige Antworten!
                    </Text>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Container>
      </motion.div>
    );
  }

  // Results screen
  if (gameMode === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = getEmoji(percentage);

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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              style={{ fontSize: '8rem' }}
            >
              {emoji}
            </motion.div>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center' }}>
                Super gemacht!
              </Title>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{ width: '100%' }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)', width: '100%' }}>
                <Stack gap="lg">
                  <div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <Text size="xl" ta="center" fw={700}>
                        Dein Ergebnis
                      </Text>
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.0, type: 'spring', bounce: 0.5 }}
                    >
                      <Text size="4rem" ta="center" fw={900} c="blue">
                        {score} / {questions.length}
                      </Text>
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: 'spring', bounce: 0.5 }}
                    >
                      <Text size="2rem" ta="center" fw={700} c="grape">
                        {percentage}%
                      </Text>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {bestStreak > 0 && (
                      <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.4, type: 'spring' }}
                      >
                        <Text size="lg" ta="center" c="orange" fw={600}>
                          🔥 Beste Serie: {bestStreak} richtig!
                        </Text>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <Stack gap="sm" mt="md">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          variant="filled"
                          color="green"
                          onClick={() => setGameMode('menu')}
                          style={{ fontSize: '1.2rem', width: '100%' }}
                        >
                          ✨ Nochmal spielen
                        </Button>
                      </motion.div>
                    </Stack>
                  </motion.div>
                </Stack>
              </Paper>
            </motion.div>
          </Stack>
        </Container>
      </motion.div>
    );
  }

  // Quiz mode
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container size="md">
        <Stack gap="lg">
          {/* Progress bar */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper p="sm" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Group justify="apart" mb="xs">
                <Text size="sm" fw={600}>
                  Frage {currentQuestion + 1} von {questions.length}
                </Text>
                <Text size="sm" fw={600} c="blue">
                  Punkte: {score}
                </Text>
              </Group>
              <Progress value={progress} size="lg" color="teal" />
              <AnimatePresence>
                {streak > 1 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.6 }}
                  >
                    <Text size="sm" c="orange" fw={700} ta="center" mt="xs">
                      🔥 Serie: {streak} richtig!
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>
            </Paper>
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
            >
              <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Title order={2} ta="center" mb="xl" style={{ fontSize: '1.8rem', color: '#333' }}>
                    Wie spät ist es?
                  </Title>
                </motion.div>

                {/* Analog Clock Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', bounce: 0.3 }}
                  style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}
                >
                  <AnalogClock hours={question.hours} minutes={question.minutes} size={280} />
                </motion.div>

                {/* Answer options */}
                <Stack gap="md">
                  {question.options!.map((option, index) => (
                    <motion.div
                      key={option}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: showFeedback ? 1 : 1.03 }}
                      whileTap={{ scale: showFeedback ? 1 : 0.97 }}
                    >
                      <Button
                        size="xl"
                        variant="filled"
                        color={getButtonColor(option)}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        style={{
                          fontSize: '1.5rem',
                          height: 'auto',
                          minHeight: 70,
                          padding: '15px',
                          whiteSpace: 'normal',
                          width: '100%',
                        }}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </Stack>

                {/* Feedback */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
                    >
                      <Stack gap="md" mt="xl">
                        {selectedAnswer === question.correctAnswer ? (
                          <motion.div
                            initial={{ rotate: -5 }}
                            animate={{ rotate: 0 }}
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
                          >
                            <Paper p="md" style={{ background: '#d4edda', border: '2px solid #28a745' }}>
                              <Text size="xl" ta="center" fw={700} c="green">
                                ✅ Richtig! Super! 🎉
                              </Text>
                            </Paper>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ x: -10 }}
                            animate={{ x: [0, -10, 10, -10, 10, 0] }}
                            transition={{ duration: 0.4 }}
                          >
                            <Paper p="md" style={{ background: '#f8d7da', border: '2px solid #dc3545' }}>
                              <Text size="lg" ta="center" fw={700} c="red">
                                ❌ Nicht ganz richtig!
                              </Text>
                              <Text size="md" ta="center" mt="xs">
                                Die richtige Antwort ist: <strong>{question.correctAnswer}</strong>
                              </Text>
                            </Paper>
                          </motion.div>
                        )}

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="lg"
                            variant="filled"
                            color="violet"
                            onClick={nextQuestion}
                            style={{ fontSize: '1.2rem', width: '100%' }}
                          >
                            {currentQuestion < questions.length - 1 ? 'Nächste Frage →' : 'Ergebnis anzeigen 🎯'}
                          </Button>
                        </motion.div>
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Paper>
            </motion.div>
          </AnimatePresence>
        </Stack>
      </Container>
    </motion.div>
  );
}
