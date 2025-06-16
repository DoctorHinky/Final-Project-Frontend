export type TabType = "overview" | "articles" | "favorites" | "settings" | "friends" | "notifications";
export type Tab = {
  id: string;
  name: TabType;
};
