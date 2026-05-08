# SellerSaathi AI Assistant Guidelines

## Context
SellerSaathi is an AI-powered web platform for Amazon India and Flipkart sellers.
Stack: Next.js 15, TypeScript, Tailwind v4, shadcn/ui, Supabase, NVIDIA DeepSeek, Razorpay.

## Architecture Guidelines
- Frontend: Next.js 15 App Router, React Server Components where applicable.
- Styling: Tailwind CSS v4, shadcn/ui components.
- Database: Supabase (PostgreSQL), with Row Level Security (RLS).
- AI Integration: NVIDIA DeepSeek API.
- Payments: Razorpay.

## Agents & Commands
- Agents are located in `.claude/agents/`
- Custom commands are in `.claude/commands/`
- Project rules are in `.claude/rules/`
