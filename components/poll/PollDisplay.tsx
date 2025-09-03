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

export default async function PollDisplay({ pollId }: PollDisplayProps) {
  const supabase = createClient();

  console.log('Fetching poll with ID:', pollId);
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

  if (pollError || !poll) {
    console.error('Error fetching poll:', pollError?.message);
    notFound();
  }

  const totalVotes = poll.poll_options.reduce((sum: number, option: PollOption) => sum + option.votes, 0);


  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/polls">
          <Button variant="outline">Back to Polls</Button>
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <VotingOptions pollId={poll.id} options={poll.poll_options} totalVotes={totalVotes} />
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <p className="text-sm text-gray-500">Total Votes: {totalVotes}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}