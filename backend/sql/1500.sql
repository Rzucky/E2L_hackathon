CREATE TABLE public.users (
	username varchar NOT NULL,
	"password" varchar NOT NULL,
	risk_factor int NOT NULL DEFAULT 10,
	"admin" boolean NULL DEFAULT false
);

CREATE TABLE public.activity_log (
	username varchar NULL,
	"time" time NOT NULL,
	activity varchar NOT NULL
);

ALTER TABLE public.users ADD CONSTRAINT users_pk PRIMARY KEY (username);
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_un UNIQUE (username);
ALTER TABLE public.users ADD CONSTRAINT users_fk FOREIGN KEY (username) REFERENCES activity_log(username);


CREATE TABLE public.alerts (
	username varchar NOT NULL,
	"type" varchar NOT NULL,
	url varchar NOT NULL
);

CREATE TABLE public.threats (
	"type" varchar NOT NULL,
	regex varchar NOT NULL,
	occurrence int NULL DEFAULT 0
);

