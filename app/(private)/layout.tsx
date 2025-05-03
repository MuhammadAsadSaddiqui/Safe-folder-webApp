// app/(private)/layout.tsx
import { ReactNode } from "react";
import SignOutButton from "@/components/SignOutButton";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 max-w-6xl flex justify-between items-center">
          <h1 className="font-bold text-xl">Secure Files</h1>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
