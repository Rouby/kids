import { Button, Container, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePoints } from '../hooks/usePoints';

// German states (Bundesländer) and their capitals
const GERMAN_STATES = [
  { state: 'Baden-Württemberg', capital: 'Stuttgart' },
  { state: 'Bayern', capital: 'München' },
  { state: 'Berlin', capital: 'Berlin' },
  { state: 'Brandenburg', capital: 'Potsdam' },
  { state: 'Bremen', capital: 'Bremen' },
  { state: 'Hamburg', capital: 'Hamburg' },
  { state: 'Hessen', capital: 'Wiesbaden' },
  { state: 'Mecklenburg-Vorpommern', capital: 'Schwerin' },
  { state: 'Niedersachsen', capital: 'Hannover' },
  { state: 'Nordrhein-Westfalen', capital: 'Düsseldorf' },
  { state: 'Rheinland-Pfalz', capital: 'Mainz' },
  { state: 'Saarland', capital: 'Saarbrücken' },
  { state: 'Sachsen', capital: 'Dresden' },
  { state: 'Sachsen-Anhalt', capital: 'Magdeburg' },
  { state: 'Schleswig-Holstein', capital: 'Kiel' },
  { state: 'Thüringen', capital: 'Erfurt' },
];

type GameMode = 'menu' | 'capitalToState' | 'stateToCapital' | 'results';

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
}

export function GermanStatesGame() {
  const { points, addPoints } = usePoints();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const generateQuestions = (mode: 'capitalToState' | 'stateToCapital') => {
    // Shuffle states array
    const shuffled = [...GERMAN_STATES].sort(() => Math.random() - 0.5);
    const numQuestions = 10; // 10 questions per game

    return shuffled.slice(0, numQuestions).map((item) => {
      const isCapitalToState = mode === 'capitalToState';
      const question = isCapitalToState
        ? `Welches Bundesland hat ${item.capital} als Hauptstadt?`
        : `Was ist die Hauptstadt von ${item.state}?`;
      
      const correctAnswer = isCapitalToState ? item.state : item.capital;
      
      // Generate wrong answers
      const wrongAnswers = GERMAN_STATES
        .filter((s) => s.state !== item.state)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => (isCapitalToState ? s.state : s.capital));
      
      // Shuffle options
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return { question, correctAnswer, options };
    });
  };

  const startGame = (mode: 'capitalToState' | 'stateToCapital') => {
    setGameMode(mode);
    setQuestions(generateQuestions(mode));
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
    setPointsEarned(0);
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return; // Prevent multiple clicks
    
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
      // Award points: 10 base + streak bonus (max 5)
      const earnedPoints = 10 + Math.min(newStreak - 1, 5);
      setPointsEarned(prev => prev + earnedPoints);
      addPoints(earnedPoints);
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
                🇩🇪 Deutsche Bundesländer Quiz
              </Title>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Text size="xl" style={{ color: 'white', textAlign: 'center' }}>
                Lerne die 16 Bundesländer und ihre Hauptstädte!
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
                  color="teal"
                  onClick={() => startGame('stateToCapital')}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🏛️ Hauptstadt finden
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Finde die Hauptstadt des Bundeslandes
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
                  color="violet"
                  onClick={() => startGame('capitalToState')}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  🗺️ Bundesland finden
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Finde das Bundesland zur Hauptstadt
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
                  <Paper p="md" style={{ background: 'rgba(255,255,255,0.9)', marginTop: '2rem' }}>
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

                  {pointsEarned > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.5, type: 'spring', bounce: 0.5 }}
                    >
                      <Text size="lg" ta="center" c="teal" fw={600}>
                        💎 +{pointsEarned} Punkte verdient!
                        {points !== null && (
                          <Text size="sm" c="dimmed">
                            (Gesamt: {points} Punkte)
                          </Text>
                        )}
                      </Text>
                    </motion.div>
                  )}

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
                    {question.question}
                  </Title>
                </motion.div>

                {/* Answer options */}
                <Stack gap="md">
                  {question.options.map((option, index) => (
                    <motion.div
                      key={option}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
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
                          fontSize: '1.3rem',
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
