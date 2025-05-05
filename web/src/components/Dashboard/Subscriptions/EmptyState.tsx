"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

const EmptyState = () => {
  const router = useRouter();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-200 bg-white">
        <CardBody className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 bg-gray-100 rounded-full">
              <Icon
                icon="solar:info-circle-linear"
                className="w-8 h-8 text-gray-500"
              />
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No active subscription
            </h2>

            <p className="text-gray-600 text-sm mb-6">
              You don&apos;t currently have an active subscription. Discover our
              plans for more features.
            </p>

            <Button
              color="primary"
              size="md"
              startContent={
                <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
              }
              onPress={() => router.push("/pricing")}
            >
              Discover plans
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default EmptyState;
