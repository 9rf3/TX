"use client";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Zap, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { updatePassword } from "@/actions/auth";
import { updatePasswordSchema } from "@/lib/validations/auth";
import type { UpdatePasswordInput } from "@/lib/validations/auth";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState<UpdatePasswordInput>({ password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UpdatePasswordInput, string>>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = updatePasswordSchema.safeParse(form);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
      });
      return;
    }

    const formData = new FormData();
    formData.append("password", parsed.data.password);
    formData.append("confirmPassword", parsed.data.confirmPassword);

    startTransition(async () => {
      const result = await updatePassword(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              {success ? <CheckCircle className="w-7 h-7 text-white" /> : <Zap className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-2xl font-bold">{success ? "Password updated" : "Set new password"}</h1>
            <p className="text-sm text-muted-light">
              {success ? "Redirecting to login..." : "Enter your new password below"}
            </p>
          </div>

          {!success ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <Input
                label="New Password"
                name="password"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: undefined }); }}
                icon={<Lock className="w-4 h-4" />}
                error={fieldErrors.password}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setFieldErrors({ ...fieldErrors, confirmPassword: undefined }); }}
                icon={<Lock className="w-4 h-4" />}
                error={fieldErrors.confirmPassword}
              />

              <Button className="w-full" size="lg" type="submit" loading={isPending}>
                {isPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-light">Your password has been successfully updated.</p>
              <Button className="w-full" variant="ghost" onClick={() => router.push("/login")}>
                Go to login
              </Button>
            </div>
          )}

          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
