import React from 'react';

/**
 * Renders the authentication layout.
 * This layout centers its children vertically and horizontally on the screen
 * with a muted background.
 * @param {Readonly<{ children: React.ReactNode }>} props - The props for the AuthLayout component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 */
export default function AuthLayout({
  children, // The content to be displayed within the authentication layout.
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      {children}
    </div>
  );
}