"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
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
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
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
          <Card className="border-primary/30">
            <div className="flex items-center gap-3">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Category name..."
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
                autoFocus
              />
              <button onClick={handleCreate} className="p-2 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors cursor-pointer">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsAdding(false); setNewName(""); }} className="p-2 rounded-lg hover:bg-white/5 text-muted transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-muted">Loading categories...</div>
      ) : categories.length === 0 ? (
        <motion.div variants={item}>
          <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
            <Tags className="w-16 h-16 text-muted/30 mx-auto mb-4" />
            <h3 className="font-semibold text-xl text-foreground">No Categories Yet</h3>
            <p className="text-muted-light mt-2 max-w-md mx-auto">Create your first category to organize courses.</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex items-center gap-3">
              {editingId === cat.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(cat.id)} className="p-1.5 rounded-lg text-primary-light hover:bg-primary/10 transition-colors cursor-pointer">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditingId(null); setEditName(""); }} className="p-1.5 rounded-lg text-muted hover:bg-white/5 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm shrink-0">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cat.name}</div>
                    <div className="text-xs text-muted">/{cat.slug}</div>
                  </div>
                  <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
