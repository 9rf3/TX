"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Target, Plus, Check, X, Zap, ChevronRight, Flag } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
}

const defaultGoals: Goal[] = [
  { id: '1', title: 'Complete lessons today', target: 2, progress: 0, unit: 'lessons' },
  { id: '2', title: 'Earn XP today', target: 300, progress: 0, unit: 'XP' },
  { id: '3', title: 'Maintain streak', target: 7, progress: 1, unit: 'days' },
];

export function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, {
      id: Date.now().toString(),
      title: newGoal.trim(),
      target: 1,
      progress: 0,
      unit: 'tasks',
    }]);
    setNewGoal('');
    setIsAdding(false);
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-green" /> Daily Goals
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm text-primary-light hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add goal
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <Card className="border-primary/30 p-3">
              <div className="flex gap-2">
                <input
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="e.g. Finish 2 lessons..."
                  onKeyDown={e => e.key === 'Enter' && addGoal()}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
                  autoFocus
                />
                <button onClick={addGoal} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setIsAdding(false); setNewGoal(''); }} className="p-2 rounded-lg hover:bg-white/5 text-muted transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {goals.map((goal, i) => {
          const pct = goal.target > 0 ? Math.min((goal.progress / goal.target) * 100, 100) : 0;
          const done = pct >= 100;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`p-3 ${done ? 'opacity-60' : ''} group`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    done ? 'bg-accent-green/10 border border-accent-green/20' : 'bg-white/5 border border-white/10'
                  }`}>
                    {done ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <Flag className="w-4 h-4 text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium truncate ${done ? 'line-through text-muted' : ''}`}>
                        {goal.title}
                      </span>
                      {done && (
                        <div className="flex items-center gap-1 text-[10px] text-accent-green font-semibold">
                          <Zap className="w-3 h-3" />+50
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <Progress
                        value={goal.progress}
                        max={goal.target}
                        size="sm"
                        color={done ? "green" : i === 0 ? "orange" : "primary"}
                        showLabel
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-accent-red hover:bg-accent-red/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
