/** What an entry of the log is about. */
export type ActivityEntity = 'outlet' | 'banner' | 'voucher' | 'service' | 'variant_group' | 'modifier_group' | 'material' | 'bom' | 'stock' | 'order' | 'user' | 'session' | 'media';
/** What was done to it. */
export type ActivityAction = 'create' | 'update' | 'delete' | 'status' | 'reorder' | 'inject' | 'receive' | 'waste' | 'adjust' | 'transfer' | 'set_min' | 'sign_in' | 'sign_out';
export type ActivityOutcome = 'ok' | 'failed';

export type ActivityEntry = {
  id: number;
  created_at: string;
  audience: 'backoffice' | 'pos';
  actor: { id: string; name: string; roles: string[] };
  action: ActivityAction;
  entity_type: ActivityEntity;
  /** A BOM is `service:12`; stock is the material's id; sign-in and sign-out have none. */
  entity_id: string;
  /** `key` is `activity.<entity_type>.<action>`; `params` are what the sentence is about (a name, a code, a quantity…). */
  summary: { key: string; params: Record<string, string | number | boolean | null> };
  /** The request fields; anything sensitive is the text `[redacted]`. */
  changes: Record<string, unknown>;
  outcome: ActivityOutcome;
  /** The HTTP status the request ended with. */
  status: number;
  request_id: string;
  ip: string;
};

export type ActivityParams = {
  entity_type?: ActivityEntity;
  entity_id?: string;
  actor_id?: string;
  action?: ActivityAction | '';
  outcome?: ActivityOutcome | '';
  audience?: 'backoffice' | 'pos';
  q?: string;
  /** Days, YYYY-MM-DD, both included. */
  from?: string;
  to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
};
