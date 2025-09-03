'use server';

"use server";

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

interface CreatePollFormValues {
  title: string;
  description?: string;
  options: string[];
  endDate?: string;

}

export async function createPoll(values: CreatePollFormValues) {
  console.log('createPoll function started.');
  console.log('Creating supabase client with cookies:', cookies());
  const supabase = createClient();
  
  console.log('Supabase client created, getting user session...');
  const { data: { user }, error } = await supabase.auth.getUser();
  
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

    if (pollError) {
      throw new Error(`Error creating poll: ${pollError.message}`);
    }
    const optionsToInsert = values.options.map((optionContent) => ({
      poll_id: poll.id,
      content: optionContent,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert);

    if (optionsError) {
      throw new Error(`Error creating poll options: ${optionsError.message}`);
    }

    revalidatePath('/polls');
      return { success: true, pollId: poll.id };
  } catch (error: any) {
      console.error('Failed to create poll:', error.message);
      return { success: false, error: error.message };
    }
}



export async function deletePoll(formData: FormData) {
  const pollId = formData.get("pollId") as string;

  if (!pollId) {
    console.error("Poll ID is missing.");
    return;
  }

  try {
    const supabase = createClient();
    await supabase.from("polls").delete().eq("id", pollId);
    revalidatePath("/polls");
  } catch (error: any) {
    console.error("Error deleting poll:", error.message);
  }
}