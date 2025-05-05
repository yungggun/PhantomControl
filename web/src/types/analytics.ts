export interface KPIStatProps {
  title: string;
  value: number;
  change: string;
  changeType: "positive" | "neutral" | "negative";
  trendChipPosition: "top" | "bottom";
  iconName: string;
}

export interface UsedDevicesProps {
  name: string;
  amount: number;
}

export interface RegisteredClientsProps {
  x: string;
  y: number;
}
