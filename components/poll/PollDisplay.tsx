// components/poll/PollDisplay.tsx
import { createClient } from '@/lib/supabase/server';
import { handleVote } from '@/lib/actions/vote';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { revalidatePath } from 'next/cache';

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          {poll.description && <CardDescription>{poll.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {poll.poll_options.map((option: PollOption) => (
            <div key={option.id} className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span>{option.content}</span>
                <span>{option.votes} votes</span>
              </div>
              <Progress value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} className="w-full" />
              <form action={handleVote.bind(null, poll.id, option.id)}>
                <Button type="submit" className="w-full">Vote</Button>
              </form>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">Total Votes: {totalVotes}</p>
        </CardFooter>
      </Card>
    </div>
  );
}