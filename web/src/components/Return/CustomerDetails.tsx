"use client";

import type { Customer, Product } from "@/types/customer";
import { Chip, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { itemVariants } from "./Animations";
import { FC } from "react";

interface CustomerDetailsProps {
  customer?: Customer;
  product?: Product;
}

const CustomerDetails: FC<CustomerDetailsProps> = ({ customer, product }) => (
  <motion.div variants={itemVariants} className="space-y-6">
    {product && (
      <div>
        <h3 className="text-base font-medium text-default-500 mb-2">Product</h3>
        <div className="flex justify-between items-center">
          <p className="font-semibold text-xl">{product.name}</p>
          <Chip
            color="primary"
            variant="flat"
            size="lg"
            className="text-lg px-4 py-2 h-auto"
          >
            ${product.price.toFixed(2)}
          </Chip>
        </div>
      </div>
    )}

    <Divider className="my-4" />

    {customer && (
      <div>
        <h3 className="text-base font-medium text-default-500 mb-2">
          Customer Details
        </h3>
        <p className="font-semibold text-xl">{customer.name}</p>
        <p className="text-default-500 text-lg">{customer.email}</p>

        {customer.address && (
          <div className="mt-3 text-base text-default-500">
            <p>{customer.address.line1}</p>
            {customer.address.line2 && <p>{customer.address.line2}</p>}
            <p>
              {customer.address.city}, {customer.address.state || ""}{" "}
              {customer.address.postal_code}
            </p>
            <p>{customer.address.country}</p>
          </div>
        )}
      </div>
    )}
  </motion.div>
);

export default CustomerDetails;
