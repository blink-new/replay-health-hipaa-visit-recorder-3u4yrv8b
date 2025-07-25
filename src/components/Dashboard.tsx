import { useState } from 'react'
import { User } from '../types'
import Header from './Header'
import Sidebar from './Sidebar'
import ProviderPods from './ProviderPods'
import Medications from './Medications'
import Appointments from './Appointments'
import Settings from './Settings'

interface DashboardProps {
  user: User
}

type ActiveView = 'providers' | 'medications' | 'appointments' | 'settings'

export default function Dashboard({ user }: DashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('providers')

  const renderActiveView = () => {
    switch (activeView) {
      case 'providers':
        return <ProviderPods user={user} />
      case 'medications':
        return <Medications user={user} />
      case 'appointments':
        return <Appointments user={user} />
      case 'settings':
        return <Settings user={user} />
      default:
        return <ProviderPods user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}