"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, Upload, Check, Palette, Image,
  MapPin, GraduationCap, Target, GitBranch, Save,
  X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRESET_AVATARS } from "@/lib/types";
import type { GamificationProfile } from "@/lib/types";

interface ProfileIdentityProps {
  profile: GamificationProfile | null;
  onSelectAvatar: (avatarId: string) => Promise<void>;
  onUploadAvatar: (formData: FormData) => Promise<{ url: string }>;
  onUploadBanner: (formData: FormData) => Promise<{ url: string }>;
  onUpdateProfile: (data: Record<string, unknown>) => Promise<void>;
  onRefresh: () => void;
}

const FOCUS_OPTIONS = ['Frontend', 'Backend', 'AI/ML', 'Data Science', 'DevOps', 'Mobile', 'Blockchain', 'Design', 'Game Dev', 'Cybersecurity'];

export function ProfileIdentity({
  profile, onSelectAvatar, onUploadAvatar, onUpdateProfile, onRefresh,
}: ProfileIdentityProps) {
  const [tab, setTab] = useState<'avatar' | 'profile'>('avatar');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [githubUsername, setGithubUsername] = useState(profile?.github_username || '');
  const [focusAreas, setFocusAreas] = useState<string[]>(profile?.focus_areas || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = profile?.selected_avatar || profile?.avatar_url;

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await onUploadAvatar(fd);
      onRefresh();
    } catch {
      // handled by parent
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        display_name: displayName,
        bio,
        country,
        university,
        github_username: githubUsername,
        focus_areas: focusAreas,
      });
      onRefresh();
    } catch {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };

  const toggleFocus = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area],
    );
  };

  const presetAvatars = PRESET_AVATARS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        Identity & Customization
      </h2>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-white/5 w-fit">
        {(['avatar', 'profile'] as const).map(t => (
          <motion.button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-medium transition-all",
              tab === t ? "bg-primary text-white" : "text-muted-light hover:text-white",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t === 'avatar' ? 'Avatar & Banner' : 'Profile Info'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'avatar' ? (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-5"
          >
            {/* Current avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt=""
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30">
                    <User className="w-8 h-8 text-muted-light" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
                >
                  {uploading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
              </div>
              <div>
                <div className="text-sm font-semibold">Custom Avatar</div>
                <div className="text-[10px] text-muted">Upload your own image</div>
              </div>
            </div>

            {/* Preset avatars */}
            <div>
              <div className="text-xs font-semibold mb-3 text-muted-light">Preset Avatars</div>
              <div className="grid grid-cols-5 gap-2">
                {presetAvatars.map(av => (
                  <motion.button
                    key={av.id}
                    onClick={() => onSelectAvatar(av.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative rounded-xl border-2 p-2 transition-all",
                      currentAvatar === av.id
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-white/5 hover:bg-white/10",
                    )}
                  >
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-white/60" />
                    </div>
                    <div className="text-[8px] text-center mt-1 truncate text-muted-light">{av.name}</div>
                    {currentAvatar === av.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Display Name */}
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block">Display Name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary/50 focus:outline-none transition-colors"
                placeholder="Your display name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary/50 focus:outline-none transition-colors resize-none"
                placeholder="Tell the world about yourself..."
              />
            </div>

            {/* Country & University */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Country
                </label>
                <input
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="Your country"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> University
                </label>
                <input
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="Your university"
                />
              </div>
            </div>

            {/* GitHub */}
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> GitHub Username
              </label>
              <input
                value={githubUsername}
                onChange={e => setGithubUsername(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted focus:border-primary/50 focus:outline-none transition-colors"
                placeholder="your-github-username"
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="text-[10px] text-muted uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Target className="w-3 h-3" /> Focus Areas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_OPTIONS.map(area => (
                  <motion.button
                    key={area}
                    onClick={() => toggleFocus(area)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border",
                      focusAreas.includes(area)
                        ? "bg-primary/20 border-primary/30 text-primary-light"
                        : "bg-white/5 border-border text-muted-light hover:bg-white/10",
                    )}
                  >
                    {area}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Save */}
            <motion.button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
