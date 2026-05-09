'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LanguageSelect } from '@/components/shared/LanguageSelect'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'
import type { PlatformId } from '@/types/database.types'

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, updatePassword, signOut } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [language, setLanguage] = useState(profile?.language_preference ?? 'en')
  const [platform, setPlatform] = useState<PlatformId>(
    profile?.primary_platform ?? 'amazon_india'
  )
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [pwMsg, setPwMsg] = useState<string | null>(null)

  const isEmailUser = user?.app_metadata?.provider === 'email'

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ full_name: fullName, language_preference: language, primary_platform: platform })
        .eq('id', user!.id)
      setSaveMsg('Profile saved.')
    } catch {
      setSaveMsg('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setPwMsg('Password must be at least 8 characters.')
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) throw error
      setPwMsg('Password updated.')
      setNewPassword('')
    } catch {
      setPwMsg('Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  async function deleteAccount() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email ?? ''}
                disabled
                className="h-10 rounded-xl opacity-60"
              />
            </div>
            {saveMsg && (
              <p className="text-sm text-muted-foreground">{saveMsg}</p>
            )}
            <Button type="submit" disabled={saving} className="rounded-xl">
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interface language</Label>
            <LanguageSelect
              value={language}
              onChange={setLanguage}
              ariaLabel="Interface language"
            />
          </div>
          <div className="space-y-2">
            <Label>Primary platform</Label>
            <div className="flex gap-2">
              {(['amazon_india', 'flipkart'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    platform === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {p === 'amazon_india' ? 'Amazon India' : 'Flipkart'}
                </button>
              ))}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const supabase = createClient()
              supabase
                .from('profiles')
                .update({ language_preference: language, primary_platform: platform })
                .eq('id', user!.id)
            }}
            className="rounded-xl"
          >
            Save preferences
          </Button>
        </CardContent>
      </Card>

      {isEmailUser && (
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-10 rounded-xl"
                />
              </div>
              {pwMsg && <p className="text-sm text-muted-foreground">{pwMsg}</p>}
              <Button type="submit" disabled={pwSaving} variant="outline" className="rounded-xl">
                {pwSaving ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <Separator className="mb-6" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-destructive">Danger zone</p>
          <p className="text-xs text-muted-foreground">
            Deleting your account is permanent and cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="rounded-xl">
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, listings, and POAs. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
