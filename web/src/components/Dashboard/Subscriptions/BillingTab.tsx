"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import type { StripeResponse } from "@/types/payment";
import { FC } from "react";
import { itemVariants } from "./animations";

interface BillingTabProps {
  paymentMethod: StripeResponse["paymentMethod"];
}

const BillingTab: FC<BillingTabProps> = ({ paymentMethod }) => {
  return (
    <motion.div
      key="billing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Payment overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {paymentMethod && (
              <motion.div
                variants={itemVariants}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                aria-label="Payment method"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="bg-blue-500/10 p-2 rounded-lg"
                    aria-label="Credit card icon"
                  >
                    <Icon
                      icon="solar:card-linear"
                      className="w-6 h-6 text-purple-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Card details</p>

                    <Icon
                      icon={`logos:${paymentMethod.card.brand}`}
                      fontSize={12}
                      aria-label={`Credit card brand: ${paymentMethod.card.brand}`}
                    />

                    <p className="text-sm">
                      •••• •••• •••• {paymentMethod.card.last4}
                    </p>
                    <p className="text-sm">
                      Valid until: {paymentMethod.card.exp_month}/
                      {paymentMethod.card.exp_year}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod && paymentMethod.billing_details && (
              <motion.div
                variants={itemVariants}
                className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                aria-label="Billing address"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="bg-blue-500/10 p-2 rounded-lg"
                    aria-label="User ID icon"
                  >
                    <Icon
                      icon="solar:user-id-linear"
                      className="w-6 h-6 text-blue-500"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-500">Billing address</p>
                    <p className="font-semibold">
                      {paymentMethod.billing_details.name}
                    </p>
                    <p>{paymentMethod.billing_details.email}</p>
                    <p>{paymentMethod.billing_details.address.line1}</p>
                    <p>
                      {paymentMethod.billing_details.address.postal_code}{" "}
                      {paymentMethod.billing_details.address.city}
                    </p>
                    <p>{paymentMethod.billing_details.address.country}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BillingTab;
