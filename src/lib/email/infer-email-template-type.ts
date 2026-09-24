import type { EmailTemplateType } from '@/lib/api';

export function inferEmailTemplateType(stepCount: number): EmailTemplateType {
  return stepCount <= 1 ? 'single' : 'sequence';
}
