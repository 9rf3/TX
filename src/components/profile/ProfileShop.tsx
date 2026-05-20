"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Sparkles, Lock, Check, Star, Zap,
  EqualApproximately, Crown, Frame, Palette, Image,
  BadgeCheck, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_COLORS, RARITY_GLOWS } from "@/lib/types";
import type { ShopItem, UserInventoryItem, GamificationProfile } from "@/lib/types";

const typeIcons: Record<string, typeof Frame> = {
  avatar_frame: Frame, profile_banner: Image, profile_theme: Palette,
  profile_accent: Palette, avatar: Star, effect: Wand2, badge: BadgeCheck,
};

const typeLabels: Record<string, string> = {
  avatar_frame: 'Avatar Frames', profile_banner: 'Banners', profile_theme: 'Themes',
  profile_accent: 'Accents', avatar: 'Avatars', effect: 'Effects', badge: 'Badges',
};

interface ProfileShopProps {
  profile: GamificationProfile | null;
  items: ShopItem[];
  inventory: { id: string; item_id: string; is_equipped: boolean }[];
  onPurchase: (itemId: string) => Promise<void>;
  onEquip: (itemId: string) => Promise<void>;
  onRefresh: () => void;
}

export function ProfileShop({ profile, items, inventory, onPurchase, onEquip, onRefresh }: ProfileShopProps) {
  const [activeType, setActiveType] = useState<string>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const ownedIds = new Set(inventory.map(i => i.item_id));
  const equippedIds = new Set(inventory.filter(i => i.is_equipped).map(i => i.item_id));

  const types = ['all', ...new Set(items.map(i => i.item_type))];

  const filteredItems = activeType === 'all'
    ? items
    : items.filter(i => i.item_type === activeType);

  const canAfford = (item: ShopItem) => {
    if (!profile) return false;
    if (profile.level < item.level_requirement) return false;
    if (profile.tx_coins < item.price_coins) return false;
    if (profile.xp < item.price_xp) return false;
    return true;
  };

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    try {
      await onPurchase(itemId);
      setShowConfirm(null);
      onRefresh();
    } catch {
      // Error handled by parent
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      await onEquip(itemId);
      onRefresh();
    } catch {
      // Error handled by parent
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-accent-pink" />
          Profile Shop
        </h2>
        {profile && (
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              {profile.tx_coins.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {types.map(type => (
          <motion.button
            key={type}
            onClick={() => setActiveType(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200",
              activeType === type
                ? "bg-primary text-white"
                : "bg-white/5 text-muted-light hover:bg-white/10",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {type === 'all' ? 'All' : typeLabels[type] || type}
          </motion.button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredItems.map((item, i) => {
          const isOwned = ownedIds.has(item.id);
          const isEquipped = equippedIds.has(item.id);
          const affordable = canAfford(item);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "relative rounded-xl border p-3 transition-all duration-300 group",
                RARITY_COLORS[item.rarity] || 'border-white/10 bg-white/[0.02]',
                isEquipped && 'ring-2 ring-primary',
              )}
              style={{
                boxShadow: isEquipped ? RARITY_GLOWS[item.rarity] || 'none' : 'none',
              }}
            >
              {/* Rarity glow on hover */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse at center, ${item.rarity === 'legendary' ? 'rgba(250,204,21,0.1)' : item.rarity === 'epic' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)'}, transparent)`,
                }}
              />

              {/* Equipped badge */}
              {isEquipped && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Item icon */}
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
                <div className={cn(
                  "w-5 h-5",
                  item.rarity === 'legendary' ? 'text-yellow-400' :
                  item.rarity === 'epic' ? 'text-purple-400' :
                  item.rarity === 'rare' ? 'text-blue-400' :
                  'text-slate-400'
                )}>
                  {typeIcons[item.item_type] ? (
                    <Frame className="w-5 h-5" />
                  ) : (
                    <Star className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="text-xs font-semibold truncate">{item.name}</div>
              <div className="text-[9px] text-muted uppercase tracking-wider mb-2">{item.rarity}</div>

              {/* Price / Action */}
              {isOwned ? (
                <motion.button
                  onClick={() => handleEquip(item.id)}
                  className={cn(
                    "w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all",
                    isEquipped
                      ? "bg-primary/20 text-primary-light"
                      : "bg-white/5 text-muted-light hover:bg-white/10",
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isEquipped ? 'Equipped' : 'Equip'}
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowConfirm(item.id)}
                  disabled={!affordable || purchasing === item.id}
                  className={cn(
                    "w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1",
                    affordable
                      ? "bg-primary/20 text-primary-light hover:bg-primary/30"
                      : "bg-white/5 text-muted/50 cursor-not-allowed",
                  )}
                  whileHover={affordable ? { scale: 1.02 } : {}}
                  whileTap={affordable ? { scale: 0.98 } : {}}
                >
                  {purchasing === item.id ? (
                    <div className="w-3 h-3 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      {item.price_coins > 0 && `${item.price_coins}`}
                      {item.price_xp > 0 && ` + ${item.price_xp}XP`}
                    </>
                  )}
                </motion.button>
              )}

              {/* Level requirement */}
              {!isOwned && item.level_requirement > 1 && (
                <div className="text-[8px] text-muted text-center mt-1">
                  Lvl {item.level_requirement}+
                </div>
              )}

              {/* Purchase confirmation */}
              <AnimatePresence>
                {showConfirm === item.id && !isOwned && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 rounded-xl bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 z-10"
                  >
                    <p className="text-xs font-semibold mb-2">Purchase {item.name}?</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-light mb-3">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      {item.price_coins} Coins
                      {item.price_xp > 0 && ` + ${item.price_xp} XP`}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setShowConfirm(null)}
                        className="px-3 py-1 rounded-lg text-[10px] bg-white/10 text-muted-light"
                        whileHover={{ scale: 1.02 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => handlePurchase(item.id)}
                        disabled={purchasing === item.id}
                        className="px-3 py-1 rounded-lg text-[10px] bg-primary text-white font-semibold"
                        whileHover={{ scale: 1.02 }}
                      >
                        {purchasing === item.id ? 'Buying...' : 'Buy'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <ShoppingBag className="w-8 h-8 text-muted/30 mx-auto mb-2" />
          <p className="text-xs text-muted-light">No items in this category</p>
        </div>
      )}
    </motion.div>
  );
}
