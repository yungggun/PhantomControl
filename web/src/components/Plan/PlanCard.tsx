"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Role } from "@/types/user";
import { PlanData } from "@/types/plans";
import { FC } from "react";

interface PlanCardProps {
  plan: PlanData;
  isSelected?: boolean;
  isCurrent?: boolean;
  onSelect?: (plan: Role) => void;
  actionButton?: React.ReactNode;
}

const PlanCard: FC<PlanCardProps> = ({
  plan,
  isSelected,
  isCurrent,
  onSelect,
  actionButton,
}) => {
  const handleSelect = () => {
    if (onSelect && !isCurrent) {
      onSelect(plan.id);
    }
  };

  return (
    <Card
      className={`p-4 border-2 transition-all h-full ${
        isSelected ? "border-primary shadow-md" : "border-gray-300 bg-gray-50"
      } ${plan.popular ? "border-primary shadow-lg" : ""}`}
      isPressable={!isCurrent && !!onSelect}
      onPress={handleSelect}
    >
      {plan.name === "VIP" && (
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          MOST POPULAR
        </div>
      )}
      <CardHeader className="flex flex-col items-start gap-2 pb-0">
        <div className="flex items-center w-full">
          <Chip
            color={plan.chipColor || "primary"}
            variant={plan.chipVariant || "flat"}
            startContent={
              plan.chipIcon && <Icon icon={plan.chipIcon} className="h-4 w-4" />
            }
          >
            {plan.name.toUpperCase()}
          </Chip>
          {isCurrent && (
            <Chip color="success" size="sm" className="ml-2">
              Current Plan
            </Chip>
          )}
        </div>
        <div className="flex items-baseline mt-3">
          <span className="text-4xl font-bold">
            {plan.currency}
            {plan.price}
          </span>
          <span className="text-small text-default-500 ml-1">
            /{plan.interval}
          </span>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col flex-grow">
        <p className="text-default-500 mb-4">{plan.description}</p>
        <Divider className="my-4" />
        <ul className="space-y-3 flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Icon
                icon={feature.icon || "mdi:check"}
                className="h-5 w-5 text-primary"
              />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardBody>
      {actionButton && <CardFooter>{actionButton}</CardFooter>}
    </Card>
  );
};

export default PlanCard;
