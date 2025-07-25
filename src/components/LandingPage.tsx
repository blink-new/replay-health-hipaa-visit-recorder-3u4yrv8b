import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Shield, Mic, Brain, Users, Calendar, Pill } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Replay Health</h1>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Your Health Journey,
              <span className="text-primary block">Naturally Organized</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              HIPAA-compliant app that records doctor visits, creates AI summaries, 
              and organizes your healthcare in secure provider pods.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Secure Recording</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">AI Summaries</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Provider Pods</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-gray-700 font-medium">HIPAA Compliant</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary/5 px-8 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center space-x-6 pt-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600 font-medium">HIPAA Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">Bank-Level Security</span>
            </div>
          </div>
        </div>

        {/* Right Side - Visual Demo */}
        <div className="relative">
          {/* Background Image */}
          <div 
            className="w-full h-96 rounded-2xl bg-cover bg-center relative overflow-hidden"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')`
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Floating Cards */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              {/* Recording Card */}
              <Card className="mb-4 bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">Recording Visit...</span>
                    <span className="text-sm text-gray-500">02:34</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Summary Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">AI Summary Ready</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Pill className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">2 medications discussed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-gray-600">Follow-up in 2 weeks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}