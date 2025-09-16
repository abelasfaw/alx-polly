import PollDisplay from '@/components/poll/PollDisplay';

/**
 * Renders a specific poll page based on the provided ID.
 * This component acts as a wrapper for the PollDisplay component.
 * @param {Object} props - The component props.
 * @param {Object} props.params - The parameters object containing the poll ID.
 * @param {string} props.params.id - The ID of the poll to display.
 */
export default function Page({ params }: { params: { id: string } }) {
  console.log('Rendering polls/[id]/page.tsx with ID:', params.id);
  // Renders the PollDisplay component, passing the pollId from the URL parameters.
  return <PollDisplay pollId={params.id} />;
}