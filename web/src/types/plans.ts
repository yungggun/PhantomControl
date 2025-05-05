import { Role } from "./user";

export interface PlanFeature {
  text: string;
  icon?: string;
}

export interface PlanData {
  id: Role;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  chipIcon?: string;
  chipVariant?: "flat" | "solid";
  chipColor?: "primary" | "secondary" | "success" | "warning" | "danger";
}
