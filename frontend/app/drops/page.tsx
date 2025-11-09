"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Drop {
  id: string;
  title: string;
  description: string;
  remaining_slots: number;
}

interface WaitlistResponse {
  status: string;
  waitlist_id?: string;
  priority_score?: number;
  claim_code?: string;
  created?: boolean;
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchDrops = async () => {
    if (!token) return;
    try {
      const res = await api.get("/drops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrops(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  useEffect(() => {
    fetchDrops();
  }, [token]);

  const handleJoin = async (dropId: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.post<WaitlistResponse>(
        `/drops/${dropId}/join`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${res.data.status}\nÖncelik Puanı: ${res.data.priority_score || "-"}`);
      fetchDrops();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Katılma işlemi başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (dropId: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.post<WaitlistResponse>(
        `/drops/${dropId}/leave`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${res.data.status}`);
      fetchDrops();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ayrılma işlemi başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (dropId: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.post<WaitlistResponse>(
        `/drops/${dropId}/claim`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Claim kodunuz: ${res.data.claim_code}`);
      fetchDrops();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Claim işlemi başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Aktif Droplar</h1>
      <p className="mb-4">Katılabileceğiniz aktif droplar ve waitlist işlemleri aşağıda.</p>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <ul className="space-y-4">
        {drops.map((drop) => (
          <li key={drop.id} className="border p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-2 md:mb-0">
              <h2 className="font-semibold text-lg">{drop.title}</h2>
              <p>{drop.description}</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() => handleJoin(drop.id)}
                disabled={loading}
              >
                Katıl
              </button>
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={() => handleLeave(drop.id)}
                disabled={loading}
              >
                Ayrıl
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => handleClaim(drop.id)}
                disabled={loading}
              >
                Claim
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
