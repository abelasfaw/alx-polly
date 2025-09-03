'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface PollVoteFormProps {
  pollId: string;
  options: { id: string; text: string; votes: number }[];
}

export function PollVoteForm({ pollId, options }: PollVoteFormProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleVote = async () => {
    if (selectedOption) {
      // In a real app, this would send the vote to an API
      const { data, error } = await supabase
        .from('poll_options')
        .update({ votes: options.find(o => o.id === selectedOption)!.votes + 1 })
        .eq('id', selectedOption);

      if (error) {
        console.error('Error submitting vote:', error);
        alert('Error submitting vote. Please try again.');
      } else {
        setHasVoted(true);
        router.refresh(); // Refresh the page to show updated vote counts
      }
    }
  };

  return (
    <div className="flex-col space-y-4 mt-4">
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <input
              type="radio"
              id={option.id}
              name="poll-option"
              value={option.id}
              onChange={() => setSelectedOption(option.id)}
              className="cursor-pointer"
              disabled={hasVoted}
            />
            <label htmlFor={option.id} className={hasVoted ? '' : 'cursor-pointer'}>
              {option.text}
            </label>
          </div>
        ))}
      </div>
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
            Thank you for voting!
          </p>
        )}
      </div>
    </div>
  );
}