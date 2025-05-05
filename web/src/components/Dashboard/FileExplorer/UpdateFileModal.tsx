import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { FC } from "react";

interface UpdateFileModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: (isOpen: boolean) => void;
  fileContent: string;
  setFileUpdateContent: (value: string) => void;
  setFileName: (value: string) => void;
  onConfirm: () => void;
}

const UpdateFileModal: FC<UpdateFileModalProps> = ({
  isOpen,
  onOpenChange,
  fileContent,
  setFileUpdateContent,
  setFileName,
  onConfirm,
}) => {
  return (
    <Modal
      onClose={() => {
        setFileUpdateContent("");
        setFileName("");
      }}
      isOpen={isOpen}
      placement="top-center"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Edit File</ModalHeader>
            <ModalBody>
              <Textarea
                label="Content"
                placeholder="Enter content here..."
                rows={4}
                className="mt-4"
                value={fileContent}
                onChange={(e) => setFileUpdateContent(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onConfirm();
                }}
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateFileModal;
