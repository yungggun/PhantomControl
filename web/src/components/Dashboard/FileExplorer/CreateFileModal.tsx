import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { FC } from "react";

interface CreateFileModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: (isOpen: boolean) => void;
  modalHeader: string;
  fileName: string;
  setFileName: (value: string) => void;
  fileContent: string;
  setFileContent: (value: string) => void;
  onConfirm: () => void;
}

const CreateFileModal: FC<CreateFileModalProps> = ({
  isOpen,
  onOpenChange,
  modalHeader,
  fileName,
  setFileName,
  fileContent,
  setFileContent,
  onConfirm,
}) => {
  return (
    <Modal
      onClose={() => {
        setFileName("");
        setFileContent("");
      }}
      isOpen={isOpen}
      placement="top-center"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {modalHeader}
            </ModalHeader>
            <ModalBody>
              <Input
                label={
                  modalHeader === "Create File" ? "File Name" : "Folder Name"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") onConfirm();
                }}
                isRequired
                errorMessage="This field is required"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                endContent={
                  modalHeader === "Create File" && (
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">.txt</span>
                    </div>
                  )
                }
              />
              {modalHeader === "Create File" && (
                <Textarea
                  label="Content"
                  placeholder="Enter content here..."
                  rows={4}
                  className="mt-4"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  if (fileName.length === 0) return;
                  onConfirm();
                }}
              >
                Create
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateFileModal;
