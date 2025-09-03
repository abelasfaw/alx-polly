"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface UpdatePollFormValues {
  title: string;
  description?: string;
  options: { id?: string; content: string }[];
  endDate?: string;
}

export async function updatePoll(pollId: string, values: UpdatePollFormValues) {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    // Update poll details
    const { error: pollError } = await supabase
      .from('polls')
      .update({
        title: values.title,
        description: values.description,
        end_date: values.endDate || null,
      })
      .eq('id', pollId)
      .eq('created_by', user.id);

    if (pollError) {
      throw new Error(`Error updating poll: ${pollError.message}`);
    }

    // Handle options: update existing, add new, delete removed
    const existingOptionIds = values.options.filter(opt => opt.id).map(opt => opt.id);

    // Delete options that are no longer present
    const { error: deleteError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId)
      .not('id', 'in', `(${existingOptionIds.join(',')})`);

    if (deleteError) {
      throw new Error(`Error deleting old options: ${deleteError.message}`);
    }

    // Upsert (update or insert) options
    const optionsToUpsert = values.options.map(option => ({
      id: option.id,
      poll_id: pollId,
      content: option.content,
    }));

    const { error: upsertError } = await supabase
      .from('poll_options')
      .upsert(optionsToUpsert, { onConflict: 'id' });

    if (upsertError) {
      throw new Error(`Error upserting options: ${upsertError.message}`);
    }

    revalidatePath(`/polls/${pollId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update poll:', error.message);
    return { success: false, error: error.message };
  }
}