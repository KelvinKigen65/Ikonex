import type { AxiosResponse } from 'axios';

type CollectionEnvelope<Key extends string, Item> = {
  [K in Key]: Item[];
} & {
  total: number;
  pages: number;
};

export const normalizeCollection = <Key extends string, Item>(
  response: AxiosResponse<Item[] | CollectionEnvelope<Key, Item>>,
  key: Key
): AxiosResponse<CollectionEnvelope<Key, Item>> => {
  if (!Array.isArray(response.data)) {
    return response as AxiosResponse<CollectionEnvelope<Key, Item>>;
  }

  return {
    ...response,
    data: {
      [key]: response.data,
      total: response.data.length,
      pages: 1,
    } as CollectionEnvelope<Key, Item>,
  };
};
