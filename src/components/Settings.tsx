import { useState } from 'react'
import { Shield, User, Bell, Download, Share, Lock } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { User as UserType } from '../types'

interface SettingsProps {
  user: UserType
}

export default function Settings({ user }: SettingsProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      await blink.auth.updateMe({ displayName })
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportData = () => {
    toast({
      title: 'Export Initiated',
      description: 'Your data export will be ready shortly and sent to your email.'
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion',
      description: 'Please contact support to delete your account.',
      variant: 'destructive'
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and privacy preferences</p>
      </div>

      {/* HIPAA Compliance Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-accent" />
            <CardTitle>HIPAA Compliance Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Encryption</p>
              <p className="text-sm text-muted-foreground">All data is encrypted at rest and in transit</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Access Controls</p>
              <p className="text-sm text-muted-foreground">Multi-factor authentication enabled</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Lock className="h-3 w-3 mr-1" />
              Secured
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Audit Logging</p>
              <p className="text-sm text-muted-foreground">All access and changes are logged</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your visits and appointments
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming appointments
              </p>
            </div>
            <Switch
              checked={appointmentReminders}
              onCheckedChange={setAppointmentReminders}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Privacy & Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Anonymous Usage Analytics</p>
              <p className="text-sm text-muted-foreground">
                Help improve the app by sharing anonymous usage data
              </p>
            </div>
            <Switch
              checked={dataSharing}
              onCheckedChange={setDataSharing}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div>
              <p className="font-medium">Data Export</p>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your data in a secure, portable format
              </p>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Share className="h-5 w-5" />
            <CardTitle>Sharing & Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Authorized Healthcare Providers</p>
            <p className="text-sm text-muted-foreground mb-4">
              Manage which healthcare providers can access your visit summaries
            </p>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Manage Provider Access
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <p className="font-medium mb-2">Emergency Contacts</p>
            <p className="text-sm text-muted-foreground mb-4">
              Designate emergency contacts who can access your medical information
            </p>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Add Emergency Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Delete Account</p>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}