import { Users, Pill, Calendar, Settings } from 'lucide-react'
import { cn } from '../lib/utils'

interface SidebarProps {
  activeView: string
  onViewChange: (view: 'providers' | 'medications' | 'appointments' | 'settings') => void
}

const navigation = [
  { id: 'providers', name: 'Provider Pods', icon: Users },
  { id: 'medications', name: 'Medications', icon: Pill },
  { id: 'appointments', name: 'Appointments', icon: Calendar },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-border h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors',
                activeView === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}