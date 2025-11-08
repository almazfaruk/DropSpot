"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[issubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/signup", { email, password });
      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Bir hata oluştu.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSignup} className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Kayıt Ol</h2>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button disabled={issubmitting} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}
