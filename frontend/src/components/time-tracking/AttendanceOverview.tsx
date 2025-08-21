"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { BreakSummary } from "./BreakSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceAPI } from "@/lib/api";

// Utility functions
const getStatusIndicator = (
  status: string,
  checkInTime: string | null,
  checkOutTime: string | null
) => {
  if (checkInTime && !checkOutTime) {
    return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
  } else if (checkInTime && checkOutTime) {
    return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
  } else {
    return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
  }
};

const calculateWorkingHours = (
  checkInTime: string | null,
  checkOutTime: string | null
): string => {
  if (!checkInTime) return "Not started";
  if (!checkOutTime) return "In progress";

  const start = new Date(checkInTime);
  const end = new Date(checkOutTime);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHours}h ${diffMinutes}m`;
};

const formatTimeOnly = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

interface AttendanceRecord {
  attendance_id: number;
  employee_name: string;
  employee_email: string;
  department: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

interface AttendanceOverviewProps {
  currentStatus: "idle" | "working" | "break";
}

export const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({
  currentStatus,
}) => {
  const { employee } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendanceData = async () => {
    if (!employee) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const todayData = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(todayData || []);
    } catch (error) {
      console.error("Failed to fetch attendance data:", error);
      setTodayAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [employee]);

  const stats = [
    {
      title: "Today's Status",
      value:
        currentStatus === "working"
          ? "Working"
          : currentStatus === "break"
          ? "On Break"
          : "Not Working",
      icon: ClockIcon,
    },
    {
      title: "Team Online",
      value: Array.isArray(todayAttendance)
        ? todayAttendance.filter((a) => a?.check_in_time && !a?.check_out_time).length
        : 0,
      icon: UserGroupIcon,
    },
    {
      title: "Total Today",
      value: Array.isArray(todayAttendance) ? todayAttendance.length : 0,
      icon: CalendarDaysIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[#1F232B] border-none shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{stat.title}</p>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today's Team Activity */}
      <Card className="bg-[#1F232B] border-none shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Today's Team Activity
            </div>
            <span className="text-xs text-gray-400 font-normal">
              {Array.isArray(todayAttendance) ? todayAttendance.length : 0} members
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-[#2A2F3A] rounded-md"></div>
                </div>
              ))}
            </div>
          ) : Array.isArray(todayAttendance) && todayAttendance.length > 0 ? (
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <div className="space-y-2 pr-2">
                {todayAttendance.map((record) => (
                  <div
                    key={record?.attendance_id || Math.random()}
                    className="flex items-center justify-between p-2 bg-[#2A2F3A] border border-gray-700 rounded-md hover:bg-[#323741] transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getStatusIndicator(
                        record?.status || "unknown",
                        record?.check_in_time || null,
                        record?.check_out_time || null
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {record?.employee_name || "Unknown Employee"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {record?.department || "No Department"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-medium text-white">
                        {calculateWorkingHours(
                          record?.check_in_time || null,
                          record?.check_out_time || null
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record?.check_in_time
                          ? formatTimeOnly(new Date(record.check_in_time))
                          : "Not in"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <UserGroupIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No attendance records for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Summary */}
      <BreakSummary currentStatus={currentStatus} />
    </div>
  );
};
