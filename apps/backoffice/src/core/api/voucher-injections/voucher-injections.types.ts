/** What a send is asked with: who gets the voucher, by customer id and by phone number (the voucher is in the address). */
export type InjectionBody = { customer_ids: string[]; phones: string[] };

/** Why a recipient did not get the voucher, with how many. The server's reasons: `already_held`, `over_limit`, `not_found`, `inactive`. */
export type InjectionSkipped = Record<string, number>;

/** One send: who sent which voucher to how many, how many got it, and why the rest did not (the counts add up to `target_count`). */
export type Injection = {
  id: number;
  voucher_id: number;
  voucher_title: string;
  voucher_code: string;
  actor_id: string;
  actor_name: string;
  target_count: number;
  injected_count: number;
  skipped: InjectionSkipped;
  created_at: string;
};

export type InjectionsParams = { voucher_id?: number; limit: number; offset: number };

/** How many of a send were not delivered. */
export const skippedTotal = (i: Pick<Injection, 'skipped'>) => Object.values(i.skipped).reduce((sum, n) => sum + n, 0);
