"use client";

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updatePoll } from '@/lib/actions/edit-poll';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
  description: z.string().optional(),
  options: z.array(z.object({
    id: z.string().optional(),
    content: z.string().min(1, { message: 'Option cannot be empty.' }),
  })).min(2, { message: 'Please add at least two options.' }),
  endDate: z.string().optional(),
});

type PollFormValues = z.infer<typeof formSchema>;

interface EditPollFormProps {
  initialData: {
    id: string;
    title: string;
    description: string | null;
    end_date: string | null;
    poll_options: { id: string; content: string }[];
  };
}

export default function EditPollForm({ initialData }: EditPollFormProps) {
  const router = useRouter();

  const defaultValues: Partial<PollFormValues> = {
    title: initialData.title,
    description: initialData.description || '',
    options: initialData.poll_options.map(option => ({ id: option.id, content: option.content })),
    endDate: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
  };

  const form = useForm<PollFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  async function onSubmit(data: PollFormValues) {
    const result = await updatePoll(initialData.id, data);

    if (result.success) {
      router.push(`/polls/${initialData.id}`);
      alert('Poll updated successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <div>
          <FormLabel>Options</FormLabel>
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
          <Button type="button" onClick={() => append({ content: '' })} className="mt-2">
            Add Option
          </Button>
        </div>

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

        <Button type="submit">Update Poll</Button>
      </form>
    </Form>
  );
}