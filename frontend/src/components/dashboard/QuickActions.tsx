import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActionCard: React.FC<{ action: QuickAction; index: number }> = ({
  action,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
  >
    <Link href={action.href}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group bg-[#1F232B] border-none">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#652F0C] rounded-lg flex items-center justify-center">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-200">{action.description}</p>
              </div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action, index) => (
          <QuickActionCard key={action.title} action={action} index={index} />
        ))}
      </div>
    </div>
  );
};
