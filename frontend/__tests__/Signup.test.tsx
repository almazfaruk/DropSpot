import { render, screen, fireEvent } from "@testing-library/react";
import SignupPage from "@/app/signup/page";
import "@testing-library/jest-dom";

describe("SignupPage", () => {
  it("renders form inputs and button", () => {
    render(<SignupPage />);
    expect(screen.getByPlaceholderText("E-posta")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Şifre")).toBeInTheDocument();
    expect(screen.getByText("Kayıt Ol")).toBeInTheDocument();
  });

  it("shows error if backend returns error", async () => {
    // Mock API çağrısı
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ detail: "Kayıt başarısız" }),
      })
    ) as jest.Mock;

    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText("E-posta"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Şifre"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Kayıt Ol" }));
    // Error yazısı çıktığını kontrol et
    expect(await screen.findByText("Bir hata oluştu.")).toBeInTheDocument();
  });
});
