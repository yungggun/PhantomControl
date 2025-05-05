"use client";

import { useState } from "react";
import {
  Button,
  Drawer,
  useDisclosure,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/user";
import Checkout from "@/components/Payment/Checkout";
import { plans } from "@/components/Plan/plans";
import { PlanData } from "@/types/plans";
import PlanCard from "@/components/Plan/PlanCard";

const PricingPage = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Role | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubscribe = (plan: Role) => {
    setSelectedPlan(plan);
    onOpen();
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-12 h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-blackho">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade anytime as your
            business grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan: PlanData) => (
            <div key={plan.id}>
              <PlanCard
                plan={plan}
                actionButton={
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    onPress={() => handleSubscribe(plan.id)}
                  >
                    Get Started
                  </Button>
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-default-500">
            All plans include a 7-day free trial.
          </p>
          <p className="mt-2">
            <Button
              variant="light"
              color="primary"
              onPress={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </p>
        </div>
      </div>
      {/* Checkout Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        size="lg"
        motionProps={{
          variants: {
            enter: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.3 },
            },
            exit: {
              x: 100,
              opacity: 0,
              transition: { duration: 0.3 },
            },
          },
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader>Subscribing to {selectedPlan} plan</DrawerHeader>
              <DrawerBody>
                <div className="p-6 h-full overflow-y-auto">
                  {selectedPlan && <Checkout plan={selectedPlan} />}
                  <div className="mt-8 text-center">
                    <Button variant="light" onPress={onClose} className="mt-4">
                      Close
                    </Button>
                  </div>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default PricingPage;
