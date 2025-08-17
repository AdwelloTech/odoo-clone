"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardBody, Button } from "@heroui/react";
import {
  Clock,
  Play,
  Pause,
  Coffee,
  LogOut,
  User,
  BarChart3,
  HamburgerIcon,
  Menu,
  LogIn,
} from "lucide-react";

// Types
interface Activity {
  type: "checkin" | "checkout" | "break_start" | "break_end";
  description: string;
  time: string;
  timestamp: Date;
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;

  color?: "primary" | "success" | "warning" | "danger" | "default";
}

interface HeaderProps {
  currentTime: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface ActionButtonsProps {
  isOnBreak: boolean;
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onBreak: () => void;
  onCheckOut: () => void;
  extraContent: React.ReactNode;
}

interface ActivityTableProps {
  activities: Activity[];
}

// Custom hooks
const useTimer = (isActive: boolean) => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  const reset = useCallback(() => {
    setSeconds(0);
  }, []);

  return { seconds, reset };
};

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return currentTime;
};

// Utility functions
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
};

const formatTimeShort = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  return `${m}m`;
};

const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Stats Card Component
const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,

  color = "default",
}) => {
  const colorClasses: Record<string, string> = {
    primary: "bg-[#3D3D3D] shadow-xs shadow-[#FF6300]",
    success: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20",
    warning: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20",
    danger: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20",
    default: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20",
  };

  return (
    <Card
      className={`${colorClasses[color]} backdrop-blur-sm border transition-all duration-200`}
    >
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#CCCCCC] font-semibold">{title}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-gray-400">{subtitle}</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Action Buttons Component
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isOnBreak,
  isCheckedIn,
  onCheckIn,
  onBreak,
  onCheckOut,
  extraContent,
}) => {
  const currentTIme = useCurrentTime();
  return (
    <section>
      <div className="gap-4 absolute">
        <div className="flex items-center gap-2 text-white">
          <Clock size={28} />
          <div className="flex flex-col">
            <time className="text-2xl leading-tight font-bold">
              {currentTIme}
            </time>
            <span className="text-sm font-semibold text-[#C23933]">
              {getCurrentDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end mb-8">
        {!isCheckedIn ? (
          <Button
            size="lg"
            color="success"
            startContent={<Play size={20} />}
            onClick={onCheckIn}
            className=" bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl"
          >
            Check In
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              size="lg"
              color={isOnBreak ? "success" : "warning"}
              startContent={
                isOnBreak ? <Play size={20} /> : <Coffee size={20} />
              }
              onClick={onBreak}
              className=" bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl"
            >
              {isOnBreak ? "End Break" : "Break"}
            </Button>
            <Button
              size="lg"
              color="danger"
              startContent={<LogOut size={20} />}
              onClick={onCheckOut}
              className=" bg-gradient-to-r from-[#FF6300] to-[#C23732] text-white hover:bg-orange-600 font-semibold text-xl"
            >
              Check Out
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

// Activity Table Component
const ActivityTable: React.FC<ActivityTableProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity["type"]) => {
    const iconProps = { size: 16 };

    switch (type) {
      case "checkin":
        return <LogIn {...iconProps} className="text-[#FF6300]" />;
      case "checkout":
        return <LogOut {...iconProps} className="text-[#FF6300]" />;
      case "break_start":
        return <Coffee {...iconProps} className="text-[#FF6300]" />;
      case "break_end":
        return <Play {...iconProps} className="text-[#FF6300]" />;
      default:
        return <Clock {...iconProps} className="text-[#FF6300]" />;
    }
  };

  const getActivityLabel = (type: Activity["type"]): string => {
    switch (type) {
      case "checkin":
        return "Checked In";
      case "checkout":
        return "Checked Out";
      case "break_start":
        return "Break Started";
      case "break_end":
        return "Break Ended";
      default:
        return "Activity";
    }
  };

  return (
    <Card className="bg-[#3D3D3D] backdrop-blur-sm border-gray-700/50">
      <CardBody className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-white" />
          <h3 className="text-lg font-semibold text-white">Today's Activity</h3>
        </div>

        <div className="space-y-3 max-h-100 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-[#FF6300]">
              <Clock size={48} className="mx-auto mb-2 text-gray-600" />
              <p>No activities recorded today</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={`${activity.timestamp.getTime()}-${index}`}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-700/30 transition-colors border-b border-gray-700/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1">{getActivityIcon(activity.type)}</div>
                  <div>
                    <span className="text-white font-medium block">
                      {getActivityLabel(activity.type)}
                    </span>
                    {activity.description && (
                      <div className="text-xs text-gray-400 mt-1">
                        {activity.description}
                      </div>
                    )}
                  </div>
                </div>
                <time className="text-sm text-gray-300 font-mono">
                  {activity.time}
                </time>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Main Dashboard Component
const TimeTrackingDashboard: React.FC = () => {
  const currentTime = useCurrentTime();
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isOnBreak, setIsOnBreak] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Timer logic
  const workTimer = useTimer(isCheckedIn && !isOnBreak);
  const breakTimer = useTimer(isOnBreak);

  const expectedSeconds: number = 8 * 3600; // 8 hours in seconds
  const remainingSeconds: number = Math.max(
    0,
    expectedSeconds - workTimer.seconds
  );

  const addActivity = useCallback(
    (type: Activity["type"], description: string = "") => {
      const now = new Date();
      const newActivity: Activity = {
        type,
        description,
        time: getCurrentTimeString(),
        timestamp: now,
      };

      setActivities((prev) => [newActivity, ...prev]);
    },
    []
  );

  const handleCheckIn = useCallback(() => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
    addActivity("checkin", "Started work session");
  }, [addActivity]);

  const handleBreak = useCallback(() => {
    if (isOnBreak) {
      setIsOnBreak(false);
      addActivity("break_end", "Resumed work");
    } else {
      setIsOnBreak(true);
      addActivity("break_start", "Taking a break");
    }
  }, [isOnBreak, addActivity]);

  const handleCheckOut = useCallback(() => {
    setIsCheckedIn(false);
    setIsOnBreak(false);
    addActivity("checkout", "Ended work session");
  }, [addActivity]);

  const handleLogout = useCallback(() => {
    // Reset all state
    setIsCheckedIn(false);
    setIsOnBreak(false);
    setActivities([]);
    setCheckInTime(null);
    workTimer.reset();
    breakTimer.reset();
  }, [workTimer, breakTimer]);

  return (
    <div className="relative bg-[#111111] min-h-screen ">
      <Image
        alt="bg"
        src="/bg-img.png"
        className="absolute top-0 left-0 w-full h-[40vh] rotate-180 opacity-20"
        height={1080}
        width={1080}
      />

      <div className="relative z-10">
        <header className="px-8 justify-between flex flex-row mb-8">
          <div className="w-24 h-28 pt-8 text-white font-bold cursor-pointer">
            <Menu size={36} />
          </div>
          <div>
            <Image src={"/logo.png"} width={160} height={160} alt="adwello" />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6">
          <ActionButtons
            extraContent
            isOnBreak={isOnBreak}
            isCheckedIn={isCheckedIn}
            onCheckIn={handleCheckIn}
            onBreak={handleBreak}
            onCheckOut={handleCheckOut}
          />

          {isCheckedIn && (
            <>
              {/* Stats Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Worked Hours"
                  value={formatTime(workTimer.seconds)}
                  subtitle="Today"
                  color="primary"
                />
                <StatsCard
                  title="Expected Hours"
                  value={formatTime(expectedSeconds)}
                  subtitle="Target for today"
                  color="primary"
                />
                <StatsCard
                  title="Break Hours"
                  value={formatTimeShort(breakTimer.seconds)}
                  subtitle="Total Breaks"
                  color="primary"
                />
                <StatsCard
                  title="Remaining Hours"
                  value={formatTime(remainingSeconds)}
                  subtitle="To reach target"
                  color="primary"
                />
              </section>

              {/* Activity Table */}
              <section>
                <ActivityTable activities={activities} />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TimeTrackingDashboard;
