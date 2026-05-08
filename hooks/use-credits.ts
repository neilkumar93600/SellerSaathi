'use client'
import { useAuthStore } from '@/stores/auth.store'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export function useCredits() {
  const { profile } = useAuthStore()
  const supabase = createClient()

  const { data: credits, refetch } = useQuery({
    queryKey: ['credits', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null
      const { data } = await supabase
        .from('profiles')
        .select('credits_remaining, plan')
        .eq('id', profile.id)
        .single()
      return data
    },
    enabled: !!profile?.id,
    staleTime: 30 * 1000,
  })

  const hasCredits = (required: number) => (credits?.credits_remaining ?? 0) >= required

  return {
    credits: credits?.credits_remaining ?? 0,
    plan: credits?.plan ?? 'free',
    hasCredits,
    refetchCredits: refetch
  }
}
