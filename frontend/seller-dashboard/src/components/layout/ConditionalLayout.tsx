'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SellerLayout from './SellerLayout';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <SellerLayout>{children}</SellerLayout>;
}
