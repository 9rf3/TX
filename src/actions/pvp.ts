"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { PvPMatch, PvPCategory } from "@/lib/types";

export async function getActiveMatches() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as PvPMatch[];
}

export async function getUserMatches() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as PvPMatch[];
}

export async function createMatch(category: PvPCategory) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("pvp_matches")
    .insert({
      player_1_id: user.id,
      category,
      status: "waiting",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PvPMatch;
}

export async function joinMatch(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("pvp_matches")
    .update({
      player_2_id: user.id,
      status: "active",
      started_at: new Date().toISOString(),
      current_state_hash: crypto.randomUUID(),
    })
    .eq("id", matchId)
    .eq("status", "waiting")
    .is("player_2_id", null)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PvPMatch;
}

export async function getMatchStatus(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error) throw new Error(error.message);
  return data as PvPMatch;
}

export async function findAvailableMatches(category?: PvPCategory) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("pvp_matches")
    .select("*")
    .eq("status", "waiting")
    .is("player_2_id", null)
    .neq("player_1_id", user.id)
    .order("created_at", { ascending: true })
    .limit(10);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as PvPMatch[];
}

export async function getPvPStats() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, wins: 0, losses: 0, winRate: 0 };

  const { data: matches, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
    .eq("status", "completed");

  if (error) throw new Error(error.message);

  const total = matches?.length ?? 0;
  const wins = matches?.filter((m) => m.winner_id === user.id).length ?? 0;
  const losses = total - wins;

  return {
    total,
    wins,
    losses,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
  };
}

/* ==================================================================== */
/*  QUICK MATCH — finds or creates a PvP match                           */
/* ==================================================================== */

export async function quickMatch(category: PvPCategory) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Look for an available match in this category
  const { data: available } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("status", "waiting")
    .is("player_2_id", null)
    .eq("category", category)
    .neq("player_1_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  let match: PvPMatch;

  if (available && available.length > 0) {
    // Join existing match
    const joined = await supabase
      .from("pvp_matches")
      .update({
        player_2_id: user.id,
        status: "active",
        started_at: new Date().toISOString(),
        current_state_hash: crypto.randomUUID(),
      })
      .eq("id", available[0].id)
      .eq("status", "waiting")
      .select()
      .single();

    if (joined.error) throw new Error(joined.error.message);
    match = joined.data as PvPMatch;
  } else {
    // Create new match
    const created = await supabase
      .from("pvp_matches")
      .insert({
        player_1_id: user.id,
        category,
        status: "waiting",
      })
      .select()
      .single();

    if (created.error) throw new Error(created.error.message);
    match = created.data as PvPMatch;
  }

  const questions = getQuestionsForCategory(category, match.id);

  return { match, questions };
}

/* ==================================================================== */
/*  GET PVP QUESTIONS for a given match                                  */
/* ==================================================================== */

export async function getPvPQuestions(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: match, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error || !match) throw new Error("Match not found");

  return getQuestionsForCategory(match.category as PvPCategory, matchId);
}

/* ==================================================================== */
/*  SUBMIT PVP ANSWER                                                    */
/* ==================================================================== */

export async function submitPvPAnswer(
  matchId: string,
  questionId: string,
  answer: string,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: match } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match || match.status !== "active") throw new Error("Match is not active");

  const isPlayer1 = match.player_1_id === user.id;
  const isPlayer2 = match.player_2_id === user.id;
  if (!isPlayer1 && !isPlayer2) throw new Error("Not part of this match");

  // Find the question and evaluate
  const questions = getQuestionsForCategory(match.category as PvPCategory, matchId);
  const question = questions.find((q: { id: string }) => q.id === questionId);
  if (!question) throw new Error("Question not found");

  const correct = evaluateAnswer(question, answer);
  const points = correct ? (question.points ?? 100) : 0;

  // Update match score
  const updateField = isPlayer1 ? "player_1_score" : "player_2_score";
  const currentScore = isPlayer1 ? (match.player_1_score ?? 0) : (match.player_2_score ?? 0);
  const newScore = currentScore + points;

  await supabase
    .from("pvp_matches")
    .update({ [updateField]: newScore })
    .eq("id", matchId);

  return {
    correct,
    points,
    totalScore: newScore,
  };
}

/* ==================================================================== */
/*  COMPLETE PVP MATCH — determine winner, award rewards                 */
/* ==================================================================== */

export async function completePvPMatch(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: match } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) throw new Error("Match not found");
  if (match.player_2_id === null) {
    // No opponent yet — cancel
    await supabase
      .from("pvp_matches")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", matchId);
    return { status: "cancelled", winner: null, isWinner: false, p1Score: 0, p2Score: 0, xpReward: 0, coinReward: 0 };
  }

  const p1Score = match.player_1_score ?? 0;
  const p2Score = match.player_2_score ?? 0;
  let winnerId: string | null = null;

  if (p1Score > p2Score) winnerId = match.player_1_id;
  else if (p2Score > p1Score) winnerId = match.player_2_id;
  // Scores are equal — no winner (draw)

  await supabase
    .from("pvp_matches")
    .update({
      status: "completed",
      winner_id: winnerId,
      completed_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  // Award rewards
  const isWinner = winnerId === user.id;
  const xpReward = isWinner ? 50 : 15;
  const coinReward = isWinner ? 25 : 5;

  try {
    await supabase.rpc("award_xp_safe", {
      p_user_id: user.id,
      p_amount: xpReward,
      p_reason: isWinner ? "pvp_win" : "pvp_loss",
      p_metadata: { match_id: matchId, category: match.category },
    });
  } catch { /* non-critical */ }

  try {
    await supabase.rpc("award_coins_safe", {
      p_user_id: user.id,
      p_amount: coinReward,
      p_reason: isWinner ? "pvp_win" : "pvp_loss",
      p_metadata: { match_id: matchId },
    });
  } catch { /* non-critical */ }

  // Update profile pvp_won stat if winner
  if (isWinner) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("pvp_won")
        .eq("id", user.id)
        .single();
      if (profile) {
        await supabase
          .from("profiles")
          .update({ pvp_won: (profile.pvp_won ?? 0) + 1 })
          .eq("id", user.id);
      }
    } catch { /* non-critical */ }
  }

  return {
    status: "completed",
    winner: winnerId,
    isWinner,
    p1Score,
    p2Score,
    xpReward,
    coinReward,
  };
}

/* ==================================================================== */
/*  PVP MATCH STATE — poll for match updates                             */
/* ==================================================================== */

export async function getPvPMatchState(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: match } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) throw new Error("Match not found");

  return {
    id: match.id,
    status: match.status,
    player1Id: match.player_1_id,
    player2Id: match.player_2_id,
    p1Score: match.player_1_score ?? 0,
    p2Score: match.player_2_score ?? 0,
    winnerId: match.winner_id,
    category: match.category,
  };
}

/* ==================================================================== */
/*  QUESTION BANKS — embedded per-category question pools                */
/* ==================================================================== */

interface PvPQuestion {
  id: string;
  type: "multiple_choice" | "coding_challenge" | "written";
  data: {
    question: string;
    options?: string[];
    code?: string;
    language?: string;
  };
  points: number;
  correctAnswer: string;
}

function getQuestionsForCategory(category: PvPCategory, seed: string): PvPQuestion[] {
  const bank = QUESTION_BANKS[category] ?? QUESTION_BANKS.general;
  // Deterministic shuffle based on seed
  const shuffled = [...bank];
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (hash + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Return first 5 questions
  return shuffled.slice(0, 5).map((q, i) => ({
    ...q,
    id: `${seed}-q${i}`,
  }));
}

function evaluateAnswer(question: PvPQuestion, answer: string): boolean {
  if (question.type === "multiple_choice") {
    return answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  }
  const answerLower = answer.toLowerCase();
  const correctLower = question.correctAnswer.toLowerCase();
  // For coding/written, check for key terms or exact match
  const keywords = correctLower.split(/\s+/).filter((k) => k.length > 3);
  if (keywords.length > 0) {
    const matchCount = keywords.filter((kw) => answerLower.includes(kw)).length;
    return matchCount >= Math.ceil(keywords.length * 0.5);
  }
  return answerLower.includes(correctLower);
}

const QUESTION_BANKS: Record<string, PvPQuestion[]> = {
  javascript: [
    { id: "js-1", type: "multiple_choice", data: { question: "What does `typeof null` return?", options: ["null", "undefined", "object", "boolean"] }, points: 100, correctAnswer: "object" },
    { id: "js-2", type: "multiple_choice", data: { question: "Which method creates a new array with the results of calling a function on every element?", options: ["forEach()", "map()", "filter()", "reduce()"] }, points: 100, correctAnswer: "map()" },
    { id: "js-3", type: "multiple_choice", data: { question: "What is the output of `console.log(typeof NaN)`?", options: ["number", "NaN", "undefined", "object"] }, points: 100, correctAnswer: "number" },
    { id: "js-4", type: "coding_challenge", data: { question: "Write a function that returns the sum of two numbers.", code: "function add(a, b) {\n  // Your code here\n}" }, points: 200, correctAnswer: "return a + b" },
    { id: "js-5", type: "multiple_choice", data: { question: "Which symbol is used for strict equality comparison?", options: ["==", "===", "=", "!="] }, points: 100, correctAnswer: "===" },
    { id: "js-6", type: "written", data: { question: "Explain what a Promise is in JavaScript." }, points: 200, correctAnswer: "asynchronous operation eventual completion failure" },
    { id: "js-7", type: "multiple_choice", data: { question: "What does the `bind()` method do?", options: ["Creates a new function", "Binds a value to a variable", "Creates a new function with a fixed this value", "Binds an event handler"] }, points: 100, correctAnswer: "Creates a new function with a fixed this value" },
    { id: "js-8", type: "coding_challenge", data: { question: "Write code to check if a string is a palindrome.", code: "function isPalindrome(str) {\n  // Your code here\n}" }, points: 200, correctAnswer: "reverse split join" },
  ],
  react: [
    { id: "react-1", type: "multiple_choice", data: { question: "What hook is used for side effects in React?", options: ["useState", "useEffect", "useContext", "useReducer"] }, points: 100, correctAnswer: "useEffect" },
    { id: "react-2", type: "multiple_choice", data: { question: "What is JSX?", options: ["A templating engine", "A syntax extension for JavaScript", "A CSS framework", "A database"] }, points: 100, correctAnswer: "A syntax extension for JavaScript" },
    { id: "react-3", type: "multiple_choice", data: { question: "Which method is used to update state in a class component?", options: ["setState()", "updateState()", "changeState()", "modifyState()"] }, points: 100, correctAnswer: "setState()" },
    { id: "react-4", type: "coding_challenge", data: { question: "Write a simple React component that displays 'Hello World'.", language: "jsx" }, points: 200, correctAnswer: "return div Hello World" },
    { id: "react-5", type: "multiple_choice", data: { question: "What is the virtual DOM?", options: ["A direct copy of the real DOM", "A lightweight representation of the DOM in memory", "A browser API", "A JavaScript library"] }, points: 100, correctAnswer: "A lightweight representation of the DOM in memory" },
    { id: "react-6", type: "multiple_choice", data: { question: "What does `useMemo` do?", options: ["Memoizes a value", "Memoizes a function", "Creates a ref", "Triggers a re-render"] }, points: 100, correctAnswer: "Memoizes a value" },
    { id: "react-7", type: "written", data: { question: "Explain the purpose of keys in React lists." }, points: 200, correctAnswer: "identify which items changed added removed efficient update" },
    { id: "react-8", type: "multiple_choice", data: { question: "Which hook would you use to avoid prop drilling?", options: ["useState", "useEffect", "useContext", "useRef"] }, points: 100, correctAnswer: "useContext" },
  ],
  algorithms: [
    { id: "algo-1", type: "multiple_choice", data: { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"] }, points: 100, correctAnswer: "O(log n)" },
    { id: "algo-2", type: "multiple_choice", data: { question: "Which data structure operates on LIFO principle?", options: ["Queue", "Stack", "Array", "Linked List"] }, points: 100, correctAnswer: "Stack" },
    { id: "algo-3", type: "multiple_choice", data: { question: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"] }, points: 100, correctAnswer: "O(n^2)" },
    { id: "algo-4", type: "coding_challenge", data: { question: "Write a function to find the maximum element in an array.", code: "function findMax(arr) {\n  // Your code here\n}" }, points: 200, correctAnswer: "Math.max" },
    { id: "algo-5", type: "multiple_choice", data: { question: "Which traversal visits the left subtree, then root, then right subtree?", options: ["Pre-order", "In-order", "Post-order", "Level-order"] }, points: 100, correctAnswer: "In-order" },
    { id: "algo-6", type: "multiple_choice", data: { question: "What is a hash table's average lookup time?", options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"] }, points: 100, correctAnswer: "O(1)" },
    { id: "algo-7", type: "written", data: { question: "Explain the difference between BFS and DFS." }, points: 200, correctAnswer: "breadth first explores neighbors level depth first explores branch fully" },
    { id: "algo-8", type: "multiple_choice", data: { question: "Which algorithm finds the shortest path in a weighted graph?", options: ["BFS", "DFS", "Dijkstra's", "QuickSort"] }, points: 100, correctAnswer: "Dijkstra's" },
  ],
  python: [
    { id: "py-1", type: "multiple_choice", data: { question: "What is the output of `print(type([]))`?", options: ["<class 'tuple'>", "<class 'list'>", "<class 'array'>", "<class 'dict'>"] }, points: 100, correctAnswer: "<class 'list'>" },
    { id: "py-2", type: "multiple_choice", data: { question: "Which keyword is used to define a function in Python?", options: ["function", "def", "func", "define"] }, points: 100, correctAnswer: "def" },
    { id: "py-3", type: "multiple_choice", data: { question: "What does `len()` return for a string?", options: ["Memory size", "Number of characters", "Number of words", "Number of lines"] }, points: 100, correctAnswer: "Number of characters" },
    { id: "py-4", type: "coding_challenge", data: { question: "Write a Python function to check if a number is even.", code: "def is_even(n):\n    # Your code here" }, points: 200, correctAnswer: "return n % 2 == 0" },
    { id: "py-5", type: "multiple_choice", data: { question: "Which data type is immutable in Python?", options: ["List", "Dict", "Tuple", "Set"] }, points: 100, correctAnswer: "Tuple" },
    { id: "py-6", type: "multiple_choice", data: { question: "What is `pip` used for?", options: ["Package installer", "Python interpreter", "Code formatter", "Debugger"] }, points: 100, correctAnswer: "Package installer" },
    { id: "py-7", type: "written", data: { question: "Explain list comprehensions in Python." }, points: 200, correctAnswer: "concise way create lists applying expression iteration conditional" },
    { id: "py-8", type: "multiple_choice", data: { question: "What does the `with` statement do?", options: ["Imports modules", "Context manager for resource handling", "Creates a thread", "Defines a class"] }, points: 100, correctAnswer: "Context manager for resource handling" },
  ],
  html_css: [
    { id: "html-1", type: "multiple_choice", data: { question: "Which HTML tag is used for the largest heading?", options: ["<heading>", "<h1>", "<head>", "<h6>"] }, points: 100, correctAnswer: "<h1>" },
    { id: "html-2", type: "multiple_choice", data: { question: "Which CSS property changes the text color?", options: ["font-color", "color", "text-color", "foreground"] }, points: 100, correctAnswer: "color" },
    { id: "html-3", type: "multiple_choice", data: { question: "What does CSS stand for?", options: ["Computer Style Sheets", "Creative Style System", "Cascading Style Sheets", "Colorful Style Sheets"] }, points: 100, correctAnswer: "Cascading Style Sheets" },
    { id: "html-4", type: "coding_challenge", data: { question: "Write CSS to center a div horizontally.", code: "/* Your CSS here */\n.center {\n  \n}" }, points: 200, correctAnswer: "margin: 0 auto" },
    { id: "html-5", type: "multiple_choice", data: { question: "Which HTML attribute is used for inline CSS?", options: ["class", "id", "style", "css"] }, points: 100, correctAnswer: "style" },
    { id: "html-6", type: "multiple_choice", data: { question: "What does `display: flex` do?", options: ["Hides the element", "Creates a flex container", "Adds padding", "Changes font size"] }, points: 100, correctAnswer: "Creates a flex container" },
    { id: "html-7", type: "written", data: { question: "Explain the box model in CSS." }, points: 200, correctAnswer: "margin border padding content area around elements" },
    { id: "html-8", type: "multiple_choice", data: { question: "Which tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"] }, points: 100, correctAnswer: "<a>" },
  ],
  general: [
    { id: "gen-1", type: "multiple_choice", data: { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission Process", "High Tech Transfer Protocol"] }, points: 100, correctAnswer: "HyperText Transfer Protocol" },
    { id: "gen-2", type: "multiple_choice", data: { question: "What is a primary key in a database?", options: ["A key used for encryption", "A unique identifier for a record", "A foreign reference", "An index"] }, points: 100, correctAnswer: "A unique identifier for a record" },
    { id: "gen-3", type: "multiple_choice", data: { question: "What does API stand for?", options: ["Application Programming Interface", "Automated Program Integration", "Application Process Integration", "Advanced Programming Interface"] }, points: 100, correctAnswer: "Application Programming Interface" },
    { id: "gen-4", type: "coding_challenge", data: { question: "Write a function that returns 'Hello, World!'.", code: "function greet() {\n  // Your code here\n}" }, points: 200, correctAnswer: "return Hello World" },
    { id: "gen-5", type: "multiple_choice", data: { question: "Which protocol is used for secure web communication?", options: ["HTTP", "FTP", "HTTPS", "SMTP"] }, points: 100, correctAnswer: "HTTPS" },
    { id: "gen-6", type: "multiple_choice", data: { question: "What is Git used for?", options: ["Version control", "Database management", "Web hosting", "Code compilation"] }, points: 100, correctAnswer: "Version control" },
    { id: "gen-7", type: "written", data: { question: "Explain what REST APIs are." }, points: 200, correctAnswer: "representational state transfer architectural style stateless HTTP CRUD operations" },
    { id: "gen-8", type: "multiple_choice", data: { question: "What does JSON stand for?", options: ["JavaScript Object Notation", "Java Object Network", "JavaScript Online Notation", "Java Serialized Object Notation"] }, points: 100, correctAnswer: "JavaScript Object Notation" },
  ],
};
