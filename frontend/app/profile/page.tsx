"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { ProfileView } from "@/components/pages/ProfileView";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#111111] flex max-w-screen-6xl mx-auto">
      <Image
        alt="bg"
        src="/bg-img.png"
        className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
        height={1080}
        width={1080}
      />
      <Navigation />

      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <ProfileView />
          </div>
        </main>
      </div>
    </div>
  );
}
