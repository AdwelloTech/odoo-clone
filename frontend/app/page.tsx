"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
