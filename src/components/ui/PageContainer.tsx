import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';

interface PageContainerProps extends BoxProps {
  children: React.ReactNode;
}

export default function PageContainer({
  children,
  className,
  ...props
}: PageContainerProps) {
  return (
    <Box
      component="main"
      className={`mx-auto w-full max-w-5xl px-6 py-12 md:px-10 ${className ?? ''}`}
      {...props}
    >
      {children}
    </Box>
  );
}
