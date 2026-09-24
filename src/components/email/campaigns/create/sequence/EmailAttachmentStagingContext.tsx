'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { emailAttachmentService } from '@/lib/api/services/email-attachment.service';
import type { StagedEmailAttachment } from '@/lib/email/campaigns/attachment-types';

interface EmailAttachmentStagingContextValue {
  getStagedAttachments: (stepOrder: number) => StagedEmailAttachment[];
  stageAttachment: (stepOrder: number, file: File) => void;
  removeStagedAttachment: (stepOrder: number, stagedId: string) => void;
  flushStagedAttachments: (
    ownerType: 'campaign' | 'template',
    ownerId: string,
    stepOrders: number[],
  ) => Promise<void>;
}

const EmailAttachmentStagingContext =
  createContext<EmailAttachmentStagingContextValue | null>(null);

function createStagedId(): string {
  return `staged-${crypto.randomUUID()}`;
}

export function EmailAttachmentStagingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [stagedByStep, setStagedByStep] = useState<
    Record<number, StagedEmailAttachment[]>
  >({});

  const getStagedAttachments = useCallback(
    (stepOrder: number) => stagedByStep[stepOrder] ?? [],
    [stagedByStep],
  );

  const stageAttachment = useCallback((stepOrder: number, file: File) => {
    setStagedByStep((current) => ({
      ...current,
      [stepOrder]: [
        ...(current[stepOrder] ?? []),
        { id: createStagedId(), stepOrder, file },
      ],
    }));
  }, []);

  const removeStagedAttachment = useCallback(
    (stepOrder: number, stagedId: string) => {
      setStagedByStep((current) => ({
        ...current,
        [stepOrder]: (current[stepOrder] ?? []).filter(
          (item) => item.id !== stagedId,
        ),
      }));
    },
    [],
  );

  const flushStagedAttachments = useCallback(
    async (
      ownerType: 'campaign' | 'template',
      ownerId: string,
      stepOrders: number[],
    ) => {
      for (const stepOrder of stepOrders) {
        const staged = stagedByStep[stepOrder] ?? [];

        for (const item of staged) {
          if (ownerType === 'campaign') {
            await emailAttachmentService.uploadCampaignStepAttachment(
              ownerId,
              stepOrder,
              item.file,
            );
          } else {
            await emailAttachmentService.uploadTemplateStepAttachment(
              ownerId,
              stepOrder,
              item.file,
            );
          }
        }
      }

      setStagedByStep((current) => {
        const next = { ...current };
        for (const stepOrder of stepOrders) {
          delete next[stepOrder];
        }
        return next;
      });
    },
    [stagedByStep],
  );

  const value = useMemo(
    () => ({
      getStagedAttachments,
      stageAttachment,
      removeStagedAttachment,
      flushStagedAttachments,
    }),
    [
      flushStagedAttachments,
      getStagedAttachments,
      removeStagedAttachment,
      stageAttachment,
    ],
  );

  return (
    <EmailAttachmentStagingContext.Provider value={value}>
      {children}
    </EmailAttachmentStagingContext.Provider>
  );
}

export function useEmailAttachmentStaging(): EmailAttachmentStagingContextValue {
  const context = useContext(EmailAttachmentStagingContext);

  if (!context) {
    throw new Error(
      'useEmailAttachmentStaging must be used within EmailAttachmentStagingProvider',
    );
  }

  return context;
}
