'use client'

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/update", { method: "GET" });
        const data = await res.json();
        if (data.success) {
          setForm({
            name: data.user.name || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
            image: data.user.image || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result;

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64 }),
        });
        const result = await res.json();
        if (result.success) {
          setForm({ ...form, image: result.url });
          toast.success("✅ Image uploaded");
        } else {
          toast.error("❌ Upload failed");
        }
      } catch (err) {
        toast.error("❌ Something went wrong");
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Profile updated");
      } else {
        toast.error("❌ Update failed: " + data.message);
      }
    } catch (err) {
      toast.error("❌ Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center p-6 text-gray-500">Loading profile...</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 md:p-10 flex flex-col gap-6"
      >
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-4xl font-extrabold text-center text-green-600 drop-shadow-sm"
        >
          Your Profile
        </motion.h1>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <img
              src={form.image || "/placeholder-avatar.png"}
              alt="User Avatar"
              className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-full border-4 border-green-200 shadow-md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition"
            >
              ✎
            </button>
          </motion.div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <motion.div
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Name */}
            <div className="flex-1">
              <label className="block mb-1 font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition"
              />
            </div>

            {/* Email */}
            <div className="flex-1">
              <label className="block mb-1 font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label className="block mb-1 font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself"
              rows={3}
              value={form.bio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-400 transition resize-none"
            />
          </motion.div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}
