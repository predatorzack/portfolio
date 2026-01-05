-- Fix RLS policies to properly block public access
-- The existing RESTRICTIVE policies with USING (true) don't block access
-- We need PERMISSIVE policies with USING (false) to deny all non-service-role access

-- Fix admin_sessions
DROP POLICY IF EXISTS "Service role only access admin sessions" ON admin_sessions;
CREATE POLICY "No public access to admin sessions" 
ON admin_sessions FOR ALL 
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Fix chat_conversations  
DROP POLICY IF EXISTS "Service role only access conversations" ON chat_conversations;
CREATE POLICY "No public access to conversations" 
ON chat_conversations FOR ALL 
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Fix chat_messages
DROP POLICY IF EXISTS "Service role only access messages" ON chat_messages;
CREATE POLICY "No public access to messages" 
ON chat_messages FOR ALL 
TO anon, authenticated
USING (false)
WITH CHECK (false);