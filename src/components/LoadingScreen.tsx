import { Shield, Heart } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Heart className="h-12 w-12 text-primary animate-pulse" />
            <Shield className="h-6 w-6 text-accent absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Replay Health</h1>
            <p className="text-sm text-muted-foreground">HIPAA-Compliant Visit Recording</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-3/4"></div>
          </div>
          <p className="text-sm text-muted-foreground">Securing your health data...</p>
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}