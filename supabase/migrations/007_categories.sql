-- Migration 007: categories table
-- Self-referencing via parent_id for nested categories.

CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id text    NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  name        text    NOT NULL,
  slug        text    NOT NULL,
  parent_id   uuid    REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS categories_platform_id_idx ON public.categories (platform_id);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx   ON public.categories (parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS categories_platform_slug_uidx ON public.categories (platform_id, slug);
