export function formatEventIdQueryParam(publisherAccountId: string, eventId: string) {
  return `${publisherAccountId}:${eventId}`;
}

export function parseEventIdQueryParam(id: string | string[] | undefined) {
  if (!id || Array.isArray(id)) {
    id = '';
  }

  const [publisherAccountId, eventId] = id.split(':');

  return {
    eventId: eventId ?? '',
    publisherAccountId: publisherAccountId ?? '',
  };
}
