import { Button, Container, Group, Paper, Progress, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { usePoints } from '../hooks/usePoints';

type GameMode = 'menu' | 'info' | 'quiz' | 'results';

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
}

const INFO_SECTIONS = [
  {
    emoji: '🎼',
    title: 'Joseph Haydn',
    color: '#e3f2fd',
    borderColor: '#1565c0',
    facts: [
      'Geburtsdatum: 31. März 1732 in Rohrau, Österreich',
      'Todesdatum: 31. Mai 1809 in Wien',
      'Er wird oft "Vater der Symphonie" und "Vater des Streichquartetts" genannt',
      'Komponierte 104 Symphonien, 83 Streichquartette, 45 Klaviersonaten',
      'Berühmteste Werke: "Die Schöpfung", "Die Jahreszeiten", Symphonie Nr. 94 "Mit dem Paukenschlag"',
      'Er arbeitete 30 Jahre für die Fürsten Esterházy in Ungarn',
      'Haydn und Mozart waren enge Freunde. Er war auch der Lehrer von Beethoven.',
    ],
  },
  {
    emoji: '🎻',
    title: 'Das Orchester',
    color: '#f3e5f5',
    borderColor: '#6a1b9a',
    facts: [
      'Ein Orchester ist eine große Gruppe von Musikern',
      'Ein Sinfonieorchester hat etwa 60–100 Musiker',
      'Es gibt 4 Hauptgruppen: Streicher, Holzbläser, Blechbläser und Schlagwerk',
      'Der Dirigent leitet das Orchester mit einem Taktstock',
      'Das größte Instrument im Orchester ist der Kontrabass',
      'Das kleinste ist die Piccoloflöte',
      'Haydn hat die Form des klassischen Orchesters mitgeprägt',
    ],
  },
  {
    emoji: '🎻',
    title: 'Streichinstrumente',
    color: '#e8f5e9',
    borderColor: '#2e7d32',
    facts: [
      'Violine (Geige): höchste Lage, kleinstes Streichinstrument',
      'Viola (Bratsche): etwas größer als die Geige, tieferer Klang',
      'Violoncello (Cello): zwischen den Knien gespielt',
      'Kontrabass: größtes und tiefstes Streichinstrument',
      'Sie werden mit einem Bogen gestrichen oder gezupft (Pizzicato)',
      'Die Streicher sind die größte Gruppe im Orchester',
    ],
  },
  {
    emoji: '🎵',
    title: 'Holzbläser',
    color: '#fff8e1',
    borderColor: '#f57f17',
    facts: [
      'Flöte: aus Metall, obwohl "Holz" im Namen',
      'Oboe: hat ein Doppelrohrblatt',
      'Klarinette: hat ein einfaches Rohrblatt',
      'Fagott: das tiefste Holzblasinstrument, sehr lang',
      'Piccolo: kleinste Flöte, sehr hoher Ton',
    ],
  },
  {
    emoji: '🎺',
    title: 'Blechbläser',
    color: '#fce4ec',
    borderColor: '#c62828',
    facts: [
      'Trompete: heller, strahlender Klang',
      'Horn (Waldhorn): rundes Instrument, warmer Klang',
      'Posaune: hat einen Zug zum Tonverändern',
      'Tuba: größtes und tiefstes Blechblasinstrument',
    ],
  },
  {
    emoji: '🥁',
    title: 'Schlagwerk',
    color: '#e0f7fa',
    borderColor: '#00695c',
    facts: [
      'Pauken (Timpani): gestimmte Trommeln',
      'Snare Drum (kleine Trommel)',
      'Becken (Zimbeln): metallische Klangscheiben',
      'Triangel: kleines Metalldreieck',
    ],
  },
];

const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  { question: 'Wann wurde Joseph Haydn geboren?', correctAnswer: '31. März 1732', options: ['31. März 1732', '27. Januar 1756', '17. Dezember 1770', '15. September 1748'] },
  { question: 'In welcher Stadt wurde Haydn geboren?', correctAnswer: 'Rohrau', options: ['Rohrau', 'Wien', 'Salzburg', 'Budapest'] },
  { question: 'Welchen Spitznamen trägt Joseph Haydn?', correctAnswer: 'Vater der Symphonie', options: ['Vater der Symphonie', 'König der Oper', 'Meister der Fuge', 'Fürst der Musik'] },
  { question: 'Wie viele Symphonien komponierte Haydn?', correctAnswer: '104', options: ['104', '41', '9', '68'] },
  { question: 'Für welche Familie arbeitete Haydn 30 Jahre lang?', correctAnswer: 'Familie Esterházy', options: ['Familie Esterházy', 'Familie Habsburg', 'Familie Mozart', 'Familie Bach'] },
  { question: 'Wer war Haydns berühmter Schüler?', correctAnswer: 'Ludwig van Beethoven', options: ['Ludwig van Beethoven', 'Franz Schubert', 'Robert Schumann', 'Frédéric Chopin'] },
  { question: 'Wie heißt Haydns bekannteste Symphonie mit dem überraschenden Paukenschlag?', correctAnswer: 'Symphonie Nr. 94', options: ['Symphonie Nr. 94', 'Symphonie Nr. 5', 'Symphonie Nr. 40', 'Symphonie Nr. 9'] },
  { question: 'Welches ist das größte Streichinstrument?', correctAnswer: 'Kontrabass', options: ['Kontrabass', 'Cello', 'Viola', 'Violine'] },
  { question: 'Wie viele Musiker hat ein Sinfonieorchester ungefähr?', correctAnswer: '60-100 Musiker', options: ['60-100 Musiker', '10-20 Musiker', '200-300 Musiker', '30-40 Musiker'] },
  { question: 'Was macht ein Dirigent?', correctAnswer: 'Er leitet das Orchester mit einem Taktstock', options: ['Er leitet das Orchester mit einem Taktstock', 'Er spielt Geige', 'Er schreibt die Noten', 'Er stimmt die Instrumente'] },
  { question: 'Welche Instrumente gehören zu den Streichern?', correctAnswer: 'Violine, Viola, Cello, Kontrabass', options: ['Violine, Viola, Cello, Kontrabass', 'Flöte, Oboe, Klarinette, Fagott', 'Trompete, Horn, Posaune, Tuba', 'Pauken, Trommel, Becken, Triangel'] },
  { question: 'Was bedeutet "Pizzicato" beim Spielen von Streichinstrumenten?', correctAnswer: 'Die Saiten werden gezupft', options: ['Die Saiten werden gezupft', 'Die Saiten werden gestrichen', 'Das Instrument wird geschüttelt', 'Die Saiten werden gestimmt'] },
  { question: 'Welches Instrument hat ein Doppelrohrblatt?', correctAnswer: 'Oboe', options: ['Oboe', 'Klarinette', 'Flöte', 'Trompete'] },
  { question: 'Welches ist das kleinste und höchste Blasinstrument?', correctAnswer: 'Piccolo', options: ['Piccolo', 'Fagott', 'Tuba', 'Posaune'] },
  { question: 'Wie verändert die Posaune ihren Ton?', correctAnswer: 'Mit einem Zug', options: ['Mit einem Zug', 'Mit Tasten', 'Mit Ventilen', 'Mit Löchern'] },
  { question: 'Welches Werk von Haydn beschreibt die Entstehung der Welt?', correctAnswer: 'Die Schöpfung', options: ['Die Schöpfung', 'Die Jahreszeiten', 'Der Messias', 'Die Zauberflöte'] },
  { question: 'Mit wem war Joseph Haydn befreundet?', correctAnswer: 'Wolfgang Amadeus Mozart', options: ['Wolfgang Amadeus Mozart', 'Johann Sebastian Bach', 'Georg Friedrich Händel', 'Franz Liszt'] },
  { question: 'Welche Instrumente gehören zu den Blechbläsern?', correctAnswer: 'Trompete, Horn, Posaune, Tuba', options: ['Trompete, Horn, Posaune, Tuba', 'Flöte, Oboe, Klarinette, Fagott', 'Violine, Viola, Cello, Kontrabass', 'Pauken, Trommel, Becken, Triangel'] },
];

export function HaydnMusicGame() {
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

  const fisherYatesShuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const startQuiz = () => {
    const shuffled = fisherYatesShuffle(ALL_QUIZ_QUESTIONS).slice(0, 10);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
    setPointsEarned(0);
    setGameMode('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const earned = 10 + (newStreak >= 3 ? 5 : 0);
      setPointsEarned((prev) => prev + earned);
      addPoints(earned);
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

  // ── Menu ──────────────────────────────────────────────────────────────────
  if (gameMode === 'menu') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0, bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
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
                🎼 Joseph Haydn &amp; das Orchester
              </Title>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Text size="xl" style={{ color: 'white', textAlign: 'center' }}>
                Entdecke die Welt der klassischen Musik!
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
                  color="blue"
                  onClick={() => setGameMode('info')}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  📖 Informationen lesen
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Lerne über Haydn und das Orchester
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
                  color="green"
                  onClick={startQuiz}
                  style={{ fontSize: '1.3rem', height: 100, width: '100%' }}
                >
                  ❓ Quiz starten
                  <br />
                  <Text size="sm" style={{ opacity: 0.9 }}>
                    Teste dein Wissen mit 10 Fragen
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

  // ── Info ──────────────────────────────────────────────────────────────────
  if (gameMode === 'info') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 0, bottom: 0, left: 0, right: 0,
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ScrollArea style={{ flex: 1 }} p="xl">
          <Container size="md" py="xl">
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Title order={1} ta="center" mb="xl" style={{ color: '#1a237e' }}>
                🎼 Joseph Haydn &amp; das Orchester
              </Title>
            </motion.div>

            <Stack gap="lg">
              {INFO_SECTIONS.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ x: idx % 2 === 0 ? -60 : 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.1, duration: 0.5, type: 'spring' }}
                >
                  <Paper
                    p="lg"
                    style={{
                      background: section.color,
                      border: `2px solid ${section.borderColor}`,
                      borderRadius: 12,
                    }}
                  >
                    <Title order={3} mb="sm" style={{ color: section.borderColor }}>
                      {section.emoji} {section.title}
                    </Title>
                    <Stack gap="xs">
                      {section.facts.map((fact) => (
                        <Group key={fact} gap="xs" align="flex-start">
                          <Text style={{ color: section.borderColor, flexShrink: 0 }}>•</Text>
                          <Text size="md">{fact}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Paper>
                </motion.div>
              ))}
            </Stack>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ marginTop: '2rem' }}
            >
              <Stack gap="sm">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="xl"
                    variant="filled"
                    color="green"
                    onClick={startQuiz}
                    style={{ fontSize: '1.3rem', width: '100%', height: 70 }}
                  >
                    ❓ Quiz starten
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    color="gray"
                    onClick={() => setGameMode('menu')}
                    style={{ width: '100%' }}
                  >
                    ← Zurück zum Menü
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Container>
        </ScrollArea>
      </motion.div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────
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
          top: 0, bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                      <Text size="xl" ta="center" fw={700}>Dein Ergebnis</Text>
                    </motion.div>

                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, type: 'spring', bounce: 0.5 }}>
                      <Text size="4rem" ta="center" fw={900} c="blue">
                        {score} / {questions.length}
                      </Text>
                    </motion.div>

                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring', bounce: 0.5 }}>
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
                          <Text size="sm" c="dimmed">(Gesamt: {points} Punkte)</Text>
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
                          onClick={startQuiz}
                          style={{ fontSize: '1.2rem', width: '100%' }}
                        >
                          🔄 Nochmal spielen
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          variant="outline"
                          color="gray"
                          onClick={() => setGameMode('menu')}
                          style={{ fontSize: '1.1rem', width: '100%' }}
                        >
                          ← Zurück zum Menü
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

  // ── Quiz ──────────────────────────────────────────────────────────────────
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
        top: 0, bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
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
                <Text size="sm" fw={600}>Frage {currentQuestion + 1} von {questions.length}</Text>
                <Text size="sm" fw={600} c="blue">Punkte: {score}</Text>
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
                  <Title order={2} ta="center" mb="xl" style={{ fontSize: '1.6rem', color: '#333' }}>
                    {question.question}
                  </Title>
                </motion.div>

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
                          fontSize: '1.1rem',
                          height: 'auto',
                          minHeight: 60,
                          padding: '12px 15px',
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
