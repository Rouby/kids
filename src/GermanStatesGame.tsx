import { Button, Container, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';

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
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

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
          padding: '20px',
        }}
      >
        <Container size="md">
          <Stack gap="xl" align="center">
            <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center' }}>
              🇩🇪 Deutsche Bundesländer Quiz
            </Title>
            <Text size="xl" style={{ color: 'white', textAlign: 'center' }}>
              Lerne die 16 Bundesländer und ihre Hauptstädte!
            </Text>

            <Stack gap="md" style={{ width: '100%', maxWidth: 500, marginTop: '2rem' }}>
              <Button
                size="xl"
                variant="filled"
                color="teal"
                onClick={() => startGame('stateToCapital')}
                style={{ fontSize: '1.3rem', height: 100 }}
              >
                🏛️ Hauptstadt finden
                <br />
                <Text size="sm" style={{ opacity: 0.9 }}>
                  Finde die Hauptstadt des Bundeslandes
                </Text>
              </Button>

              <Button
                size="xl"
                variant="filled"
                color="violet"
                onClick={() => startGame('capitalToState')}
                style={{ fontSize: '1.3rem', height: 100 }}
              >
                🗺️ Bundesland finden
                <br />
                <Text size="sm" style={{ opacity: 0.9 }}>
                  Finde das Bundesland zur Hauptstadt
                </Text>
              </Button>
            </Stack>

            {bestStreak > 0 && (
              <Paper p="md" style={{ background: 'rgba(255,255,255,0.9)', marginTop: '2rem' }}>
                <Text size="lg" fw={700} ta="center">
                  🔥 Beste Serie: {bestStreak} richtige Antworten!
                </Text>
              </Paper>
            )}
          </Stack>
        </Container>
      </div>
    );
  }

  if (gameMode === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = getEmoji(percentage);

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
          padding: '20px',
        }}
      >
        <Container size="sm">
          <Stack gap="xl" align="center">
            <div style={{ fontSize: '8rem' }}>{emoji}</div>
            
            <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center' }}>
              Super gemacht!
            </Title>

            <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)', width: '100%' }}>
              <Stack gap="lg">
                <div>
                  <Text size="xl" ta="center" fw={700}>
                    Dein Ergebnis
                  </Text>
                  <Text size="4rem" ta="center" fw={900} c="blue">
                    {score} / {questions.length}
                  </Text>
                  <Text size="2rem" ta="center" fw={700} c="grape">
                    {percentage}%
                  </Text>
                </div>

                {bestStreak > 0 && (
                  <Text size="lg" ta="center" c="orange" fw={600}>
                    🔥 Beste Serie: {bestStreak} richtig!
                  </Text>
                )}

                <Stack gap="sm" mt="md">
                  <Button
                    size="lg"
                    variant="filled"
                    color="green"
                    onClick={() => setGameMode('menu')}
                    style={{ fontSize: '1.2rem' }}
                  >
                    ✨ Nochmal spielen
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </div>
    );
  }

  // Quiz mode
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
        padding: '20px',
      }}
    >
      <Container size="md">
        <Stack gap="lg">
          {/* Progress bar */}
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
            {streak > 1 && (
              <Text size="sm" c="orange" fw={700} ta="center" mt="xs">
                🔥 Serie: {streak} richtig!
              </Text>
            )}
          </Paper>

          {/* Question */}
          <Paper p="xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <Title order={2} ta="center" mb="xl" style={{ fontSize: '1.8rem', color: '#333' }}>
              {question.question}
            </Title>

            {/* Answer options */}
            <Stack gap="md">
              {question.options.map((option, index) => (
                <Button
                  key={index}
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
                  }}
                >
                  {option}
                </Button>
              ))}
            </Stack>

            {/* Feedback */}
            {showFeedback && (
              <Stack gap="md" mt="xl">
                {selectedAnswer === question.correctAnswer ? (
                  <Paper p="md" style={{ background: '#d4edda', border: '2px solid #28a745' }}>
                    <Text size="xl" ta="center" fw={700} c="green">
                      ✅ Richtig! Super! 🎉
                    </Text>
                  </Paper>
                ) : (
                  <Paper p="md" style={{ background: '#f8d7da', border: '2px solid #dc3545' }}>
                    <Text size="lg" ta="center" fw={700} c="red">
                      ❌ Nicht ganz richtig!
                    </Text>
                    <Text size="md" ta="center" mt="xs">
                      Die richtige Antwort ist: <strong>{question.correctAnswer}</strong>
                    </Text>
                  </Paper>
                )}

                <Button
                  size="lg"
                  variant="filled"
                  color="violet"
                  onClick={nextQuestion}
                  style={{ fontSize: '1.2rem' }}
                >
                  {currentQuestion < questions.length - 1 ? 'Nächste Frage →' : 'Ergebnis anzeigen 🎯'}
                </Button>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}
