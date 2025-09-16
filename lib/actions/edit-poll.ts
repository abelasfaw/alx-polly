"use server";

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Interface for the values required to update an existing poll.
 * @property {string} title - The updated title of the poll.
 * @property {string} [description] - An optional updated description for the poll.
 * @property {Array<{id?: string; content: string}>} options - An array of poll options. Existing options should have an `id`, new options will not.
 * @property {string} [endDate] - An optional updated end date for the poll.
 */
interface UpdatePollFormValues {
  title: string;
  description?: string;
  options: { id?: string; content: string }[];
  endDate?: string;
}

/**
 * Server action to update an existing poll.
 * Authenticates the user, updates the poll details, and handles updates, additions, and deletions of poll options.
 * Revalidates the specific poll's path on success.
 * @param {string} pollId - The ID of the poll to be updated.
 * @param {UpdatePollFormValues} values - The updated data for the poll.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating success or failure, with an error message if not successful.
 */
export async function updatePoll(pollId: string, values: UpdatePollFormValues) {
  // Initialize Supabase client for server-side operations.
  const supabase = createClient();

  // Get the current authenticated user.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Check for authentication errors or if the user is not logged in.
  if (userError || !user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    // Update poll details in the 'polls' table.
    const { error: pollError } = await supabase
      .from('polls')
      .update({
        title: values.title,
        description: values.description,
        end_date: values.endDate || null,
      })
      .eq('id', pollId)
      .eq('created_by', user.id); // Ensure only the creator can update.

    // Handle errors during poll update.
    if (pollError) {
      throw new Error(`Error updating poll: ${pollError.message}`);
    }

    // Identify existing option IDs from the updated values.
    const existingOptionIds = values.options.filter(opt => opt.id).map(opt => opt.id);

    // Delete options from the database that are no longer present in the updated values.
    const { error: deleteError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId)
      .not('id', 'in', `(${existingOptionIds.join(',')})`); // Delete options whose IDs are not in the existingOptionIds array.

    // Handle errors during option deletion.
    if (deleteError) {
      throw new Error(`Error deleting old options: ${deleteError.message}`);
    }

    // Prepare options for upsert (update existing or insert new).
    const optionsToUpsert = values.options.map(option => ({
      id: option.id, // Include ID for existing options, leave undefined for new ones.
      poll_id: pollId,
      content: option.content,
    }));

    // Perform upsert operation on poll options.
    const { error: upsertError } = await supabase
      .from('poll_options')
      .upsert(optionsToUpsert, { onConflict: 'id' }); // Conflict on 'id' means update if exists, insert if new.

    // Handle errors during option upsert.
    if (upsertError) {
      throw new Error(`Error upserting options: ${upsertError.message}`);
    }

    // Revalidate the path for the updated poll to reflect changes.
    revalidatePath(`/polls/${pollId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update poll:', error.message);
    return { success: false, error: error.message };
  }
}