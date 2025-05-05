import { PlanData } from "@/types/plans";
import { Role } from "@/types/user";

export const plans: PlanData[] = [
  {
    id: Role.PREMIUM,
    name: "Premium",
    price: 20,
    currency: "€",
    interval: "month",
    description: "Perfect for small businesses and startups.",
    chipIcon: "mdi:star",
    chipVariant: "flat",
    chipColor: "primary",
    popular: false,
    features: [
      { text: "Up to 20 clients" },
      { text: "Basic analytics" },
      { text: "Email support" },
      { text: "Better performance" },
    ],
  },
  {
    id: Role.VIP,
    name: "VIP",
    price: 50,
    currency: "€",
    interval: "month",
    description: "For growing businesses with advanced needs.",
    chipIcon: "mdi:crown",
    chipVariant: "solid",
    chipColor: "primary",
    popular: true,
    features: [
      { text: "Up to 50 clients" },
      { text: "Advanced analytics" },
      { text: "Priority support" },
      { text: "Best performance" },
      { text: "Custom reporting" },
    ],
  },
];
