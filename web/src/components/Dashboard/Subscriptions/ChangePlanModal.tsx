"use client";

import { FC, useState } from "react";
import { motion } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import type { Role } from "@/types/user";
import { PlanData } from "@/types/plans";
import { plans } from "@/components/Plan/plans";
import PlanCard from "@/components/Plan/PlanCard";

interface ChangePlanModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  currentPlan: Role;
  onPlanChange: (newPlan: Role) => void;
  isLoading: boolean;
}

const ChangePlanModal: FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onPlanChange,
  isLoading,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Role | null>(null);

  const handleConfirm = () => {
    if (!selectedPlan || selectedPlan === currentPlan) return;
    onPlanChange(selectedPlan);
  };

  const handleClose = () => {
    setSelectedPlan(null);
    onClose();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 200, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 50,
      },
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      motionProps={{
        variants: {
          enter: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeOut" },
          },
          exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2, ease: "easeIn" },
          },
        },
      }}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">Change Your Plan</h2>
            <p className="text-sm text-gray-500">
              Select a new plan to upgrade or downgrade your subscription
            </p>
          </ModalHeader>
          <ModalBody>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {plans.map((plan: PlanData) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className="h-full"
                >
                  <PlanCard
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    isCurrent={currentPlan === plan.name.toUpperCase()}
                    onSelect={() => setSelectedPlan(plan.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleConfirm}
              isDisabled={
                !selectedPlan || selectedPlan === currentPlan || isLoading
              }
              isLoading={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Change"}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default ChangePlanModal;
