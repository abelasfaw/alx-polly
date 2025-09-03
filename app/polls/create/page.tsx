'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { createPoll } from '@/lib/actions/poll';

type FormValues = {
  title: string;
  description?: string;
  options: { value: string }[];
  endDate?: string;

};

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: 'Title must not exceed 100 characters.' }),
  description: z.string().max(500, { message: 'Description must not exceed 500 characters.' }).optional(),
  options: z.array(z.object({
    value: z.string().min(1, { message: 'Option cannot be empty.' }).max(50, { message: 'Option must not exceed 50 characters.' })
  }))
    .min(2, { message: 'Please add at least 2 options.' }),
  endDate: z.string().optional(),

});

export default function CreatePollPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  const router = useRouter();
  const { user, loading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [{ value: '' }, { value: '' }],
      endDate: '',

    },
  });
  
  const { fields, append, remove } = useFieldArray({
     control: form.control,
     name: "options",
   });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  const addOption = () => {
    append({ value: '' });
  };

  const removeOption = (index: number) => {
    if (fields.length <= 2) return; // Minimum 2 options
    remove(index);
  };

  const onSubmit = async (data: FormValues) => {
    const pollData = {
      ...data,
      options: data.options.map(option => option.value)
    };
    console.log('onSubmit function triggered. Submitting form data:', pollData);
    const result = await createPoll(pollData);
    console.log('Result from createPoll:', result);

    if (result.success) {
      router.push('/polls');
      alert('Poll created successfully!');
    } else {
      console.error('Poll creation failed:', result.error);
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Poll</h1>
          <Button variant="outline" asChild>
            <Link href="/polls">Cancel</Link>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-sm font-medium border-2 rounded-l-md border-r-0 transition-colors flex-1 ${
                  activeTab === 'basic'
                    ? 'border-gray-300 text-gray-800 bg-white'
                    : 'border-gray-200 text-gray-500 hover:text-gray-700 bg-gray-50'
                }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-2 rounded-r-md transition-colors flex-1 ${
                  activeTab === 'settings'
                    ? 'border-gray-300 text-gray-800 bg-white'
                    : 'border-gray-200 text-gray-500 hover:text-gray-700 bg-gray-50'
                }`}
          >
            Settings
          </button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-2xl mx-auto">
            {activeTab === 'basic' && (
              <>
                <CardHeader>
                  <CardTitle>Create a New Poll</CardTitle>
                  <CardDescription className="mb-6">
                    Fill out the form below to create a new poll
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poll Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a question for your poll" {...field} />
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
                          <Input placeholder="Add more context to your poll" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                     <FormLabel>Poll Options</FormLabel>
                     
                     {fields.map((field, index) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`options.${index}.value`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <div className="flex gap-2 items-center">
                              <FormControl>
                                <Input
                                  {...formField}
                                  placeholder={`Option ${index + 1}`}
                                  required
                                />
                              </FormControl>
                              {fields.length > 2 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeOption(index)}
                                  className="shrink-0"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                     
                     <Button 
                       type="button" 
                       variant="outline" 
                       size="sm" 
                       onClick={addOption}
                       className="mt-2"
                     >
                       Add Option
                     </Button>
                   </div>
                 </CardContent>
                <CardFooter className="flex justify-end pt-6">
                  <Button 
                    type="button"
                    onClick={() => {
                      console.log('Button click triggered');
                      form.handleSubmit(onSubmit)();
                    }}
                  >
                    Create Poll
                  </Button>
                </CardFooter>
              </>
            )}
            {activeTab === 'settings' && (
              <>
                <CardHeader>
                  <CardTitle>Poll Settings</CardTitle>
                  <CardDescription className="mb-6">
                    Configure additional options for your poll
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poll End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </>
            )}
          </Card>
        </form>
      </Form>
    </div>
  );

}