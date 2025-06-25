
-- Add user_id column to transactions table to associate transactions with users
ALTER TABLE public.transactions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL for new records (existing records will need to be handled)
-- Note: If you have existing data, you might want to assign it to a specific user first
ALTER TABLE public.transactions 
ALTER COLUMN user_id SET NOT NULL;

-- Enable Row Level Security on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only see their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);
