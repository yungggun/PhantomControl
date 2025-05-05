"use client";

import { motion } from "framer-motion";
import { Progress } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useFormat } from "@/hooks/use-format";
import type { StripeResponse } from "@/types/payment";
import { FC } from "react";
import { itemVariants } from "./animations";

interface DetailsTabProps {
  subscription: StripeResponse["subscription"];
  paymentMethod: StripeResponse["paymentMethod"];
  daysRemaining: number;
  progressPercentage: number;
}

const DetailsTab: FC<DetailsTabProps> = ({
  subscription,
  paymentMethod,
  daysRemaining,
  progressPercentage,
}) => {
  const { formatDate } = useFormat();

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Subscription period</span>
            <span className="text-sm font-medium">
              {daysRemaining} days remaining
            </span>
          </div>
          <Progress
            value={progressPercentage}
            size="md"
            radius="full"
            aria-label="Subscription progress"
            classNames={{
              indicator: "bg-gradient-to-r from-purple-500 to-blue-500",
            }}
          />
          <div
            className="flex justify-between mt-1 text-xs text-gray-500"
            aria-label="Subscription period dates"
          >
            <span>{formatDate(subscription.current_period_start)}</span>
            <span>{formatDate(subscription.current_period_end)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={itemVariants}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            aria-label="Next settlement date"
          >
            <div className="flex items-start gap-3">
              <div
                className="bg-blue-500/10 p-2 rounded-lg"
                aria-label="Calendar icon"
              >
                <Icon
                  icon="solar:calendar-linear"
                  className="w-6 h-6 text-purple-500"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Next settlement</p>
                <p className="font-semibold">
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            aria-label="Subscription start date"
          >
            <div className="flex items-start gap-3">
              <div
                className="bg-blue-500/10 p-2 rounded-lg"
                aria-label="Subscription start icon"
              >
                <Icon
                  icon="solar:calendar-mark-linear"
                  className="w-6 h-6 text-blue-500"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscribed since</p>
                <p className="font-semibold">
                  {formatDate(subscription.current_period_start)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            aria-label="Billing cycle information"
          >
            <div className="flex items-start gap-3">
              <div
                className="bg-blue-500/10 p-2 rounded-lg"
                aria-label="Billing cycle icon"
              >
                <Icon
                  icon="solar:refresh-bold"
                  className="w-6 h-6 text-green-500"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Billing cycle</p>
                <p className="font-semibold capitalize">
                  {subscription.plan.interval_count === 1
                    ? ""
                    : subscription.plan.interval_count}{" "}
                  {subscription.plan.interval === "month"
                    ? "Monthly"
                    : "Yearly"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            aria-label="Payment method details"
          >
            <div className="flex items-start gap-3">
              <div
                className="bg-blue-500/10 p-2 rounded-lg"
                aria-label="Payment method icon"
              >
                <Icon
                  icon="solar:card-recive-linear"
                  className="w-6 h-6 text-orange-500"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment method</p>
                <p className="font-semibold">
                  {paymentMethod.type === "card"
                    ? `•••• •••• •••• ${paymentMethod.card.last4}`
                    : "PayPal"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetailsTab;
