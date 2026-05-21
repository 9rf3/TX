"use client";
import { useState, useCallback, useMemo, memo } from "react";
import { ShoppingBag, Coins, Sparkles, Frame, Star, Image, Palette, Wand2, BadgeCheck } from "lucide-react";
import { GamePanel, PanelHeader } from "@/components/ui/GamePanel";
import { cn, formatNumber, getRarityColor } from "@/lib/utils";
import type { ShopItem, GamificationProfile } from "@/lib/types";

const typeLabels: Record<string, string> = {
  avatar_frame: "Frames", profile_banner: "Banners", profile_theme: "Themes",
  profile_accent: "Accents", avatar: "Avatars", effect: "Effects", badge: "Badges",
};

interface PremiumProfileShopProps {
  profile: GamificationProfile | null;
  items: ShopItem[];
  inventory: { id: string; item_id: string; is_equipped: boolean }[];
  onPurchase: (itemId: string) => Promise<void>;
  onEquip: (itemId: string) => Promise<void>;
  onRefresh: () => void;
}

export const PremiumProfileShop = memo(function PremiumProfileShop({
  profile, items, inventory, onPurchase, onEquip, onRefresh,
}: PremiumProfileShopProps) {
  const [category, setCategory] = useState<string>("all");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const ownedIds = new Set(inventory.map(i => i.item_id));
  const equippedIds = new Set(inventory.filter(i => i.is_equipped).map(i => i.item_id));
  const coinBalance = profile?.tx_coins ?? 0;

  const types = ["all", ...new Set(items.map(i => i.item_type))];

  const filtered = useMemo(
    () => category === "all" ? items : items.filter(i => i.item_type === category),
    [category, items]
  );

  const canAfford = useCallback((item: ShopItem) => {
    if (!profile) return false;
    if (profile.level < item.level_requirement) return false;
    if (coinBalance < item.price_coins) return false;
    return true;
  }, [profile, coinBalance]);

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId);
    try {
      await onPurchase(itemId);
      onRefresh();
    } catch {
      // handled by parent
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      await onEquip(itemId);
      onRefresh();
    } catch {
      // handled by parent
    }
  };

  if (items.length === 0) return null;

  return (
    <GamePanel>
      <PanelHeader
        icon={<ShoppingBag className="h-4 w-4" />}
        title="Profile Shop"
        action={
          <span className="flex items-center gap-1 text-xs font-black text-accent-orange">
            <Coins className="h-3.5 w-3.5" /> {formatNumber(coinBalance)} TX
          </span>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {types.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-[8px] border px-3 py-1.5 text-xs font-bold capitalize transition cursor-pointer",
              category === cat
                ? "border-primary/40 bg-primary/15 text-primary-light"
                : "border-white/10 bg-white/5 text-muted-light hover:text-white hover:border-white/20"
            )}
          >
            {cat === "all" ? "All" : typeLabels[cat] || cat}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const isOwned = ownedIds.has(item.id);
          const isEquipped = equippedIds.has(item.id);
          const affordable = canAfford(item);

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-[8px] border border-white/10 bg-black/18 p-4 transition hover:border-primary/30",
                isEquipped && "border-accent-green/25 bg-accent-green/5"
              )}
            >
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-[8px] border border-white/10 text-2xl bg-white/[0.03]"
                style={item.preview_url?.startsWith("linear-gradient") ? { background: item.preview_url } : undefined}
              >
                <Frame className="h-6 w-6 text-muted-light" />
              </div>
              <div className="text-sm font-black text-white">{item.name}</div>
              {item.description && (
                <div className="mt-1 text-xs text-muted-light">{item.description}</div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-black" style={{ color: getRarityColor(item.rarity) }}>
                  {item.rarity}
                </span>
                <span className="text-white/15">•</span>
                <span className="text-xs font-black text-accent-orange">{item.price_coins} TX</span>
              </div>
              {item.level_requirement > 1 && !isOwned && (
                <div className="text-[9px] text-muted-light mt-1">Requires Lv.{item.level_requirement}</div>
              )}
              <button
                onClick={() => isOwned ? handleEquip(item.id) : handlePurchase(item.id)}
                disabled={(!isOwned && !affordable) || purchasing === item.id}
                className={cn(
                  "mt-3 w-full rounded-[8px] border py-2 text-xs font-black transition cursor-pointer",
                  isOwned
                    ? isEquipped
                      ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                      : "border-primary/35 bg-primary/12 text-primary-light hover:bg-primary/22"
                    : affordable
                      ? "border-primary/35 bg-primary/12 text-primary-light hover:bg-primary/22"
                      : "border-white/10 bg-white/5 text-muted cursor-not-allowed"
                )}
              >
                {purchasing === item.id ? "..." :
                 isOwned ? (isEquipped ? "✓ Equipped" : "Equip") :
                 affordable ? `Buy for ${item.price_coins} TX` : "Not enough TX"}
              </button>
            </div>
          );
        })}
      </div>
    </GamePanel>
  );
});
