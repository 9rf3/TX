import { useCallback, useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { DbCategory } from "@/lib/types";

export type Category = DbCategory;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const fetchedRef = useRef(false);

  const fetchCategories = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabaseRef.current
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (err) throw err;
      setCategories(data as Category[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch categories";
      console.error("Error fetching categories:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = async (name: string, slug: string) => {
    try {
      const { data, error: err } = await supabaseRef.current
        .from("categories")
        .insert([{ name, slug }])
        .select()
        .single();

      if (err) throw err;
      const created = data as Category;
      setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create category";
      console.error("Error creating category:", message);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: { name?: string; slug?: string }) => {
    try {
      const { data, error: err } = await supabaseRef.current
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;
      const updated = data as Category;
      setCategories(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update category";
      console.error("Error updating category:", message);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error: err } = await supabaseRef.current
        .from("categories")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete category";
      console.error("Error deleting category:", message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories, fetchCategories, createCategory,
    updateCategory, deleteCategory, isLoading, error
  };
}
