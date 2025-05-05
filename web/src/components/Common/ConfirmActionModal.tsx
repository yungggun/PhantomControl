import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { FC } from "react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  useHandleConfirmAction: () => void;
  header: string;
  body: string;
  buttonText: string;
}

const ConfirmActionModal: FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  useHandleConfirmAction,
  header,
  body,
  buttonText,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={() => onClose()}>
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={() => onClose()}>
            Cancel
          </Button>
          <Button color="danger" onPress={useHandleConfirmAction}>
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmActionModal;
