'use client';

import Link, { type LinkProps } from 'next/link';
import { useSettingsHref } from '@/hooks/useSettingsHref';

export default function SettingsLink({ href, ...rest }: LinkProps) {
  const resolvedHref = useSettingsHref(typeof href === 'string' ? href : '');

  return <Link href={resolvedHref} {...rest} />;
}
