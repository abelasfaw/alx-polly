# Polling App with QR Code Sharing

## Project Overview
This is a modern polling application that allows users to create, share, and vote on polls. Key features include user authentication, dynamic poll creation with various options and optional end dates, unique shareable links, and QR code generation for easy distribution. The application is designed to be robust, maintainable, and user-friendly, providing real-time voting results.

## Technology Stack
The project is built using the following technologies:

*   **Language**: TypeScript (Strict mode enabled)
*   **Main Framework**: Next.js (App Router)
*   **Database & Auth**: Supabase (PostgreSQL for database, Supabase Auth for authentication)
*   **Styling**: Tailwind CSS with `shadcn/ui` components for a consistent and accessible UI.
*   **State Management**:
    *   **Server State**: Primarily managed by Next.js Server Components for data fetching and display.
    *   **Client State**: `useState` or `useReducer` for local component state in Client Components. Global client-side state management is avoided unless absolutely necessary.
*   **API Communication**:
    *   **Mutations**: Next.js Server Actions are used for all data mutations (e.g., creating polls, submitting votes).
    *   **Data Fetching**: Data is fetched directly in Server Components using the Supabase client. Client-side data fetching with `useEffect` and `useState` in page components is avoided.
*   **Utility Libraries**: `qrcode.react` for generating QR codes.

## Setup Steps

### Prerequisites
Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   npm, yarn, or pnpm (your preferred package manager)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/alx-polly.git
cd alx-polly
```

### 2. Environment Variables
Create a `.env.local` file in the root of the project and add your Supabase credentials. You can find these in your Supabase project settings.

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY # Used for server-side operations
```

**Important**: Never commit your `.env.local` file to version control.

### 3. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Supabase Database Setup

1.  **Create a new Supabase project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Set up your database schema**: You will need to create tables for `polls`, `options`, and `votes`. Here's a basic schema:

    ```sql
    -- polls table
    create table polls (
      id uuid primary key default uuid_generate_v4(),
      user_id uuid references auth.users(id) on delete cascade,
      title text not null,
      description text,
      end_date timestamp with time zone,
      created_at timestamp with time zone default now()
    );

    -- options table
    create table options (
      id uuid primary key default uuid_generate_v4(),
      poll_id uuid references polls(id) on delete cascade,
      text text not null,
      votes integer default 0
    );

    -- votes table
    create table votes (
      id uuid primary key default uuid_generate_v4(),
      user_id uuid references auth.users(id) on delete cascade,
      poll_id uuid references polls(id) on delete cascade,
      option_id uuid references options(id) on delete cascade,
      created_at timestamp with time zone default now()
    );
    ```

3.  **Enable Row Level Security (RLS)**: Ensure RLS is enabled for your tables and set up appropriate policies to control access.

    *Example RLS policy for `polls` table (read access for all, write access for authenticated users):*
    ```sql
    -- Enable RLS on polls table
    alter table polls enable row level security;

    -- Policy for authenticated users to create polls
    create policy "Authenticated users can create polls" on polls
      for insert with check (auth.uid() = user_id);

    -- Policy for all users to view polls
    create policy "All users can view polls" on polls
      for select using (true);

    -- Policy for poll owners to update their polls
    create policy "Poll owners can update their polls" on polls
      for update using (auth.uid() = user_id);

    -- Policy for poll owners to delete their polls
    create policy "Poll owners can delete their polls" on polls
      for delete using (auth.uid() = user_id);
    ```

    *Similar policies will be needed for `options` and `votes` tables.*

4.  **Create an RPC function for incrementing votes**: This function will be called by a Server Action to safely increment vote counts.

    ```sql
    create or replace function increment_vote_count(option_id_input uuid)
    returns void as $$
    begin
      update options
      set votes = votes + 1
      where id = option_id_input;
    end;
    $$ language plpgsql security definer;
    ```

## Usage Examples

### Creating a Poll
1.  Navigate to the "Create Poll" page.
2.  Fill in the poll title, description, and add at least two options.
3.  Optionally, set an end date for the poll.
4.  Click "Create Poll".
5.  You will be redirected to the poll's unique page, where you can share the link or QR code.

### Voting on a Poll
1.  Access a poll via its unique link or QR code.
2.  Select your preferred option.
3.  Click "Vote".
4.  Your vote will be registered, and you will see the updated results.

## How to Run and Test the App Locally

### Running the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Running Tests
(If applicable, add instructions for running tests here. For example, if using Jest:)
```bash
npm test
# or
yarn test
# or
pnpm test
```