"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeIcon,
  ClockIcon,


import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  ClockIcon, 
  ClipboardDocumentListIcon,

  UserIcon,
  ChartBarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Time Tracking",
    href: "/time-tracking",
    icon: ClockIcon,
  },
  {

    name: "Tasks",
    href: "/tasks",
    icon: ClipboardDocumentListIcon,
  },
  {

    name: "Profile",
    href: "/profile",
        
    name: 'Tasks',
    href: '/tasks',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Profile',
    href: '/profile',

    icon: UserIcon,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: ChartBarIcon,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarDaysIcon,
  },
];

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#121212] shadow-xs shadow-white w-64 h-screen fixed left-0 top-0 z-10"
    >
      <div className="p-6">
        {/* Logo */}
        <div className="px-4 flex items-center space-x-3 mb-8">
          <Image
            src="/adwello-logo.png"
            alt="Adwello CRM"
            width={160}
            height={160}
          />
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-[#FF6300] text-center text-white"
                    : "text-white text-center hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="ml-auto w-2 h-2 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
