ALTER TABLE public.threats ADD severity int NULL DEFAULT 0;
ALTER TABLE public.users ADD "location" varchar NOT NULL DEFAULT 'Zagreb';
ALTER TABLE public.activity_log DROP CONSTRAINT activity_log_un;

