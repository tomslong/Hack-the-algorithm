import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main className="container py-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
