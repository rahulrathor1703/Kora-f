import type { FieldErrors } from 'react-hook-form';
import type { EmailTemplateFormValues } from '@/lib/schemas/email-template';

function stepLabel(stepIndex: number): string {
  if (stepIndex === 0) {
    return 'Opening email';
  }

  return `Follow-up ${stepIndex}`;
}

export function collectEmailTemplateValidationIssues(
  errors: FieldErrors<EmailTemplateFormValues>,
): string[] {
  const issues: string[] = [];

  if (errors.name?.message) {
    issues.push(String(errors.name.message));
  }

  const stepsErrors = errors.steps;

  if (stepsErrors && typeof stepsErrors === 'object' && 'message' in stepsErrors) {
    if (stepsErrors.message) {
      issues.push(String(stepsErrors.message));
    }
  }

  if (Array.isArray(stepsErrors)) {
    stepsErrors.forEach((stepError, index) => {
      if (!stepError || typeof stepError !== 'object') {
        return;
      }

      const label = stepLabel(index);

      if (stepError.subject?.message) {
        issues.push(`${label}: add a subject line.`);
      }

      if (stepError.body?.message) {
        issues.push(`${label}: add email body content.`);
      }

      if (stepError.delayDays?.message) {
        const raw = String(stepError.delayDays.message);
        const friendly =
          index === 0
            ? null
            : raw.includes('>=1') || raw.toLowerCase().includes('too small')
              ? 'choose how many days after no reply to send this follow-up (at least 1 day).'
              : raw;
        if (friendly) {
          issues.push(`${label}: ${friendly}`);
        }
      }

      if (stepError.scheduledDate?.message) {
        issues.push(`${label}: ${String(stepError.scheduledDate.message)}`);
      }
    });
  }

  if (issues.length === 0) {
    return [
      'Add a template name, subject line, and email body before saving.',
    ];
  }

  return issues;
}

export function getEmailTemplateValidationToast(
  errors: FieldErrors<EmailTemplateFormValues>,
): string {
  const issues = collectEmailTemplateValidationIssues(errors);
  return issues[0] ?? 'Complete all required fields before saving.';
}

export function getFirstEmailTemplateErrorElementId(
  errors: FieldErrors<EmailTemplateFormValues>,
): string | null {
  if (errors.name) {
    return 'email-template-name';
  }

  const stepsErrors = errors.steps;
  if (!Array.isArray(stepsErrors)) {
    return null;
  }

  for (let index = 0; index < stepsErrors.length; index += 1) {
    const stepError = stepsErrors[index];
    if (!stepError || typeof stepError !== 'object') {
      continue;
    }

    if (stepError.subject) {
      return `template-step-${index}-subject`;
    }

    if (stepError.body) {
      return `template-step-${index}-body`;
    }

    if (stepError.delayDays || stepError.scheduledDate) {
      return `template-step-${index}-subject`;
    }
  }

  return null;
}
