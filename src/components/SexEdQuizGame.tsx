import { Button, Container, Group, Paper, Progress, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { usePoints } from '../hooks/usePoints';
import { fisherYatesShuffle } from '../utils/shuffle';

interface QuizQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
}

interface Topic {
  id: string;
  emoji: string;
  title: string;
  color: string;
  questions: QuizQuestion[];
}

const TOPICS: Topic[] = [
  {
    id: 'typisch',
    emoji: '👦👧',
    title: 'Typisch Junge / typisch Mädchen?',
    color: '#e3f2fd',
    questions: [
      {
        question: 'Was stimmt bei Farben wie "rosa ist für Mädchen, blau ist für Jungen"?',
        correctAnswer: 'Das ist eine Gewohnheit, keine Regel – jeder kann jede Farbe mögen.',
        options: [
          'Das ist eine Gewohnheit, keine Regel – jeder kann jede Farbe mögen.',
          'Das stimmt immer, Jungen dürfen kein Rosa tragen.',
          'Mädchen dürfen kein Blau tragen.',
          'Farben zeigen, ob jemand ein Junge oder Mädchen ist.',
        ],
        explanation: 'Farben sind für alle da! Es gibt keine Farbe, die nur für Mädchen oder nur für Jungen ist.',
      },
      {
        question: 'Darf ein Junge weinen, wenn er traurig ist?',
        correctAnswer: 'Ja, alle Menschen dürfen weinen – das ist normal und gesund.',
        options: [
          'Ja, alle Menschen dürfen weinen – das ist normal und gesund.',
          'Nein, Jungen sind stark und weinen nicht.',
          'Nur Mädchen dürfen weinen.',
          'Weinen ist peinlich für jeden.',
        ],
        explanation: 'Gefühle zeigen ist für alle Menschen wichtig und gesund, egal ob Junge oder Mädchen.',
      },
      {
        question: 'Was gilt wirklich für Jungen und Mädchen?',
        correctAnswer: 'Beide können jeden Beruf erlernen und jedes Hobby haben.',
        options: [
          'Beide können jeden Beruf erlernen und jedes Hobby haben.',
          'Mädchen sind für Hausarbeit zuständig, Jungen fürs Arbeiten.',
          'Nur Jungen können Fußball spielen.',
          'Mädchen sind immer stärker in Sprachen als Jungen.',
        ],
        explanation: 'Jeder Mensch ist einzigartig – Hobbys und Berufe kennen kein Geschlecht!',
      },
      {
        question: 'Was sind körperliche Unterschiede zwischen Jungen und Mädchen?',
        correctAnswer: 'Jungen und Mädchen haben unterschiedliche Geschlechtsorgane.',
        options: [
          'Jungen und Mädchen haben unterschiedliche Geschlechtsorgane.',
          'Jungen sind immer größer als Mädchen.',
          'Mädchen sind immer schlauer als Jungen.',
          'Jungen haben immer kürzere Haare.',
        ],
        explanation: 'Der wichtigste körperliche Unterschied sind die Geschlechtsorgane. Alles andere ist von Mensch zu Mensch verschieden.',
      },
      {
        question: 'Darf ein Mädchen mit Autos und Bauklötzen spielen?',
        correctAnswer: 'Ja, Kinder dürfen mit allem spielen, was ihnen Freude macht.',
        options: [
          'Ja, Kinder dürfen mit allem spielen, was ihnen Freude macht.',
          'Nein, Autos sind nur für Jungen.',
          'Nein, das ist nicht mädchenhaft.',
          'Nur wenn Jungen dabei sind.',
        ],
        explanation: 'Spielzeug hat kein Geschlecht – jeder spielt, womit er Spaß hat!',
      },
    ],
  },
  {
    id: 'liebe',
    emoji: '💕',
    title: 'Verliebt sein und Lieben',
    color: '#fce4ec',
    questions: [
      {
        question: 'Was bedeutet „verliebt sein"?',
        correctAnswer: 'Ein aufgeregtes Kribbeln im Bauch und ständig an jemanden denken.',
        options: [
          'Ein aufgeregtes Kribbeln im Bauch und ständig an jemanden denken.',
          'Jemanden so gut kennen wie die eigene Familie.',
          'Sich um jemanden sorgen, egal was passiert.',
          'Jemanden heiraten wollen.',
        ],
        explanation: 'Verliebt sein fühlt sich aufgeregt und kribbelig an – man denkt viel an die andere Person!',
      },
      {
        question: 'Was ist ein Zeichen dafür, dass man jemanden liebt (z. B. in der Familie)?',
        correctAnswer: 'Man ist füreinander da, auch wenn Zeiten schwierig sind.',
        options: [
          'Man ist füreinander da, auch wenn Zeiten schwierig sind.',
          'Man hat immer Kribbeln im Bauch.',
          'Man denkt ständig an diese Person.',
          'Man ist immer aufgeregt, wenn man die Person sieht.',
        ],
        explanation: 'Liebe ist tiefer als Verliebt-sein – sie ist Fürsorge und Verbundenheit über lange Zeit.',
      },
      {
        question: 'Was ist der Hauptunterschied zwischen verliebt sein und lieben?',
        correctAnswer: 'Verliebt sein ist oft ein intensives Gefühl am Anfang; Lieben wächst tiefer mit der Zeit.',
        options: [
          'Verliebt sein ist oft ein intensives Gefühl am Anfang; Lieben wächst tiefer mit der Zeit.',
          'Verliebt sein dauert ein ganzes Leben lang.',
          'Lieben bedeutet nur Schmetterlinge im Bauch.',
          'Es gibt keinen Unterschied zwischen beiden.',
        ],
        explanation: 'Verliebt-sein ist oft ein Prickeln am Anfang; tiefe Liebe wächst langsam und hält an.',
      },
      {
        question: 'Kann man jemanden lieben, der kein Familienmitglied ist?',
        correctAnswer: 'Ja, Freunde, Partner und andere Menschen können geliebt werden.',
        options: [
          'Ja, Freunde, Partner und andere Menschen können geliebt werden.',
          'Nein, Liebe gibt es nur in der Familie.',
          'Nein, man kann nur romantisch verliebt sein.',
          'Nur Erwachsene können andere außerhalb der Familie lieben.',
        ],
        explanation: 'Es gibt viele Arten von Liebe: Familienliebe, Freundschaft und romantische Liebe.',
      },
      {
        question: 'Ist es normal, sich in jemanden zu verlieben?',
        correctAnswer: 'Ja, das ist ein normales Gefühl, das viele Menschen kennen.',
        options: [
          'Ja, das ist ein normales Gefühl, das viele Menschen kennen.',
          'Nein, das ist etwas Besonderes, das selten passiert.',
          'Nur Erwachsene dürfen verliebt sein.',
          'Nein, solche Gefühle sind falsch.',
        ],
        explanation: 'Verliebt sein ist ein wunderschönes, ganz normales Gefühl!',
      },
    ],
  },
  {
    id: 'organe',
    emoji: '🫀',
    title: 'Geschlechtsorgane',
    color: '#e8f5e9',
    questions: [
      {
        question: 'Welche äußeren Geschlechtsorgane hat ein Mädchen?',
        correctAnswer: 'Vulva (die äußere Schamgegend) und Vaginalöffnung.',
        options: [
          'Vulva (die äußere Schamgegend) und Vaginalöffnung.',
          'Penis und Hoden.',
          'Gebärmutter und Eierstock (diese sind innen).',
          'Nur die Gebärmutter.',
        ],
        explanation: 'Das äußerlich sichtbare weibliche Geschlechtsorgan heißt Vulva; die Gebärmutter und Eierstöcke sind innen.',
      },
      {
        question: 'Welches innere Organ ist nur beim Mädchen vorhanden?',
        correctAnswer: 'Die Gebärmutter (Uterus).',
        options: [
          'Die Gebärmutter (Uterus).',
          'Die Harnblase.',
          'Die Niere.',
          'Das Herz.',
        ],
        explanation: 'In der Gebärmutter kann ein Baby heranwachsen.',
      },
      {
        question: 'Wie nennt man die äußeren Geschlechtsorgane beim Jungen?',
        correctAnswer: 'Penis und Hodensack (mit den Hoden).',
        options: [
          'Penis und Hodensack (mit den Hoden).',
          'Vulva und Vagina.',
          'Gebärmutter und Eierstock.',
          'Penis und Gebärmutter.',
        ],
        explanation: 'Bei Jungen sind Penis und Hodensack außen sichtbar.',
      },
      {
        question: 'Wo werden beim Mädchen die Eizellen gebildet?',
        correctAnswer: 'In den Eierstöcken.',
        options: [
          'In den Eierstöcken.',
          'In der Gebärmutter.',
          'In der Vagina.',
          'In den Hoden.',
        ],
        explanation: 'Die Eierstöcke (Ovarien) produzieren Eizellen.',
      },
      {
        question: 'Wo werden beim Jungen die Samenzellen gebildet?',
        correctAnswer: 'In den Hoden.',
        options: [
          'In den Hoden.',
          'Im Penis.',
          'In den Eierstöcken.',
          'In der Gebärmutter.',
        ],
        explanation: 'Die Hoden produzieren Samenzellen (Spermien).',
      },
      {
        question: 'Warum ist es wichtig, einen medizinischen Namen für Körperteile zu kennen?',
        correctAnswer: 'Damit man beim Arzt oder zu Hause klar über seinen Körper sprechen kann.',
        options: [
          'Damit man beim Arzt oder zu Hause klar über seinen Körper sprechen kann.',
          'Weil man sonst bestraft wird.',
          'Es ist nicht wichtig.',
          'Nur Ärzte müssen diese Namen kennen.',
        ],
        explanation: 'Korrekte Namen helfen uns, offen und ohne Scham über unseren Körper zu sprechen.',
      },
    ],
  },
  {
    id: 'pubertaet',
    emoji: '🌱',
    title: 'Pubertät & Körperliche Veränderungen',
    color: '#fff8e1',
    questions: [
      {
        question: 'Was ist die Pubertät?',
        correctAnswer: 'Eine Zeit, in der sich der Körper vom Kind zum Erwachsenen verändert.',
        options: [
          'Eine Zeit, in der sich der Körper vom Kind zum Erwachsenen verändert.',
          'Eine Krankheit.',
          'Der erste Schultag.',
          'Eine Zeit, die nur Mädchen erleben.',
        ],
        explanation: 'Pubertät ist eine ganz natürliche Entwicklungsphase, die jeder Mensch durchläuft.',
      },
      {
        question: 'Was passiert bei Jungen in der Pubertät?',
        correctAnswer: 'Die Stimme wird tiefer, Haare wachsen und der Körper wird größer und muskulöser.',
        options: [
          'Die Stimme wird tiefer, Haare wachsen und der Körper wird größer und muskulöser.',
          'Die Stimme wird höher.',
          'Die Hoden verschwinden.',
          'Nichts ändert sich äußerlich.',
        ],
        explanation: 'Bei Jungen vertieft sich die Stimme, Körperbehaarung wächst und die Muskeln entwickeln sich.',
      },
      {
        question: 'Was passiert bei Mädchen in der Pubertät?',
        correctAnswer: 'Die Brust wächst, die Hüften werden breiter und die Menstruation beginnt.',
        options: [
          'Die Brust wächst, die Hüften werden breiter und die Menstruation beginnt.',
          'Die Stimme wird viel tiefer.',
          'Mädchen wachsen nicht mehr.',
          'Die Haare fallen aus.',
        ],
        explanation: 'Mädchen entwickeln eine weibliche Körperform und die Periode beginnt.',
      },
      {
        question: 'Wann beginnt die Pubertät typischerweise?',
        correctAnswer: 'Meist zwischen 9 und 13 Jahren – jeder Mensch ist unterschiedlich.',
        options: [
          'Meist zwischen 9 und 13 Jahren – jeder Mensch ist unterschiedlich.',
          'Immer genau mit 10 Jahren.',
          'Erst mit 18 Jahren.',
          'Nur am Geburtstag.',
        ],
        explanation: 'Der Zeitpunkt ist bei jedem anders – das ist völlig normal!',
      },
      {
        question: 'Warum kann die Haut in der Pubertät unreiner werden?',
        correctAnswer: 'Weil Hormone die Talgdrüsen anregen, mehr Fett zu produzieren.',
        options: [
          'Weil Hormone die Talgdrüsen anregen, mehr Fett zu produzieren.',
          'Wegen zu wenig Schlafen.',
          'Wegen des Schulstresses allein.',
          'Weil man zu viel wächst.',
        ],
        explanation: 'Hormone sind Botenstoffe im Blut, die viele Veränderungen in der Pubertät auslösen.',
      },
      {
        question: 'Ist es normal, in der Pubertät Gefühlsschwankungen zu haben?',
        correctAnswer: 'Ja, Hormone können Stimmungen beeinflussen – das ist völlig normal.',
        options: [
          'Ja, Hormone können Stimmungen beeinflussen – das ist völlig normal.',
          'Nein, das deutet auf eine Krankheit hin.',
          'Nur Mädchen haben Gefühlsschwankungen.',
          'Nein, man sollte immer gleich fühlen.',
        ],
        explanation: 'Gefühlsschwankungen sind normal – sprich mit jemandem dem du vertraust!',
      },
    ],
  },
  {
    id: 'menstruation',
    emoji: '🩸',
    title: 'Menstruationszyklus',
    color: '#f3e5f5',
    questions: [
      {
        question: 'Was ist Menstruation?',
        correctAnswer: 'Die monatliche Abstoßung der Gebärmutterschleimhaut, wenn keine Schwangerschaft eingetreten ist.',
        options: [
          'Die monatliche Abstoßung der Gebärmutterschleimhaut, wenn keine Schwangerschaft eingetreten ist.',
          'Eine Krankheit.',
          'Urin (Pipi).',
          'Eine Art Sport.',
        ],
        explanation: 'Die Periode (Menstruation) ist ein natürlicher Körpervorgang bei Mädchen und Frauen.',
      },
      {
        question: 'Wie oft kommt die Menstruation (Periode) ungefähr?',
        correctAnswer: 'Ungefähr einmal im Monat (alle 21–35 Tage).',
        options: [
          'Ungefähr einmal im Monat (alle 21–35 Tage).',
          'Einmal im Jahr.',
          'Jeden Tag.',
          'Einmal pro Woche.',
        ],
        explanation: 'Der Zyklus dauert durchschnittlich 28 Tage – kann aber von Person zu Person variieren.',
      },
      {
        question: 'Wie lange dauert die Menstruation meistens?',
        correctAnswer: '3 bis 7 Tage.',
        options: [
          '3 bis 7 Tage.',
          'Nur 1 Stunde.',
          '4 Wochen.',
          'Genau 2 Wochen.',
        ],
        explanation: 'Die meisten Perioden dauern zwischen 3 und 7 Tagen.',
      },
      {
        question: 'Was können Mädchen während der Menstruation benutzen?',
        correctAnswer: 'Binden, Tampons oder Menstruationstassen.',
        options: [
          'Binden, Tampons oder Menstruationstassen.',
          'Gar nichts, man muss es aushalten.',
          'Nur Pflaster.',
          'Ausschließlich Windeln.',
        ],
        explanation: 'Es gibt verschiedene Hygieneartikel, die helfen, die Periode diskret und bequem zu handhaben.',
      },
      {
        question: 'Wann beginnt die erste Menstruation (Menarche) meist?',
        correctAnswer: 'Zwischen 10 und 14 Jahren – jeder Körper ist anders.',
        options: [
          'Zwischen 10 und 14 Jahren – jeder Körper ist anders.',
          'Immer genau mit 10 Jahren.',
          'Erst mit 20 Jahren.',
          'Mit dem ersten Schultag.',
        ],
        explanation: 'Der Zeitpunkt der ersten Periode ist bei jedem Mädchen anders – das ist normal.',
      },
      {
        question: 'Wozu dient der Menstruationszyklus im Körper?',
        correctAnswer: 'Er bereitet die Gebärmutter jeden Monat auf eine mögliche Schwangerschaft vor.',
        options: [
          'Er bereitet die Gebärmutter jeden Monat auf eine mögliche Schwangerschaft vor.',
          'Er reinigt die Nieren.',
          'Er lässt die Knochen wachsen.',
          'Er reguliert den Appetit.',
        ],
        explanation: 'Jeder Zyklus baut eine Schleimhaut auf – wird sie nicht gebraucht, wird sie abgestoßen.',
      },
    ],
  },
  {
    id: 'baby',
    emoji: '👶',
    title: 'So entsteht ein Baby',
    color: '#e0f7fa',
    questions: [
      {
        question: 'Was braucht es, damit ein Baby entstehen kann?',
        correctAnswer: 'Eine Eizelle der Frau und eine Samenzelle (Spermium) des Mannes.',
        options: [
          'Eine Eizelle der Frau und eine Samenzelle (Spermium) des Mannes.',
          'Nur eine Eizelle.',
          'Nur eine Samenzelle.',
          'Eine Eizelle und Luft.',
        ],
        explanation: 'Wenn Ei- und Samenzelle zusammentreffen, kann ein neues Leben beginnen.',
      },
      {
        question: 'Wie nennt man den Vorgang, bei dem Ei- und Samenzelle verschmelzen?',
        correctAnswer: 'Befruchtung.',
        options: [
          'Befruchtung.',
          'Pubertät.',
          'Menstruation.',
          'Geburt.',
        ],
        explanation: 'Bei der Befruchtung verschmilzt die Samenzelle mit der Eizelle – eine neue Zelle entsteht.',
      },
      {
        question: 'Wo findet die Befruchtung der Eizelle statt?',
        correctAnswer: 'Im Eileiter der Frau.',
        options: [
          'Im Eileiter der Frau.',
          'Im Magen.',
          'In der Nase.',
          'Im Hodensack.',
        ],
        explanation: 'Im Eileiter treffen Ei- und Samenzelle aufeinander und können sich vereinigen.',
      },
      {
        question: 'Was entsteht, wenn eine Eizelle befruchtet wird?',
        correctAnswer: 'Eine befruchtete Eizelle (Zygote), aus der ein Baby heranwächst.',
        options: [
          'Eine befruchtete Eizelle (Zygote), aus der ein Baby heranwächst.',
          'Sofort ein fertiges Baby.',
          'Eine neue Samenzelle.',
          'Ein Ei wie beim Huhn.',
        ],
        explanation: 'Die Zygote teilt sich immer weiter und wird zu einem Embryo, dann zu einem Fötus und schließlich zu einem Baby.',
      },
      {
        question: 'Wo wächst das Baby nach der Befruchtung heran?',
        correctAnswer: 'In der Gebärmutter der Mutter.',
        options: [
          'In der Gebärmutter der Mutter.',
          'Im Magen der Mutter.',
          'Im Ei außerhalb des Körpers.',
          'In den Eierstöcken.',
        ],
        explanation: 'Die befruchtete Eizelle nistet sich in der Gebärmutter ein und wächst dort heran.',
      },
    ],
  },
  {
    id: 'entwicklung',
    emoji: '🤰',
    title: 'Das Baby im Bauch – Entwicklung',
    color: '#e8eaf6',
    questions: [
      {
        question: 'Wie lange dauert eine Schwangerschaft beim Menschen?',
        correctAnswer: 'Ungefähr 9 Monate (ca. 40 Wochen).',
        options: [
          'Ungefähr 9 Monate (ca. 40 Wochen).',
          '3 Monate.',
          '2 Jahre.',
          'Genau 6 Monate.',
        ],
        explanation: 'Eine Schwangerschaft dauert beim Menschen etwa 40 Wochen, das sind rund 9 Monate.',
      },
      {
        question: 'Was ist die Nabelschnur?',
        correctAnswer: 'Eine Verbindung zwischen Baby und Mutterkuchen, die das Baby mit Nährstoffen versorgt.',
        options: [
          'Eine Verbindung zwischen Baby und Mutterkuchen, die das Baby mit Nährstoffen versorgt.',
          'Ein Spielzeug für das Baby.',
          'Ein Knochen.',
          'Die Hülle um das Baby.',
        ],
        explanation: 'Über die Nabelschnur bekommt das Baby Sauerstoff und Nährstoffe von der Mutter.',
      },
      {
        question: 'Wann kann das Baby im Bauch Bewegungen machen, die die Mutter spürt?',
        correctAnswer: 'Ab etwa dem 4.–5. Schwangerschaftsmonat.',
        options: [
          'Ab etwa dem 4.–5. Schwangerschaftsmonat.',
          'Erst nach der Geburt.',
          'Bereits am ersten Tag.',
          'Erst kurz vor der Geburt.',
        ],
        explanation: 'Die ersten Kindsbewegungen spürt die Mutter meist ab dem 4. oder 5. Monat.',
      },
      {
        question: 'Was schützt das Baby im Mutterleib?',
        correctAnswer: 'Die Fruchtblase mit Fruchtwasser.',
        options: [
          'Die Fruchtblase mit Fruchtwasser.',
          'Eine harte Schale.',
          'Die Magensäure.',
          'Nichts – es ist ungeschützt.',
        ],
        explanation: 'Die Fruchtblase ist ein wasseriger Schutzsack, der das Baby wie ein Kissen umgibt.',
      },
      {
        question: 'Was passiert bei der Geburt?',
        correctAnswer: 'Die Gebärmutter zieht sich zusammen und das Baby wird durch den Geburtskanal geboren.',
        options: [
          'Die Gebärmutter zieht sich zusammen und das Baby wird durch den Geburtskanal geboren.',
          'Das Baby fliegt aus dem Bauch heraus.',
          'Das Baby bleibt immer im Bauch.',
          'Das Baby wird gebacken.',
        ],
        explanation: 'Bei der Geburt helfen Wehen (Gebärmutterkontraktionen), das Baby zur Welt zu bringen.',
      },
      {
        question: 'Was ist der Ultraschall bei einer Schwangerschaft?',
        correctAnswer: 'Eine Untersuchung, bei der man das Baby im Bauch sehen kann.',
        options: [
          'Eine Untersuchung, bei der man das Baby im Bauch sehen kann.',
          'Eine Art Sport für Schwangere.',
          'Eine Impfung.',
          'Eine Blutuntersuchung.',
        ],
        explanation: 'Mit Ultraschall können Ärzte das Baby im Mutterleib beobachten und sicherstellen, dass alles gesund ist.',
      },
    ],
  },
];

type GameMode = 'menu' | 'quiz' | 'results';

export function SexEdQuizGame() {
  const { points, addPoints } = usePoints();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const startTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setQuestions(fisherYatesShuffle(topic.questions).map((q) => ({
      ...q,
      options: fisherYatesShuffle(q.options),
    })));
    setGameMode('quiz');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
    setPointsEarned(0);
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
      const earned = 10 + Math.min(newStreak - 1, 5);
      setPointsEarned((p) => p + earned);
      addPoints(earned);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
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

  const getEmoji = (pct: number) => {
    if (pct >= 90) return '🌟';
    if (pct >= 70) return '😊';
    if (pct >= 50) return '👍';
    return '💪';
  };

  // ── MENU ─────────────────────────────────────────────────────────────────────
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
          background: 'linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Container size="md" style={{ width: '100%' }}>
          <Stack gap="lg" align="center">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2rem', textAlign: 'center' }}>
                🌸 Körper & Gefühle Quiz
              </Title>
              <Text size="md" style={{ color: 'white', textAlign: 'center', marginTop: 8 }}>
                Sexualerziehung – 4. Klasse
              </Text>
            </motion.div>

            <ScrollArea style={{ width: '100%', maxWidth: 560 }}>
              <Stack gap="sm" style={{ paddingBottom: 8 }}>
                {TOPICS.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.08, duration: 0.4, type: 'spring' }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      size="lg"
                      variant="white"
                      onClick={() => startTopic(topic)}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: '14px 20px',
                        fontSize: '1.1rem',
                        textAlign: 'left',
                        background: topic.color,
                        color: '#333',
                        border: '2px solid rgba(255,255,255,0.6)',
                      }}
                    >
                      <Group gap="sm" wrap="nowrap">
                        <Text size="1.6rem">{topic.emoji}</Text>
                        <Text fw={600} style={{ whiteSpace: 'normal' }}>
                          {topic.title}
                        </Text>
                      </Group>
                    </Button>
                  </motion.div>
                ))}
              </Stack>
            </ScrollArea>

            {bestStreak > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9, type: 'spring', bounce: 0.5 }}
              >
                <Paper p="md" style={{ background: 'rgba(255,255,255,0.9)' }}>
                  <Text size="md" fw={700} ta="center">
                    🔥 Beste Serie: {bestStreak} richtige Antworten!
                  </Text>
                </Paper>
              </motion.div>
            )}
          </Stack>
        </Container>
      </motion.div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────────
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
          background: 'linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%)',
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
              style={{ fontSize: '7rem' }}
            >
              {emoji}
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Title order={1} style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center' }}>
                Gut gemacht!
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
                    <Text size="xl" ta="center" fw={700}>
                      Dein Ergebnis: {selectedTopic?.title}
                    </Text>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.0, type: 'spring', bounce: 0.5 }}
                    >
                      <Text size="4rem" ta="center" fw={900} c="violet">
                        {score} / {questions.length}
                      </Text>
                    </motion.div>
                    <Text size="2rem" ta="center" fw={700} c="pink">
                      {percentage}%
                    </Text>
                  </div>

                  {bestStreak > 0 && (
                    <Text size="lg" ta="center" c="orange" fw={600}>
                      🔥 Beste Serie: {bestStreak} richtig!
                    </Text>
                  )}

                  {pointsEarned > 0 && (
                    <Text size="lg" ta="center" c="teal" fw={600}>
                      💎 +{pointsEarned} Punkte verdient!
                      {points !== null && (
                        <Text size="sm" c="dimmed">
                          (Gesamt: {points} Punkte)
                        </Text>
                      )}
                    </Text>
                  )}

                  <Stack gap="sm" mt="md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="filled"
                        color="pink"
                        onClick={() => setGameMode('menu')}
                        style={{ fontSize: '1.1rem', width: '100%' }}
                      >
                        ✨ Anderes Thema wählen
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        variant="light"
                        color="violet"
                        onClick={() => selectedTopic && startTopic(selectedTopic)}
                        style={{ fontSize: '1.1rem', width: '100%' }}
                      >
                        🔄 Nochmal spielen
                      </Button>
                    </motion.div>
                  </Stack>
                </Stack>
              </Paper>
            </motion.div>
          </Stack>
        </Container>
      </motion.div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────────────────────
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
        background: 'linear-gradient(135deg, #f9a8d4 0%, #a78bfa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '70px',
      }}
    >
      <Container size="md" style={{ width: '100%' }}>
        <Stack gap="lg">
          {/* Progress */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper p="sm" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Group justify="apart" mb="xs">
                <Text size="sm" fw={600}>
                  {selectedTopic?.emoji} {selectedTopic?.title}
                </Text>
                <Text size="sm" fw={600} c="violet">
                  {currentQuestion + 1} / {questions.length}
                </Text>
              </Group>
              <Progress value={progress} size="lg" color="pink" />
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

          {/* Question card */}
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
                  <Title
                    order={2}
                    ta="center"
                    mb="xl"
                    style={{ fontSize: '1.5rem', color: '#333' }}
                  >
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
                        size="lg"
                        variant="filled"
                        color={getButtonColor(option)}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        style={{
                          fontSize: '1rem',
                          height: 'auto',
                          minHeight: 60,
                          padding: '12px 16px',
                          whiteSpace: 'normal',
                          width: '100%',
                          textAlign: 'left',
                        }}
                        styles={{ label: { whiteSpace: 'normal', wordBreak: 'break-word' } }}
                      >
                        {option}
                      </Button>
                    </motion.div>
                  ))}
                </Stack>

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
                          <Paper p="md" style={{ background: '#d4edda', border: '2px solid #28a745' }}>
                            <Text size="xl" ta="center" fw={700} c="green">
                              ✅ Richtig! Super! 🎉
                            </Text>
                            {question.explanation && (
                              <Text size="sm" ta="center" mt="xs" c="dark">
                                {question.explanation}
                              </Text>
                            )}
                          </Paper>
                        ) : (
                          <Paper p="md" style={{ background: '#f8d7da', border: '2px solid #dc3545' }}>
                            <Text size="lg" ta="center" fw={700} c="red">
                              ❌ Nicht ganz richtig!
                            </Text>
                            <Text size="md" ta="center" mt="xs">
                              Die richtige Antwort ist: <strong>{question.correctAnswer}</strong>
                            </Text>
                            {question.explanation && (
                              <Text size="sm" ta="center" mt="xs" c="dark">
                                {question.explanation}
                              </Text>
                            )}
                          </Paper>
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
                            {currentQuestion < questions.length - 1
                              ? 'Nächste Frage →'
                              : 'Ergebnis anzeigen 🎯'}
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
