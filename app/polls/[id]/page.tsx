'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data for a single poll
const mockPoll = {
  id: '1',
  title: 'Favorite Programming Language',
  description: 'What is your favorite programming language?',
  options: [
    { id: '1', text: 'JavaScript', votes: 15 },
    { id: '2', text: 'Python', votes: 12 },
    { id: '3', text: 'Java', votes: 8 },
    { id: '4', text: 'C#', votes: 5 },
    { id: '5', text: 'Go', votes: 2 },
  ],
  totalVotes: 42,
  createdBy: 'John Doe',
  createdAt: '2023-05-15',
};

export default function PollPage({ params }: { params: { id: string } }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedOption) {
      // In a real app, this would send the vote to an API
      setHasVoted(true);
    }
  };

  // Calculate percentages for the progress bars
  const getPercentage = (votes: number) => {
    return Math.round((votes / mockPoll.totalVotes) * 100);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/polls" className="text-blue-500 hover:underline flex items-center gap-1">
          ← Back to Polls
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/polls/1/edit">Edit Poll</Link>
          </Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{mockPoll.title}</CardTitle>
          <CardDescription>{mockPoll.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {mockPoll.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!hasVoted ? (
                      <input
                        type="radio"
                        id={option.id}
                        name="poll-option"
                        value={option.id}
                        onChange={() => setSelectedOption(option.id)}
                        className="cursor-pointer"
                      />
                    ) : null}
                    <label htmlFor={option.id} className={hasVoted ? '' : 'cursor-pointer'}>
                      {option.text}
                    </label>
                  </div>
                  {hasVoted && (
                    <span className="text-sm font-medium">
                      {getPercentage(option.votes)}% ({option.votes} votes)
                    </span>
                  )}
                </div>

                {hasVoted && (
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${getPercentage(option.votes)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex-col space-y-4">
          <div className="flex w-full">
            {!hasVoted ? (
              <Button 
                onClick={handleVote} 
                disabled={!selectedOption} 
                className="w-auto"
                size="sm"
              >
                Submit Vote
              </Button>
            ) : (
              <p className="text-left text-muted-foreground">
                Thank you for voting! Total votes: {mockPoll.totalVotes}
              </p>
            )}
          </div>
          
          <div className="flex justify-between w-full">
            <p className="text-sm text-muted-foreground">
              Created by {mockPoll.createdBy}
            </p>
            <p className="text-sm text-muted-foreground">
              Created on {new Date(mockPoll.createdAt).toLocaleDateString('en-US', {month: 'numeric', day: 'numeric', year: 'numeric'}).replace(/\//g, '/')}
            </p>
          </div>
        </CardFooter>
      </Card>

      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button variant="outline" className="h-12 text-lg" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }}>
            Copy Link
          </Button>
          <Button variant="outline" className="h-12 text-lg" onClick={() => {
            const tweetText = encodeURIComponent(`Vote on this poll: ${mockPoll.title}`);
            const tweetUrl = encodeURIComponent(window.location.href);
            window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
          }}>
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}