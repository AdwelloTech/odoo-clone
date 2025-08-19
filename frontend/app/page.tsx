"use client";

import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";

export default function App() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div>
      <LoginForm />
    </div>
  );
}
