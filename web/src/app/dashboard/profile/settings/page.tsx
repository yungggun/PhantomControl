"use client";

import { Icon } from "@iconify/react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  useDisclosure,
} from "@heroui/react";
import { userStore } from "@/data/userStore";
import ApiClient from "@/api";
import { toast } from "sonner";
import { useHandleDeleteAccount } from "@/hooks/use-user";
import { useState } from "react";
import ConfirmActionModal from "@/components/Common/ConfirmActionModal";

const apiClient = new ApiClient();

const ProfileSettings = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalContent, setModalContent] = useState<{
    header: string;
    body: string;
    buttonText: string;
    action: () => void;
  }>({ header: "", body: "", buttonText: "", action: () => {} });
  const { user, clientKey, fetchUser, fetchClientKey } = userStore();
  const [username, setUsername] = useState<string>(user.username ?? "Guest");

  const createdAtDate = user.createdAt ? new Date(user.createdAt) : new Date();
  const handleDeleteAccount = useHandleDeleteAccount();

  const copyClientKey = () => {
    if (clientKey.key) {
      navigator.clipboard.writeText(clientKey.key);
      toast.success("Client key has been copied to clipboard.");
    } else {
      toast.error("Client key is not available.");
    }
  };

  const resetClientKey = async () => {
    setModalContent({
      header: "Are you absolutely sure?",
      body: "This action cannot be undone. Your current client key will be invalid, and a new one will be generated.",
      buttonText: "Reset",
      action: async () => {
        const response = await apiClient.user.helper.resetClientKey();
        if (response.status) {
          fetchClientKey();
          onClose();
          toast.success("Client key has been reset.");
        } else {
          toast.error("Failed to reset API key.");
        }
      },
    });
    onOpen();
  };

  const deleteAccount = async () => {
    setModalContent({
      header: "Are you absolutely sure?",
      body: "This action cannot be undone. Your account and all data will be permanently deleted.",
      buttonText: "Delete Account",
      action: async () => {
        handleDeleteAccount();
        onClose();
      },
    });
    onOpen();
  };

  const updateUser = async (username: string) => {
    return apiClient.user.helper.updateUser(username).then((response) => {
      if (response.status) {
        fetchUser();
        toast.success("Username has been updated.");
      } else {
        toast.error("Failed to update username.");
      }
    });
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-black">
        Account Information
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex space-x-4">
            <Input
              label="Username"
              onChange={(e) => setUsername(e.target.value)}
              defaultValue={username}
              variant="bordered"
            />
            <Input
              label="Email"
              type="email"
              readOnly
              defaultValue={user.email}
              variant="bordered"
            />
          </div>
          <div className="flex space-x-4">
            <Input
              label="Role"
              value={user.role}
              isReadOnly
              variant="bordered"
            />
            <Input
              label="Account Created"
              value={createdAtDate.toLocaleDateString()}
              isReadOnly
              variant="bordered"
            />
          </div>
          <Button
            color="primary"
            type="submit"
            isDisabled={username === user.username}
            onPress={() => updateUser(username)}
          >
            Update Information
          </Button>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Client Key</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-500">
              Your client key is used to tell our servers who our client is.
              Keep your key safe and do not share it with anyone. If you believe
              your key has been compromised, you can reset it below.
            </p>
            <Input
              value={clientKey.key}
              isReadOnly
              variant="bordered"
              classNames={{
                input:
                  "font-mono [&:not(:focus)]:blur-sm transition-all duration-300",
              }}
              endContent={
                <Button isIconOnly variant="light" onPress={copyClientKey}>
                  <Icon icon="mdi:content-copy" className="h-4 w-4" />
                </Button>
              }
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Danger Zone</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data.
              </p>
              <Button color="danger" onPress={deleteAccount}>
                Delete Account
              </Button>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm text-gray-500">
                Reset your API key. This will invalidate the current key and
                generate a new one.
              </p>
              <Button color="danger" onPress={resetClientKey}>
                Reset Client Key
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmActionModal
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        useHandleConfirmAction={modalContent.action}
        header={modalContent.header}
        body={modalContent.body}
        buttonText={modalContent.buttonText}
      />
    </div>
  );
};

export default ProfileSettings;
