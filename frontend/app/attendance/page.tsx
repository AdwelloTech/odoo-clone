"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Coffee,
  Play,
  LogIn,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  attendanceAPI,
  AttendanceRecord as BackendAttendanceRecord,
} from "@/app/api/attendance";
import { employeeAPI, EmployeeProfile } from "@/app/api/employees";
import AppNavbar from "@/components/navbar";

// Types
interface AttendanceRecord {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number;
  breakHours: number;
  isOvertime: boolean;
  isShortHours: boolean;
  activities: Array<{
    type: "checkin" | "checkout" | "break_start" | "break_end";
    time: string;
    description: string;
  }>;
}

// Backend attendance record interface
interface BackendAttendanceData {
  attendance_id: number;
  employee: number;
  employee_name: string;
  employee_email: string;
  department: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  created_at: string;
  updated_at: string;
}

interface AttendancePageProps {}

// Utility functions
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const formatTime24Hour = (timeString: string): string => {
  const date = new Date(`2000-01-01T${timeString}`);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getWeekDates = (date: Date): Date[] => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(start);
    newDate.setDate(start.getDate() + i);
    dates.push(newDate);
  }
  return dates;
};

const getMonthDates = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates = [];

  // Add previous month's days to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(firstDay.getDate() - i - 1);
    dates.push(prevDate);
  }

  // Add current month's days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i));
  }

  // Add next month's days to fill last week
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    const nextDate = new Date(lastDay);
    nextDate.setDate(lastDay.getDate() + i);
    dates.push(nextDate);
  }

  return dates;
};

// Utility functions for backend data conversion
const convertBackendToFrontend = (
  backendData: BackendAttendanceData
): AttendanceRecord => {
  const checkIn = backendData.check_in_time
    ? new Date(backendData.check_in_time).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const checkOut = backendData.check_out_time
    ? new Date(backendData.check_out_time).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  let totalHours = 0;
  if (backendData.check_in_time && backendData.check_out_time) {
    const checkInTime = new Date(backendData.check_in_time);
    const checkOutTime = new Date(backendData.check_out_time);
    totalHours =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  } else if (backendData.check_in_time) {
    // If only checked in, calculate hours until now
    const checkInTime = new Date(backendData.check_in_time);
    const now = new Date();
    totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  }

  const breakHours = 0; // Backend doesn't track breaks yet, so default to 0
  const isOvertime = totalHours > 8;
  const isShortHours = totalHours < 8;

  // Generate activities based on backend data
  const activities = [];
  if (backendData.check_in_time) {
    activities.push({
      type: "checkin" as const,
      time: new Date(backendData.check_in_time).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: "Started work session",
    });
  }

  if (backendData.check_out_time) {
    activities.push({
      type: "checkout" as const,
      time: new Date(backendData.check_out_time).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      description: "Ended work session",
    });
  }

  return {
    date: backendData.date,
    checkIn,
    checkOut,
    totalHours,
    breakHours,
    isOvertime,
    isShortHours,
    activities,
  };
};

// Function to aggregate multiple sessions per day
const aggregateMultipleSessions = (
  dayRecords: BackendAttendanceData[],
  dateKey: string
): AttendanceRecord => {
  // Sort records by check-in time
  const sortedRecords = dayRecords.sort((a, b) => {
    if (!a.check_in_time) return 1;
    if (!b.check_in_time) return -1;
    return (
      new Date(a.check_in_time).getTime() - new Date(b.check_in_time).getTime()
    );
  });

  // Get first check-in and last check-out
  const firstCheckIn = sortedRecords[0].check_in_time;
  const lastCheckOut = sortedRecords[sortedRecords.length - 1].check_out_time;

  // Calculate total hours from all sessions
  let totalHours = 0;
  dayRecords.forEach((record) => {
    if (record.check_in_time && record.check_out_time) {
      const checkInTime = new Date(record.check_in_time);
      const checkOutTime = new Date(record.check_out_time);
      totalHours +=
        (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    } else if (record.check_in_time) {
      // If only checked in, calculate hours until now
      const checkInTime = new Date(record.check_in_time);
      const now = new Date();
      totalHours += (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    }
  });

  // Generate activities from all sessions
  const activities: Array<{
    type: "checkin" | "checkout" | "break_start" | "break_end";
    time: string;
    description: string;
  }> = [];

  dayRecords.forEach((record, index) => {
    if (record.check_in_time) {
      activities.push({
        type: "checkin",
        time: new Date(record.check_in_time).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        description: `Session ${index + 1} started`,
      });
    }

    if (record.check_out_time) {
      activities.push({
        type: "checkout",
        time: new Date(record.check_out_time).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        description: `Session ${index + 1} ended`,
      });
    }
  });

  const breakHours = 0; // Backend doesn't track breaks yet
  const isOvertime = totalHours > 8;
  const isShortHours = totalHours < 8;

  return {
    date: dateKey,
    checkIn: firstCheckIn
      ? new Date(firstCheckIn).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    checkOut: lastCheckOut
      ? new Date(lastCheckOut).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      : null,
    totalHours,
    breakHours,
    isOvertime,
    isShortHours,
    activities,
  };
};

// Function to get current user's attendance data efficiently
const getCurrentUserAttendanceData = async (employeeId: number) => {
  try {
    // Get today's attendance
    const todayAttendances = await attendanceAPI.getTodayAttendance();
    const myTodayAttendances = todayAttendances.filter(
      (record) => record.employee === employeeId
    );

    // Get historical data for current user (last 90 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);

    const historicalData = await attendanceAPI.getAttendanceByDateRange(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    // Filter for current user
    const myHistoricalData = historicalData.filter(
      (record) => record.employee === employeeId
    );

    return { myTodayAttendances, myHistoricalData };
  } catch (error) {
    console.error("Error fetching user attendance data:", error);
    throw error;
  }
};

const calculateHoursFromBackend = (
  backendData: BackendAttendanceData
): {
  totalHours: number;
  breakHours: number;
  isOvertime: boolean;
  isShortHours: boolean;
} => {
  let totalHours = 0;
  if (backendData.check_in_time && backendData.check_out_time) {
    const checkInTime = new Date(backendData.check_in_time);
    const checkOutTime = new Date(backendData.check_out_time);
    totalHours =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  } else if (backendData.check_in_time) {
    // If only checked in, calculate hours until now
    const checkInTime = new Date(backendData.check_in_time);
    const now = new Date();
    totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  }

  const breakHours = 0; // Backend doesn't track breaks yet
  const isOvertime = totalHours > 8;
  const isShortHours = totalHours < 8;

  return { totalHours, breakHours, isOvertime, isShortHours };
};

// Generate weekly summary data
const generateWeeklySummary = (
  attendanceData: AttendanceRecord[],
  weekStart: Date
) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekRecords = attendanceData.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });

  const totalHours = weekRecords.reduce(
    (sum, record) => sum + record.totalHours,
    0
  );
  const totalBreakHours = weekRecords.reduce(
    (sum, record) => sum + record.breakHours,
    0
  );
  const workingDays = weekRecords.length;
  const overtimeDays = weekRecords.filter((record) => record.isOvertime).length;
  const shortHoursDays = weekRecords.filter(
    (record) => record.isShortHours
  ).length;
  const averageDaily = workingDays > 0 ? totalHours / workingDays : 0;

  return {
    totalHours,
    totalBreakHours,
    workingDays,
    overtimeDays,
    shortHoursDays,
    averageDaily,
    records: weekRecords,
  };
};

// Generate monthly summary data
const generateMonthlySummary = (
  attendanceData: AttendanceRecord[],
  year: number,
  month: number
) => {
  const monthRecords = attendanceData.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() === month;
  });

  const totalHours = monthRecords.reduce(
    (sum, record) => sum + record.totalHours,
    0
  );
  const totalBreakHours = monthRecords.reduce(
    (sum, record) => sum + record.breakHours,
    0
  );
  const workingDays = monthRecords.length;
  const overtimeDays = monthRecords.filter(
    (record) => record.isOvertime
  ).length;
  const shortHoursDays = monthRecords.filter(
    (record) => record.isShortHours
  ).length;
  const averageDaily = workingDays > 0 ? totalHours / workingDays : 0;

  // Calculate weekly averages
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (
    let weekStart = new Date(firstDay);
    weekStart <= lastDay;
    weekStart.setDate(weekStart.getDate() + 7)
  ) {
    const weekSummary = generateWeeklySummary(
      attendanceData,
      new Date(weekStart)
    );
    if (weekSummary.workingDays > 0) {
      weeks.push(weekSummary);
    }
  }

  return {
    totalHours,
    totalBreakHours,
    workingDays,
    overtimeDays,
    shortHoursDays,
    averageDaily,
    weeks,
    records: monthRecords,
  };
};

// View Components
const DailyView: React.FC<{
  selectedDate: Date;
  attendanceData: AttendanceRecord[];
}> = ({ selectedDate, attendanceData }) => {
  const dateString = getDateString(selectedDate);
  const record = attendanceData.find((r) => r.date === dateString);

  if (!record) {
    return (
      <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-6">
          <div className="text-center py-8 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Attendance Record</h3>
            <p>No attendance data found for this date.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Daily Timeline
          </h3>
          <div className="space-y-4">
            {record.activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-400 font-mono">
                  {formatTime24Hour(activity.time)}
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    {activity.type === "checkin" && (
                      <LogIn size={16} className="text-green-400" />
                    )}
                    {activity.type === "checkout" && (
                      <LogOut size={16} className="text-red-400" />
                    )}
                    {activity.type === "break_start" && (
                      <Coffee size={16} className="text-yellow-400" />
                    )}
                    {activity.type === "break_end" && (
                      <Play size={16} className="text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const WeeklyView: React.FC<{
  selectedDate: Date;
  attendanceData: AttendanceRecord[];
}> = ({ selectedDate, attendanceData }) => {
  const weekDates = getWeekDates(selectedDate);
  const weekSummary = generateWeeklySummary(attendanceData, weekDates[0]);

  return (
    <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
      <CardBody className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Weekly Overview
        </h3>

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Total Hours</p>
            <p className="text-2xl font-bold text-white">
              {weekSummary.totalHours.toFixed(1)}h
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Working Days</p>
            <p className="text-2xl font-bold text-white">
              {weekSummary.workingDays}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Avg Daily</p>
            <p className="text-2xl font-bold text-white">
              {weekSummary.averageDaily.toFixed(1)}h
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Overtime Days</p>
            <p className="text-2xl font-bold text-white">
              {weekSummary.overtimeDays}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const dateString = getDateString(date);
            const record = attendanceData.find((r) => r.date === dateString);
            const isToday = getDateString(new Date()) === dateString;
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

            return (
              <div
                key={index}
                className={`p-3 rounded-lg text-center border ${
                  isToday
                    ? "bg-[#FF6300] text-white border-[#FF6300]"
                    : isCurrentMonth
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-800 border-gray-700 text-gray-500"
                }`}
              >
                <div className="text-xs font-medium mb-1">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-lg font-bold mb-2">{date.getDate()}</div>
                {record && (
                  <div className="text-xs">
                    <div className="text-green-400">
                      {record.totalHours.toFixed(1)}h
                    </div>
                    {record.isOvertime && (
                      <div className="text-yellow-400 text-xs">+</div>
                    )}
                    {record.isShortHours && (
                      <div className="text-red-400 text-xs">-</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Trends */}
        <div className="mt-6 pt-6 border-t border-gray-600">
          <h4 className="text-md font-semibold text-white mb-4">
            Weekly Trends
          </h4>
          <div className="space-y-3">
            {weekSummary.records.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {new Date(record.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </p>
                    <p className="text-sm text-gray-400">
                      {record.checkIn} - {record.checkOut || "Ongoing"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {record.totalHours.toFixed(1)}h
                  </p>
                  <div className="flex gap-1 mt-1">
                    {record.isOvertime && (
                      <Chip color="success" size="sm">
                        +
                      </Chip>
                    )}
                    {record.isShortHours && (
                      <Chip color="warning" size="sm">
                        -
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const MonthlyView: React.FC<{
  selectedDate: Date;
  attendanceData: AttendanceRecord[];
}> = ({ selectedDate, attendanceData }) => {
  const monthDates = getMonthDates(selectedDate);
  const monthName = selectedDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthSummary = generateMonthlySummary(
    attendanceData,
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );

  return (
    <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
      <CardBody className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{monthName}</h3>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Total Hours</p>
            <p className="text-2xl font-bold text-white">
              {monthSummary.totalHours.toFixed(1)}h
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Working Days</p>
            <p className="text-2xl font-bold text-white">
              {monthSummary.workingDays}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Overtime Days</p>
            <p className="text-2xl font-bold text-white">
              {monthSummary.overtimeDays}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">Avg Daily</p>
            <p className="text-2xl font-bold text-white">
              {monthSummary.averageDaily.toFixed(1)}h
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-400"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {monthDates.map((date, index) => {
            const dateString = getDateString(date);
            const record = attendanceData.find((r) => r.date === dateString);
            const isToday = getDateString(new Date()) === dateString;
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

            return (
              <div
                key={index}
                className={`p-2 rounded-lg text-center border min-h-[60px] flex flex-col items-center justify-center ${
                  isToday
                    ? "bg-[#FF6300] text-white border-[#FF6300]"
                    : isCurrentMonth
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer"
                      : "bg-gray-800 border-gray-700 text-gray-500"
                }`}
              >
                <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                {record && isCurrentMonth && (
                  <div className="text-xs">
                    <div className="text-green-400">
                      {record.totalHours.toFixed(1)}h
                    </div>
                    {record.isOvertime && (
                      <div className="text-yellow-400">+</div>
                    )}
                    {record.isShortHours && (
                      <div className="text-red-400">-</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-600">
          <h4 className="text-md font-semibold text-white mb-4">
            Weekly Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthSummary.weeks.map((week, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-white">
                    Week {index + 1}
                  </h5>
                  <span className="text-xs text-gray-400">
                    {week.workingDays} days
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total:</span>
                    <span className="text-sm font-medium text-white">
                      {week.totalHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Average:</span>
                    <span className="text-sm font-medium text-white">
                      {week.averageDaily.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Overtime:</span>
                    <span className="text-sm font-medium text-green-400">
                      {week.overtimeDays} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Attendance Page Component
const AttendancePage: React.FC<AttendancePageProps> = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [employeeProfile, setEmployeeProfile] =
    useState<EmployeeProfile | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user's employee profile
  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!user) return;

      try {
        const profile = await employeeAPI.getCurrentUserProfile();
        setEmployeeProfile(profile);
        setEmployeeId(profile.id);
        setError(null);
      } catch (error) {
        console.error("Error fetching employee profile:", error);
        setError(
          "Employee profile not found. Please contact your administrator."
        );
        setEmployeeId(null);
      }
    };

    fetchEmployeeProfile();
  }, [user]);

  // Load attendance data from backend API
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we have a valid employee ID
        if (!employeeId) {
          setError(
            "Employee profile not found. Please contact your administrator."
          );
          setIsLoading(false);
          return;
        }

        // Get current user's attendance data efficiently
        const { myTodayAttendances, myHistoricalData } =
          await getCurrentUserAttendanceData(employeeId);

        // Group records by date and aggregate multiple sessions per day
        const recordsByDate = new Map<string, BackendAttendanceData[]>();

        // Add today's records
        if (myTodayAttendances.length > 0) {
          recordsByDate.set(getDateString(new Date()), myTodayAttendances);
        }

        // Add historical records
        myHistoricalData.forEach((record) => {
          const dateKey = record.date;
          if (!recordsByDate.has(dateKey)) {
            recordsByDate.set(dateKey, []);
          }
          recordsByDate.get(dateKey)!.push(record);
        });

        // Convert grouped records to frontend format
        const convertedRecords: AttendanceRecord[] = [];

        recordsByDate.forEach((dayRecords, dateKey) => {
          if (dayRecords.length === 1) {
            // Single session for the day
            convertedRecords.push(convertBackendToFrontend(dayRecords[0]));
          } else {
            // Multiple sessions for the day - aggregate them
            const aggregatedRecord = aggregateMultipleSessions(
              dayRecords,
              dateKey
            );
            convertedRecords.push(aggregatedRecord);
          }
        });

        // Sort by date (most recent first)
        convertedRecords.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAttendanceData(convertedRecords);
      } catch (error) {
        console.error("Error loading attendance data from backend:", error);
        setError(
          "Failed to load attendance data from server. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      loadAttendanceData();
    }
  }, [employeeId]);

  // Real-time sync with backend every 30 seconds
  useEffect(() => {
    const syncWithBackend = async () => {
      if (!employeeId) return;

      try {
        // Get current user's attendance data efficiently
        const { myTodayAttendances } =
          await getCurrentUserAttendanceData(employeeId);

        // Update today's record if it exists
        setAttendanceData((prev) => {
          const todayString = getDateString(new Date());
          const todayRecord =
            myTodayAttendances.length > 0
              ? aggregateMultipleSessions(myTodayAttendances, todayString)
              : {
                  date: todayString,
                  checkIn: null,
                  checkOut: null,
                  totalHours: 0,
                  breakHours: 0,
                  isOvertime: false,
                  isShortHours: false,
                  activities: [],
                };

          const existingIndex = prev.findIndex((r) => r.date === todayString);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = todayRecord;
            return updated;
          } else {
            return [todayRecord, ...prev];
          }
        });
      } catch (error) {
        console.error("Error syncing with backend:", error);
        // Don't show error for background sync
      }
    };

    const interval = setInterval(syncWithBackend, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [employeeId]);

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (view === "daily") {
      newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "weekly") {
      newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (view === "monthly") {
      newDate.setMonth(
        selectedDate.getMonth() + (direction === "next" ? 1 : -1)
      );
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Real-time update from dashboard
  useEffect(() => {
    const handleStorageChange = () => {
      // Since we're now using backend data, we don't need localStorage updates
      // This function can be simplified or removed
    };

    // For now, just sync with backend periodically
    const interval = setInterval(() => {
      if (employeeId) {
        // Trigger a sync with backend
        // This will update the attendance data from the server
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [employeeId]);

  return (
    <ProtectedRoute>
      <div className="relative bg-[#111111] min-h-screen">
        <Image
          alt="bg"
          src="/bg-img.png"
          className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
          height={1080}
          width={1080}
        />

        <div className="relative z-10">
          <AppNavbar />
          {/* Header */}
          <header className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-white">Attendance</h1>
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={goToToday}
                  className="bg-[#FF6300] text-white hover:bg-orange-600"
                >
                  Today
                </Button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 pb-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Employee Profile Not Found Message */}
            {!employeeId && !error && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  Employee profile not found. Please contact your administrator
                  to set up your employee profile.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm">
                  Loading attendance data...
                </p>
              </div>
            )}

            {/* Today's Summary Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Today's Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-[#FF6300]" />
                      <div>
                        <p className="text-sm text-gray-400">Worked Hours</p>
                        <p className="text-xl font-bold text-white">
                          {(() => {
                            const todayRecord = attendanceData.find(
                              (r) => r.date === getDateString(new Date())
                            );
                            return todayRecord
                              ? `${todayRecord.totalHours.toFixed(1)}h`
                              : "0.0h";
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <Coffee size={20} className="text-[#FF6300]" />
                      <div>
                        <p className="text-sm text-gray-400">Break Hours</p>
                        <p className="text-xl font-bold text-white">
                          {(() => {
                            const todayRecord = attendanceData.find(
                              (r) => r.date === getDateString(new Date())
                            );
                            return todayRecord
                              ? `${todayRecord.breakHours.toFixed(1)}h`
                              : "0.0h";
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={20} className="text-[#FF6300]" />
                      <div>
                        <p className="text-sm text-gray-400">Status</p>
                        <div className="flex gap-2 mt-1">
                          {(() => {
                            const todayRecord = attendanceData.find(
                              (r) => r.date === getDateString(new Date())
                            );
                            if (!todayRecord)
                              return (
                                <Chip color="default" size="sm">
                                  No Data
                                </Chip>
                              );
                            if (todayRecord.isOvertime)
                              return (
                                <Chip color="success" size="sm">
                                  Overtime
                                </Chip>
                              );
                            if (todayRecord.isShortHours)
                              return (
                                <Chip color="warning" size="sm">
                                  Short Hours
                                </Chip>
                              );
                            return (
                              <Chip color="primary" size="sm">
                                Complete
                              </Chip>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-[#FF6300]" />
                      <div>
                        <p className="text-sm text-gray-400">Expected Hours</p>
                        <p className="text-xl font-bold text-white">8.0h</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button
                  variant={view === "daily" ? "solid" : "bordered"}
                  color={view === "daily" ? "primary" : "default"}
                  onClick={() => setView("daily")}
                  className={
                    view === "daily"
                      ? "bg-[#FF6300] text-white"
                      : "border-gray-600 text-gray-300"
                  }
                >
                  <CalendarDays size={16} className="mr-2" />
                  Daily
                </Button>
                <Button
                  variant={view === "weekly" ? "solid" : "bordered"}
                  color={view === "weekly" ? "primary" : "default"}
                  onClick={() => setView("weekly")}
                  className={
                    view === "weekly"
                      ? "bg-[#FF6300] text-white"
                      : "border-gray-600 text-gray-300"
                  }
                >
                  <BarChart3 size={16} className="mr-2" />
                  Weekly
                </Button>
                <Button
                  variant={view === "monthly" ? "solid" : "bordered"}
                  color={view === "monthly" ? "primary" : "default"}
                  onClick={() => setView("monthly")}
                  className={
                    view === "monthly"
                      ? "bg-[#FF6300] text-white"
                      : "border-gray-600 text-gray-300"
                  }
                >
                  <Calendar size={16} className="mr-2" />
                  Monthly
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="bordered"
                  color="default"
                  onClick={() => navigateDate("prev")}
                  className="border-gray-600 text-gray-300"
                >
                  <ChevronLeft size={16} />
                </Button>

                <div className="text-white font-medium">
                  {view === "daily" &&
                    selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  {view === "weekly" &&
                    `Week of ${selectedDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}`}
                  {view === "monthly" &&
                    selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                </div>

                <Button
                  variant="bordered"
                  color="default"
                  onClick={() => navigateDate("next")}
                  className="border-gray-600 text-gray-300"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            {/* Content */}
            {view === "daily" && (
              <DailyView
                selectedDate={selectedDate}
                attendanceData={attendanceData}
              />
            )}
            {view === "weekly" && (
              <WeeklyView
                selectedDate={selectedDate}
                attendanceData={attendanceData}
              />
            )}
            {view === "monthly" && (
              <MonthlyView
                selectedDate={selectedDate}
                attendanceData={attendanceData}
              />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AttendancePage;
