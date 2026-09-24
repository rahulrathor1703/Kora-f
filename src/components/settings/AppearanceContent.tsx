'use client';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColorModeToggle from '@/components/ColorModeToggle';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import { useThemeMode } from '@/theme/ThemeModeProvider';

export default function AppearanceContent() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="Preferences"
        title="Appearance"
        description="Choose how MarketNiti looks on your device."
      />

      <Card className="dashboard-panel surface-panel max-w-2xl rounded-2xl shadow-none">
        <CardContent className="p-6 md:p-8">
          <Typography variant="h6" component="h2" className="font-bold">
            Color mode
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Switch between light and dark themes for your workspace.
          </Typography>
          <Box className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-800/50">
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isDark
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-primary-soft text-primary'
                }`}
              >
                {isDark ? (
                  <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
                ) : (
                  <LightModeOutlinedIcon sx={{ fontSize: 20 }} />
                )}
              </Box>
              <Box>
                <Typography variant="body2" className="font-semibold">
                  {isDark ? 'Dark mode' : 'Light mode'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isDark ? 'Dark mode is active' : 'Light mode is active'}
                </Typography>
              </Box>
            </Stack>
            <ColorModeToggle size="small" />
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
