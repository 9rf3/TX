"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { SkillNode } from "./SkillNode";
import { SkillDetailsPanel } from "./SkillDetailsPanel";
import type { SkillNodeWithProgress } from "@/lib/hooks/useSkillTree";

interface SkillTreeCanvasProps {
  skills: SkillNodeWithProgress[];
  availablePoints: number;
  userLevel: number;
  onInvest: (skillId: string) => Promise<{ xpRewarded: number; coinsRewarded: number } | undefined>;
}

export function SkillTreeCanvas({ skills, availablePoints, userLevel, onInvest }: SkillTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [investing, setInvesting] = useState(false);

  const gridSize = 200;
  const padding = 200;

  const minX = Math.min(...skills.map((s) => s.position_x)) * gridSize - padding;
  const maxX = Math.max(...skills.map((s) => s.position_x)) * gridSize + padding;
  const minY = Math.min(...skills.map((s) => s.position_y)) * gridSize - padding;
  const maxY = Math.max(...skills.map((s) => s.position_y)) * gridSize + padding;

  const canvasWidth = maxX - minX;
  const canvasHeight = maxY - minY;

  const selectedSkill = skills.find((s) => s.id === selectedId) || null;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setScale((prev) => Math.max(0.3, Math.min(2, prev * delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    },
    [isPanning, panStart]
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    const handleGlobalUp = () => setIsPanning(false);
    window.addEventListener("mouseup", handleGlobalUp);
    return () => window.removeEventListener("mouseup", handleGlobalUp);
  }, []);

  useEffect(() => {
    if (canvasWidth > 0 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const fitScale = Math.min(
        rect.width / (canvasWidth + padding * 2),
        rect.height / (canvasHeight + padding * 2),
        1.2
      );
      setScale(Math.min(fitScale, 1));
      setPosition({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, [canvasWidth, canvasHeight, skills.length]);

  const handleInvest = async (skillId: string) => {
    if (investing) return;
    setInvesting(true);
    try {
      const result = await onInvest(skillId);
      return result;
    } finally {
      setInvesting(false);
    }
  };

  const getNodeCenter = (skill: SkillNodeWithProgress) => {
    return {
      x: skill.position_x * gridSize,
      y: skill.position_y * gridSize,
    };
  };

  const connections = skills
    .filter((s) => s.parent_skill_id)
    .map((child) => {
      const parent = skills.find((s) => s.id === child.parent_skill_id);
      if (!parent) return null;
      const from = getNodeCenter(parent);
      const to = getNodeCenter(child);
      const midY = (from.y + to.y) / 2;
      const path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
      const isActive = child.isUnlocked && parent.isUnlocked;
      return { from: parent, to: child, path, isActive };
    })
    .filter(Boolean) as {
    from: SkillNodeWithProgress;
    to: SkillNodeWithProgress;
    path: string;
    isActive: boolean;
  }[];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Stats header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-muted">Available Points</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold gradient-text">{availablePoints}</span>
              <span className="text-xs text-muted">SP</span>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <span className="text-xs text-muted">Your Level</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{userLevel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {skills.filter((s) => s.isUnlocked).length}/{skills.length} skills unlocked
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setScale((s) => Math.min(2, s * 1.2))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-light hover:text-foreground transition-colors cursor-pointer text-xs"
            >
              +
            </button>
            <button
              onClick={() => setScale((s) => Math.max(0.3, s / 1.2))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-light hover:text-foreground transition-colors cursor-pointer text-xs"
            >
              -
            </button>
            <button
              onClick={() => {
                setScale(0.85);
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  setPosition({ x: rect.width / 2, y: rect.height / 2 });
                }
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-light hover:text-foreground transition-colors cursor-pointer text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-background via-[#0d0d1a] to-background"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        {/* Grid dots background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: `${40 * scale}px ${40 * scale}px`,
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />

        {/* Transform container */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* SVG Connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ left: minX, top: minY, width: canvasWidth, height: canvasHeight }}
          >
            <defs>
              <linearGradient id="line-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="line-mastered" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {connections.map((conn, i) => {
              const bothMastered = conn.from.isMaxed && conn.to.isMaxed;
              const bothActive = conn.from.isUnlocked && conn.to.isUnlocked;
              const oneActive = conn.from.isUnlocked || conn.to.isUnlocked;
              return (
                <g key={i}>
                  {/* Shadow */}
                  <path
                    d={conn.path}
                    fill="none"
                    stroke={bothMastered ? "#facc15" : bothActive ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)"}
                    strokeWidth={bothMastered ? 8 : 6}
                    style={{ filter: bothMastered ? "blur(4px)" : undefined }}
                  />
                  {/* Main line */}
                  <path
                    d={conn.path}
                    fill="none"
                    stroke={
                      bothMastered
                        ? "url(#line-mastered)"
                        : bothActive
                          ? "url(#line-active)"
                          : oneActive
                            ? "rgba(139,92,246,0.3)"
                            : "rgba(255,255,255,0.08)"
                    }
                    strokeWidth={bothMastered ? 3 : 2}
                    strokeLinecap="round"
                    strokeDasharray={bothActive ? "none" : "6 4"}
                    className={bothActive && !bothMastered ? "animate-dash-flow" : ""}
                    style={bothActive && !bothMastered ? { strokeDasharray: "4 4" } : undefined}
                  />
                  {/* Flow particles on active connections */}
                  {bothActive && (
                    <circle r="2.5" fill={bothMastered ? "#facc15" : "#8b5cf6"}>
                      <animateMotion
                        dur={bothMastered ? "1.5s" : "2s"}
                        repeatCount="indefinite"
                        path={conn.path}
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {skills.map((skill) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              onClick={() => setSelectedId(skill.id === selectedId ? null : skill.id)}
              isSelected={skill.id === selectedId}
              gridSize={gridSize}
            />
          ))}
        </div>

        {/* Empty state */}
        {skills.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🌳</div>
              <p className="text-muted">Skill tree is growing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Details panel */}
      <SkillDetailsPanel
        skill={selectedSkill}
        availablePoints={availablePoints}
        onInvest={handleInvest}
        onClose={() => setSelectedId(null)}
        investing={investing}
      />
    </div>
  );
}
