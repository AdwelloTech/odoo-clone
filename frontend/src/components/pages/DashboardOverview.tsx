"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  WelcomeSection,
  DashboardStats,
  QuickActions,
  RecentActivity,
} from "@/components/dashboard";

const quickActions = [
  {
    title: "Start Time Tracking",
    description: "Clock in and start tracking your work hours",
    icon: ClockIcon,
    href: "/time-tracking",
    color: "bg-blue-500",
  },
  {
    title: "View Profile",
    description: "Update your personal information and settings",
    icon: UserIcon,
    href: "/profile",
    color: "bg-green-500",
  },
  {
    title: "View Reports",
    description: "Check your attendance reports and analytics",
    icon: ChartBarIcon,
    href: "/reports",
    color: "bg-purple-500",
  },
  {
    title: "Calendar View",
    description: "See your schedule and attendance calendar",
    icon: CalendarDaysIcon,
    href: "/calendar",
    color: "bg-orange-500",
  },
];

export const DashboardOverview: React.FC = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refreshData,
  } = useDashboardData();

  if (error) {
    return (
      <div className="space-y-8">
        <WelcomeSection />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-900/20 border border-red-500/50 rounded-lg p-6"
        >
          <h3 className="text-lg font-medium text-red-400 mb-2">
            Error Loading Dashboard Data
          </h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeSection />

      <DashboardStats
        weeklyStats={dashboardData?.weeklyStats || null}
        teamMembersCount={dashboardData?.teamMembersCount || 0}
        isLoading={isLoading}
      />

      <QuickActions actions={quickActions} />

      <RecentActivity />
    </div>
  );
};
