export type NavItem = {
  title: string;
  icon: string;
  url: string;
  items: NavItem[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};
