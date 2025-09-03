import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import { PollVoteForm } from './poll-vote-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Copy, Share2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
interface PollOption {
  id: string;
  option_text: string;
  votes: number;
  poll_id: string;
}

interface Poll {
  id: string;
  question: string;
  created_at: string;
  user_id: string;
  poll_options: PollOption[];
}

export default async function PollDisplay({ pollId }: { pollId: string }) {
  const supabase = createClient();

  const { data: poll } = await supabase
    .from('polls')
    .select('*, poll_options(*)')
    .eq('id', pollId)
    .single();

  if (!poll) {
    notFound();
  }

  const totalVotes = poll.poll_options.reduce((sum: number, option: PollOption) => sum + option.votes, 0);

  const getPercentage = (votes: number) => {
    return totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{poll.question}</h1>
      <div className="space-y-4">
        {poll.poll_options.map((option: PollOption) => (
          <div key={option.id} className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span>{option.option_text}</span>
              <span>{getPercentage(option.votes)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${getPercentage(option.votes)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <PollVoteForm poll={poll} totalVotes={totalVotes} getPercentage={getPercentage} />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Poll Actions</CardTitle>
          <CardDescription>Manage your poll or share it with others.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex space-x-2">
            <Button asChild>
              <Link href={`/polls/${poll.id}/edit`}>Edit Poll</Link>
            </Button>
            <Button variant="destructive">Delete Poll</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="share-link">Shareable Link</Label>
            <div className="flex space-x-2">
              <Input id="share-link" readOnly value={`${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.id}`} />
              <Button onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.id}`)}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
          <Button className="w-full" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote on my poll: ${poll.question}`)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/polls/${poll.id}`)}`, '_blank')}><Share2 className="h-4 w-4 mr-2" />Share on Twitter</Button>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Created by {poll.user_id} on {new Date(poll.created_at).toLocaleDateString()}
        </CardFooter>
      </Card>
    </div>
  );
}