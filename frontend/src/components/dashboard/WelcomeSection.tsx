import React from "react";
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const WelcomeSection: React.FC = () => {
  const { user, employee } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[#FF6300] to-[#C23732] rounded-2xl p-8 text-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white font-bold mb-2">
            Welcome back, {user?.first_name || "User"}!
          </h1>
          <p className="text-gray-200 text-lg">
            Today is {formatDate(new Date())}
          </p>
          {employee && (
            <p className="text-gray-200 mt-2">
              {employee.role?.name} • {employee.role?.department?.name}
            </p>
          )}
        </div>
        <div className="hidden md:block">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
            <DocumentTextIcon className="w-16 h-16 text-white/80" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
