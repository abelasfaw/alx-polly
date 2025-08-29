import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to Polly</h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12">
        Create, share, and analyze polls with ease. Get instant feedback from your audience.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-16">
        <Button size="lg" asChild>
          <Link href="/polls">Browse Polls</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/polls/create">Create a Poll</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="flex flex-col items-center p-6 border rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">Easy to Use</h3>
          <p className="text-muted-foreground text-center">
            Create polls in seconds with our intuitive interface. No technical skills required.
          </p>
        </div>
        
        <div className="flex flex-col items-center p-6 border rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 20v-6"></path>
              <path d="M6 20V10"></path>
              <path d="M18 20V4"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">Real-time Results</h3>
          <p className="text-muted-foreground text-center">
            Watch votes come in real-time. Get instant insights from your audience.
          </p>
        </div>
        
        <div className="flex flex-col items-center p-6 border rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">Customizable</h3>
          <p className="text-muted-foreground text-center">
            Customize your polls with various options, settings, and appearance choices.
          </p>
        </div>
      </div>
    </div>
  );
}
