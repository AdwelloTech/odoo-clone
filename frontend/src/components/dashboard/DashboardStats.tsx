import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";

interface StatItemProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  isLoading = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-[#1F232B] border-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#D8D7D7] text-sm font-medium mb-2">{title}</p>
            {isLoading ? (
              <LoadingSpinner className="h-8 w-8 " />
            ) : (
              <p className="text-2xl font-bold text-white">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

interface DashboardStatsProps {
  weeklyStats: {
    totalHours: number;
    totalMinutes: number;
    daysWorked: number;
    averageDailyHours: number;
    averageDailyMinutes: number;
  } | null;
  teamMembersCount: number;
  isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  weeklyStats,
  teamMembersCount,
  isLoading,
}) => {
  const formatTimeDisplay = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return "0h 0m";
    return `${hours}h ${minutes}m`;
  };

  const stats = [
    {
      title: "Total Hours This Week",
      value: weeklyStats
        ? formatTimeDisplay(weeklyStats.totalHours, weeklyStats.totalMinutes)
        : "0h 0m",
      icon: ClockIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      isLoading,
    },
    {
      title: "Days Worked",
      value: weeklyStats?.daysWorked?.toString() || "0",
      icon: CalendarDaysIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      isLoading,
    },
    {
      title: "Average Daily Hours",
      value: weeklyStats
        ? formatTimeDisplay(
            weeklyStats.averageDailyHours,
            weeklyStats.averageDailyMinutes
          )
        : "0h 0m",
      icon: BoltIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      isLoading,
    },
    {
      title: "Team Members",
      value: teamMembersCount.toString(),
      icon: UsersIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      isLoading: false, // Team count doesn't need loading state
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Quick Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatItem key={stat.title} {...stat} isLoading={stat.isLoading} />
        ))}
      </div>
    </div>
  );
};

// Icon imports
const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CalendarDaysIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const BoltIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);
