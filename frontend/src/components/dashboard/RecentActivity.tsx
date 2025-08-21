import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  ClockIcon,
  ChartBarIcon,
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useCurrentStatus,
  useRecentActivities,
} from "@/hooks/useDashboardData";

const ActivityItem: React.FC<{
  activity: any;
  index: number;
}> = ({ activity, index }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "check_in":
        return ArrowRightCircleIcon;
      case "check_out":
        return ArrowLeftCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "check_in":
        return "text-green-500";
      case "check_out":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type);
  const date = new Date(activity.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-center space-x-3 p-3 rounded-lg bg-[#2A2F3A] border border-gray-700"
    >
      <div
        className={`w-8 h-8 rounded-full bg-[#652F0C] flex items-center justify-center`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {activity.description}
        </p>
        <p className="text-xs text-gray-400">
          {date.toLocaleDateString()} •{" "}
          {date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
};

export const RecentActivity: React.FC = () => {
  const { isClockedIn, isOnBreak } = useCurrentStatus();
  const { activities, isLoading, error } = useRecentActivities();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-[#1F232B] border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Activity</CardTitle>
            {isClockedIn && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-500 font-medium">
                  {isOnBreak ? "On Break" : "Active"}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner className="mx-auto mb-4" />
              <p className="text-gray-400">Loading recent activity...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-4">{error}</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <ActivityItem
                  key={`${activity.timestamp}-${activity.type}`}
                  activity={activity}
                  index={index}
                />
              ))}
              <div className="mt-6 text-center">
                <Link href="/time-tracking">
                  <Button className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white shadow-none cursor-pointer hover:bg-gradient-to-r hover:from-[#FF6100] hover:to-[#C21732] transition-all duration-300">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#652F0C] rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No recent activity
              </h3>
              <p className="text-gray-200 mb-6">
                Start tracking your time to see your recent activity here.
              </p>
              <Link href="/time-tracking">
                <Button className="bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white shadow-none cursor-pointer hover:bg-gradient-to-r hover:from-[#FF6100] hover:to-[#C21732] transition-all duration-300">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Start Time Tracking
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
