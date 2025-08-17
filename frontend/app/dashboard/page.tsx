"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Spacer,
} from "@heroui/react";
import {
  Clock,
  Target,
  Coffee,
  Timer,
  CheckCircle2,
  Play,
  Square,
  MoreHorizontal,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";

interface ActivityItem {
  id: string;
  type: "check-in" | "break" | "check-out";
  time: string;
  duration?: string;
  icon: any;
  color: "success" | "warning" | "danger";
}

interface DashboardMetrics {
  workedHours: string;
  expectedHours: string;
  breakHours: string;
  remainingHours: string;
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Mock data - replace with actual API calls
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    workedHours: "7h 45m",
    expectedHours: "8h 00m",
    breakHours: "45m",
    remainingHours: "15m",
  });

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "check-in",
      time: "09:00 AM",
      icon: CheckCircle2,
      color: "success",
    },
    {
      id: "2",
      type: "break",
      time: "12:30 PM",
      duration: "30 min",
      icon: Coffee,
      color: "warning",
    },
    {
      id: "3",
      type: "check-out",
      time: "05:45 PM",
      duration: "8h 15m total",
      icon: Square,
      color: "danger",
    },
  ]);

  const [isCheckedIn, setIsCheckedIn] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    // API call would go here
    setIsCheckedIn(true);
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: "check-in",
      time: new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: CheckCircle2,
      color: "success",
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleBreakStart = () => {
    // API call would go here
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: "break",
      time: new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: Coffee,
      color: "warning",
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleCheckOut = () => {
    // API call would go here
    setIsCheckedIn(false);
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      type: "check-out",
      time: new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: "8h 15m total",
      icon: Square,
      color: "danger",
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const getActivityIcon = (activity: ActivityItem) => {
    const IconComponent = activity.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "check-in":
        return "Checked in";
      case "break":
        return "Break started";
      case "check-out":
        return "Checked out";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8 text-gray-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {currentTime}
              </h1>
              <p className="text-gray-500 mt-1">{currentDate}</p>
            </div>
          </div>

          <Button
            color={isCheckedIn ? "danger" : "success"}
            variant="solid"
            size="lg"
            startContent={
              isCheckedIn ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )
            }
            onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            className="px-8 py-6 text-white font-semibold"
          >
            {isCheckedIn ? "Check Out" : "Check In"}
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Worked Hours */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Worked Hours
                </p>
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {metrics.workedHours}
                </h3>
                <p className="text-sm text-gray-500 mb-1">Today</p>
              </div>
            </CardBody>
          </Card>

          {/* Expected Hours */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Expected Hours
                </p>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {metrics.expectedHours}
                </h3>
                <p className="text-sm text-gray-500 mb-1">Target for today</p>
              </div>
            </CardBody>
          </Card>

          {/* Break Hours */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Break Hours
                </p>
                <Coffee className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {metrics.breakHours}
                </h3>
                <p className="text-sm text-gray-500 mb-1">Total breaks</p>
              </div>
            </CardBody>
          </Card>

          {/* Remaining Hours */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Remaining Hours
                </p>
                <Timer className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-end gap-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {metrics.remainingHours}
                </h3>
                <p className="text-sm text-gray-500 mb-1">To reach target</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Activity Section */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Today's Activity
              </h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activities recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        activity.color === "success"
                          ? "bg-green-100"
                          : activity.color === "warning"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      {getActivityIcon(activity)}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {getActivityLabel(activity.type)}
                      </h4>
                      {activity.duration && (
                        <p className="text-sm text-gray-500">
                          {activity.duration}
                        </p>
                      )}
                    </div>

                    <Chip
                      variant="flat"
                      color={activity.color}
                      size="sm"
                      className="font-medium"
                    >
                      {activity.time}
                    </Chip>
                  </div>
                ))}
              </div>
            )}

            <Spacer y={4} />

            {/* Quick Actions */}
            {isCheckedIn && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  color="warning"
                  variant="flat"
                  startContent={<Coffee className="w-4 h-4" />}
                  onClick={handleBreakStart}
                  className="font-medium"
                >
                  Start Break
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
