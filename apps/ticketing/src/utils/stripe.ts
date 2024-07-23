import { EVENTS_WORKER_BASE } from './common';

export const createStripeEvent = async (eventData: any) => {
  const response = await fetch(`${EVENTS_WORKER_BASE}/stripe/create-event`, {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error('Failed to upload to Stripe');
  }
  return response;
};
