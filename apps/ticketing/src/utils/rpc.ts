import { KEYPOM_EVENTS_CONTRACT_ID, NETWORK_NODE_URL } from './config';
import { FunderEventMetadata } from './helpers';

function encodeJsonRpcArgs(args: Record<any, any>) {
  const bytes = new TextEncoder().encode(JSON.stringify(args));
  return btoa(Array.from(bytes, (b) => String.fromCodePoint(b)).join(''));
}

function parseJsonRpcResponse(bytes: number[]): Record<any, any> {
  const decodedResult = new TextDecoder().decode(Uint8Array.from(bytes));
  return JSON.parse(decodedResult);
}

export async function jsonRpcFetch<T = any>(options: {
  requestType?: 'call_function';
  finality?: 'optimistic';
  accountId: string;
  methodName: string;
  args?: Record<string, any>;
}) {
  const body = JSON.stringify({
    id: 'dontcare',
    jsonrpc: '2.0',
    method: 'query',
    params: {
      request_type: options.requestType ?? 'call_function',
      finality: options.finality ?? 'optimistic',
      account_id: options.accountId,
      method_name: options.methodName,
      args_base64: options.args ? encodeJsonRpcArgs(options.args) : undefined,
    },
  });

  const response = await fetch(NETWORK_NODE_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });

  const rawData = await response.json();
  const data = parseJsonRpcResponse(rawData.result.result) as T;
  return data;
}

export async function fetchEventFromJsonRpc(publisherAccountId: string, eventId: string) {
  const data = await jsonRpcFetch({
    accountId: KEYPOM_EVENTS_CONTRACT_ID,
    methodName: 'get_funder_info',
    args: { account_id: publisherAccountId },
  });

  if (!data) return null;

  const events = Object.values(JSON.parse(data.metadata)) as FunderEventMetadata[];
  const event = events.find((ev) => ev.id === eventId);

  if (!event) return null;

  return event;
}
