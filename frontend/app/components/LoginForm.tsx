import React from "react";
import Image from "next/image";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

const LoginForm = () => {
  return (
    <section className="relative bg-[#111111] h-screen flex items-center justify-center">
      {/* Background image overlay */}
      <Image
        alt="bg"
        src="/bg-img.png"
        className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
        height={1080}
        width={1080}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
        <div className="w-72 h-72 rounded-full overflow-hidden bg-white flex items-center justify-center border-8 border-[#FF6300]">
          <img
            src="/greek.png"
            className="w-64 h-64 object-contain"
            alt="Logo"
          />
        </div>

        {/* Login text */}
        <div className="text-center mt-6">
          <p className="text-white font-bold text-4xl mb-2">LOGIN</p>
          <span className="text-[#9F9999] font-semibold text-2xl">
            Welcome to Adwello Management
          </span>
        </div>

        {/* Input fields */}
        <div className="mt-6 w-full flex flex-col gap-4">
          <Input
            variant="flat"
            label="Username"
            classNames={{
              inputWrapper: "bg-[#222222] text-white",
              label: "text-white font-semibold ",
            }}
          />
          <Input
            variant="flat"
            label="Password"
            classNames={{
              inputWrapper: "bg-[#222222] text-white",
              label: "text-white font-semibold ",
            }}
          />
        </div>

        <div className="mt-6 w-full">
          <Button
            className="w-full bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl"
            size="lg"
          >
            Login
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
