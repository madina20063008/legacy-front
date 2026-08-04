import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchConversations, fetchThread, sendMessage } from '@/services/api/messages-repo';

const KEYS = {
  conversations: ['messages', 'conversations'] as const,
  thread: (id: string) => ['messages', 'thread', id] as const,
};

// Poll for near-real-time delivery.
export function useConversations() {
  return useQuery({
    queryKey: KEYS.conversations,
    queryFn: fetchConversations,
    refetchInterval: 5000,
  });
}

export function useThread(userId: string) {
  return useQuery({
    queryKey: KEYS.thread(userId),
    queryFn: () => fetchThread(userId),
    refetchInterval: 3000,
    enabled: !!userId,
  });
}

export function useSendMessage(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendMessage(userId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.thread(userId) });
      qc.invalidateQueries({ queryKey: KEYS.conversations });
    },
  });
}
