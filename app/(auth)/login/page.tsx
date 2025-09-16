'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Defines the schema for the login form using Zod.
 * It validates the email format and password length.
 */
const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

/**
 * LoginPage component for user authentication.
 * Handles user login with email and password using Supabase.
 */
export default function LoginPage() {
  const router = useRouter();
  // State to manage and display authentication errors.
  const [error, setError] = useState<string | null>(null);

  // Initializes the form with Zod resolver for validation.
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handles the form submission for user login.
   * @param {LoginFormValues} values - The form values containing email and password.
   */
  const onSubmit = async (values: LoginFormValues) => {
    setError(null); // Clear any previous errors.
    const supabase = createClient(); // Initialize Supabase client.
    // Attempt to sign in with provided credentials.
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError(error.message); // Set error message if login fails.
    } else {
      router.push('/polls'); // Redirect to polls page on successful login.
    }
  };

  return (
    // Main container for the login page, centering the card.
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {/* Email input field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password input field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Displays error message if authentication fails */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {/* Login submission button */}
              <Button className="w-full" type="submit">Login</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            {/* Link to the registration page */}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}