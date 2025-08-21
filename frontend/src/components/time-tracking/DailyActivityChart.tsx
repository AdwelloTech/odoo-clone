"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeOnly, formatDuration } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { attendanceAPI } from "@/lib/api";
import { LoadingSpinner } from "../ui/loading";

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

interface ChartDataPoint {
  time: string;
  clockIns: number;
  clockOuts: number;
  myClockIn?: number;
  myClockOut?: number;
  totalHours: number;
}

interface DailyActivityChartProps {
  currentStatus: "idle" | "working" | "break";
}

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({
  currentStatus,
}) => {
  const { employee } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>(
    []
  );
  const [myTodayRecord, setMyTodayRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);

  const fetchTodayData = async () => {
    try {
      setIsLoading(true);

      // Fetch today's attendance for all employees
      const todayData = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(todayData || []);

      // Find current user's record for today
      if (employee && todayData) {
        const myRecord = todayData.find(
          (record: AttendanceRecord) => record.employee_email === employee.email
        );
        setMyTodayRecord(myRecord || null);
      }
    } catch (error) {
      console.error("Failed to fetch today attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = () => {
    // Generate hourly data points from 6 AM to 10 PM
    const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

    const data: ChartDataPoint[] = hours.map((hour) => {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      // Count clock ins and outs for this hour
      let clockIns = 0;
      let clockOuts = 0;
      let totalHours = 0;

      todayAttendance.forEach((record: AttendanceRecord) => {
        if (record.check_in_time) {
          const checkInHour = new Date(record.check_in_time).getHours();
          if (checkInHour === hour) clockIns++;
        }

        if (record.check_out_time) {
          const checkOutHour = new Date(record.check_out_time).getHours();
          if (checkOutHour === hour) clockOuts++;
        }

        // Calculate total hours worked by this hour
        if (record.check_in_time) {
          const checkIn = new Date(record.check_in_time);
          const currentTime = new Date();
          const endTime = record.check_out_time
            ? new Date(record.check_out_time)
            : currentTime;

          if (checkIn.getHours() <= hour && endTime.getHours() >= hour) {
            const hoursInThisSlot = Math.min(
              1,
              (endTime.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
            );
            totalHours += hoursInThisSlot;
          }
        }
      });

      const dataPoint: ChartDataPoint = {
        time: timeStr,
        clockIns,
        clockOuts,
        totalHours: Math.round(totalHours * 10) / 10,
      };

      // Add user's specific clock in/out if it matches this hour
      if (myTodayRecord) {
        if (myTodayRecord.check_in_time) {
          const myCheckInHour = new Date(
            myTodayRecord.check_in_time
          ).getHours();
          if (myCheckInHour === hour) {
            dataPoint.myClockIn = 1;
          }
        }

        if (myTodayRecord.check_out_time) {
          const myCheckOutHour = new Date(
            myTodayRecord.check_out_time
          ).getHours();
          if (myCheckOutHour === hour) {
            dataPoint.myClockOut = 1;
          }
        }
      }

      return dataPoint;
    });

    setChartData(data);
  };

  const calculateTotalHours = () => {
    if (myTodayRecord && myTodayRecord.check_in_time) {
      const checkIn = new Date(myTodayRecord.check_in_time);
      const checkOut = myTodayRecord.check_out_time
        ? new Date(myTodayRecord.check_out_time)
        : new Date();
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      setTotalHoursWorked(Math.round(hours * 10) / 10);
    } else {
      setTotalHoursWorked(0);
    }
  };

  useEffect(() => {
    fetchTodayData();
  }, [employee]);

  useEffect(() => {
    if (todayAttendance.length > 0) {
      generateChartData();
      calculateTotalHours();
    }
  }, [todayAttendance, myTodayRecord]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${
                entry.dataKey === "clockIns"
                  ? "Clock Ins"
                  : entry.dataKey === "clockOuts"
                  ? "Clock Outs"
                  : entry.dataKey === "totalHours"
                  ? "Team Hours"
                  : entry.dataKey
              }: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentHour = new Date().getHours();

  return (
    <Card className="bg-[#1F232B] border-none shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Today's Activity Overview
          </div>
          <div className="text-sm text-gray-200">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#C3383166] rounded-lg p-4"
              >
                <div className="flex items-center">
                  <ClockIcon className="w-8 h-8 text-white mr-3" />
                  <div>
                    <p className="text-sm font-medium text-white  ">
                      Hours Today
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {totalHoursWorked}h
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#C3383166] rounded-lg p-4"
              >
                <div className="flex items-center">
                  <CalendarIcon className="w-8 h-8 text-white mr-3" />
                  <div>
                    <p className="text-sm font-medium text-white">Status</p>
                    <p className="text-lg font-bold text-white">
                      {currentStatus === "working"
                        ? "Working"
                        : currentStatus === "break"
                        ? "On Break"
                        : myTodayRecord?.check_in_time &&
                          !myTodayRecord?.check_out_time
                        ? "Checked In"
                        : "Off"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => value}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Current time reference line */}
                  <ReferenceLine
                    x={`${currentHour.toString().padStart(2, "0")}:00`}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: "Now", position: "top", offset: 10 }}
                  />

                  {/* Team activity bars */}
                  <Bar
                    dataKey="clockIns"
                    fill="#10b981"
                    name="Clock Ins"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="clockOuts"
                    fill="#f59e0b"
                    name="Clock Outs"
                    radius={[2, 2, 0, 0]}
                  />

                  {/* Team hours line */}
                  <Line
                    type="monotone"
                    dataKey="totalHours"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 3 }}
                    name="Team Hours"
                  />

                  {/* User's personal markers */}
                  {myTodayRecord && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="myClockIn"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{ fill: "#dc2626", r: 6 }}
                        connectNulls={false}
                        name="My Clock In"
                      />
                      <Line
                        type="monotone"
                        dataKey="myClockOut"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{
                          fill: "#dc2626",
                          r: 6,
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        connectNulls={false}
                        name="My Clock Out"
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-200">Team Clock Ins</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                <span className="text-gray-200">Team Clock Outs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-gray-200">Team Hours</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span className="text-gray-200">My Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0.5 bg-red-400 border-dashed mr-2"></div>
                <span className="text-gray-200">Current Time</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
