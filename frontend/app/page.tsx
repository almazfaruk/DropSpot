import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-4xl font-bold mb-10">DropShop</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <a
          href="/admin/login"
          className="text-center px-4 py-2 rounded-md bg-red-400 hover:bg-red-500 transition text-lg font-medium"
        >
          Admin Girişi
        </a>

        <a
          href="/login"
          className="text-center px-4 py-2 rounded-md bg-blue-400 hover:bg-blue-500 transition text-lg font-medium"
        >
          Kullanıcı Girişi
        </a>
        <a
            href="/signup"
            className="px-4 py-2 text-center rounded-md bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            Kayıt Ol
          </a>
      </div>
    </div>
  );
}
