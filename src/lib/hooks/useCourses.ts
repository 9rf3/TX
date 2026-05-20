import { useCallback, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { DbCourseWithInstructor } from "@/lib/types";

export type CourseData = DbCourseWithInstructor;

export function useCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sbRef = useRef(createClient());

  const fetchCourses = useCallback(async (includeUnpublished = false) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = sbRef.current
        .from("courses")
        .select("*, instructor:profiles(*)")
        .order("created_at", { ascending: false });

      if (!includeUnpublished) {
        query = query.eq("published", true);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setCourses(data as unknown as CourseData[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch courses";
      console.error("Error fetching courses:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCourse = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await sbRef.current
        .from("courses")
        .select("*, instructor:profiles(*)")
        .eq("id", id)
        .single();

      if (err) throw err;
      setCourse(data as unknown as CourseData);
      return data as unknown as CourseData;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch course";
      console.error("Error fetching course:", message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourse = async (courseData: Record<string, unknown>) => {
    setError(null);
    try {
      const { data: userData } = await sbRef.current.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error: err } = await sbRef.current
        .from("courses")
        .insert([{ ...courseData, created_by: userData.user.id }])
        .select("*, instructor:profiles(*)")
        .single();

      if (err) throw err;
      const created = data as unknown as CourseData;
      setCourses(prev => [created, ...prev]);
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create course";
      console.error("Error creating course:", message);
      setError(message);
      throw err;
    }
  };

  const updateCourse = async (id: string, courseData: Record<string, unknown>) => {
    setError(null);
    try {
      const { data, error: err } = await sbRef.current
        .from("courses")
        .update({ ...courseData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, instructor:profiles(*)")
        .single();

      if (err) throw err;
      const updated = data as unknown as CourseData;
      setCourses(prev => prev.map(c => c.id === id ? updated : c));
      setCourse(updated);
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update course";
      console.error("Error updating course:", message);
      setError(message);
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    setError(null);
    try {
      const { error: err } = await sbRef.current
        .from("courses")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setCourses(prev => prev.filter(c => c.id !== id));
      if (course?.id === id) setCourse(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete course";
      console.error("Error deleting course:", message);
      setError(message);
      throw err;
    }
  };

  return {
    courses, course, fetchCourses, fetchCourse,
    createCourse, updateCourse, deleteCourse,
    isLoading, error
  };
}
