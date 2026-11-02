export type OrderStatus = 'created' | 'processing' | 'ready' | 'fulfilled' | 'cancelled';

export type Order = {
  id: string;
  outlet_id: number;
  customer_name: string;
  customer_phone: string;
  lines: { item_id: number; name: string; unit: string; price: number; qty: number; variant?: string; modifiers?: { group?: string; name: string; price: number }[] }[];
  total: number;
  status: OrderStatus;
  /** The transaction code people read out and search by: TRX-DDMMYYYY-XXXX. */
  code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type OrderFilter = { status?: string; outlet_id?: number; q?: string; from?: string; to?: string };

export type OrdersParams = OrderFilter & { sort_by?: string; sort_dir?: 'asc' | 'desc'; limit?: number; offset?: number };

/**
 * The numbers above the orders list, for exactly the orders the filters show, cancelled ones included when the filters let them
 * through. Money is whole rupiah and each average is rounded once, by the server.
 */
export type OrderSummary = {
  orders: number;
  fulfilled: number;
  cancelled: number;
  open: number;
  counted: number;
  value: number;
  avg_value: number;
  lines: number;
  avg_lines: string;
  cancelled_percent: string;
  fulfilled_percent: string;
};

export type OrderStats = {
  by_status: Record<OrderStatus, number>;
  /** Rupiah, over every fulfilled order. */
  revenue: number;
  /** One row per day, oldest first (Asia/Jakarta). */
  days: { date: string; orders: number; fulfilled: number; cancelled: number }[];
};
