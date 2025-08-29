'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import Link from 'next/link';

type FormValues = {
  title: string;
  description?: string;
  options: string[];
  endDate?: string;
  allowMultiple: boolean;
  requireLogin: boolean;
};

export default function CreatePollPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'settings'>('basic');
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      options: ['', ''],
      endDate: '',
      allowMultiple: false,
      requireLogin: true,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });
  
  const addOption = () => {
    append('');
  };

  const removeOption = (index: number) => {
    if (fields.length <= 2) return; // Minimum 2 options
    remove(index);
  };

  const onSubmit = (data: FormValues) => {
    // In a real app, this would send the poll data to an API
    console.log('Poll submitted', data);
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

      <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        name={`options.${index}`}
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
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allowMultiple"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={() => field.onChange(!field.value)}
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Allow users to select multiple options
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requireLogin"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={() => field.onChange(!field.value)}
                                className="w-4 h-4"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Require users to be logged in to vote
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

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

          </form>
        </Form>
      </Card>
      
      <div className="mt-6 max-w-2xl mx-auto flex justify-end">
        <Button 
          type="button" 
          onClick={() => form.handleSubmit(onSubmit)()}
          className="px-8"
        >
          Create Poll
        </Button>
      </div>
    </div>
  );
}