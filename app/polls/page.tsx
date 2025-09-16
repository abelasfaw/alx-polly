import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deletePoll } from '@/lib/actions/poll';
import { format } from 'date-fns';

/**
 * Renders the PollsPage, displaying a list of all created polls.
 * Allows users to view, create, edit, and delete polls.
 * This is a Server Component, fetching data directly from Supabase.
 */
export default async function PollsPage() {
  // Initializes the Supabase client for server-side operations.
  const supabase = createClient();
  // Fetches the current authenticated user.
  const { data: { user } } = await supabase.auth.getUser();

  // Fetches poll data from Supabase, including poll options and vote counts.
  const { data: polls, error } = await supabase
    .from('polls')
    .select(`
      id,
      title,
      description,
      created_at,
      created_by,
      poll_options ( id, votes(count) )
    `)
    .order('created_at', { ascending: false });

  // Handles errors during poll data fetching.
  if (error) {
    console.error('Error fetching polls:', error);
    return <div className="container mx-auto py-8">Error loading polls.</div>;
  }
  return (
    <div className="container mx-auto py-8">
      {/* Header section for the polls page */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Polls</h1>
        {/* Button to navigate to the poll creation page */}
        <Button asChild>
          <Link href="/polls/create">Create Poll</Link>
        </Button>
      </div>

      {/* Grid layout for displaying individual poll cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Maps through the fetched polls and renders a Card for each */}
        {polls?.map((poll) => (
          <div key={poll.id} className="flex flex-col">
            {/* Poll Card */}
            <Card className="hover:shadow-lg transition-shadow flex-1">
              <CardHeader>
                {/* Poll Title */}
                <CardTitle>{poll.title}</CardTitle>
                {/* Poll Description */}
                <CardDescription>{poll.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Displays number of options and total votes */}
                <p className="text-sm text-muted-foreground">
                  {poll.poll_options?.length || 0} options • {poll.poll_options?.reduce((acc: number, option: any) => acc + (option.votes?.[0]?.count || 0), 0) || 0} votes
                </p>
                {/* Displays poll creation details */}
                <p className="text-sm text-muted-foreground mt-1">
                  Created by {user && poll.created_by === user.id ? 'You' : 'Someone'} on {format(new Date(poll.created_at), 'MMM dd, yyyy')}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {/* Button to view the detailed poll page */}
                <Button asChild className="w-full">
                  <Link href={`/polls/${poll.id}`}>View Poll</Link>
                </Button>
              </CardFooter>
            </Card>
            {/* Conditional rendering for edit and delete buttons, only for poll creators */}
            {user && poll.created_by === user.id && (
              <div className="flex gap-2 mt-2 w-full">
                {/* Button to edit the poll */}
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/polls/${poll.id}/edit`}>
                  Edit
                </Link>
                </Button>
                {/* Form to delete the poll, using a Server Action */}
                <form action={deletePoll} className="flex-1">
                  <input type="hidden" name="pollId" value={poll.id} />
                  <Button type="submit" variant="destructive" size="sm" className="w-full">
                    Delete
                  </Button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}