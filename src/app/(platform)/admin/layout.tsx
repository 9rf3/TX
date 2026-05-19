import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard");
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }
  
  return <>{children}</>;
}
