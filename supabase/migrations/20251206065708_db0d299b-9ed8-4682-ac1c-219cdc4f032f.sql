-- Fix RLS: Restrict chat data access to service role only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service role can manage conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Service role can manage messages" ON public.chat_messages;

-- Create proper restrictive policies for service role only
CREATE POLICY "Service role only access conversations" 
ON public.chat_conversations 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role only access messages" 
ON public.chat_messages 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create admin_sessions table to store secure session tokens
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can manage admin sessions
CREATE POLICY "Service role only access admin sessions" 
ON public.admin_sessions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create index for fast token lookup
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(token);

-- Create index for cleanup of expired sessions
CREATE INDEX idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);