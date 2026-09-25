import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResendVerificationPage from "../auth/resend-verification/page";
import RegisterPage from "../auth/register/page";

const { apiPostMock, searchParamsMock, routerPushMock, registerMutateAsyncMock } = vi.hoisted(() => ({
  apiPostMock: vi.fn(),
  searchParamsMock: vi.fn(),
  routerPushMock: vi.fn(),
  registerMutateAsyncMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({ apiPost: apiPostMock }));
vi.mock("@/lib/api/hooks/useAuth", () => ({
  useRegister: () => ({ mutateAsync: registerMutateAsyncMock, reset: vi.fn(), isPending: false }),
}));
vi.mock("@/lib/store/useUserStore", () => ({
  useUserStore: (selector?: (state: { user: null }) => unknown) => {
    const state = { user: null };
    return selector ? selector(state) : state;
  },
}));
vi.mock("next/navigation", () => ({
  useSearchParams: searchParamsMock,
  useRouter: () => ({ push: routerPushMock }),
}));

describe("ResendVerificationPage", () => {
  beforeEach(() => {
    apiPostMock.mockReset();
    registerMutateAsyncMock.mockReset();
    routerPushMock.mockReset();
    searchParamsMock.mockReturnValue(new URLSearchParams("redirect=%2Fcart"));
  });

  it("sends the email to the resend-verification contract and shows a privacy-safe result", async () => {
    apiPostMock.mockResolvedValue({ success: true });
    render(<ResendVerificationPage />);

    fireEvent.change(screen.getByLabelText("Alamat Email"), { target: { value: "buyer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Ulang Tautan" }));

    await waitFor(() => expect(apiPostMock).toHaveBeenCalledWith("/auth/resend-verification", { email: "buyer@example.com" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/Jika alamat email terdaftar dan belum diverifikasi/);
    expect(screen.getByRole("link", { name: "Kembali ke Login" })).toHaveAttribute("href", "/auth/login?redirect=%2Fcart");
  });

  it("keeps the form available and reports request failures", async () => {
    apiPostMock.mockRejectedValue(new Error("Layanan email tidak tersedia"));
    render(<ResendVerificationPage />);

    fireEvent.change(screen.getByLabelText("Alamat Email"), { target: { value: "buyer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Ulang Tautan" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Layanan email tidak tersedia");
    expect(screen.getByLabelText("Alamat Email")).toBeInTheDocument();
  });

  it("tells the user when registration succeeded but verification delivery was not confirmed", () => {
    searchParamsMock.mockReturnValue(new URLSearchParams("registered=1&delivery=unconfirmed"));
    render(<ResendVerificationPage />);

    expect(screen.getByRole("status")).toHaveTextContent(/layanan email belum mengonfirmasi/);
    expect(screen.getByRole("status")).toHaveTextContent(/jangan mendaftar ulang/);
  });

  it("takes a newly registered customer to the verification recovery page", async () => {
    registerMutateAsyncMock.mockResolvedValue({ success: true, data: { verificationEmailAccepted: true } });
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Contoh: Budi Santoso"), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByPlaceholderText("contoh@nexa.com"), { target: { value: "buyer@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Minimal 6 karakter"), { target: { value: "secure123" } });
    fireEvent.change(screen.getByPlaceholderText("Ulangi kata sandi"), { target: { value: "secure123" } });
    fireEvent.click(screen.getByRole("button", { name: "Daftar Anggota" }));

    await waitFor(() => expect(routerPushMock).toHaveBeenCalledWith("/auth/resend-verification?registered=1&delivery=accepted&redirect=%2Fcart"));
  });
});
