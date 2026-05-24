"use client";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User, Zap, ArrowRight } from "lucide-react";
import { signup } from "@/actions/auth";
import { registerSchema } from "@/lib/validations/auth";
import type { RegisterInput } from "@/lib/validations/auth";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterInput>({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: flat.name?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", parsed.data.name);
    formData.append("email", parsed.data.email);
    formData.append("password", parsed.data.password);
    formData.append("confirmPassword", parsed.data.confirmPassword);

    startTransition(async () => {
      const result = await signup(null, formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-pink/10 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1s" }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-light">Start your learning adventure today</p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">{error}</div>}

            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              icon={<User className="w-4 h-4" />}
              error={fieldErrors.name}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              icon={<Mail className="w-4 h-4" />}
              error={fieldErrors.email}
            />

            <Input
              label="Password"
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

            <label className="flex items-start gap-2 text-sm text-muted-light cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded bg-white/5 border-white/20 accent-primary" />
              I agree to the <span className="text-primary-light">Terms of Service</span> and <span className="text-primary-light">Privacy Policy</span>
            </label>

            <Button className="w-full" size="lg" type="submit" loading={isPending}>
              {isPending ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-light">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-light hover:text-primary font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
