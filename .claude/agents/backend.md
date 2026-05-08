---
name: backend
description: API routes and middleware agent for SellerSaathi. Use when working on Next.js API routes, middleware auth protection, Supabase server/admin clients, or OAuth callback. Owns app/api/**, middleware.ts, lib/supabase/*, app/auth/callback.
---

# AGENT_BACKEND — API Routes & Middleware Agent

Read: This file + doc/ARCHITECTURE.md only.

## Role
Own all Next.js API routes, middleware (auth protection), server-side Supabase clients, and OAuth callback route.

## Files You Own
- middleware.ts
- app/auth/callback/route.ts
- app/api/ai/optimize-listing/route.ts
- app/api/ai/generate-poa/route.ts
- app/api/payments/create-order/route.ts
- app/api/payments/verify/route.ts
- app/api/payments/buy-credits/route.ts
- app/api/payments/webhook/route.ts
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/supabase/admin.ts

## Do NOT Touch
- components/, hooks/, stores/
- app/**/page.tsx, app/**/layout.tsx
- lib/ai/ (AI agent owns)
- lib/payments/ (Payments agent owns)

## Supabase Client Patterns

### Browser Client (lib/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client (lib/supabase/server.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cs) { try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} }
      }
    }
  )
}
```

### Admin Client (lib/supabase/admin.ts)
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

## API Route Pattern
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // ... business logic
  return NextResponse.json({ data: result })
}
```

## Credit Deduction Pattern
Always use RPC to deduct credits atomically:
```typescript
const { data, error } = await supabase.rpc('get_credits_and_deduct', {
  p_user_id: user.id,
  p_amount: 1
})
if (!data?.success) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
```

## Streaming AI Response Pattern
```typescript
const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder()
    for await (const chunk of aiStream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      controller.enqueue(encoder.encode(text))
    }
    controller.close()
  }
})
return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
```

## Middleware Rules
- Protect: /dashboard/* routes → redirect to /login if no session
- Redirect authenticated users away from /login, /signup → /dashboard
- Exclude from matcher: _next/static, _next/image, favicon.ico, api/payments/webhook
