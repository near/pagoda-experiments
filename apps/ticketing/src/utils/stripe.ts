import { EVENTS_WORKER_BASE } from './config';
import { FormSchema, serializeMediaForWorker } from './helpers';

export const createStripeEvent = async (eventData: FormSchema) => {
  const response = await fetch(`${EVENTS_WORKER_BASE}/stripe/create-event`, {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error('Failed to upload to Stripe');
  }
  return response;
};

export const pinMediaToIPFS = async (formData: FormSchema): Promise<Response | undefined> => {
  let ipfsResponse: Response | undefined;
  try {
    const serializedData = await serializeMediaForWorker(formData);
    ipfsResponse = await fetch(`${EVENTS_WORKER_BASE}/ipfs-pin`, {
      method: 'POST',
      body: JSON.stringify({ base64Data: serializedData }),
    });
  } catch (error) {
    console.error('Failed to pin media on IPFS', error);
  }
  return ipfsResponse;
};
