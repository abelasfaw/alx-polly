import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deletePoll } from '@/lib/actions/poll';
import { format } from 'date-fns';

export default async function PollsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  if (error) {
    console.error('Error fetching polls:', error);
    return <div className="container mx-auto py-8">Error loading polls.</div>;
  }
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Button asChild>
          <Link href="/polls/create">Create Poll</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls?.map((poll) => (
          <div key={poll.id} className="flex flex-col">
            <Card className="hover:shadow-lg transition-shadow flex-1">
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {poll.poll_options?.length || 0} options • {poll.poll_options?.reduce((acc: number, option: any) => acc + (option.votes?.[0]?.count || 0), 0) || 0} votes
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Created by {user && poll.created_by === user.id ? 'You' : 'Someone'} on {format(new Date(poll.created_at), 'MMM dd, yyyy')}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href={`/polls/${poll.id}`}>View Poll</Link>
                </Button>
              </CardFooter>
            </Card>
            {user && poll.created_by === user.id && (
              <div className="flex gap-2 mt-2 w-full">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/polls/${poll.id}/edit`}>
                  Edit
                </Link>
                </Button>
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