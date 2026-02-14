
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  team TEXT NOT NULL CHECK (team IN ('suporte-tecnico', 'financeiro', 'comercial', 'infra')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Add user_id to chats
ALTER TABLE public.chats ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to chats" ON public.chats;
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;

-- New RLS policies for chats (user-scoped)
CREATE POLICY "Users can read own chats" ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chats FOR DELETE USING (auth.uid() = user_id);

-- New RLS policies for messages (via chat ownership)
CREATE POLICY "Users can read own messages" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
CREATE POLICY "Users can create own messages" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.chats WHERE chats.id = messages.chat_id AND chats.user_id = auth.uid()));

-- Trigger to auto-create profile is NOT needed here since we create it during registration

-- Index for faster lookups
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
