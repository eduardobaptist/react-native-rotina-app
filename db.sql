CREATE TABLE public.tarefas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  titulo text,
  descricao text,
  prioridade text DEFAULT 'baixa'::text,
  concluida boolean DEFAULT false,
  latitude double precision,
  longitude double precision,
  nome_local text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  concluida_em timestamp with time zone,
  raio_notificacao_metros integer NOT NULL DEFAULT 200,
  CONSTRAINT tarefas_pkey PRIMARY KEY (id)
);