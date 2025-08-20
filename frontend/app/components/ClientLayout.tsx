"use client";

import { useAuth } from "../contexts/AuthContext";
import AppNavbar from "@/components/navbar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <AppNavbar />}
      <main>{children}</main>
    </>
  );
}
