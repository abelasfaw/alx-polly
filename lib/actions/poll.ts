'use server';

"use server";

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Interface for the values required to create a new poll.
 * @property {string} title - The title of the poll.
 * @property {string} [description] - An optional description for the poll.
 * @property {string[]} options - An array of strings, each representing a poll option.
 * @property {string} [endDate] - An optional end date for the poll.
 */
interface CreatePollFormValues {
  title: string;
  description?: string;
  options: string[];
  endDate?: string;

}

/**
 * Server action to create a new poll.
 * Authenticates the user, inserts the poll into the database, and then inserts the associated poll options.
 * Revalidates the '/polls' path on success.
 * @param {CreatePollFormValues} values - The data for the new poll, including title, description, options, and an optional end date.
 * @returns {Promise<{success: boolean, pollId?: string, error?: string}>} An object indicating success or failure, with the poll ID if successful, or an error message if not.
 */
export async function createPoll(values: CreatePollFormValues) {
  console.log('createPoll function started.');
  console.log('Creating supabase client with cookies:', cookies());
  // Initialize Supabase client for server-side operations.
  const supabase = createClient();
  
  console.log('Supabase client created, getting user session...');
  // Get the current authenticated user.
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Check for authentication errors or if the user is not logged in.
  if (error || !user) {
    console.error('Error getting user or user not authenticated:', error);
    throw new Error('User not authenticated');
  }


  console.log('User in createPoll:', user);
  // Log the incoming data to the server action
  console.log('createPoll Server Action received data:', values);

  // Log the user session status (using the already fetched user)
  console.log('User session in createPoll:', user ? 'Authenticated' : 'Not Authenticated');

  // Log the poll data before insertion
  console.log('Attempting to insert poll with data:', {




    title: values.title,
    description: values.description,
    created_by: user.id,
    end_date: values.endDate || null,
  });

  // Log the options data before insertion
  console.log('Attempting to insert options with data:', values.options.map(optionContent => ({ content: optionContent })));


  try {
    // Insert the new poll into the 'polls' table.
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({





        title: values.title,
        description: values.description,
        created_by: user.id,
        end_date: values.endDate || null,
      })
      .select()
      .single();

    // Handle errors during poll insertion.
    if (pollError) {
      throw new Error(`Error creating poll: ${pollError.message}`);
    }
    // Prepare poll options for insertion.
    const optionsToInsert = values.options.map((optionContent) => ({
      poll_id: poll.id,
      content: optionContent,
    }));

    // Insert the poll options into the 'poll_options' table.
    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert);

    // Handle errors during poll options insertion.
    if (optionsError) {
      throw new Error(`Error creating poll options: ${optionsError.message}`);
    }

    // Revalidate the '/polls' path to show the new poll.
    revalidatePath('/polls');
      return { success: true, pollId: poll.id };
  } catch (error: any) {
      console.error('Failed to create poll:', error.message);
      return { success: false, error: error.message };
    }
}



/**
 * Server action to delete a poll.
 * Deletes a poll from the database based on its ID.
 * Revalidates the '/polls' path on success.
 * @param {FormData} formData - The form data containing the pollId to be deleted.
 */
export async function deletePoll(formData: FormData) {
  // Extract pollId from the form data.
  const pollId = formData.get("pollId") as string;

  // If pollId is missing, log an error and return.
  if (!pollId) {
    console.error("Poll ID is missing.");
    return;
  }

  try {
    // Initialize Supabase client for server-side operations.
    const supabase = createClient();
    // Delete the poll from the 'polls' table.
    await supabase.from("polls").delete().eq("id", pollId);
    // Revalidate the '/polls' path to reflect the deletion.
    revalidatePath("/polls");
  } catch (error: any) {
    console.error("Error deleting poll:", error.message);
  }
}