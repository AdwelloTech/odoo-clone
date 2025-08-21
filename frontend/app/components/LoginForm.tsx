"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useAuth } from "@/app/contexts/AuthContext";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-[#111111] h-screen flex items-center justify-center">
      <Image
        alt="bg"
        src="/bg-img.png"
        className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
        height={1080}
        width={1080}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
        {/* Logo */}
        <div className="w-72 h-72 rounded-full overflow-hidden bg-white flex items-center justify-center border-8 border-[#FF6300]">
          <img
            src="/greek.png"
            className="w-64 h-64 object-contain"
            alt="Logo"
          />
        </div>

        {/* Text */}
        <div className="text-center mt-6">
          <p className="text-white font-bold text-4xl mb-2">LOGIN</p>
          <span className="text-[#9F9999] font-semibold text-2xl">
            Welcome to Adwello Management
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 w-full flex flex-col gap-4"
        >
          <Input
            name="email"
            variant="flat"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            classNames={{
              inputWrapper: "bg-[#222222] text-white",
              label: "text-white font-semibold",
            }}
          />
          <Input
            name="password"
            type="password"
            variant="flat"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            classNames={{
              inputWrapper: "bg-[#222222] text-white",
              label: "text-white font-semibold",
            }}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl"
            size="lg"
            isLoading={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Error */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </section>
  );
};

export default LoginForm;
