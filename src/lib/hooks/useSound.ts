"use client";
import { useCallback, useRef, useState } from "react";

const SOUND_ENABLED_KEY = 'tx_sound_enabled';

export function useSound() {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  });
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    if (!enabled) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported
    }
  }, [enabled, getContext]);

  const playXpGain = useCallback(() => {
    playTone(880, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.08), 75);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.12), i * 100);
    });
  }, [playTone]);

  const playAchievement = useCallback(() => {
    playTone(659, 0.15, 'triangle', 0.12);
    setTimeout(() => playTone(784, 0.15, 'triangle', 0.1), 100);
    setTimeout(() => playTone(1047, 0.3, 'triangle', 0.12), 200);
  }, [playTone]);

  const playRewardClaim = useCallback(() => {
    const notes = [659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine', 0.1), i * 60);
    });
  }, [playTone]);

  const playCoinReward = useCallback(() => {
    playTone(1319, 0.1, 'triangle', 0.08);
    setTimeout(() => playTone(1568, 0.15, 'triangle', 0.08), 80);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(600, 0.05, 'square', 0.03);
  }, [playTone]);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(SOUND_ENABLED_KEY, String(value));
  }, []);

  return {
    enabled, setEnabled,
    playXpGain, playLevelUp, playAchievement,
    playRewardClaim, playCoinReward, playClick,
  };
}
