import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "../auth/forgot-password/page";

const { apiPostMock } = vi.hoisted(() => ({ apiPostMock: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ apiPost: apiPostMock }));

describe("ForgotPasswordPage", () => {
  beforeEach(() => apiPostMock.mockReset());

  it("uses privacy-safe copy because the API result does not reveal whether an account exists", async () => {
    apiPostMock.mockResolvedValue({ success: true, data: { accepted: true } });
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("contoh@nexa.com"), { target: { value: "buyer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Tautan Pemulihan" }));

    await waitFor(() => expect(apiPostMock).toHaveBeenCalledWith("/auth/forgot-password", { email: "buyer@example.com" }));
    expect(await screen.findByRole("heading", { name: "Permintaan Diterima" })).toBeInTheDocument();
    expect(screen.getByText(/Jika alamat email/)).toHaveTextContent(/terdaftar, instruksi pemulihan akan dikirim/);
    expect(screen.queryByText("Email Terkirim!")).not.toBeInTheDocument();
  });
});
