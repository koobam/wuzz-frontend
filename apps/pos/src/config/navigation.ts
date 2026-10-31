/** The top navigation as data: adding a page is an entry here. Labels are translation keys. */
export const navigation = [
  { to: '/', label: 'nav.newOrder', exact: true },
  { to: '/orders', label: 'nav.orders' },
  { to: '/stock', label: 'nav.stock' },
  { to: '/chat', label: 'nav.chat' },
] as const;
