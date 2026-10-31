/** What the gateway wraps every answer in. */
export type Envelope<T> = { success: boolean; message: string; data: T };

/** What a list endpoint answers: one page of rows, and how many rows match in all. */
export type Page<T> = { items: T[]; total: number };
