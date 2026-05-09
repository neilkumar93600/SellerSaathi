'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { POAFormData } from '@/types/poa.types'

export function usePOAs() {
  const supabase = createClient()
  const { data: poas, isLoading } = useQuery({
    queryKey: ['poas'],
    queryFn: async () => {
      const { data } = await supabase
        .from('poa_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
  })
  return { poas, isLoading }
}

export function useGeneratePOA() {
  return useMutation({
    mutationFn: async (formData: POAFormData) => {
      const response = await fetch('/api/ai/generate-poa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error ?? 'POA generation failed')
      }
      return response
    },
  })
}
