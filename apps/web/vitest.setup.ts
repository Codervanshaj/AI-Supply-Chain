import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
}));
