'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ListingFormData } from '@/types/listing.types'

export function useListings() {
  const supabase = createClient()

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
  })

  return { listings, isLoading }
}

export function useListing(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()
      return data
    },
    enabled: !!id,
  })
}

export function useOptimizeListing() {
  return useMutation({
    mutationFn: async (formData: ListingFormData) => {
      const response = await fetch('/api/ai/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'Optimization failed')
      }
      return response
    },
  })
}
