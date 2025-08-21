'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/image-with-fallback'
import { useAuth } from '@/contexts/AuthContext'

export const Header: React.FC = () => {
  const { user, employee, logout } = useAuth()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Empty space for navigation consistency */}
        <div></div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              2
            </span>
          </Button>

          {/* User Info */}
          <Link href="/profile" className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-600">
                {employee?.role?.name || 'Employee'}
              </p>
            </div>
            
            {/* Profile Image or Default Avatar */}
            <ImageWithFallback
              src={employee?.profile_image}
              alt={`${user?.first_name} ${user?.last_name}`}
              size="md"
              className="border border-gray-200"
            />
          </Link>

          {/* Logout */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="text-gray-500 hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
