export interface User {
  id: string
  email: string
  displayName?: string
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  location: string
  phone?: string
  email?: string
  userId: string
  createdAt: string
}

export interface Visit {
  id: string
  providerId: string
  title: string
  date: string
  duration: number
  audioUrl?: string
  transcription?: string
  summary?: string
  keyPoints: string[]
  medications: string[]
  followUpActions: string[]
  userId: string
  createdAt: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy: string
  notes?: string
  userId: string
  createdAt: string
}

export interface Appointment {
  id: string
  providerId: string
  title: string
  date: string
  time: string
  type: 'in-person' | 'telehealth'
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  userId: string
  createdAt: string
}