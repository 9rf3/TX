import { useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { DbCourseModule } from "@/lib/types";

export type CourseModule = DbCourseModule;

export function useModules(courseId?: string) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchModules = useCallback(async (cId?: string) => {
    const targetCourseId = cId || courseId;
    if (!targetCourseId) return;

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", targetCourseId)
        .order("order_index", { ascending: true });

      if (err) throw err;
      setModules(data as CourseModule[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch modules";
      console.error("Error fetching modules:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, supabase]);

  const createModule = async (moduleData: Partial<CourseModule> & { course_id?: string }) => {
    try {
      const { data, error: err } = await supabase
        .from("course_modules")
        .insert([{
          ...moduleData,
          course_id: moduleData.course_id || courseId
        }])
        .select()
        .single();

      if (err) throw err;
      const created = data as CourseModule;
      setModules(prev => [...prev, created].sort((a, b) => a.order_index - b.order_index));
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create module";
      console.error("Error creating module:", message);
      throw err;
    }
  };

  const updateModule = async (id: string, moduleData: Partial<CourseModule>) => {
    try {
      const { data, error: err } = await supabase
        .from("course_modules")
        .update({ ...moduleData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;
      const updated = data as CourseModule;
      setModules(prev => prev.map(m => m.id === id ? updated : m).sort((a, b) => a.order_index - b.order_index));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update module";
      console.error("Error updating module:", message);
      throw err;
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete module";
      console.error("Error deleting module:", message);
      throw err;
    }
  };

  const reorderModules = async (orderedModules: CourseModule[]) => {
    try {
      const updates = orderedModules.map((m, i) => ({
        id: m.id,
        order_index: i
      }));

      const { error: err } = await supabase
        .from("course_modules")
        .upsert(updates);

      if (err) throw err;
      setModules(orderedModules.map((m, i) => ({ ...m, order_index: i })));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reorder modules";
      console.error("Error reordering modules:", message);
      throw err;
    }
  };

  const resetModules = () => setModules([]);

  return {
    modules, fetchModules, createModule, updateModule, deleteModule,
    reorderModules, resetModules, isLoading, error
  };
}
