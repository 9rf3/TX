import { useCallback, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "./useUsers";

export interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  gradient: string | null;
  price: string;
  level: string;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  instructor?: UserProfile;
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCourses = useCallback(async (includeUnpublished = false) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("courses")
        .select("*, instructor:profiles(*)")
        .order("created_at", { ascending: false });

      if (!includeUnpublished) {
        query = query.eq("published", true);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setCourses(data as unknown as CourseData[]);
    } catch (err: any) {
      console.error("Error fetching courses:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourse = async (courseData: Partial<CourseData>) => {
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error: err } = await supabase
        .from("courses")
        .insert([{ ...courseData, created_by: userData.user.id }])
        .select("*, instructor:profiles(*)")
        .single();

      if (err) throw err;
      setCourses(prev => [data as unknown as CourseData, ...prev]);
      return data;
    } catch (err: any) {
      console.error("Error creating course:", err.message);
      setError(err.message);
      throw err;
    }
  };

  return { courses, fetchCourses, createCourse, isLoading, error };
}
