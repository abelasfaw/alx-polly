'use client';


import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { updatePoll } from '@/lib/actions/edit-poll';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

  async function onSubmit(values: PollFormValues) {
    const result = await updatePoll(initialData.id, values);
    if (result.success) {
      router.push('/polls');
    } else {
      // Handle error, maybe set a form error
      console.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Poll: {initialData.title}</CardTitle>
        <CardDescription>Make changes to your poll here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <div>
            <Label htmlFor="title">Poll Title</Label>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Poll Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Poll Description" {...field}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Poll Options</h2>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`options.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={index === 0 ? 'sr-only' : ''}>
                      Option {index + 1}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          
          <CardFooter className="flex justify-end p-0 pt-6">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}