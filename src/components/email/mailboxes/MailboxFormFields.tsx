'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import MailboxAppPasswordGuideHint from '@/components/email/mailboxes/MailboxAppPasswordGuideHint';
import DomainDnsStatusPanel from '@/components/email/mailboxes/DomainDnsStatusPanel';
import MailboxFormSection from '@/components/email/mailboxes/MailboxFormSection';
import MailboxProviderPicker from '@/components/email/mailboxes/MailboxProviderPicker';
import AppPasswordSegmentInput from '@/components/ui/AppPasswordSegmentInput';
import FormTextField from '@/components/ui/FormTextField';
import { DAILY_SEND_LIMIT_PRESETS, MAILBOX_APP_PASSWORD_SEGMENT_LENGTHS, MAILBOX_EMAIL_PLACEHOLDERS } from '@/lib/email/mailbox-providers';
import { startMailboxOAuth } from '@/lib/email/mailbox-oauth';
import type {
  MailboxCreateFormValues,
  MailboxEditFormValues,
} from '@/lib/schemas/mailbox';
import { useOrgSlug } from '@/contexts/org-slug';
import { useApiQuery } from '@/hooks/api';
import { useDomainDnsCheck } from '@/hooks/useDomainDnsCheck';
import { mailboxService } from '@/lib/api';

interface MailboxFormFieldsProps {
  isSaving: boolean;
  mode?: 'create' | 'edit';
}

export default function MailboxFormFields({
  isSaving,
  mode = 'create',
}: MailboxFormFieldsProps) {
  const { control, setValue } = useFormContext<
    MailboxCreateFormValues | MailboxEditFormValues
  >();
  const orgSlug = useOrgSlug();
  const provider = useWatch({ control, name: 'provider' });
  const email = useWatch({ control, name: 'email' });
  const dailySendLimit = useWatch({
    control,
    name: 'dailySendLimit',
  });
  const oauthToken = useWatch({ control, name: 'oauthToken' });
  const isCreateMode = mode === 'create';
  const { data: oauthAvailability } = useApiQuery(
    'mailboxes.oauthAvailability',
    () => mailboxService.getOAuthAvailability(),
    { enabled: isCreateMode && (provider === 'gmail' || provider === 'outlook') },
  );

  const isEmailProvider = provider === 'gmail' || provider === 'outlook';
  const isOAuthConnected = Boolean(oauthToken?.trim());
  const oauthSignInAvailable =
    provider === 'gmail'
      ? Boolean(oauthAvailability?.google)
      : provider === 'outlook'
        ? Boolean(oauthAvailability?.microsoft)
        : false;
  const domainDnsCheck = useDomainDnsCheck(email ?? '', isCreateMode);

  function handleProviderChange(
    nextProvider: MailboxCreateFormValues['provider'],
  ) {
    setValue('appPassword', '');
    setValue('oauthToken', '');
    setValue('smtpHost', '');
    setValue('smtpPort', nextProvider === 'smtp' ? '587' : '');
    setValue('smtpUser', '');
    setValue('smtpPassword', '');
    setValue('smtpSecure', false);

    const switchingBetweenEmailProviders =
      (provider === 'gmail' || provider === 'outlook') &&
      (nextProvider === 'gmail' || nextProvider === 'outlook') &&
      provider !== nextProvider;

    if (switchingBetweenEmailProviders) {
      setValue('email', '');
    } else if (nextProvider !== 'gmail' && nextProvider !== 'outlook') {
      setValue('email', email ?? '');
    }
  }

  return (
    <Stack spacing={3.5} className="pt-1">
      <MailboxFormSection
        title="Provider"
        description={
          isCreateMode
            ? undefined
            : 'Provider cannot be changed after the mailbox is created.'
        }
      >
        {isCreateMode ? (
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <MailboxProviderPicker
                value={field.value}
                disabled={isSaving}
                onChange={(nextProvider) => {
                  field.onChange(nextProvider);
                  handleProviderChange(nextProvider);
                }}
              />
            )}
          />
        ) : (
          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth disabled>
                <InputLabel id="mailbox-provider-label">Provider</InputLabel>
                <Select
                  {...field}
                  labelId="mailbox-provider-label"
                  label="Provider"
                  className="rounded-xl"
                >
                  <MenuItem value="gmail">Gmail</MenuItem>
                  <MenuItem value="outlook">Outlook</MenuItem>
                  <MenuItem value="smtp">Custom SMTP</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        )}
      </MailboxFormSection>

      <MailboxFormSection title="Connection">
        {isEmailProvider ? (
          <Stack spacing={2}>
            <FormTextField
              key={provider}
              name="email"
              control={control}
              label="Email address"
              autoComplete="email"
              placeholder={MAILBOX_EMAIL_PLACEHOLDERS[provider]}
              disabled={
                isSaving ||
                (isCreateMode && isOAuthConnected) ||
                !isCreateMode
              }
              helperText={
                !isCreateMode
                  ? 'Email cannot be changed after the mailbox is created.'
                  : undefined
              }
            />

            {isCreateMode && !isOAuthConnected ? (
              <Controller
                name="appPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <AppPasswordSegmentInput
                    key={provider}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    segmentLengths={
                      MAILBOX_APP_PASSWORD_SEGMENT_LENGTHS[provider]
                    }
                    disabled={isSaving}
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    label="App password"
                    labelAdornment={
                      <MailboxAppPasswordGuideHint provider={provider} />
                    }
                  />
                )}
              />
            ) : null}

            {isCreateMode && oauthSignInAvailable ? (
              <>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Divider className="flex-1" />
                  <Typography variant="caption" color="text.secondary">
                    or sign in with {provider === 'gmail' ? 'Google' : 'Microsoft'}
                  </Typography>
                  <Divider className="flex-1" />
                </Stack>

                <Button
                  variant="outlined"
                  size="large"
                  disabled={isSaving || isOAuthConnected}
                  onClick={() => startMailboxOAuth(provider, orgSlug)}
                  className="rounded-2xl border-neutral-300 py-3 font-semibold normal-case"
                >
                  {provider === 'gmail'
                    ? 'Connect with Google'
                    : 'Connect with Microsoft'}
                </Button>
              </>
            ) : null}

            {isCreateMode && isOAuthConnected ? (
              <Box className="mailbox-form-callout">
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CheckCircleOutlinedIcon fontSize="small" className="text-primary" />
                  <Stack spacing={0.25} className="min-w-0 flex-1">
                    <Typography variant="body2" className="font-semibold">
                      {provider === 'gmail' ? 'Google' : 'Microsoft'} account connected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {email?.trim()
                        ? `Signed in as ${email.trim()}`
                        : 'Complete the form below and add the mailbox.'}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    disabled={isSaving}
                    onClick={() => {
                      setValue('oauthToken', '');
                      setValue('appPassword', '');
                    }}
                    className="shrink-0 normal-case"
                  >
                    Disconnect
                  </Button>
                </Stack>
              </Box>
            ) : null}

            {isCreateMode && domainDnsCheck.domain ? (
              <DomainDnsStatusPanel
                domain={domainDnsCheck.domain}
                result={domainDnsCheck.result}
                isLoading={domainDnsCheck.isLoading}
                error={domainDnsCheck.error}
              />
            ) : null}
          </Stack>
        ) : null}

        {provider === 'smtp' ? (
          <Stack spacing={2}>
            {isCreateMode ? (
              <FormTextField
                name="email"
                control={control}
                label="Email address"
                autoComplete="email"
                placeholder={MAILBOX_EMAIL_PLACEHOLDERS.smtp}
                disabled={isSaving}
              />
            ) : null}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box className="min-w-0 flex-[2]">
                <FormTextField
                  name="smtpHost"
                  control={control}
                  label="SMTP host"
                  autoComplete="off"
                  disabled={isSaving}
                />
              </Box>
              <Box className="min-w-0 flex-1">
                <FormTextField
                  name="smtpPort"
                  control={control}
                  label="Port"
                  type="number"
                  autoComplete="off"
                  disabled={isSaving}
                />
              </Box>
            </Stack>
            <FormTextField
              name="smtpUser"
              control={control}
              label="SMTP username"
              autoComplete="off"
              disabled={isSaving}
            />
            <FormTextField
              name="smtpPassword"
              control={control}
              label={
                mode === 'edit'
                  ? 'SMTP password (leave blank to keep current)'
                  : 'SMTP password'
              }
              type="password"
              autoComplete="off"
              disabled={isSaving}
            />
            <Controller
              name="smtpSecure"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      disabled={isSaving}
                    />
                  }
                  label="Use TLS/SSL (port 465)"
                />
              )}
            />

            {isCreateMode && domainDnsCheck.domain ? (
              <DomainDnsStatusPanel
                domain={domainDnsCheck.domain}
                result={domainDnsCheck.result}
                isLoading={domainDnsCheck.isLoading}
                error={domainDnsCheck.error}
              />
            ) : null}
          </Stack>
        ) : null}
      </MailboxFormSection>

      {!isCreateMode ? (
        <>
          <MailboxFormSection
            title="Sender identity"
            description="How this mailbox appears in campaigns and your team list."
          >
            <FormTextField
              name="displayName"
              control={control}
              label="Display name"
              autoComplete="off"
              disabled={isSaving}
            />

            {!isEmailProvider ? (
              <FormTextField
                name="email"
                control={control}
                label="Email address"
                autoComplete="off"
                disabled={isSaving}
              />
            ) : null}

            <FormTextField
              name="fromName"
              control={control}
              label="From name"
              autoComplete="off"
              disabled={isSaving}
            />
          </MailboxFormSection>
        </>
      ) : null}

      <MailboxFormSection title="Daily send limit">
        <Stack direction="row" spacing={1} className="flex-wrap">
          {DAILY_SEND_LIMIT_PRESETS.map((preset) => {
            const selected = dailySendLimit === String(preset);

            return (
              <Chip
                key={preset}
                label={`${preset}/day`}
                clickable={!isSaving}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => setValue('dailySendLimit', String(preset))}
                className="rounded-xl font-semibold"
              />
            );
          })}
        </Stack>
        <Controller
          name="dailySendLimit"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Custom daily limit"
              type="number"
              fullWidth
              disabled={isSaving}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              slotProps={{
                htmlInput: { min: 1, max: 10000 },
              }}
              className="rounded-xl"
            />
          )}
        />
      </MailboxFormSection>
    </Stack>
  );
}

export const mailboxCreateFormDefaultValues: MailboxCreateFormValues = {
  provider: 'gmail',
  email: '',
  appPassword: '',
  oauthToken: '',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  smtpSecure: false,
  dailySendLimit: '50',
};

export const mailboxFormDefaultValues: MailboxEditFormValues = {
  ...mailboxCreateFormDefaultValues,
  displayName: '',
  fromName: '',
};
