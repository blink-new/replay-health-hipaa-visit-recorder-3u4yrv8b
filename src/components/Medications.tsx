import { useState, useEffect, useCallback } from 'react'
import { Plus, Pill, Calendar, Clock, User, Trash2, Edit } from 'lucide-react'
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
import { Medication, User as UserType } from '../types'
import { MedicationAutocomplete } from './MedicationAutocomplete'

interface MedicationsProps {
  user: UserType
}

export default function Medications({ user }: MedicationsProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMedication, setShowAddMedication] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const { toast } = useToast()

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribedBy: '',
    notes: ''
  })

  const loadMedications = useCallback(async () => {
    try {
      const data = await blink.db.medications.list({ 
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setMedications(data)
    } catch (error) {
      console.error('Error loading medications:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in medication name, dosage, and frequency.',
        variant: 'destructive'
      })
      return
    }

    try {
      const medication = await blink.db.medications.create({
        ...newMedication,
        userId: user.id,
        createdAt: new Date().toISOString()
      })
      
      setMedications([medication, ...medications])
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        prescribedBy: '',
        notes: ''
      })
      setShowAddMedication(false)
      
      toast({
        title: 'Medication Added',
        description: `${medication.name} has been added to your medications.`
      })
    } catch (error) {
      console.error('Error adding medication:', error)
      toast({
        title: 'Error',
        description: 'Failed to add medication. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteMedication = async (medication: Medication) => {
    try {
      await blink.db.medications.delete(medication.id)
      setMedications(medications.filter(m => m.id !== medication.id))
      
      toast({
        title: 'Medication Removed',
        description: `${medication.name} has been removed from your medications.`
      })
    } catch (error) {
      console.error('Error deleting medication:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove medication. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const isActive = (medication: Medication) => {
    if (!medication.endDate) return true
    return new Date(medication.endDate) > new Date()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Medications</h2>
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
          <h2 className="text-2xl font-bold">Medications</h2>
          <p className="text-muted-foreground">Track your current and past medications</p>
        </div>
        
        <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Search Medication Database</Label>
                <MedicationAutocomplete
                  onSelect={(medication) => {
                    setNewMedication({
                      ...newMedication,
                      name: medication.generic_name,
                      dosage: medication.common_dosages.split(', ')[0] || '', // Use first common dosage
                      notes: `${medication.drug_class} - Used for: ${medication.indication}`
                    })
                  }}
                  placeholder="Search for medications..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Search our database of medications or add manually below
                </p>
              </div>
              
              <div className="border-t pt-4">
                <div>
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    placeholder="e.g., Lisinopril"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    placeholder="e.g., 10mg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={newMedication.frequency} onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once-daily">Once daily</SelectItem>
                    <SelectItem value="twice-daily">Twice daily</SelectItem>
                    <SelectItem value="three-times-daily">Three times daily</SelectItem>
                    <SelectItem value="four-times-daily">Four times daily</SelectItem>
                    <SelectItem value="as-needed">As needed</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newMedication.startDate}
                    onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newMedication.endDate}
                    onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="prescribedBy">Prescribed By</Label>
                <Input
                  id="prescribedBy"
                  value={newMedication.prescribedBy}
                  onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                  placeholder="Take with food, side effects, etc."
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddMedication(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMedication}>Add Medication</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Medications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your medications to keep better records of your healthcare
            </p>
            <Button onClick={() => setShowAddMedication(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((medication) => (
            <Card key={medication.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{medication.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={isActive(medication) ? 'default' : 'secondary'}>
                        {isActive(medication) ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{medication.dosage}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingMedication(medication)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMedication(medication)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{medication.frequency.replace('-', ' ')}</span>
                </div>
                
                {medication.prescribedBy && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Prescribed by {medication.prescribedBy}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Started: {formatDate(medication.startDate)}
                    {medication.endDate && ` • Ends: ${formatDate(medication.endDate)}`}
                  </span>
                </div>

                {medication.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">{medication.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}