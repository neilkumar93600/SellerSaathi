# AGENT_BACKEND — API Routes & Middleware Agent

**Read:** This file + `ARCHITECTURE.md` only.

---

## Role
You own all Next.js API routes, middleware (auth protection), server-side Supabase clients, and the OAuth callback route.

## Files You Own
```
middleware.ts
app/auth/callback/route.ts
app/api/ai/optimize-listing/route.ts
app/api/ai/generate-poa/route.ts
app/api/payments/create-order/route.ts
app/api/payments/verify/route.ts
app/api/payments/buy-credits/route.ts
app/api/payments/webhook/route.ts
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
```

## Do NOT Touch
- `components/`, `hooks/`, `stores/`
- `app/**/page.tsx`, `app/**/layout.tsx`
- `lib/ai/` (AI agent owns this)
- `lib/payments/` (Payments agent owns this)

---

## Supabase Client Patterns

### Browser Client (`lib/supabase/client.ts`)
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

### Server Client (`lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll(cs) { try { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} } } }
  )
}
```

### Admin Client (`lib/supabase/admin.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
```

---

## Middleware (`middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard']
const AUTH_PATHS = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // Create response + refresh Supabase session
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cs) { cs.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options) }) }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.includes(pathname) && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/payments/webhook).*)']
}
```

---

## Auth Callback (`app/auth/callback/route.ts`)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

---

## API Route Pattern

Every API route follows this structure:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({ /* fields */ })

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate body
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    // 3. Business logic here

    // 4. Return
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[route-name]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## AI Route: optimize-listing

**File:** `app/api/ai/optimize-listing/route.ts`

**Method:** POST  
**Body:**
```typescript
{
  platform: 'amazon_india' | 'flipkart'
  category_id: string
  input_title: string
  input_description: string
  input_bullets: string[]
  input_specs: Record<string, string>
  input_keywords?: string
  output_language: string  // 'en'|'hi'|'bn'|'ta'|'te'|'kn'|'mr'|'gu'
}
```

**Flow:**
1. Auth check
2. Validate body with Zod
3. Check user credits via RPC `get_credits_and_deduct(user.id, 1)`
4. If credits < 1: return `{ error: 'insufficient_credits' }` 400
5. Insert listing row with status `processing`
6. Call `lib/ai/prompts/listing.prompts.ts` to get prompt
7. Call NVIDIA DeepSeek API with streaming enabled
8. Return `ReadableStream` (SSE) to client
9. On stream complete: update listing row with results, status `completed`
10. On error: update listing row status `failed`

**Returns:** `text/event-stream` SSE stream

---

## AI Route: generate-poa

**File:** `app/api/ai/generate-poa/route.ts`

**Method:** POST  
**Body:**
```typescript
{
  platform: 'amazon_india' | 'flipkart'
  asin_or_listing_id: string
  suspension_reason: string
  suspension_notice_text: string
}
```

**Flow:**
1. Auth check
2. Validate body
3. Check credits: `get_credits_and_deduct(user.id, 2)` (costs 2 credits)
4. Insert poa_request row status `processing`
5. Build POA prompt from `lib/ai/prompts/poa.prompts.ts`
6. Stream DeepSeek response
7. Update poa_request row with generated_poa, status `completed`
8. Return stream

---

## Response Format (non-streaming routes)

```typescript
// Success
{ data: T, message?: string }

// Error
{ error: string, code?: string, details?: unknown }
```

---

## Key Libraries to Import
```typescript
import { createClient } from '@/lib/supabase/server'  // server routes
import { supabaseAdmin } from '@/lib/supabase/admin'    // webhooks only
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
```

## Packages Required
```json
"@supabase/ssr": "latest",
"@supabase/supabase-js": "^2",
"zod": "^3"
```
