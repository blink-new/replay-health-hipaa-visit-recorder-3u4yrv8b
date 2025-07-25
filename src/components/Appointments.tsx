import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, Clock, MapPin, Video, Phone, Trash2, Edit } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { Appointment, Provider, User as UserType } from '../types'

interface AppointmentsProps {
  user: UserType
}

export default function Appointments({ user }: AppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()

  const [newAppointment, setNewAppointment] = useState({
    providerId: '',
    title: '',
    date: '',
    time: '',
    type: 'in-person' as 'in-person' | 'telehealth',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    notes: ''
  })

  const loadData = useCallback(async () => {
    try {
      const [appointmentsData, providersData] = await Promise.all([
        blink.db.appointments.list({ 
          where: { userId: user.id },
          orderBy: { date: 'asc' }
        }),
        blink.db.providers.list({ where: { userId: user.id } })
      ])
      setAppointments(appointmentsData)
      setProviders(providersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddAppointment = async () => {
    if (!newAppointment.providerId || !newAppointment.title || !newAppointment.date || !newAppointment.time) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    try {
      const appointment = await blink.db.appointments.create({
        ...newAppointment,
        userId: user.id,
        createdAt: new Date().toISOString()
      })
      
      setAppointments([...appointments, appointment])
      setNewAppointment({
        providerId: '',
        title: '',
        date: '',
        time: '',
        type: 'in-person',
        status: 'scheduled',
        notes: ''
      })
      setShowAddAppointment(false)
      
      toast({
        title: 'Appointment Added',
        description: `${appointment.title} has been scheduled.`
      })
    } catch (error) {
      console.error('Error adding appointment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add appointment. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteAppointment = async (appointment: Appointment) => {
    try {
      await blink.db.appointments.delete(appointment.id)
      setAppointments(appointments.filter(a => a.id !== appointment.id))
      
      toast({
        title: 'Appointment Removed',
        description: `${appointment.title} has been removed.`
      })
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove appointment. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getProvider = (providerId: string) => {
    return providers.find(p => p.id === providerId)
  }

  const formatDateTime = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`)
    return {
      date: appointmentDate.toLocaleDateString(),
      time: appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    return appointmentDateTime > new Date()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Appointments</h2>
        </div>
        <div className="space-y-4">
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

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && isUpcoming(apt.date, apt.time)
  )
  const pastAppointments = appointments.filter(apt => 
    apt.status !== 'scheduled' || !isUpcoming(apt.date, apt.time)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointments</h2>
          <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
        </div>
        
        <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider *</Label>
                <Select value={newAppointment.providerId} onValueChange={(value) => setNewAppointment({ ...newAppointment, providerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} - {provider.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Appointment Title *</Label>
                <Input
                  id="title"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                  placeholder="e.g., Annual Checkup"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newAppointment.type} onValueChange={(value: 'in-person' | 'telehealth') => setNewAppointment({ ...newAppointment, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="telehealth">Telehealth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddAppointment(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAppointment}>Add Appointment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {appointments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
            <p className="text-muted-foreground mb-4">
              Schedule your appointments to keep track of your healthcare visits
            </p>
            <Button onClick={() => setShowAddAppointment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => {
                  const provider = getProvider(appointment.providerId)
                  const { date, time } = formatDateTime(appointment.date, appointment.time)
                  
                  return (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{appointment.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {provider?.name} - {provider?.specialty}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingAppointment(appointment)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAppointment(appointment)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{time}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {appointment.type === 'telehealth' ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          <span>{appointment.type === 'telehealth' ? 'Telehealth' : 'In-Person'}</span>
                        </div>

                        {appointment.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Appointments</h3>
              <div className="space-y-4">
                {pastAppointments.map((appointment) => {
                  const provider = getProvider(appointment.providerId)
                  const { date, time } = formatDateTime(appointment.date, appointment.time)
                  
                  return (
                    <Card key={appointment.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{appointment.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {provider?.name} - {provider?.specialty}
                            </p>
                          </div>
                          <Badge variant={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                          </div>
                          {appointment.type === 'telehealth' ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}