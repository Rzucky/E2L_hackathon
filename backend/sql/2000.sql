CREATE TABLE public.requsts (
	good int NOT NULL DEFAULT 0,
	bad int NULL DEFAULT 0
);
-- i will leave this shame here
ALTER TABLE public.requsts RENAME TO request;
ALTER TABLE public.request RENAME TO requests;
