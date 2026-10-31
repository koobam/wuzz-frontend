export type User = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  roles: string[];
  points: number;
  streak: number;
  xp: number;
  created_at: string;
};

export type AccountQuery = { query?: string; status?: string; outlet_id?: number; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit?: number; offset?: number };

/** A back-office admin or a staff member (a customer is a User). `outlet_id` is 0 when not tied to an outlet. */
export type Account = {
  id: string;
  name: string;
  phone: string;
  role: string;
  outlet_id: number;
  status: User['status'];
  created_at: string;
};
