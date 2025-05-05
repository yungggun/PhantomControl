import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { FC } from "react";
import { Image } from "@heroui/react";

interface ReadFileModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  content: string | null;
  setFileContent: (value: string) => void;
  fileType: string | null;
}

const ReadFileModal: FC<ReadFileModalProps> = ({
  isOpen,
  onClose,
  content,
  fileType,
  setFileContent,
}) => {
  const fileExtension = fileType ? fileType.split("/").pop() : "";

  const isImage =
    fileExtension &&
    ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
      fileExtension.toLowerCase()
    );

  const isVideo =
    fileExtension &&
    ["mp4", "webm", "ogg", "avi", "mov", "mkv"].includes(
      fileExtension.toLowerCase()
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setFileContent("");
      }}
      size={isImage ? "5xl" : isVideo ? "5xl" : "md"}
    >
      <ModalContent>
        <ModalHeader>File Content</ModalHeader>
        <ModalBody>
          {!content ? (
            <p>No content available</p>
          ) : isImage ? (
            <div className="flex justify-center items-center ">
              <Image
                src={`data:image/${fileExtension};base64,${content}`}
                alt="File content"
                isBlurred
                isZoomed
              />
            </div>
          ) : isVideo ? (
            <video controls style={{ width: "100%", borderRadius: "16px" }}>
              <source
                src={`data:video/${fileExtension};base64,${content}`}
                type={`video/${fileExtension}`}
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="whitespace-pre-wrap break-words">{atob(content)}</p>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReadFileModal;
