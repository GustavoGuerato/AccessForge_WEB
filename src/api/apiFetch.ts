
type ApiFetchOptions = RequestInit & {
  token: string;
  logout: () => void;
};

export async function apiFetch(
  url: string,
  { token, logout, ...options }: ApiFetchOptions,
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    logout();
  }

  return response;
}
