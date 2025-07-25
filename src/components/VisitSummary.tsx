import { useState } from 'react'
import { Calendar, Clock, Mic, FileText, Pill, CheckCircle, Share2, Download, Play, Pause, Volume2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Visit, Provider } from '../types'
import { format } from 'date-fns'

interface VisitSummaryProps {
  visit: Visit
  provider: Provider
  onShare?: () => void
  onDownload?: () => void
}

export default function VisitSummary({ visit, provider, onShare, onDownload }: VisitSummaryProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFullTranscript, setShowFullTranscript] = useState(false)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playAudio = () => {
    if (visit.audioUrl) {
      const audio = new Audio(visit.audioUrl)
      audio.play()
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
    }
  }

  // Parse summary to extract structured information
  const parseSummary = (summary: string) => {
    const sections = {
      keyPoints: [] as string[],
      medications: [] as string[],
      followUp: [] as string[]
    }

    // Extract medications mentioned
    const medicationMatch = summary.match(/\*\*Medications?\s*(?:Mentioned|Discussed)?:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
    if (medicationMatch) {
      const medicationText = medicationMatch[1]
      const medications = medicationText.split(/[-•]\s*/).filter(med => med.trim() && !med.includes('**'))
      sections.medications = medications.map(med => med.trim()).filter(Boolean)
    }

    // Extract follow-up actions
    const followUpMatch = summary.match(/\*\*Follow[- ]?Up\s*(?:Actions?)?:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
    if (followUpMatch) {
      const followUpText = followUpMatch[1]
      const actions = followUpText.split(/[-•]\s*/).filter(action => action.trim() && !action.includes('**'))
      sections.followUp = actions.map(action => action.trim()).filter(Boolean)
    }

    // Extract key points
    const keyPointsMatch = summary.match(/\*\*Key\s*Points?:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i)
    if (keyPointsMatch) {
      const keyPointsText = keyPointsMatch[1]
      const points = keyPointsText.split(/[-•]\s*/).filter(point => point.trim() && !point.includes('**'))
      sections.keyPoints = points.map(point => point.trim()).filter(Boolean)
    }

    return sections
  }

  const summaryData = parseSummary(visit.summary)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{visit.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(visit.date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(visit.duration)}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Volume2 className="h-3 w-3 mr-1" />
                Recorded
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{provider.specialty}</Badge>
              <span className="text-sm text-muted-foreground">with {provider.name}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {visit.audioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {isPlaying ? 'Playing...' : 'Play'}
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Summary Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <h3 className="font-semibold text-lg">AI-Generated Summary</h3>
            <Badge variant="secondary" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              AI Processed
            </Badge>
          </div>

          {/* Key Points */}
          {summaryData.keyPoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Key Points</h4>
              <div className="space-y-2">
                {summaryData.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {summaryData.medications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Medications Discussed</h4>
              <div className="grid gap-2">
                {summaryData.medications.map((medication, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Pill className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800">{medication}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Actions */}
          {summaryData.followUp.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Follow-up Actions</h4>
              <div className="space-y-2">
                {summaryData.followUp.map((action, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Full Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Complete Summary</h4>
            <Badge variant="outline" className="text-xs">HIPAA Compliant</Badge>
          </div>
          <ScrollArea className="h-32 w-full rounded-md border p-4">
            <div className="text-sm whitespace-pre-wrap">{visit.summary}</div>
          </ScrollArea>
        </div>

        {/* Transcription */}
        {visit.transcription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Visit Transcription</h4>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-1" />
                    View Full Transcript
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Complete Visit Transcription</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">{visit.transcription}</div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {visit.transcription}
              </p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-xs text-green-700">
            This visit summary is encrypted and stored securely in compliance with HIPAA regulations.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}