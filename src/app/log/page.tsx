"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, Lock, TriangleAlert } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Log() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      setPending(false);

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        toast.success("Logged in successfully!");
        router.push("/"); 
      }
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setPending(false);

      if (res.ok) {
        toast.success(data.message);
        setIsLogin(true);
      } else {
        setError(data.message);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
      >
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold text-center text-green-600 mb-6"
        >
          {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
        </motion.h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-700 mb-4"
          >
            <TriangleAlert />
            <p>{error}</p>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {!isLogin && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 border rounded-xl p-3 focus-within:ring-2 focus-within:ring-green-400 transition shadow-sm hover:shadow-md"
            >
              <User className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Full name"
                disabled={pending}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full outline-none bg-transparent"
                required
              />
            </motion.div>
          )}

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 border rounded-xl p-3 focus-within:ring-2 focus-within:ring-green-400 transition shadow-sm hover:shadow-md"
          >
            <Mail className="w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              disabled={pending}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full outline-none bg-transparent"
              required
            />
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 border rounded-xl p-3 focus-within:ring-2 focus-within:ring-green-400 transition shadow-sm hover:shadow-md"
          >
            <Lock className="w-5 h-5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              disabled={pending}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full outline-none bg-transparent"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={pending}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg"
          >
            {pending ? "Please wait..." : isLogin ? "Login" : "Register"}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-gray-600 mt-6"
        >
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 font-semibold hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
