'use client';

import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import type { NavItem } from '@/lib/workspace-navigation';
import SidebarNavItem from './SidebarNavItem';

interface SidebarFlatModuleNavItemsProps {
  items: NavItem[];
  isExpanded: boolean;
  onNavigate?: () => void;
  orgSlug: string;
}

export default function SidebarFlatModuleNavItems({
  items,
  isExpanded,
  onNavigate,
  orgSlug,
}: SidebarFlatModuleNavItemsProps) {
  return items.map((child) => (
    <Box key={child.href}>
      {child.dividerBefore ? (
        <Divider className="mx-4 my-1.5 border-surface-border" />
      ) : null}
      <SidebarNavItem
        item={child}
        isExpanded={isExpanded}
        onNavigate={onNavigate}
        orgSlug={orgSlug}
      />
    </Box>
  ));
}
