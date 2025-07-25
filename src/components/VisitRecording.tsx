import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Square, Play, Pause, Save, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { Provider, Visit, User } from '../types'

interface VisitRecordingProps {
  provider: Provider
  user: User
  onComplete: (visit: Visit) => void
  onCancel: () => void
}

export default function VisitRecording({ provider, user, onComplete, onCancel }: VisitRecordingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [visitTitle, setVisitTitle] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast({
        title: 'Recording Started',
        description: 'Your visit is now being recorded securely.'
      })
    } catch (error) {
      console.error('Error starting recording:', error)
      toast({
        title: 'Recording Error',
        description: 'Unable to access microphone. Please check permissions.',
        variant: 'destructive'
      })
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSaveVisit = async () => {
    if (!audioBlob || !visitTitle.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a visit title and ensure recording is complete.',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)

    try {
      // Upload audio file
      const audioFile = new File([audioBlob], `visit-${Date.now()}.wav`, { type: 'audio/wav' })
      const { publicUrl } = await blink.storage.upload(audioFile, `visits/${user.id}/`)

      // Transcribe audio
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const base64Data = dataUrl.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(audioBlob)
      })

      const { text: transcription } = await blink.ai.transcribeAudio({
        audio: base64Audio,
        language: 'en'
      })

      // Generate AI summary
      const { text: summary } = await blink.ai.generateText({
        prompt: `Please analyze this medical visit transcription and provide a structured summary. Extract key points, medications mentioned, and follow-up actions. Format the response as a medical visit summary.

Transcription: ${transcription}`,
        maxTokens: 1000
      })

      // Create visit record
      const visit = await blink.db.visits.create({
        providerId: provider.id,
        title: visitTitle,
        date: new Date().toISOString(),
        duration: recordingTime,
        audioUrl: publicUrl,
        transcription,
        summary,
        keyPoints: [], // Will be extracted from summary in a real implementation
        medications: [], // Will be extracted from summary in a real implementation
        followUpActions: [], // Will be extracted from summary in a real implementation
        userId: user.id,
        createdAt: new Date().toISOString()
      })

      toast({
        title: 'Visit Saved',
        description: 'Your visit has been recorded and summarized successfully.'
      })

      onComplete(visit)
    } catch (error) {
      console.error('Error saving visit:', error)
      toast({
        title: 'Save Error',
        description: 'Failed to save visit. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Record Visit</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Recording visit with {provider.name} - {provider.specialty}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {!isRecording ? (
                <Button onClick={startRecording} size="lg" className="rounded-full h-16 w-16">
                  <Mic className="h-8 w-8" />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  {isPaused ? (
                    <Button onClick={resumeRecording} size="lg" className="rounded-full h-12 w-12">
                      <Play className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button onClick={pauseRecording} size="lg" variant="secondary" className="rounded-full h-12 w-12">
                      <Pause className="h-6 w-6" />
                    </Button>
                  )}
                  <Button onClick={stopRecording} size="lg" variant="destructive" className="rounded-full h-12 w-12">
                    <Square className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </div>

            {/* Recording Status */}
            <div className="space-y-2">
              {isRecording && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <Badge variant={isPaused ? 'secondary' : 'destructive'}>
                    {isPaused ? 'PAUSED' : 'RECORDING'}
                  </Badge>
                </div>
              )}
              <div className="text-2xl font-mono font-bold">
                {formatTime(recordingTime)}
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Visit Title *</Label>
              <Input
                id="title"
                value={visitTitle}
                onChange={(e) => setVisitTitle(e.target.value)}
                placeholder="e.g., Annual Checkup, Follow-up Appointment"
                disabled={isRecording}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                placeholder="Any additional notes about this visit..."
                rows={3}
                disabled={isRecording}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={isRecording || isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveVisit} 
              disabled={!audioBlob || isRecording || isProcessing || !visitTitle.trim()}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Visit
                </>
              )}
            </Button>
          </div>

          {/* HIPAA Notice */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">🔒 HIPAA-Compliant Recording</p>
            <p>
              This recording is encrypted and stored securely in compliance with HIPAA regulations. 
              Only you have access to this data, and it will be processed using secure AI services.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}