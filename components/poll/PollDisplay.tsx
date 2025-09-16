// components/poll/PollDisplay.tsx
import { createClient } from '@/lib/supabase/server';
import { VotingOptions } from './VotingOptions';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

interface PollOption {
  id: string;
  content: string;
  votes: number;
}

interface PollDisplayProps {
  pollId: string;
}

/**
 * PollDisplay component fetches and displays a single poll, including its options and vote counts.
 * It also provides an interface for users to vote on poll options.
 * @param {PollDisplayProps} { pollId } - The ID of the poll to be displayed.
 */
export default async function PollDisplay({ pollId }: PollDisplayProps) {
  // Initializes Supabase client for server-side data fetching.
  const supabase = createClient();

  console.log('Fetching poll with ID:', pollId);
  // Fetches poll data and its associated options from Supabase.
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select(`
      *,
      poll_options (*)
    `)
    .eq('id', pollId)
    .single();

  console.log('Poll data:', poll);
  console.log('Poll error:', pollError);

  // Handles cases where the poll is not found or an error occurs during fetching.
  if (pollError || !poll) {
    console.error('Error fetching poll:', pollError?.message);
    notFound();
  }

  // Calculates the total number of votes across all options.
  const totalVotes = poll.poll_options.reduce((sum: number, option: PollOption) => sum + option.votes, 0);


  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-100">
      {/* Button to navigate back to the polls list */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/polls">
          <Button variant="outline">Back to Polls</Button>
        </Link>
      </div>
      {/* Main card displaying the poll details */}
      <Card className="w-full max-w-md">
        <CardHeader>
          {/* Poll title */}
          <CardTitle>{poll.title}</CardTitle>
          {/* Poll description (optional) */}
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voting options component */}
          <VotingOptions pollId={poll.id} options={poll.poll_options} totalVotes={totalVotes} />
        </CardContent>
        <CardFooter>
          {/* Displays the total number of votes */}
          <div className="flex justify-between items-center w-full">
            <p className="text-sm text-gray-500">Total Votes: {totalVotes}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}