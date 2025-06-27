'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Profile', href: '/settings' },
  { name: 'Billing', href: '/settings/billing' },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:space-x-4 border-b mb-6">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            'px-3 py-2 font-medium text-sm rounded-md',
            pathname === item.href
              ? 'bg-muted text-primary-foreground'
              : 'text-muted-foreground hover:text-primary-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
