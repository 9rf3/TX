"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Zap, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-float" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-4">
              {sent ? <CheckCircle className="w-7 h-7 text-white" /> : <Zap className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-2xl font-bold">{sent ? "Check your email" : "Reset password"}</h1>
            <p className="text-sm text-muted-light">
              {sent ? `We sent a reset link to ${email}` : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {!sent ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
              <Button className="w-full" size="lg" type="submit">Send Reset Link</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button className="w-full" variant="ghost" onClick={() => setSent(false)}>Try another email</Button>
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
