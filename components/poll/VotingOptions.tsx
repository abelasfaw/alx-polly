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

/**
 * SubmitButton component displays a button for submitting a vote.
 * It disables the button while the form is pending.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Voting...' : 'Vote'}
    </Button>
  );
}

/**
 * VotingOptions component displays a list of poll options and allows users to vote.
 * It handles form submission for voting and displays vote counts and progress bars.
 * @param {VotingOptionsProps} { pollId, options, totalVotes } - Props for the component.
 * @param {string} pollId - The ID of the poll.
 * @param {PollOption[]} options - An array of poll options.
 * @param {number} totalVotes - The total number of votes for the poll.
 */
export function VotingOptions({ pollId, options, totalVotes }: VotingOptionsProps) {
interface FormState {
  message: string | null;
  errors: Record<string, string[]> | null;
}

  const initialState: FormState = { message: null, errors: {} };
  // Initializes form state and action for handling votes.
  const [state, formAction] = useFormState<FormState, FormData>(handleVote, initialState);

  // Displays toast notifications based on the form submission state.
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
      {/* Maps through each poll option to display it */}
      {options.map((option: PollOption) => (
        <div key={option.id} className="flex flex-col space-y-2">
          {/* Displays option content and vote count */}
          <div className="flex justify-between items-center">
            <span>{option.content}</span>
            <span>{option.votes} votes</span>
          </div>
          {/* Progress bar showing the percentage of votes for the option */}
          <Progress value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} className="w-full" />
          {/* Form for submitting a vote for the current option */}
          <form action={formAction}>
            {/* Hidden input for poll ID */}
            <input type="hidden" name="pollId" value={pollId} />
            {/* Hidden input for option ID */}
            <input type="hidden" name="optionId" value={option.id} />
            {/* Submit button for voting */}
            <SubmitButton />
          </form>
        </div>
      ))}
    </div>
  );
}