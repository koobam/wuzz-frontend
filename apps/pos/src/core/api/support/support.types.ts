export type Conversation = {
  id: string;
  customer_id: string;
  kind: 'support' | 'outlet';
  outlet_id: string | null;
  status: 'open' | 'closed';
  last_message_at: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'customer' | 'admin' | 'outlet';
  body: string;
  inserted_at: string;
};

export type IceServer = { urls: string[]; username?: string; credential?: string };
