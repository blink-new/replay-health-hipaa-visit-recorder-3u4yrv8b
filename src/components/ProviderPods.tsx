import { useState, useEffect, useCallback } from 'react'
import { Plus, Stethoscope, MapPin, Phone, Mail, Mic, FileText, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { Provider, Visit, User } from '../types'
import VisitRecording from './VisitRecording'
import { ProviderAutocomplete } from './ProviderAutocomplete'

interface ProviderPodsProps {
  user: User
}

export default function ProviderPods({ user }: ProviderPodsProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProvider, setShowAddProvider] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showRecording, setShowRecording] = useState(false)
  const { toast } = useToast()

  const [newProvider, setNewProvider] = useState({
    name: '',
    specialty: '',
    location: '',
    phone: '',
    email: ''
  })

  const loadData = useCallback(async () => {
    try {
      const [providersData, visitsData] = await Promise.all([
        blink.db.providers.list({ where: { userId: user.id } }),
        blink.db.visits.list({ where: { userId: user.id } })
      ])
      setProviders(providersData)
      setVisits(visitsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddProvider = async () => {
    if (!newProvider.name || !newProvider.specialty) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in provider name and specialty.',
        variant: 'destructive'
      })
      return
    }

    try {
      const provider = await blink.db.providers.create({
        ...newProvider,
        userId: user.id,
        createdAt: new Date().toISOString()
      })
      
      setProviders([...providers, provider])
      setNewProvider({ name: '', specialty: '', location: '', phone: '', email: '' })
      setShowAddProvider(false)
      
      toast({
        title: 'Provider Added',
        description: `${provider.name} has been added to your providers.`
      })
    } catch (error) {
      console.error('Error adding provider:', error)
      toast({
        title: 'Error',
        description: 'Failed to add provider. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getProviderVisits = (providerId: string) => {
    return visits.filter(visit => visit.providerId === providerId)
  }

  const handleStartRecording = (provider: Provider) => {
    setSelectedProvider(provider)
    setShowRecording(true)
  }

  const handleRecordingComplete = (visit: Visit) => {
    setVisits([visit, ...visits])
    setShowRecording(false)
    setSelectedProvider(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Provider Pods</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Provider Pods</h2>
          <p className="text-muted-foreground">Organize your healthcare providers and visit recordings</p>
        </div>
        
        <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Provider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Search Provider Database</Label>
                <ProviderAutocomplete
                  onSelect={(provider) => {
                    setNewProvider({
                      name: provider.name,
                      specialty: provider.specialty + (provider.subspecialty ? ` - ${provider.subspecialty}` : ''),
                      location: `${provider.organization}, ${provider.city}, ${provider.state}`,
                      phone: provider.phone,
                      email: ''
                    })
                  }}
                  placeholder="Search for healthcare providers..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Search our database of healthcare providers or add manually below
                </p>
              </div>
              
              <div className="border-t pt-4">
                <div>
                  <Label htmlFor="name">Provider Name *</Label>
                  <Input
                    id="name"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    placeholder="Dr. Sarah Johnson"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input
                    id="specialty"
                    value={newProvider.specialty}
                    onChange={(e) => setNewProvider({ ...newProvider, specialty: e.target.value })}
                    placeholder="Cardiology"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Textarea
                  id="location"
                  value={newProvider.location}
                  onChange={(e) => setNewProvider({ ...newProvider, location: e.target.value })}
                  placeholder="123 Medical Center Dr, City, State"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newProvider.phone}
                  onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newProvider.email}
                  onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                  placeholder="office@provider.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddProvider(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProvider}>Add Provider</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {providers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Providers Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your healthcare providers to start organizing your visit recordings
            </p>
            <Button onClick={() => setShowAddProvider(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Provider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const providerVisits = getProviderVisits(provider.id)
            return (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {provider.specialty}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartRecording(provider)}
                      className="shrink-0"
                    >
                      <Mic className="h-4 w-4 mr-1" />
                      Record
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.location && (
                    <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{provider.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {provider.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{provider.phone}</span>
                      </div>
                    )}
                    {provider.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{provider.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{providerVisits.length} visits</span>
                        </div>
                        {providerVisits.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Last: {new Date(providerVisits[0]?.date || '').toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {showRecording && selectedProvider && (
        <VisitRecording
          provider={selectedProvider}
          user={user}
          onComplete={handleRecordingComplete}
          onCancel={() => {
            setShowRecording(false)
            setSelectedProvider(null)
          }}
        />
      )}
    </div>
  )
}