import React from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Shield, Mic, Brain, Users, Calendar, Pill } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Hero Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-6 w-6" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Replay
              <span className="text-primary"> Health</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Record, organize, and understand your medical visits with AI-powered summaries. 
              Keep all your healthcare information secure and accessible.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700">Secure Recording</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Brain className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-gray-700">AI Summaries</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700">Provider Pods</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-gray-700">Appointments</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get Started
          </Button>
        </div>

        {/* Right Side - Visual Demo */}
        <div className="relative">
          {/* Background Image */}
          <div 
            className="absolute inset-0 rounded-3xl bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')`
            }}
          />
          
          {/* Floating Cards */}
          <div className="relative z-10 space-y-6">
            
            {/* Recording Card */}
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Mic className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Recording Visit</h3>
                  <p className="text-sm text-gray-600">Dr. Sarah Johnson - Cardiology</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">15:32</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Summary Card */}
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl ml-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">AI Summary Ready</h3>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Blood pressure stable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Continue Lisinopril 10mg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Follow-up in 3 months</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Provider Pod Card */}
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Provider Pods</h3>
                    <p className="text-sm text-gray-600">3 providers, 12 visits</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-xs text-gray-500">Total Visits</div>
                </div>
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  )
}