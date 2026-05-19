"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Trophy, Zap, Swords, ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'tournament' | 'challenge' | 'event';
  startsAt: string;
  endsAt: string;
  reward: number;
  participants: number;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekend XP Rush',
    description: 'Earn 2x XP on all lessons this weekend',
    type: 'event',
    startsAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    endsAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    reward: 2000,
    participants: 47,
  },
];

export function ActiveEvents() {
  const [events] = useState<Event[]>(mockEvents);
  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      const result: Record<string, string> = {};
      events.forEach(e => {
        const diff = new Date(e.startsAt).getTime() - Date.now();
        if (diff > 0) {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          result[e.id] = `Starts in ${d}d ${h}h`;
        } else {
          const end = new Date(e.endsAt).getTime() - Date.now();
          if (end > 0) {
            const d = Math.floor(end / 86400000);
            const h = Math.floor((end % 86400000) / 3600000);
            result[e.id] = `${d}d ${h}h remaining`;
          } else {
            result[e.id] = 'Ended';
          }
        }
      });
      setTimeLeft(result);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Swords className="w-5 h-5 text-accent-pink" /> Live Events
      </h2>
      {events.map(event => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="relative overflow-hidden border-accent-pink/20">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 to-primary/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/5 rounded-full blur-3xl" />
            <div className="relative z-10 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-pink/10 border border-accent-pink/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-accent-pink" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{event.title}</h3>
                    <Badge variant="primary" size="sm">LIVE</Badge>
                  </div>
                  <p className="text-xs text-muted">{event.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted">
                      <Clock className="w-3 h-3" />
                      {timeLeft[event.id] || 'Loading...'}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted">
                      <Calendar className="w-3 h-3" />
                      {event.participants} joined
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-light font-medium">
                      <Zap className="w-3 h-3" />
                      +{event.reward} XP
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="shrink-0">
                  Join <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
