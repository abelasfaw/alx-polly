"use client";

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updatePoll } from '@/lib/actions/edit-poll';

/**
 * Defines the schema for the poll editing form using Zod.
 * It validates the poll title, description, options (with optional IDs), and an optional end date.
 */
const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  options: z.array(z.object({
    id: z.string().optional(), // Option ID is optional for new options
    content: z.string().min(1, { message: 'Option cannot be empty.' }),
  })).min(2, { message: 'Please add at least two options.' }),
  endDate: z.string().optional(),
});

type PollFormValues = z.infer<typeof formSchema>;

/**
 * Props for the EditPollForm component.
 * @property {Object} initialData - The initial data of the poll to be edited.
 * @property {string} initialData.id - The ID of the poll.
 * @property {string} initialData.title - The title of the poll.
 * @property {string | null} initialData.description - The description of the poll.
 * @property {string | null} initialData.end_date - The end date of the poll.
 * @property {Array<{id: string; content: string}>} initialData.poll_options - The existing options of the poll.
 */
interface EditPollFormProps {
  initialData: {
    id: string;
    title: string;
    description: string | null;
    end_date: string | null;
    poll_options: { id: string; content: string }[];
  };
}

/**
 * EditPollForm component for editing existing polls.
 * Allows users to modify poll title, description, options, and end date.
 * @param {EditPollFormProps} { initialData } - The initial data of the poll to populate the form.
 */
export default function EditPollForm({ initialData }: EditPollFormProps) {
  const router = useRouter();

  // Sets default form values based on the initialData prop.
  const defaultValues: Partial<PollFormValues> = {
    title: initialData.title,
    description: initialData.description || '',
    options: initialData.poll_options.map(option => ({ id: option.id, content: option.content })),
    endDate: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
  };

  // Initializes the form with Zod resolver for validation and default values.
  const form = useForm<PollFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Manages dynamic form fields for poll options.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  /**
   * Handles the form submission for updating a poll.
   * Calls the updatePoll server action and redirects on success.
   * @param {PollFormValues} data - The form data containing updated poll details.
   */
  async function onSubmit(data: PollFormValues) {
    // Calls the server action to update the poll.
    const result = await updatePoll(initialData.id, data);

    if (result.success) {
      router.push(`/polls/${initialData.id}`); // Redirects to the updated poll's page.
      alert('Poll updated successfully!');
    } else {
      alert(`Error: ${result.error}`); // Displays an error message.
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Poll Title input field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter poll title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Poll Description input field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter poll description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Poll Options section */}
        <div>
          <FormLabel>Options</FormLabel>
          {/* Renders each poll option input field */}
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`options.${index}.content`}
              render={({ field: optionField }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="Option content" {...optionField} />
                      {/* Button to remove an option */}
                      <Button type="button" variant="destructive" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          {/* Button to add a new poll option */}
          <Button type="button" onClick={() => append({ content: '' })} className="mt-2">
            Add Option
          </Button>
        </div>

        {/* Poll End Date input field */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button for updating the poll */}
        <Button type="submit">Update Poll</Button>
      </form>
    </Form>
  );
}