"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Target, Plus, Check, X, Zap, ChevronRight, Flag, Flame, Trash } from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

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
  const { playClick, playAchievement, playRewardClaim } = useSound();
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (!newGoal.trim()) return;
    playClick();
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
    playClick();
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleIncrement = (id: string) => {
    playClick();
    setGoals(prev =>
      prev.map(g => {
        if (g.id === id) {
          const nextProgress = Math.min(g.progress + 1, g.target);
          if (nextProgress >= g.target && g.progress < g.target) {
            // goal completed sound
            setTimeout(() => playRewardClaim(), 150);
          }
          return { ...g, progress: nextProgress };
        }
        return g;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent-green/15 border border-accent-green/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">Objectives Tracker</h2>
            <p className="text-[10px] text-muted-light">Complete active operations to earn bonus XP</p>
          </div>
        </div>

        <button
          onClick={() => { playClick(); setIsAdding(!isAdding); }}
          className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-1 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Objective
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
            <Card className="border-primary/30 p-3.5 bg-gradient-to-r from-surface to-surface-light">
              <div className="flex gap-2">
                <input
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="e.g. Finish 2 lessons..."
                  onKeyDown={e => e.key === 'Enter' && addGoal()}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground focus:outline-none focus:border-primary/50"
                  autoFocus
                />
                <button onClick={addGoal} className="p-2.5 rounded-xl bg-primary/10 text-primary-light hover:bg-primary border border-primary/20 hover:text-white transition-all cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { playClick(); setIsAdding(false); setNewGoal(''); }} className="p-2.5 rounded-xl hover:bg-white/5 text-muted transition-all cursor-pointer">
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
              <Card className={`p-4 group relative overflow-hidden bg-gradient-to-r from-surface to-surface-light hover:border-accent-green/30 transition duration-300 ${done ? 'opacity-55' : ''}`}>
                <div className="flex items-center gap-3 relative z-10">
                  {/* Custom Checkbox Action */}
                  <div
                    onClick={() => !done && handleIncrement(goal.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
                      done
                        ? 'bg-accent-green/10 border border-accent-green/20'
                        : 'bg-white/5 border border-white/10 hover:border-accent-green/50 hover:bg-accent-green/5'
                    }`}
                  >
                    {done ? (
                      <Check className="w-4 h-4 text-accent-green" />
                    ) : (
                      <span className="text-[10px] font-black text-muted-light group-hover:text-accent-green">+{goal.progress}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black truncate text-white ${done ? 'line-through text-muted-light' : ''}`}>
                        {goal.title}
                      </span>
                      {done && (
                        <div className="flex items-center gap-1 text-[10px] text-accent-green font-bold bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3 text-accent-green animate-bounce" />+50 XP
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5">
                      <Progress
                        value={goal.progress}
                        max={goal.target}
                        size="sm"
                        color={done ? "green" : i === 0 ? "orange" : "primary"}
                        showLabel
                      />
                    </div>
                  </div>

                  {/* Remove Goal Button */}
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-accent-red hover:bg-accent-red/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                  >
                    <Trash className="w-3.5 h-3.5" />
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
