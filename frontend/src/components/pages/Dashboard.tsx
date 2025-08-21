"use client";

import React from "react";
import { Header } from "../layout/Header";
import { Navigation } from "../layout/Navigation";
import { DashboardOverview } from "./DashboardOverview";
import Image from "next/image";

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#111111] flex max-w-screen-6xl mx-auto">
      <Image
        alt="bg"
        src="/bg-img.png"
        className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
        height={1080}
        width={1080}
      />
      <div className="flex-1 ml-64">
        <Header />
        <Navigation />
        <main className="py-10">
          <div className="max-w-7xl mx-auto">
            <DashboardOverview />
          </div>
        </main>
      </div>
    </div>
  );
};
