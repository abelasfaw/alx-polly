'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleVote } from '@/lib/actions/vote';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface PollOption {
  id: string;
  content: string;
  votes: number;
}

interface VotingOptionsProps {
  pollId: string;
  options: PollOption[];
  totalVotes: number;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Voting...' : 'Vote'}
    </Button>
  );
}

export function VotingOptions({ pollId, options, totalVotes }: VotingOptionsProps) {
interface FormState {
  message: string | null;
  errors: Record<string, string[]> | null;
}

  const initialState: FormState = { message: null, errors: {} };
  const [state, formAction] = useFormState<FormState, FormData>(handleVote, initialState);
  useEffect(() => {
    if (state?.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast.error(state.message);
      } else {
        toast.success(state.message);
      }
    }
  }, [state]);

  return (
    <div className="space-y-4">
      {options.map((option: PollOption) => (
        <div key={option.id} className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span>{option.content}</span>
            <span>{option.votes} votes</span>
          </div>
          <Progress value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} className="w-full" />
          <form action={formAction}>
            <input type="hidden" name="pollId" value={pollId} />
            <input type="hidden" name="optionId" value={option.id} />
            <SubmitButton />
          </form>
        </div>
      ))}
    </div>
  );
}