'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth.store'

export function useSubscription() {
  const { profile } = useAuthStore()
  const supabase = createClient()

  return useQuery({
    queryKey: ['subscription', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single()
      return data
    },
    enabled: !!profile?.id,
  })
}
