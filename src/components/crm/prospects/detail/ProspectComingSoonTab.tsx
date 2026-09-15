'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface ProspectComingSoonTabProps {
  tabLabel: string;
}

export default function ProspectComingSoonTab({
  tabLabel,
}: ProspectComingSoonTabProps) {
  return (
    <Card className="dashboard-panel rounded-2xl shadow-none">
      <CardContent className="px-6 py-14 text-center">
        <Typography variant="h6" className="font-bold">
          {tabLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Coming soon — this section is under development.
        </Typography>
      </CardContent>
    </Card>
  );
}
