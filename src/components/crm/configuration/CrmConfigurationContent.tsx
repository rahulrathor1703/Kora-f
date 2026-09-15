'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SettingsMenuItem from '@/components/settings/SettingsMenuItem';
import SettingsSubPageHeader from '@/components/settings/SettingsSubPageHeader';
import { useHasPermission } from '@/hooks/useHasPermission';
import { crmConfigurationDropdownItems } from '@/lib/crm/settings-navigation';

function filterNavItems(
  canReadConfig: boolean,
  canReadLocationSettings: boolean,
  canReadBantSettings: boolean,
) {
  return crmConfigurationDropdownItems.filter((item) => {
    if (!item.requiredPermission) {
      return true;
    }

    if (item.requiredPermission === 'location-settings:read') {
      return canReadLocationSettings;
    }

    if (item.requiredPermission === 'bant-settings:read') {
      return canReadBantSettings;
    }

    return canReadConfig;
  });
}

export default function CrmConfigurationContent() {
  const canReadConfig = useHasPermission('company-config:read');
  const canReadLocationSettings = useHasPermission('location-settings:read');
  const canReadBantSettings = useHasPermission('bant-settings:read');

  const dropdownItems = filterNavItems(
    canReadConfig,
    canReadLocationSettings,
    canReadBantSettings,
  );

  const dropdownOptions = dropdownItems.filter(
    (item) => item.requiredPermission !== 'bant-settings:read',
  );
  const qualificationItems = dropdownItems.filter(
    (item) => item.requiredPermission === 'bant-settings:read',
  );

  if (!canReadConfig && !canReadLocationSettings && !canReadBantSettings) {
    return (
      <Typography variant="body2" color="text.secondary">
        You do not have permission to view CRM configuration.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      <SettingsSubPageHeader
        overline="CRM"
        title="CRM Configuration"
        description="Configure dropdown options, location autocomplete, and BANT qualification settings for CRM."
        parentBack={{ href: '/crm/companies', label: 'Companies' }}
        showPlatformBackLink={false}
      />

      {dropdownOptions.length > 0 ? (
        <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="p-5 md:p-6">
            <Box className="mb-4">
              <Typography
                variant="overline"
                className="font-semibold tracking-[0.14em] text-primary"
              >
                Dropdown options
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-1 leading-relaxed"
              >
                Manage category and location options used in company records, plus
                the location autocomplete API.
              </Typography>
            </Box>

            <Box className="flex flex-col gap-3">
              {dropdownOptions.map((item) => (
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
      ) : null}

      {qualificationItems.length > 0 ? (
        <Card className="dashboard-panel surface-panel rounded-2xl shadow-none">
          <CardContent className="p-5 md:p-6">
            <Box className="mb-4">
              <Typography
                variant="overline"
                className="font-semibold tracking-[0.14em] text-primary"
              >
                Qualification
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-1 leading-relaxed"
              >
                Configure BANT criteria, scoring weights, and tier thresholds.
              </Typography>
            </Box>

            <Box className="flex flex-col gap-3">
              {qualificationItems.map((item) => (
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
      ) : null}
    </Stack>
  );
}
