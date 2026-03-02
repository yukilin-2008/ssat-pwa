export type Question = {
  id: string;
  type: "vocab" | "analogy";
  stem: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
  tag: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "v1",
    type: "vocab",
    stem: "Select the best synonym for: rapid",
    choices: ["slow", "quick", "quiet", "weak"],
    answerIndex: 1,
    explanation: "Rapid means fast or quick.",
    tag: "vocab:synonym",
  },
  {
    id: "v2",
    type: "vocab",
    stem: "Select the best synonym for: tiny",
    choices: ["small", "angry", "bright", "heavy"],
    answerIndex: 0,
    explanation: "Tiny means very small.",
    tag: "vocab:synonym",
  },
  {
    id: "a1",
    type: "analogy",
    stem: "Bird : Nest :: Bee : ?",
    choices: ["Hive", "Pond", "Cave", "Field"],
    answerIndex: 0,
    explanation: "A bird lives in a nest; a bee lives in a hive.",
    tag: "analogy:home",
  },
];