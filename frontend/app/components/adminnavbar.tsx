"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  // ✅ Client-side token load
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link href="/" className="text-xl font-semibold">
        MyApp
      </Link>

      <div className="flex items-center gap-4">
        {/* ✅ TOKEN YOKSA Login ve Signup göster */}
        {!token && (
          <>
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-md  transition"
            >
              Giriş Yap
            </Link>
          </>
        )}
        {token && (
            <>
            <Link
          href="/admin/drops"
          className="px-4 py-2 rounded-md  transition"
        >
          Droplar
        </Link>
                  <button
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null); // ✅ UI anında yenilenir
              router.push("/admin/login");
            }}
            className="px-4 py-2 rounded-md  transition cursor-pointer"
          >
            Çıkış Yap
          </button>
            </>
        )}
      </div>
    </nav>
  );
}
