import type { InboxReply } from '@/lib/email/inbox/inbox-types';

export function isInboxReplyDone(reply: InboxReply): boolean {
  return reply.replyReadAt != null;
}
