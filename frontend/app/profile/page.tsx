'use client'

import React from 'react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { ProfileView } from '@/components/pages/ProfileView'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <ProfileView />
          </div>
        </main>
      </div>
    </div>
  )
}
