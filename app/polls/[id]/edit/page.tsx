import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import EditPollForm from '@/components/poll/EditPollForm';

export default async function EditPollPage({ params }: { params: { id: string } }) {
  const { id: pollId } = params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: poll, error } = await supabase
    .from('polls')
    .select('*, poll_options(*)')
    .eq('id', pollId)
    .single();

  if (error || !poll) {
    console.error('Error fetching poll:', error);
    notFound();
  }

  if (poll.created_by !== user.id) {
    redirect('/polls'); // Redirect if not the creator
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Poll</h1>
      <EditPollForm initialData={poll} />
    </div>
  );
}