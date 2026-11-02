export type DirectConversation = {
  id: string;
  /** For a direct thread, the lower of the two people's ids; `peer_id` is the other. */
  customer_id: string;
  peer_id: string | null;
  kind: 'direct' | 'support' | 'outlet';
  status: 'open' | 'closed';
  last_message_at: string | null;
  /** user id → when that person last read the thread. A message is read once its time is at or before the other side's entry. */
  reads?: Record<string, string>;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  body: string;
  inserted_at: string;
};
