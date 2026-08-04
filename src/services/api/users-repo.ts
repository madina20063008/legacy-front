import { api } from './client';

export interface FoundUser {
  userId: string;
  username: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
}

/** Look up a registered user by their username (telegram). Null if none. */
export async function lookupUser(username: string): Promise<FoundUser | null> {
  const res = await api.get<{ found: boolean; user?: FoundUser }>(
    `/users/lookup?username=${encodeURIComponent(username)}`,
  );
  return res.found && res.user ? res.user : null;
}
