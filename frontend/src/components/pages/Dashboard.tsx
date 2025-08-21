'use client'

import React from 'react'
import { Header } from '../layout/Header'
import { Navigation } from '../layout/Navigation'
import { DashboardOverview } from './DashboardOverview'

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 ml-64">
        <Header />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardOverview />
          </div>
        </main>
      </div>
    </div>
  )
}
