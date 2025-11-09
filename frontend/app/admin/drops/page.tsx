"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import AdminNavbar from "@/app/components/adminnavbar";
interface Drop {
  id: string;
  title: string;
  description?: string;
  claim_window_start?: string;
  claim_window_end?: string;
  remaining_slots: number;
}

interface DropFormData {
  title: string;
  description?: string;
  claim_window_start?: string;
  claim_window_end?: string;
  remaining_slots: number;
}

export default function AdminDropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [form, setForm] = useState<DropFormData>({
    title: "",
    description: "",
    claim_window_start: "",
    claim_window_end: "",
    remaining_slots: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchDrops = async () => {
    if (!token) return;
    try {
      const res = await api.get("/admin/droplist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrops(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Droplar alınamadı.");
    }
  };

  useEffect(() => {
    fetchDrops();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      if (editingId) {
        // Güncelleme
        await api.put(`/admin/drops/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Drop güncellendi ✅");
      } else {
        // Yeni drop ekleme
        await api.post("/admin/drops", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Yeni drop oluşturuldu ✅");
      }
      setForm({
        title: "",
        description: "",
        claim_window_start: "",
        claim_window_end: "",
        remaining_slots: 0,
      });
      setEditingId(null);
      fetchDrops();
    } catch (err: any) {
      alert(err.response?.data?.detail || "İşlem başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (drop: Drop) => {
    setEditingId(drop.id);
    setForm({
      title: drop.title,
      description: drop.description || "",
      claim_window_start: drop.claim_window_start?.slice(0, 16) || "",
      claim_window_end: drop.claim_window_end?.slice(0, 16) || "",
      remaining_slots: drop.remaining_slots,
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Bu drop'u silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/admin/drops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Drop silindi ❌");
      fetchDrops();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Silme işlemi başarısız.");
    }
  };

  return (
    <>
    <AdminNavbar />
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Admin - Drop Yönetimi</h1>
      <p className="mb-4">Yeni droplar ekleyebilir, mevcutları düzenleyebilir veya silebilirsiniz.</p>

      {/* Drop Formu */}
      <form onSubmit={handleSubmit} className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">
          {editingId ? "Drop Düzenle" : "Yeni Drop Oluştur"}
        </h2>
        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded"
            required
          />
          <textarea
            placeholder="Açıklama"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded"
          />
          <label className="text-sm text-gray-600">Claim Başlangıç</label>
          <input
            type="datetime-local"
            value={form.claim_window_start}
            onChange={(e) => setForm({ ...form, claim_window_start: e.target.value })}
            className="border p-2 rounded"
          />
          <label className="text-sm text-gray-600">Claim Bitiş</label>
          <input
            type="datetime-local"
            value={form.claim_window_end}
            onChange={(e) => setForm({ ...form, claim_window_end: e.target.value })}
            className="border p-2 rounded"
          />
          <label className="text-sm text-gray-600">Stok</label>
          <input
            type="number"
            placeholder="Stok (örnek: 100)"
            value={form.remaining_slots}
            onChange={(e) => setForm({ ...form, remaining_slots: parseInt(e.target.value) })}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
          >
            {editingId ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </form>

      <h2 className="text-lg font-semibold mb-3">Mevcut Droplar</h2>
      {drops.length === 0 ? (
        <p>Henüz drop bulunmuyor.</p>
      ) : (
        <ul className="space-y-4">
          {drops.map((drop) => (
            <li key={drop.id} className="border p-4 rounded flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="font-bold">{drop.title}</h3>
                <p className="text-sm text-gray-600">{drop.description}</p>
                <p className="text-sm mt-1">
                  <span className="font-semibold">Stok:</span> {drop.remaining_slots}
                </p>
                <p className="text-xs text-gray-500">
                  {drop.claim_window_start && `Başlangıç: ${new Date(drop.claim_window_start).toLocaleString()}`} <br />
                  {drop.claim_window_end && `Bitiş: ${new Date(drop.claim_window_end).toLocaleString()}`}
                </p>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  onClick={() => handleEdit(drop)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => handleDelete(drop.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>

                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}
