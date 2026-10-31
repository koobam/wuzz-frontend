type Category = {
  id: number;
  name?: string;
};

export type BottomNavigationParamList = {
  home: undefined;
  menu: undefined;
  history: undefined;
  support: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  bottom: undefined;
  checkout: undefined;
  walkthrough: undefined;
  /** outletId: a link to one outlet; the list opens with it picked if the list has it. */
  outletlist: { outletId?: string } | undefined;
  /** Where the customer is, so the list does not have to ask for the position again. */
  wuzzerlist: { lat: number; long: number } | undefined;
  menusearch: undefined;
  /** editId: a line already in the order, opened to change its choices. */
  laundry: { type?: string; serviceId: string; editId?: string };
  orderstatus: { orderId: string };
  // (auth) group
  login: undefined;
  onboarding: undefined;
  locationpermission: undefined;
  verification: {
    phone?: string;
  };
  register: undefined;

  // (bottom) group
  activity: undefined;
  chat: undefined;
  dashboard: undefined;
  home: undefined;
  profile: undefined;

  // (Gamification) group
  avatar: undefined;
  checkin: undefined;
  gatcha: undefined;
  league: undefined;
  level: undefined;
  shop: undefined;
  shareProfileQr: undefined;
  streak: undefined;
  //  (Gamification) milestone group
  milestonelist: undefined;
  milestonedetail: undefined;
  //  (Gamification) Challenge Group
  challengelist: undefined;
  challengedetail: undefined;

  // (Main) Group
  category: {
    activeID: number;
    onPress: (item: Category, index: number) => void;
  };
  changeprofile: undefined;
  chatdetail: undefined;
  explore: undefined;
  // (Main) Friend Group
  friendlist: undefined;
  frienddetail: undefined;
  notification: undefined;
  spot: undefined;
  stats: undefined;

  survey: undefined;
  // (utils) group
  help: undefined;
  scan: undefined;
  webview: {
    uri: string;
    title?: string;
  };
  leaderboard: undefined;

  // (account) group
  deliveryaddress: undefined;
  addaddress: undefined;
};
