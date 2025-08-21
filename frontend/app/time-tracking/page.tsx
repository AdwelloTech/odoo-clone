"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { TimeTracker } from "@/components/time-tracking/TimeTracker";
import { AttendanceOverview } from "@/components/time-tracking/AttendanceOverview";
import Image from "next/image";

export default function TimeTrackingPage() {
  const [currentStatus, setCurrentStatus] = useState<
    "idle" | "working" | "break"
  >("idle");

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
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-white">Time Tracking</h1>
              <p className="text-gray-200 mt-2">
                Track your work hours and manage your attendance
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Time Tracker - Left Side */}
              <div className="lg:col-span-5">
                <div className="sticky top-6">
                  <TimeTracker onStatusChange={setCurrentStatus} />
                </div>
              </div>

              {/* Attendance Overview - Right Side */}
              <div className="lg:col-span-7">
                <AttendanceOverview currentStatus={currentStatus} />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
