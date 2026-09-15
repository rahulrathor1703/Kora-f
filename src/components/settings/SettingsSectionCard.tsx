'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { SettingsNavItem } from '@/lib/settings-navigation';
import SettingsMenuItem from '@/components/settings/SettingsMenuItem';

interface SettingsSectionCardProps {
  title: string;
  description: string;
  items: SettingsNavItem[];
}

export default function SettingsSectionCard({
  title,
  description,
  items,
}: SettingsSectionCardProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="dashboard-panel surface-panel h-full rounded-2xl shadow-none">
      <CardContent className="flex h-full flex-col p-5 md:p-6">
        <Box className="mb-4">
          <Typography variant="overline" className="font-semibold tracking-[0.14em] text-primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1 leading-relaxed">
            {description}
          </Typography>
        </Box>

        <Box className="flex flex-col gap-3">
          {items.map((item) => (
            <SettingsMenuItem
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
