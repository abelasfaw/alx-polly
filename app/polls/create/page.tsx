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

/**
 * Defines the schema for the poll creation form using Zod.
 * It validates the poll title, description, options, and an optional end date.
 */
const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100, { message: 'Title must not exceed 100 characters.' }),
  description: z.string().max(500, { message: 'Description must not exceed 500 characters.' }).optional(),
  options: z.array(z.object({
    value: z.string().min(1, { message: 'Option cannot be empty.' }).max(50, { message: 'Option must not exceed 50 characters.' })
  }))
    .min(2, { message: 'Please add at least 2 options.' }),
  endDate: z.string().optional(),

});

/**
 * CreatePollPage component for creating new polls.
 * Users can input a poll title, description, multiple options, and an optional end date.
 * Requires user authentication.
 */
export default function CreatePollPage() {
  // State to manage the active tab between 'basic' and 'settings'.
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  const router = useRouter();
  // Retrieves user authentication status from AuthContext.
  const { user, loading } = useAuth();

  // Initializes the form with Zod resolver for validation and default values.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [{ value: '' }, { value: '' }],
      endDate: '',

    },
  });
  
  // Manages dynamic form fields for poll options.
  const { fields, append, remove } = useFieldArray({
     control: form.control,
     name: "options",
   });

  // Redirects unauthenticated users to the login page.
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Displays a loading message while authentication status is being determined.
  if (loading || !user) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }

  /**
   * Adds a new empty option field to the poll options array.
   */
  const addOption = () => {
    append({ value: '' });
  };

  /**
   * Removes an option field from the poll options array.
   * Prevents removal if there are only two options left.
   * @param {number} index - The index of the option to remove.
   */
  const removeOption = (index: number) => {
    if (fields.length <= 2) return; // Minimum 2 options must remain.
    remove(index);
  };

  /**
   * Handles the form submission for creating a new poll.
   * Calls the createPoll server action and redirects on success.
   * @param {FormValues} data - The form data containing poll title, description, options, and end date.
   */
  const onSubmit = async (data: FormValues) => {
    // Transforms options array for submission.
    const pollData = {
      ...data,
      options: data.options.map(option => option.value)
    };
    console.log('onSubmit function triggered. Submitting form data:', pollData);
    const result = await createPoll(pollData);
    console.log('Result from createPoll:', result);

    if (result.success) {
      router.push('/polls'); // Redirect to polls list on success.
      alert('Poll created successfully!');
    } else {
      console.error('Poll creation failed:', result.error);
      alert(`Error: ${result.error}`); // Display error message to the user.
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header section for the create poll page */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Poll</h1>
          {/* Button to navigate back to the polls list */}
          <Button variant="outline" asChild>
            <Link href="/polls">Cancel</Link>
          </Button>
        </div>

        {/* Tab Navigation for Basic Info and Settings */}
        <div className="flex mb-6">
          {/* Basic Info tab button */}
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
          {/* Settings tab button */}
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
            {/* Conditional rendering for Basic Info tab content */}
            {activeTab === 'basic' && (
              <>
                <CardHeader>
                  <CardTitle>Create a New Poll</CardTitle>
                  <CardDescription className="mb-6">
                    Fill out the form below to create a new poll
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Poll Title input field */}
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

                  {/* Poll Description input field */}
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

                  {/* Dynamic Poll Options section */}
                  <div className="space-y-4">
                     <FormLabel>Poll Options</FormLabel>
                     
                     {/* Renders each poll option input field */}
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
                              {/* Button to remove an option, visible if more than 2 options exist */}
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
                     
                     {/* Button to add a new poll option */}
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
                  {/* Button to submit the poll creation form */}
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
            {/* Conditional rendering for Poll Settings tab content */}
            {activeTab === 'settings' && (
              <>
                <CardHeader>
                  <CardTitle>Poll Settings</CardTitle>
                  <CardDescription className="mb-6">
                    Configure additional options for your poll
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Poll End Date input field */}
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