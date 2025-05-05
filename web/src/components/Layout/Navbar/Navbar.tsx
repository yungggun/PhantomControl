"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSidebarContext } from "@/context/SidebarProvider";
import { Icon } from "@iconify/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  DropdownSection,
} from "@heroui/react";
import { userStore } from "@/data/userStore";
import { useHandleLogout } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import ApiClient from "@/api";

const apiClient = new ApiClient();

const Navbar = () => {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const { user } = userStore();
  const router = useRouter();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    apiClient.clients.helper
      .downloadClientFile((progress: number) => setDownloadProgress(progress))
      .finally(() => {
        setIsDownloading(false);
        setDownloadProgress(null);
      });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 lg:hidden"
        aria-label="Toggle Sidebar"
      >
        <Icon icon="mdi:menu" className="text-xl" />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/icon.png"}
            width={45}
            height={45}
            alt="PhantomControl"
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-semibold text-dark">
          Dashboard
        </h1>
        <p className="font-medium">Control all your clients in one place</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <div className="shrink-0">
          <Dropdown showArrow backdrop="transparent">
            <DropdownTrigger>
              <User
                as="button"
                avatarProps={{
                  src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                }}
                className="transition-transform"
                description={
                  user.role
                    ? user.role?.charAt(0).toUpperCase() +
                      user.role?.slice(1).toLowerCase()
                    : "User"
                }
                name={user.username}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
              <DropdownSection showDivider>
                <DropdownItem
                  isReadOnly
                  key="profile"
                  className="h-14 gap-2"
                  textValue={`Signed in as ${user.username}`}
                >
                  <User
                    avatarProps={{
                      size: "sm",
                      src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                    }}
                    description={user.email}
                    name={user.username}
                  />
                </DropdownItem>
              </DropdownSection>
              <DropdownSection showDivider>
                <DropdownItem
                  key="settings"
                  startContent={
                    <Icon icon="solar:settings-outline" fontSize={20} />
                  }
                  textValue="Settings"
                  onPress={() => router.push("/dashboard/profile/settings")}
                >
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="Plans"
                  startContent={
                    <Icon icon="ion:pricetags-outline" fontSize={16} />
                  }
                  textValue="Plans"
                  onPress={() => router.push("/pricing")}
                >
                  Plans
                </DropdownItem>
                <DropdownItem
                  key="Download Client"
                  startContent={
                    <Icon
                      icon="solar:download-minimalistic-bold"
                      fontSize={16}
                    />
                  }
                  textValue="Download Client"
                  onPress={handleDownload}
                >
                  {isDownloading
                    ? `Downloading... ${downloadProgress ?? 0}%`
                    : "Download Client"}
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<Icon icon="solar:logout-3-line-duotone" />}
                  onPress={useHandleLogout()}
                  textValue="Log Out"
                >
                  Log Out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
