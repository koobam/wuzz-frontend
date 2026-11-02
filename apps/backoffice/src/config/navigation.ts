import { Boxes, Megaphone, Send, Ticket, Calculator, FlaskConical, History, Warehouse, Layers, LayoutDashboard, ShieldCheck, ShoppingCart, SlidersHorizontal, Store, UserCog, UserRound, Users, type LucideIcon } from 'lucide-react';

/** A row of a tab's dropdown: where it goes, its title, and a line about it (translation keys for both). */
export type NavChild = { to: '/outlets' | '/services' | '/banners' | '/vouchers' | '/voucher-injections' | '/variants' | '/modifiers' | '/admins' | '/staff' | '/users' | '/materials' | '/stock' | '/stock-history' | '/costing'; label: string; description: string; icon: LucideIcon };

export type NavItem = {
  to: '/' | '/orders' | '/users' | '/outlets' | '/services' | '/banners' | '/materials';
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** A tab with children is a dropdown: it opens a list of pages instead of going to one. */
  children?: NavChild[];
};

/** The top navigation as data: adding a page is an entry here. Labels are translation keys. */
export const navigation: NavItem[] = [
  { to: '/', label: 'nav.dashboard', icon: LayoutDashboard, exact: true },
  { to: '/orders', label: 'nav.orders', icon: ShoppingCart },
  {
    to: '/services',
    label: 'nav.catalog',
    icon: Boxes,
    children: [
      { to: '/outlets', label: 'nav.outlets', description: 'nav.outletsDesc', icon: Store },
      { to: '/services', label: 'nav.services', description: 'nav.servicesDesc', icon: Boxes },
      { to: '/variants', label: 'nav.variants', description: 'nav.variantsDesc', icon: Layers },
      { to: '/modifiers', label: 'nav.modifiers', description: 'nav.modifiersDesc', icon: SlidersHorizontal },
    ],
  },
  {
    to: '/banners',
    label: 'nav.promotion',
    icon: Megaphone,
    children: [
      { to: '/banners', label: 'nav.banners', description: 'nav.bannersDesc', icon: Megaphone },
      { to: '/vouchers', label: 'nav.vouchers', description: 'nav.vouchersDesc', icon: Ticket },
      { to: '/voucher-injections', label: 'nav.voucherInjections', description: 'nav.voucherInjectionsDesc', icon: Send },
    ],
  },
  {
    to: '/materials',
    label: 'nav.inventory',
    icon: Warehouse,
    children: [
      { to: '/materials', label: 'nav.materials', description: 'nav.materialsDesc', icon: FlaskConical },
      { to: '/stock', label: 'nav.stock', description: 'nav.stockDesc', icon: Warehouse },
      { to: '/stock-history', label: 'nav.stockHistory', description: 'nav.stockHistoryDesc', icon: History },
      { to: '/costing', label: 'nav.costing', description: 'nav.costingDesc', icon: Calculator },
    ],
  },
  {
    to: '/users',
    label: 'nav.users',
    icon: Users,
    children: [
      { to: '/admins', label: 'nav.admins', description: 'nav.adminsDesc', icon: ShieldCheck },
      { to: '/staff', label: 'nav.staff', description: 'nav.staffDesc', icon: UserCog },
      { to: '/users', label: 'nav.customers', description: 'nav.customersDesc', icon: UserRound },
    ],
  },
];
