import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/admin-navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <AdminNavigation />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Site
            </Button>
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}