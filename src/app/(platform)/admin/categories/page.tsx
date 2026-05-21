"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { GamePanel } from "@/components/ui/GamePanel";
import { Button } from "@/components/ui/Button";
import { useCategories } from "@/lib/hooks/useCategories";
import { useRequireRole, ROLES } from "@/lib/role-utils";
import { Tags, Plus, Edit2, Trash2, X, Check } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function AdminCategoriesPage() {
  const { isAuthorized, isLoading: isRoleLoading } = useRequireRole([ROLES.ADMIN]);
  const { categories, createCategory, updateCategory, deleteCategory, isLoading } = useCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory(newName.trim(), slugify(newName));
      setNewName("");
      setIsAdding(false);
    } catch {
      alert("Failed to create category");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(id, { name: editName.trim(), slug: slugify(editName) });
      setEditingId(null);
      setEditName("");
    } catch {
      alert("Failed to update category");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Courses using it will lose this category.`)) return;
    try {
      await deleteCategory(id);
    } catch {
      alert("Failed to delete category");
    }
  };

  if (isRoleLoading || !isAuthorized) {
    return (
      <div className="relative min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <Tags className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-light text-sm">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-[#070b16] px-3 py-4 text-foreground sm:px-4 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_85%_16%,rgba(6,182,212,0.08),transparent_38%)]" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 max-w-4xl mx-auto space-y-6">
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Tags className="w-7 h-7 text-primary" /> Categories
            </h1>
            <p className="text-muted-light mt-1">Manage course categories</p>
          </div>
          <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-1" /> {isAdding ? "Cancel" : "Add Category"}
          </Button>
        </motion.div>

        {isAdding && (
          <motion.div variants={item}>
            <GamePanel className="border-primary/30 p-4">
              <div className="flex items-center gap-3">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Category name..."
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="flex-1 px-3 py-2 rounded-[8px] bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-muted"
                  autoFocus
                />
                <button onClick={handleCreate} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setIsAdding(false); setNewName(""); }} className="p-2 rounded-lg hover:bg-white/5 text-muted-light transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </GamePanel>
          </motion.div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-muted-light">Loading categories...</div>
        ) : categories.length === 0 ? (
          <motion.div variants={item}>
            <GamePanel className="text-center py-20 flex flex-col justify-center items-center">
              <Tags className="w-16 h-16 text-muted/30 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-white">No Categories Yet</h3>
              <p className="text-muted-light mt-2 max-w-md mx-auto text-sm">Create your first category to organize courses.</p>
            </GamePanel>
          </motion.div>
        ) : (
          <motion.div variants={item} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <GamePanel key={cat.id} className="flex items-center gap-3 p-4">
                {editingId === cat.id ? (
                  <>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                      className="flex-1 px-3 py-1.5 rounded-[8px] bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 text-white"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(cat.id)} className="p-1.5 rounded-lg text-primary-light hover:bg-primary/10 transition-colors cursor-pointer">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingId(null); setEditName(""); }} className="p-1.5 rounded-lg text-muted-light hover:bg-white/5 transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-primary/10 text-sm shrink-0 text-primary-light font-bold">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{cat.name}</div>
                      <div className="text-xs text-muted-light">/{cat.slug}</div>
                    </div>
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="p-1.5 rounded-lg text-muted-light hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg text-muted-light hover:text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </GamePanel>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
