/**
 * Private user-to-user messaging. Conversations exist between accounts that are
 * linked via matching usernames. Backed by the REST API; the local fallback is
 * empty (real chat needs the backend + two linked accounts).
 */
import { api } from './client';
import { isApiConfigured } from './config';
import { getUserId } from './session';

/** The signed-in user's account id (used to tell own vs received messages). */
export function myUserId(): string | null {
  return getUserId();
}

export interface Conversation {
  userId: string;
  name: string;
  username: string | null;
  photoUrl: string | null;
  lastMessage: string | null;
  lastAt: string | null;
  fromMe: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  if (!isApiConfigured) return [];
  return api.get<Conversation[]>('/messages');
}

export async function fetchThread(userId: string): Promise<DirectMessage[]> {
  if (!isApiConfigured) return [];
  return api.get<DirectMessage[]>(`/messages?user=${userId}`);
}

export async function sendMessage(toUserId: string, body: string): Promise<DirectMessage> {
  return api.post<DirectMessage>('/messages', { toUserId, body });
}
