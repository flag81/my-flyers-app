// TODO: Implement API calls
// src/services/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getProducts = async ({ pageParam = 1, queryKey }: any) => {
  const [, userId, storeId, isFavorite, onSale, keyword] = queryKey;

  const url = new URL(`${API_URL}/getProducts`);
  url.searchParams.append('page', pageParam);
  if (userId) url.searchParams.append('userId', userId.toString());
  if (storeId) url.searchParams.append('storeId', storeId.toString());
  if (isFavorite) url.searchParams.append('isFavorite', 'true');
  if (onSale) url.searchParams.append('onSale', 'true');
  if (keyword) url.searchParams.append('keyword', keyword);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  const json = await res.json();
  return {
    products: json.data ?? [],
    nextPage: json.nextPage
  };
};

export const getStores = async () => {
  const res = await fetch(`${API_URL}/getStores`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
};
