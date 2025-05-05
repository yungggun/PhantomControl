"use client";

import type { Customer, Product } from "@/types/customer";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { containerVariants, itemVariants } from "./Animations";
import CustomerDetails from "./CustomerDetails";
import { FC } from "react";
import { userStore } from "@/data/userStore";

interface SuccessCardProps {
  customer?: Customer;
  product?: Product;
}

const SuccessCard: FC<SuccessCardProps> = ({ customer, product }) => {
  const router = useRouter();
  const { fetchUser } = userStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl z-10"
    >
      <Card className="w-full shadow-xl">
        <CardHeader className="flex gap-5 bg-success-50 dark:bg-success-900/20 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3,
              rotate: {
                delay: 1,
                duration: 2,
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: 1,
              },
            }}
          >
            <Icon
              icon="akar-icons:check"
              className="text-success"
              fontSize={36}
            />
          </motion.div>
          <div className="flex flex-col">
            <motion.p variants={itemVariants} className="text-2xl font-bold">
              Payment Successful
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-medium text-default-500"
            >
              Thank you for your purchase
            </motion.p>
          </div>
        </CardHeader>

        <CardBody className="p-8">
          <CustomerDetails customer={customer} product={product} />
        </CardBody>

        <CardFooter className="p-8">
          <motion.div
            variants={itemVariants}
            className="w-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              color="primary"
              endContent={
                <Icon icon="solar:arrow-right-linear" fontSize={20} />
              }
              onPress={() => {
                router.push("/dashboard");
                fetchUser();
              }}
              fullWidth
              size="lg"
              className="text-lg h-14"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SuccessCard;
