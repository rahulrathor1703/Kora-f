import Box from '@mui/material/Box';

interface DashboardContentProps {
  children: React.ReactNode;
}

export default function DashboardContent({ children }: DashboardContentProps) {
  return (
    <Box className="dashboard-content w-full px-4 py-6 sm:px-6 md:py-8 lg:px-8 xl:px-10">
      {children}
    </Box>
  );
}
