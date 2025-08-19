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

// Generate realistic attendance data based on patterns
const generateRealisticAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  // Generate data for the last 90 days (3 months)
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Skip holidays (you can add more holiday logic here)
    const month = date.getMonth();
    const day = date.getDate();

    // Simple holiday check (New Year, Christmas, etc.)
    if (
      (month === 0 && day === 1) || // New Year
      (month === 11 && day === 25)
    ) {
      // Christmas
      continue;
    }

    // Generate realistic work patterns
    let checkInHour = 8; // Base check-in time
    let checkOutHour = 17; // Base check-out time
    let breakHours = 1.0; // Base break time

    // Add some variation based on day of week
    if (date.getDay() === 1) {
      // Monday - slightly later start
      checkInHour += 0.5;
    } else if (date.getDay() === 5) {
      // Friday - slightly earlier end
      checkOutHour -= 0.5;
    }

    // Add random variation (±30 minutes for check-in, ±1 hour for check-out)
    checkInHour += Math.random() - 0.5;
    checkOutHour += Math.random() - 0.5;

    // Ensure reasonable bounds
    checkInHour = Math.max(7, Math.min(10, checkInHour));
    checkOutHour = Math.max(16, Math.min(20, checkOutHour));

    // Calculate total hours
    const totalHours = checkOutHour - checkInHour - breakHours;

    // Determine status
    const isOvertime = totalHours > 8.5;
    const isShortHours = totalHours < 7.5;

    // Generate realistic activities
    const activities = [];

    // Check-in
    activities.push({
      type: "checkin" as const,
      time: `${Math.floor(checkInHour).toString().padStart(2, "0")}:${Math.round(
        (checkInHour % 1) * 60
      )
        .toString()
        .padStart(2, "0")}`,
      description: "Started work session",
    });

    // Morning break (if working long hours)
    if (totalHours > 6) {
      const morningBreakTime = checkInHour + 2 + Math.random() * 0.5;
      activities.push({
        type: "break_start" as const,
        time: `${Math.floor(morningBreakTime).toString().padStart(2, "0")}:${Math.round(
          (morningBreakTime % 1) * 60
        )
          .toString()
          .padStart(2, "0")}`,
        description: "Morning break",
      });
      activities.push({
        type: "break_end" as const,
        time: `${Math.floor(morningBreakTime + 0.25)
          .toString()
          .padStart(2, "0")}:${Math.round(((morningBreakTime + 0.25) % 1) * 60)
          .toString()
          .padStart(2, "0")}`,
        description: "Resumed work",
      });
    }

    // Lunch break
    const lunchStart = checkInHour + 4 + Math.random() * 0.5;
    activities.push({
      type: "break_start" as const,
      time: `${Math.floor(lunchStart).toString().padStart(2, "0")}:${Math.round(
        (lunchStart % 1) * 60
      )
        .toString()
        .padStart(2, "0")}`,
      description: "Lunch break",
    });
    activities.push({
      type: "break_end" as const,
      time: `${Math.floor(lunchStart + 0.75)
        .toString()
        .padStart(2, "0")}:${Math.round(((lunchStart + 0.75) % 1) * 60)
        .toString()
        .padStart(2, "0")}`,
      description: "Resumed work",
    });

    // Afternoon break (if working very long hours)
    if (totalHours > 8) {
      const afternoonBreakTime = lunchStart + 2 + Math.random() * 0.5;
      activities.push({
        type: "break_start" as const,
        time: `${Math.floor(afternoonBreakTime).toString().padStart(2, "0")}:${Math.round(
          (afternoonBreakTime % 1) * 60
        )
          .toString()
          .padStart(2, "0")}`,
        description: "Afternoon break",
      });
      activities.push({
        type: "break_end" as const,
        time: `${Math.floor(afternoonBreakTime + 0.25)
          .toString()
          .padStart(2, "0")}:${Math.round(
          ((afternoonBreakTime + 0.25) % 1) * 60
        )
          .toString()
          .padStart(2, "0")}`,
        description: "Resumed work",
      });
    }

    // Check-out
    activities.push({
      type: "checkout" as const,
      time: `${Math.floor(checkOutHour).toString().padStart(2, "0")}:${Math.round(
        (checkOutHour % 1) * 60
      )
        .toString()
        .padStart(2, "0")}`,
      description: "Ended work session",
    });

    records.push({
      date: getDateString(date),
      checkIn: activities[0].time,
      checkOut: activities[activities.length - 1].time,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      breakHours: Math.round(breakHours * 10) / 10,
      isOvertime,
      isShortHours,
      activities,
    });
  }

  return records.reverse();
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
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  // Load attendance data from localStorage (from dashboard)
  useEffect(() => {
    const savedActivities = localStorage.getItem("activities");
    const savedCheckIn = localStorage.getItem("isCheckedIn");
    const savedCheckInTime = localStorage.getItem("checkInTime");

    if (savedActivities) {
      try {
        const activities = JSON.parse(savedActivities);
        const isCheckedIn = savedCheckIn === "true";

        // Convert dashboard activities to attendance format with proper calculations
        const today = new Date();
        const todayString = getDateString(today);

        // Calculate actual hours from activities (same logic as dashboard)
        let totalHours = 0;
        let breakHours = 0;
        let isOvertime = false;
        let isShortHours = false;

        if (activities.length > 0) {
          const checkInActivity = activities.find(
            (a: any) => a.type === "checkin"
          );
          const checkOutActivity = activities.find(
            (a: any) => a.type === "checkout"
          );

          if (checkInActivity) {
            const checkInTime = new Date(checkInActivity.timestamp);
            const checkOutTime = checkOutActivity
              ? new Date(checkOutActivity.timestamp)
              : new Date();

            // Calculate total hours worked
            const totalMs = checkOutTime.getTime() - checkInTime.getTime();
            const rawTotalHours = totalMs / (1000 * 60 * 60);

            // Calculate break hours
            let breakMs = 0;
            let breakStartTime: Date | null = null;

            for (const activity of activities) {
              if (activity.type === "break_start") {
                breakStartTime = new Date(activity.timestamp);
              } else if (activity.type === "break_end" && breakStartTime) {
                breakMs +=
                  new Date(activity.timestamp).getTime() -
                  breakStartTime.getTime();
                breakStartTime = null;
              }
            }

            // If break is still ongoing, add current break time
            if (breakStartTime && isCheckedIn) {
              breakMs += new Date().getTime() - breakStartTime.getTime();
            }

            breakHours = breakMs / (1000 * 60 * 60);
            totalHours = Math.max(0, rawTotalHours - breakHours);

            // Determine overtime/short hours
            isOvertime = totalHours > 8;
            isShortHours = totalHours < 8;
          }
        }

        const record: AttendanceRecord = {
          date: todayString,
          checkIn:
            activities.find((a: any) => a.type === "checkin")?.time || null,
          checkOut:
            activities.find((a: any) => a.type === "checkout")?.time || null,
          totalHours: totalHours,
          breakHours: breakHours,
          isOvertime: isOvertime,
          isShortHours: isShortHours,
          activities: activities.map((a: any) => ({
            type: a.type,
            time: a.time,
            description: a.description,
          })),
        };

        // Generate realistic data for past dates
        const pastData = generateRealisticAttendanceData();
        setAttendanceData([record, ...pastData]);
      } catch (error) {
        console.error("Error loading attendance data:", error);
        // Fallback to realistic data
        setAttendanceData(generateRealisticAttendanceData());
      }
    } else {
      // Fallback to realistic data
      setAttendanceData(generateRealisticAttendanceData());
    }
  }, []);

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
      const savedActivities = localStorage.getItem("activities");
      const savedCheckIn = localStorage.getItem("isCheckedIn");

      if (savedActivities) {
        try {
          const activities = JSON.parse(savedActivities);
          const isCheckedIn = savedCheckIn === "true";

          // Update today's record with fresh data
          const today = new Date();
          const todayString = getDateString(today);

          // Calculate actual hours from activities
          let totalHours = 0;
          let breakHours = 0;
          let isOvertime = false;
          let isShortHours = false;

          if (activities.length > 0) {
            const checkInActivity = activities.find(
              (a: any) => a.type === "checkin"
            );
            const checkOutActivity = activities.find(
              (a: any) => a.type === "checkout"
            );

            if (checkInActivity) {
              const checkInTime = new Date(checkInActivity.timestamp);
              const checkOutTime = checkOutActivity
                ? new Date(checkOutActivity.timestamp)
                : new Date();

              // Calculate total hours worked
              const totalMs = checkOutTime.getTime() - checkInTime.getTime();
              const rawTotalHours = totalMs / (1000 * 60 * 60);

              // Calculate break hours
              let breakMs = 0;
              let breakStartTime: Date | null = null;

              for (const activity of activities) {
                if (activity.type === "break_start") {
                  breakStartTime = new Date(activity.timestamp);
                } else if (activity.type === "break_end" && breakStartTime) {
                  breakMs +=
                    new Date(activity.timestamp).getTime() -
                    breakStartTime.getTime();
                  breakStartTime = null;
                }
              }

              // If break is still ongoing, add current break time
              if (breakStartTime && isCheckedIn) {
                breakMs += new Date().getTime() - breakStartTime.getTime();
              }

              breakHours = breakMs / (1000 * 60 * 60);
              totalHours = Math.max(0, rawTotalHours - breakHours);

              // Determine overtime/short hours
              isOvertime = totalHours > 8;
              isShortHours = totalHours < 8;
            }
          }

          const updatedRecord: AttendanceRecord = {
            date: todayString,
            checkIn:
              activities.find((a: any) => a.type === "checkin")?.time || null,
            checkOut:
              activities.find((a: any) => a.type === "checkout")?.time || null,
            totalHours: totalHours,
            breakHours: breakHours,
            isOvertime: isOvertime,
            isShortHours: isShortHours,
            activities: activities.map((a: any) => ({
              type: a.type,
              time: a.time,
              description: a.description,
            })),
          };

          // Update the attendance data with fresh record
          setAttendanceData((prev) => {
            const existingIndex = prev.findIndex((r) => r.date === todayString);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = updatedRecord;
              return updated;
            } else {
              return [updatedRecord, ...prev];
            }
          });
        } catch (error) {
          console.error("Error updating attendance data:", error);
        }
      }
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check for changes every second to catch local updates
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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
          {/* Header */}
          <header className="px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="bordered"
                    color="default"
                    onClick={() => router.push("/dashboard")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back to Dashboard
                  </Button>
                  <Calendar size={32} className="text-[#FF6300]" />
                  <h1 className="text-3xl font-bold text-white">Attendance</h1>
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  onClick={goToToday}
                  className="bg-[#FF6300] text-white hover:bg-orange-600"
                >
                  Today
                </Button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 pb-8">
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
