import PollDisplay from '@/components/poll/PollDisplay';

export default function Page({ params }: { params: { id: string } }) {
  console.log('Rendering polls/[id]/page.tsx with ID:', params.id);
  return <PollDisplay pollId={params.id} />;
}