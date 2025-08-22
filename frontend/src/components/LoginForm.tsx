"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
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
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-white text-black border-none font-bold"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="bg-white text-black border-none font-bold"
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-bold text-xl shadow-none cursor-pointer"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Error */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </section>
  );
};
