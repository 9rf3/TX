import { User, Course, Lesson, Quiz, Achievement, LeaderboardEntry, Friend, ActivityItem, DailyChallenge, ChatSession, WeeklyStats, MonthlyStats, AdminStats } from './types';

export const currentUser: User = {
  id: '1', name: 'Alex Morgan', username: 'alexm', email: 'alex@twokax.com',
  avatar: '/avatars/alex.jpg', level: 24, xp: 23450, xpToNext: 24000,
  rank: 5, streak: 14, badges: [
    { id: '1', title: 'Early Adopter', icon: '🌟', color: '#f59e0b' },
    { id: '2', title: 'Code Master', icon: '💻', color: '#8b5cf6' },
    { id: '3', title: 'Streak King', icon: '🔥', color: '#ef4444' },
  ],
  completedCourses: 12, totalCourses: 18, joinedAt: '2025-09-15', isOnline: true, role: 'student',
};

const instructors = [
  { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', title: 'Senior Engineer @ Google', bio: 'Full-stack developer with 10+ years of experience.', rating: 4.9, students: 45200, courses: 8 },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', title: 'Design Lead @ Figma', bio: 'UI/UX designer passionate about beautiful interfaces.', rating: 4.8, students: 32100, courses: 5 },
  { id: '3', name: 'Dr. Emily Park', avatar: '/avatars/emily.jpg', title: 'AI Researcher @ DeepMind', bio: 'PhD in Machine Learning, passionate about teaching.', rating: 4.9, students: 28400, courses: 6 },
];

const makeLessons = (count: number, prefix: string): Lesson[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`, title: `Lesson ${i + 1}: ${['Introduction', 'Core Concepts', 'Advanced Patterns', 'State Management', 'API Integration', 'Testing', 'Deployment', 'Best Practices', 'Real Projects', 'Final Review'][i % 10]}`,
    description: 'Deep dive into this topic with hands-on examples.', duration: `${15 + Math.floor(Math.random() * 30)}min`,
    videoUrl: '', order: i + 1, isCompleted: i < Math.floor(count * 0.4), isLocked: i > Math.floor(count * 0.5),
    xpReward: 50 + Math.floor(Math.random() * 50), type: i % 4 === 3 ? 'quiz' : i % 5 === 4 ? 'project' : 'video',
  }));

export const courses: Course[] = [
  { id: '1', title: 'React — Complete Masterclass', description: 'Learn React from zero to hero. Hooks, Context, Redux, Next.js and more.', category: 'development', thumbnail: '', gradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', instructor: instructors[0], lessons: makeLessons(42, 'react'), totalLessons: 42, completedLessons: 16, duration: '28h', xpReward: 2500, rating: 4.9, students: 15420, price: 'free', level: 'intermediate', tags: ['React', 'JavaScript', 'Frontend'], achievements: [] },
  { id: '2', title: 'UI/UX Design with Figma', description: 'Create stunning modern interfaces. Prototyping, design systems, animations.', category: 'design', thumbnail: '', gradient: 'linear-gradient(135deg, #fd79a8, #e84393)', instructor: instructors[1], lessons: makeLessons(35, 'figma'), totalLessons: 35, completedLessons: 35, duration: '22h', xpReward: 2000, rating: 4.8, students: 12300, price: 29.99, level: 'beginner', tags: ['Figma', 'UI/UX', 'Design'], achievements: [] },
  { id: '3', title: 'Python for Data Science', description: 'Data analysis, ML, visualization with NumPy, Pandas and Scikit-learn.', category: 'data-science', thumbnail: '', gradient: 'linear-gradient(135deg, #00cec9, #0984e3)', instructor: instructors[2], lessons: makeLessons(56, 'python'), totalLessons: 56, completedLessons: 8, duration: '36h', xpReward: 3000, rating: 4.9, students: 18900, price: 34.99, level: 'intermediate', tags: ['Python', 'ML', 'Data'], achievements: [] },
  { id: '4', title: 'Advanced JavaScript', description: 'Closures, promises, async/await, design patterns and app architecture.', category: 'development', thumbnail: '', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)', instructor: instructors[0], lessons: makeLessons(38, 'js'), totalLessons: 38, completedLessons: 0, duration: '25h', xpReward: 2200, rating: 4.7, students: 9800, price: 19.99, level: 'advanced', tags: ['JavaScript', 'ES6+', 'Patterns'], achievements: [] },
  { id: '5', title: 'AI & Machine Learning', description: 'Build intelligent systems with TensorFlow, PyTorch and modern AI tools.', category: 'ai', thumbnail: '', gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', instructor: instructors[2], lessons: makeLessons(48, 'ai'), totalLessons: 48, completedLessons: 0, duration: '32h', xpReward: 3500, rating: 4.9, students: 22100, price: 49.99, level: 'advanced', tags: ['AI', 'ML', 'Deep Learning'], achievements: [] },
  { id: '6', title: 'Node.js & Express', description: 'Backend development with JavaScript. REST APIs, databases, authentication.', category: 'development', thumbnail: '', gradient: 'linear-gradient(135deg, #55efc4, #00b894)', instructor: instructors[0], lessons: makeLessons(44, 'node'), totalLessons: 44, completedLessons: 44, duration: '30h', xpReward: 2800, rating: 4.8, students: 11200, price: 'free', level: 'intermediate', tags: ['Node.js', 'Express', 'Backend'], achievements: [] },
];

export const achievements: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '👣', xpReward: 50, isUnlocked: true, progress: 1, maxProgress: 1, rarity: 'common' },
  { id: '2', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', xpReward: 200, isUnlocked: true, progress: 7, maxProgress: 7, rarity: 'rare' },
  { id: '3', title: 'Knowledge Seeker', description: 'Complete 10 courses', icon: '📚', xpReward: 500, isUnlocked: false, progress: 7, maxProgress: 10, rarity: 'epic' },
  { id: '4', title: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: '🎯', xpReward: 300, isUnlocked: true, progress: 5, maxProgress: 5, rarity: 'rare' },
  { id: '5', title: 'Social Butterfly', description: 'Add 20 friends', icon: '🦋', xpReward: 150, isUnlocked: false, progress: 12, maxProgress: 20, rarity: 'common' },
  { id: '6', title: 'Legend', description: 'Reach level 50', icon: '👑', xpReward: 2000, isUnlocked: false, progress: 24, maxProgress: 50, rarity: 'legendary' },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, user: { ...currentUser, id: '10', name: 'Emma Wilson', username: 'emmaw', level: 42, xp: 89200, rank: 1, streak: 45, avatar: '' } as User, xp: 89200, level: 42, streak: 45, change: 0 },
  { rank: 2, user: { ...currentUser, id: '11', name: 'James Liu', username: 'jamesl', level: 39, xp: 78400, rank: 2, streak: 32, avatar: '' } as User, xp: 78400, level: 39, streak: 32, change: 1 },
  { rank: 3, user: { ...currentUser, id: '12', name: 'Sofia Garcia', username: 'sofiag', level: 37, xp: 72100, rank: 3, streak: 28, avatar: '' } as User, xp: 72100, level: 37, streak: 28, change: -1 },
  { rank: 4, user: { ...currentUser, id: '13', name: 'Ryan Park', username: 'ryanp', level: 35, xp: 65800, rank: 4, streak: 21, avatar: '' } as User, xp: 65800, level: 35, streak: 21, change: 2 },
  { rank: 5, user: { ...currentUser, name: 'Alex Morgan', rank: 5 }, xp: 23450, level: 24, streak: 14, change: 0 },
  { rank: 6, user: { ...currentUser, id: '14', name: 'Mia Chen', username: 'miac', level: 22, xp: 21200, rank: 6, streak: 19, avatar: '' } as User, xp: 21200, level: 22, streak: 19, change: -2 },
  { rank: 7, user: { ...currentUser, id: '15', name: 'Noah Kim', username: 'noahk', level: 20, xp: 19800, rank: 7, streak: 11, avatar: '' } as User, xp: 19800, level: 20, streak: 11, change: 1 },
  { rank: 8, user: { ...currentUser, id: '16', name: 'Ava Brown', username: 'avab', level: 18, xp: 17500, rank: 8, streak: 8, avatar: '' } as User, xp: 17500, level: 18, streak: 8, change: 0 },
];

export const friends: Friend[] = [
  { user: { ...currentUser, id: '20', name: 'Liam Taylor', username: 'liamt', level: 28, xp: 27800, isOnline: true, avatar: '' } as User, status: 'online', lastActivity: 'Studying React Masterclass', mutualFriends: 5 },
  { user: { ...currentUser, id: '21', name: 'Olivia Davis', username: 'oliviad', level: 31, xp: 31200, isOnline: true, avatar: '' } as User, status: 'online', lastActivity: 'Completed a quiz', mutualFriends: 3 },
  { user: { ...currentUser, id: '22', name: 'Ethan Moore', username: 'ethanm', level: 19, xp: 18400, isOnline: false, avatar: '' } as User, status: 'offline', lastActivity: '2h ago', mutualFriends: 8 },
  { user: { ...currentUser, id: '23', name: 'Isabella Clark', username: 'isabellac', level: 25, xp: 24600, isOnline: false, avatar: '' } as User, status: 'away', lastActivity: 'Watching AI lessons', mutualFriends: 2 },
  { user: { ...currentUser, id: '24', name: 'Mason Lee', username: 'masonl', level: 33, xp: 33100, isOnline: true, avatar: '' } as User, status: 'online', lastActivity: 'In a study group', mutualFriends: 6 },
];

export const activityFeed: ActivityItem[] = [
  { id: '1', user: friends[0].user, action: 'completed', target: 'React Masterclass - Lesson 15', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'course_complete' },
  { id: '2', user: friends[1].user, action: 'earned', target: 'Quiz Master badge', timestamp: new Date(Date.now() - 1200000).toISOString(), type: 'achievement' },
  { id: '3', user: friends[4].user, action: 'reached', target: 'Level 33', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'level_up' },
  { id: '4', user: friends[2].user, action: 'started', target: '15-day streak 🔥', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'streak' },
  { id: '5', user: friends[3].user, action: 'scored 95% on', target: 'Python Quiz #3', timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'quiz' },
];

export const dailyChallenges: DailyChallenge[] = [
  { id: '1', title: 'Complete 3 Lessons', description: 'Finish any 3 lessons today', xpReward: 150, progress: 2, maxProgress: 3, icon: '📖', isCompleted: false },
  { id: '2', title: 'Quiz Streak', description: 'Pass 2 quizzes in a row', xpReward: 200, progress: 1, maxProgress: 2, icon: '🎯', isCompleted: false },
  { id: '3', title: 'Social Star', description: 'Send 5 messages to friends', xpReward: 100, progress: 5, maxProgress: 5, icon: '💬', isCompleted: true },
];

export const chatSessions: ChatSession[] = [
  { id: '1', title: 'Help with React Hooks', messages: [
    { id: '1', content: 'Can you explain useEffect cleanup functions?', role: 'user', timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: '2', content: 'Of course! The cleanup function in useEffect runs before the component unmounts or before the effect re-runs. It\'s used for cleaning up subscriptions, timers, or event listeners.\n\n```javascript\nuseEffect(() => {\n  const timer = setInterval(() => {\n    console.log("tick");\n  }, 1000);\n\n  return () => clearInterval(timer);\n}, []);\n```\n\nThis prevents memory leaks in your application.', role: 'assistant', timestamp: new Date(Date.now() - 55000).toISOString() },
  ], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', title: 'Python Data Structures', messages: [], createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', title: 'CSS Grid vs Flexbox', messages: [], createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export const quizData: Quiz = {
  id: '1', title: 'React Fundamentals Quiz', courseId: '1',
  questions: [
    { id: '1', text: 'What hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctIndex: 1, explanation: 'useState is the primary hook for managing local state in functional components.' },
    { id: '2', text: 'What does JSX stand for?', options: ['JavaScript XML', 'JavaScript Extension', 'Java Syntax XML', 'JSON XML'], correctIndex: 0, explanation: 'JSX stands for JavaScript XML, a syntax extension for JavaScript.' },
    { id: '3', text: 'Which method is used to update state?', options: ['this.state = {}', 'setState()', 'The setter from useState', 'updateState()'], correctIndex: 2, explanation: 'In functional components, the setter function from useState is used to update state.' },
    { id: '4', text: 'What is the virtual DOM?', options: ['A direct copy of the real DOM', 'A lightweight JS representation of the DOM', 'A browser API', 'A CSS framework'], correctIndex: 1, explanation: 'The virtual DOM is a lightweight JavaScript representation used for efficient updates.' },
    { id: '5', text: 'How do you pass data from parent to child?', options: ['State', 'Props', 'Context', 'Refs'], correctIndex: 1, explanation: 'Props (properties) are used to pass data from parent to child components.' },
  ],
  timeLimit: 300, xpReward: 500, passingScore: 60,
};

export const weeklyStats: WeeklyStats[] = [
  { day: 'Mon', xp: 450, lessons: 3 }, { day: 'Tue', xp: 320, lessons: 2 },
  { day: 'Wed', xp: 580, lessons: 4 }, { day: 'Thu', xp: 200, lessons: 1 },
  { day: 'Fri', xp: 690, lessons: 5 }, { day: 'Sat', xp: 410, lessons: 3 },
  { day: 'Sun', xp: 550, lessons: 4 },
];

export const monthlyStats: MonthlyStats[] = [
  { month: 'Jan', users: 1200, revenue: 12400, courses: 15 },
  { month: 'Feb', users: 1800, revenue: 18200, courses: 18 },
  { month: 'Mar', users: 2400, revenue: 24800, courses: 22 },
  { month: 'Apr', users: 3100, revenue: 31500, courses: 25 },
  { month: 'May', users: 4200, revenue: 42100, courses: 30 },
  { month: 'Jun', users: 5800, revenue: 58400, courses: 35 },
];

export const adminStats: AdminStats = {
  totalUsers: 15420, activeUsers: 8930, totalCourses: 156, totalRevenue: 284500,
  userGrowth: 12.5, courseGrowth: 8.3, revenueGrowth: 23.1, engagementRate: 78.4,
};

export const suggestedPrompts = [
  'Explain React hooks in simple terms',
  'How do I center a div with CSS?',
  'What is the difference between let and const?',
  'Help me understand async/await',
  'Best practices for API design',
  'How does machine learning work?',
];
