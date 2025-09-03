'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function handleVote(
  prevState: { message: string | null; errors: Record<string, string[]> | null },
  formData: FormData
) {
  const pollId = formData.get('pollId') as string;
  const optionId = formData.get('optionId') as string;

  if (!pollId) {
    return { message: 'Poll ID is missing.', errors: {} };
  }

  if (!optionId) {
    return { message: 'Option ID is missing.', errors: {} };
  }

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
    return { message: pollError?.message || 'Poll not found', errors: {} };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error('User not authenticated:', userError?.message);
    return { message: userError?.message || 'User not authenticated', errors: {} };
  }

  const userId = userData.user.id;

  // Check if the user has already voted for this poll
  const { data: existingVote, error: existingVoteError } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('poll_id', pollId)
    .single();

  if (existingVoteError && existingVoteError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking existing vote:', existingVoteError.message);
    return { message: existingVoteError.message, errors: {} };
  }

  if (existingVote) {
    console.warn('User has already voted for this poll.');
    return { message: 'You have already voted for this poll.', errors: {} };
  }

  // Insert the new vote
  const { error: voteInsertError } = await supabase.from('votes').insert({
    user_id: userId,
    poll_id: pollId,
    option_id: optionId,
  });

  if (voteInsertError) {
    console.error('Error inserting vote:', voteInsertError.message);
    return { message: voteInsertError.message, errors: {} };
  }

  // Increment the vote count for the selected option
  const { error } = await supabase
    .rpc('increment_vote', { option_id_param: optionId });

  if (error) {
    console.error('Error voting:', error.message);
    return { message: error.message, errors: {} };
  }
  revalidatePath(`/polls/${pollId}`);
  return { message: 'Vote submitted successfully!', errors: {} };
}