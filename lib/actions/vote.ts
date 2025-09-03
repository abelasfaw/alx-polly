'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function handleVote(pollId: string, optionId: string) {
  const supabase = createClient();

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (*)
    `)
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    console.error('Error fetching poll for vote:', pollError?.message);
    return;
  }

  const { error } = await supabase
    .from('poll_options')
    .update({ votes: (poll.poll_options.find((opt: any) => opt.id === optionId)?.votes || 0) + 1 })
    .eq('id', optionId);

  if (error) {
    console.error('Error voting:', error.message);
  }
  revalidatePath(`/polls/${pollId}`);
}