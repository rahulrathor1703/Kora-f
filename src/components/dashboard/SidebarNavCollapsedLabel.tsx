'use client';

interface SidebarNavCollapsedLabelProps {
  label: string;
  active?: boolean;
}

export default function SidebarNavCollapsedLabel({
  label,
  active = false,
}: SidebarNavCollapsedLabelProps) {
  return (
    <span className="sidebar-nav-collapsed-label-wrap">
      <span
        className={`sidebar-nav-collapsed-label ${
          active ? 'text-primary' : 'text-text-secondary'
        }`}
      >
        {label}
      </span>
    </span>
  );
}
