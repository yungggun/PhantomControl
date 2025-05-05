"use client";

import React, { FC } from "react";
import { Card, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { KPIStatProps } from "@/types/analytics";

export interface KPIStatListProps {
  data: KPIStatProps[];
}

const KPIStat: FC<KPIStatListProps> = ({ data }) => {
  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {data.map(
        (
          { title, value, change, changeType, trendChipPosition, iconName },
          index
        ) => (
          <Card key={index} className="border border-transparent">
            <div className="flex p-4 pb-6">
              <div
                className={cn(
                  "mt-1 flex h-8 w-8 items-center justify-center rounded-md",
                  {
                    "bg-success-50": changeType === "positive",
                    "bg-warning-50": changeType === "neutral",
                    "bg-danger-50": changeType === "negative",
                  }
                )}
              >
                {changeType === "positive" ? (
                  <Icon className="text-success" icon={iconName} width={20} />
                ) : changeType === "neutral" ? (
                  <Icon className="text-warning" icon={iconName} width={20} />
                ) : (
                  <Icon className="text-danger" icon={iconName} width={20} />
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <dt className="mx-4 text-small font-medium text-default-500">
                  {title}
                </dt>
                <dd className="px-4 text-2xl font-semibold text-default-700">
                  {value}
                </dd>
              </div>

              <Chip
                className={cn("absolute right-4", {
                  "top-4": trendChipPosition === "top",
                  "bottom-4": trendChipPosition === "bottom",
                })}
                classNames={{
                  content: "font-semibold text-[0.65rem]",
                }}
                color={
                  changeType === "positive"
                    ? "success"
                    : changeType === "neutral"
                    ? "warning"
                    : "danger"
                }
                radius="sm"
                size="sm"
                startContent={
                  changeType === "positive" ? (
                    <Icon
                      height={12}
                      icon={"solar:arrow-right-up-linear"}
                      width={12}
                    />
                  ) : changeType === "neutral" ? (
                    <Icon
                      height={12}
                      icon={"solar:arrow-right-linear"}
                      width={12}
                    />
                  ) : (
                    <Icon
                      height={12}
                      icon={"solar:arrow-right-down-linear"}
                      width={12}
                    />
                  )
                }
                variant="flat"
              >
                {change}
              </Chip>
            </div>
          </Card>
        )
      )}
    </dl>
  );
};

export default KPIStat;
