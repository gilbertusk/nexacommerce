import { createLogger } from '@nexacommerce/logger';
import { emailService } from '../services/email.service';
import {
  claimPendingEmails,
  markEmailSent,
  releaseEmailClaim,
  rescheduleOrFailEmail,
} from '../services/email-outbox';

const logger = createLogger('email-dispatcher');

const POLL_INTERVAL_MS = Number(process.env.EMAIL_DISPATCH_POLL_INTERVAL_MS) || 5_000;
const BATCH_SIZE = Number(process.env.EMAIL_DISPATCH_BATCH_SIZE) || 20;
const LEASE_MS = Number(process.env.EMAIL_DISPATCH_LEASE_MS) || 60_000;

let timer: NodeJS.Timeout | null = null;
let running = false;

/**
 * Deliver one batch of queued emails.
 *
 * Delivery is at-least-once by construction: the transport may accept a
 * message and the process may die before the row is marked SENT, in which case
 * the lease expires and the message is sent again. That is the safe direction
 * for transactional mail — losing an order confirmation is worse than sending
 * it twice.
 */
export async function dispatchPendingEmails(): Promise<{ sent: number; failed: number }> {
  const { lockToken, jobs } = await claimPendingEmails(BATCH_SIZE, LEASE_MS);
  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      const rendered = await emailService.resolveTemplate(
        job.templateName,
        (job.templateData as Record<string, unknown>) || {},
      );
      if (!rendered) {
        throw new Error(`Email template "${job.templateName}" not found or inactive`);
      }

      await emailService.deliverEmail({
        to: job.to,
        // The stored subject was compiled when the job was queued, so a later
        // template edit cannot silently change what the recipient was promised.
        subject: job.subject,
        html: rendered.html,
        text: rendered.text,
      });
      await markEmailSent(job.id, lockToken);
      sent += 1;
    } catch (err) {
      const outcome = await rescheduleOrFailEmail(
        job.id,
        lockToken,
        job.retryCount,
        job.maxRetries,
        err,
      );
      if (outcome === 'FAILED') {
        failed += 1;
        logger.error(
          `Email ${job.id} (${job.templateName}) permanently failed after ${job.maxRetries} retries`,
        );
      }
    }
  }

  return { sent, failed };
}

async function tick(): Promise<void> {
  if (running) return;
  running = true;
  try {
    await dispatchPendingEmails();
  } catch (err: any) {
    logger.error(`Email dispatch cycle failed: ${err.message}`);
  } finally {
    running = false;
  }
}

export function startEmailDispatcher(): void {
  if (timer) return;
  timer = setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);
  // Do not hold the process open for the sake of the poller.
  timer.unref?.();
  logger.info(`Email dispatcher started (every ${POLL_INTERVAL_MS}ms, batch ${BATCH_SIZE})`);
}

export function stopEmailDispatcher(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

export { releaseEmailClaim };
