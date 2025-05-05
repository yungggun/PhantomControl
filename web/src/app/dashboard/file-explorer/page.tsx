"use client";

import ApiClient from "@/api";
import { FileExplorers, FileTree } from "@/types/fileExplorers";
import {
  Avatar,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Input,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import useIsMobile from "@/hooks/use-mobile";
import clsx from "clsx";
import CreateFileModal from "@/components/Dashboard/FileExplorer/CreateFileModal";
import ReadFileModal from "@/components/Dashboard/FileExplorer/ReadFileModal";
import UpdateFileModal from "@/components/Dashboard/FileExplorer/UpdateFileModal";

const apiClient = new ApiClient();

const FileExplorerPage = () => {
  const [fileExplorers, setFileExplorers] = useState<FileExplorers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fileTree, setFileTree] = useState<FileTree[]>([]);
  const [selectedHwid, setSelectedHwid] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [path, setPath] = useState<string>("");
  const [modalHeader, setModalHeader] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileCreateContent, setFileCreateContent] = useState("");
  const [fileUpdateContent, setFileUpdateContent] = useState("");
  const [fileType, setFileType] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});
  const [downloadingFiles, setDownloadingFiles] = useState<
    Record<string, boolean>
  >({});
  const [confirmClose, setConfirmClose] = useState<{
    [hwid: string]: NodeJS.Timeout | null;
  }>({});
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<{
    [fileName: string]: NodeJS.Timeout | null;
  }>({});

  const {
    isOpen: isOpenCreateFile,
    onOpen: onOpenCreateFile,
    onOpenChange: onOpenChangeCreateFile,
  } = useDisclosure();

  const {
    isOpen: isOpenReadFile,
    onOpen: onOpenReadFile,
    onOpenChange: onOpenChangeReadFile,
  } = useDisclosure();

  const {
    isOpen: isOpenUpdateFile,
    onOpen: onOpenUpdateFile,
    onOpenChange: onOpenChangeUpdateFile,
  } = useDisclosure();

  const actionTopList = [
    {
      icon: "lets-icons:upload",
      color: "primary" as const,
      toolTip: "Upload File",
      onPress: () => {
        document.getElementById("file-input")?.click();
      },
    },
    {
      icon: "iconamoon:folder-add",
      color: "primary" as const,
      toolTip: "Create Folder",
      onPress: () => {
        setModalHeader("Create Folder");
        onOpenCreateFile();
      },
    },
    {
      icon: "iconamoon:file-add-light",
      color: "primary" as const,
      toolTip: "Create File",
      onPress: () => {
        setModalHeader("Create File");
        onOpenCreateFile();
      },
    },
    {
      icon: "charm:refresh",
      color: "primary" as const,
      toolTip: "Refresh the files",
      onPress: () => {
        if (!selectedHwid) return;
        apiClient.clients.fileExplorer
          .getFileTree(selectedHwid, path)
          .then((response) => {
            if (response.status) {
              setFileTree(response.data);
              toast.success("Refreshed!");
            } else {
              toast.error("Failed to get file tree");
            }
          });
      },
    },
  ];

  const actionList = [
    {
      icon: "wpf:view-file",
      color: "primary" as const,
      onPress: (name: string) => {
        if (!selectedHwid) return;
        apiClient.clients.fileExplorer
          .readFile(selectedHwid, path + "/" + name)
          .then((response) => {
            if (response.status) {
              setFileContent(response.data ?? "");
              setFileType(response.fileType);

              onOpenReadFile();
            } else {
              toast.error("Failed to read file");
            }
          });
      },
    },
    {
      icon: "wpf:edit-file",
      color: "primary" as const,
      onPress: (name: string) => {
        if (!selectedHwid) return;

        apiClient.clients.fileExplorer
          .readFile(selectedHwid, path + "/" + name)
          .then((response) => {
            if (response.status) {
              const content = atob(response.data);

              setFileName(name);
              setFileUpdateContent(content);
              onOpenUpdateFile();
            }
          });
      },
    },
    {
      icon: "ic:outline-file-download",
      color: "primary" as const,
      onPress: (name: string, type: string) => {
        if (!selectedHwid) return;

        setDownloadingFiles((prev) => ({ ...prev, [name]: true }));
        setDownloadProgress((prev) => ({ ...prev, [name]: 0 }));

        apiClient.clients.fileExplorer
          .downloadFileFromClient(
            selectedHwid,
            type === "folder" ? `${path}/${name}` : path,
            type === "folder" ? "*" : name,
            (progress: number) => {
              setDownloadProgress((prev) => ({ ...prev, [name]: progress }));
            }
          )
          .then((response) => {
            setDownloadingFiles((prev) => ({ ...prev, [name]: false }));
            if (response.status) {
              toast.success("File downloaded successfully");
            } else {
              toast.error("Failed to download file");
            }
          });
      },
    },
    {
      icon: "mdi:delete",
      color: "danger" as const,
      onPress: (name: string) => {
        if (!selectedHwid) return;

        if (!confirmDeleteFile[name]) {
          toast.info("Press again to confirm delete");

          const timeout = setTimeout(() => {
            setConfirmDeleteFile((prev) => {
              const updated = { ...prev };
              delete updated[name];
              return updated;
            });
          }, 5000);

          setConfirmDeleteFile((prev) => ({ ...prev, [name]: timeout }));
        } else {
          clearTimeout(confirmDeleteFile[name]!);
          apiClient.clients.fileExplorer
            .deleteFile(selectedHwid, path + "/" + name)
            .then((response) => {
              if (response.status) {
                toast.success("File deleted successfully");
                setFileTree((prevFileTree) =>
                  prevFileTree.filter((file) => file.name !== name)
                );
                setConfirmDeleteFile((prev) => {
                  const updated = { ...prev };
                  delete updated[name];
                  return updated;
                });
              } else {
                toast.error("Failed to delete file");
              }
            });
        }
      },
    },
  ];

  const handleUpdateFile = () => {
    if (!selectedHwid) return;

    apiClient.clients.fileExplorer
      .updateFile(selectedHwid, path + "/" + fileName, fileUpdateContent)
      .then((response) => {
        if (response.status) {
          toast.success("File updated successfully");
        } else {
          toast.error("Failed to update file");
        }
      });

    onOpenChangeUpdateFile();
    setFileUpdateContent("");
  };

  const handleCreate = () => {
    if (!selectedHwid) return;

    const isFolder = modalHeader === "Create Folder";
    const fileType = isFolder ? "folder" : "file";
    const fullPath = `${path}/${fileName}${isFolder ? "" : ".txt"}`;

    apiClient.clients.fileExplorer
      .createFile(selectedHwid, fullPath, fileCreateContent, fileType)
      .then((response) => {
        if (response.status) {
          toast.success(`${isFolder ? "Folder" : "File"} created successfully`);
          setFileTree((prevFileTree) => [
            ...prevFileTree,
            { name: `${fileName}${isFolder ? "" : ".txt"}`, type: fileType },
          ]);
        } else {
          toast.error(`Failed to create ${isFolder ? "folder" : "file"}`);
        }
      });

    onOpenChangeCreateFile();
    setFileName("");
    setFileCreateContent("");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && selectedHwid) {
      setUploading(true);
      apiClient.clients.fileExplorer
        .uploadFileToClient(selectedHwid, Array.from(files), path, (progress) =>
          setUploadProgress(progress)
        )
        .then((response) => {
          if (response.status) {
            toast.success("File uploaded successfully");
            apiClient.clients.fileExplorer
              .getFileTree(selectedHwid, path)
              .then((response) => {
                if (response.status) {
                  setFileTree(response.data);
                } else {
                  toast.error("Failed to get file tree");
                }
              });
          } else {
            toast.error("Failed to upload file");
          }
        })
        .catch(() => {
          toast.error("An error occurred while uploading the file");
        })
        .finally(() => {
          setUploading(false);
          setUploadProgress(0);
        });
    }
  };

  useEffect(() => {
    apiClient.clients.fileExplorer
      .getFileExplorersByUserId()
      .then((response) => {
        if (response.status) {
          setFileExplorers(
            response.data.sort((a: { client: { online: string } }) =>
              a.client.online ? -1 : 1
            )
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedHwid) {
      const username = fileExplorers.find(
        (fileExplorer) => fileExplorer.hwid === selectedHwid
      )?.name;

      setPath(username ? `C:/Users/${username}/Desktop` : "C:/");

      apiClient.clients.fileExplorer
        .getFileTree(
          selectedHwid,
          username ? `C:/Users/${username}/Desktop` : "C:/"
        )
        .then((response) => {
          if (response.status) {
            setFileTree(response.data);
          } else {
            toast.error("Failed to get file tree");
          }
        });
    }
  }, [fileExplorers, selectedHwid]);

  useEffect(() => {
    apiClient.clients.helper.initSocket((data) => {
      setFileExplorers((prevFileExplorer) => {
        return prevFileExplorer.map((fileExplorer) =>
          fileExplorer.hwid === data.hwid
            ? {
                ...fileExplorer,
                client: { ...fileExplorer.client, online: data.online },
              }
            : fileExplorer
        );
      });
    });

    return () => {
      apiClient.clients.helper.disconnectSocket();
    };
  }, []);

  const closeFileExplorer = (hwid: string) => {
    if (!confirmClose[hwid]) {
      toast.info("Press again to confirm close");

      const timeout = setTimeout(() => {
        setConfirmClose((prev) => {
          const updated = { ...prev };
          delete updated[hwid];
          return updated;
        });
      }, 5000);

      setConfirmClose((prev) => ({ ...prev, [hwid]: timeout }));
    } else {
      clearTimeout(confirmClose[hwid]!);
      apiClient.clients.fileExplorer
        .deleteFileExplorer(hwid)
        .then((response) => {
          if (response.status) {
            setFileExplorers(
              fileExplorers.filter((fileExplorer) => fileExplorer.hwid !== hwid)
            );
            setSelectedHwid(null);
            toast.success("File Explorer closed successfully");
            setConfirmClose((prev) => {
              const updated = { ...prev };
              delete updated[hwid];
              return updated;
            });
          } else {
            toast.error("Failed to close File Explorer");
          }
        });
    }
  };

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const isOnline = (hwid: string) => {
    return fileExplorers.find((fileExplorer) => fileExplorer.hwid === hwid)
      ?.client?.online;
  };

  const filteredFileExplorers = fileExplorers.filter((fileExplorer) =>
    fileExplorer.name.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4">
        <Input
          isClearable
          className="w-full sm:max-w-[30%]"
          placeholder="Search by name..."
          startContent={<Icon icon="mdi:magnify" />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <span className="text-default-400 text-small">
          Total {fileExplorers.length} File Explorer
        </span>
        {/* Sidebar Toggle Button for Mobile */}
        {isMobile && (
          <Button
            onPress={() => setIsSidebarOpen((prev) => !prev)}
            color="primary"
            className="self-start"
          >
            {isSidebarOpen ? (
              <Icon icon="mdi:close" fontSize={20} />
            ) : (
              <Icon icon="mdi:menu" fontSize={20} />
            )}
          </Button>
        )}
      </div>
      <div className="flex bg-white rounded-xl shadow-md h-full max-h-[70vh]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full w-full">
            <Spinner label="Loading..." />
          </div>
        ) : fileExplorers.length > 0 ? (
          <>
            {/* Tabs */}
            <div
              className={clsx(
                "flex flex-col justify-start bg-white rounded-tl-xl rounded-bl-xl max-w-[250px] h-full p-4 border-r overflow-y-auto custom-scrollbar",
                {
                  hidden: isMobile && !isSidebarOpen,
                }
              )}
            >
              {filteredFileExplorers.length > 0 ? (
                filteredFileExplorers.map((fileExplorer) => (
                  <div
                    key={fileExplorer.hwid}
                    className={clsx(
                      "mb-2 bg-slate-100 p-4 rounded-xl flex items-center group",
                      {
                        "bg-slate-200 shadow-md":
                          selectedHwid === fileExplorer.hwid,
                        "cursor-not-allowed opacity-70": !isOnline(
                          fileExplorer.hwid
                        ),
                        "cursor-pointer": isOnline(fileExplorer.hwid),
                      }
                    )}
                    onClick={() => {
                      if (isOnline(fileExplorer.hwid)) {
                        setSelectedHwid(fileExplorer.hwid);
                        setIsSidebarOpen(false);
                      } else {
                        toast.error(
                          "The client is offline so you can't access the file explorer"
                        );
                      }
                    }}
                  >
                    <Avatar
                      size="md"
                      className="flex justify-start"
                      classNames={{
                        base: "bg-gradient-to-br from-[#006bff] to-[#00aaff]",
                        icon: "text-black/80",
                      }}
                      icon={
                        <Icon
                          icon="mdi:account"
                          className="text-black"
                          fontSize={25}
                        />
                      }
                    />
                    <div className="ml-2 flex-1 min-w-0">
                      <p className="text-ellipsis overflow-hidden whitespace-nowrap capitalize">
                        {fileExplorer.name}
                      </p>
                      <Chip
                        className="capitalize border-none"
                        color={
                          fileExplorer.client?.online ? "success" : "danger"
                        }
                        size="md"
                        variant="dot"
                      >
                        {fileExplorer.client?.online ? "online" : "offline"}
                      </Chip>
                    </div>
                    {/* Close Icon */}
                    <div
                      className="ml-2 p-1 rounded-full hover:bg-gray-500/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFileExplorer(fileExplorer.hwid);
                      }}
                    >
                      <Icon
                        icon="mdi:close"
                        className={clsx({
                          "text-red-500 hover:text-red-700":
                            confirmClose[fileExplorer.hwid],
                          "text-gray-500 hover:text-gray-700":
                            !confirmClose[fileExplorer.hwid],
                        })}
                        fontSize={20}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <h1 className="font-semibold text-2xl">
                    There is no file explorer named{" "}
                    <span className="text-primary">{filterValue}</span>
                  </h1>
                </div>
              )}
            </div>

            {/* File Explorer */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
              {/* Options Container */}
              {!isSidebarOpen && selectedHwid && (
                <div className="flex justify-between border-b pb-4 items-center">
                  <div>
                    <Breadcrumbs
                      itemsAfterCollapse={2}
                      itemsBeforeCollapse={1}
                      maxItems={5}
                    >
                      {path.split("/").map((item, index) => (
                        <BreadcrumbItem
                          key={index}
                          onPress={() => {
                            const newPath = path
                              .split("/")
                              .slice(0, index + 1)
                              .join("/");
                            setPath(newPath);
                            apiClient.clients.fileExplorer
                              .getFileTree(selectedHwid, newPath)
                              .then((response) => {
                                if (response.status) {
                                  setFileTree(response.data);
                                } else {
                                  toast.error("Failed to get file tree");
                                }
                              });
                          }}
                        >
                          {item}
                        </BreadcrumbItem>
                      ))}
                    </Breadcrumbs>
                  </div>
                  <div className="flex items-center">
                    {actionTopList.map((action, index) => (
                      <Tooltip
                        showArrow
                        delay={1000}
                        content={action.toolTip}
                        key={index}
                      >
                        {uploading && action.toolTip === "Upload File" ? (
                          <CircularProgress
                            aria-label="Loading..."
                            color="primary"
                            showValueLabel={true}
                            size="lg"
                            value={uploadProgress}
                          />
                        ) : (
                          <Button
                            color={action.color}
                            className="ml-2"
                            isIconOnly
                            onPress={action.onPress}
                          >
                            <Icon icon={action.icon} fontSize={17} />
                          </Button>
                        )}
                      </Tooltip>
                    ))}

                    <input
                      type="file"
                      id="file-input"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                      multiple
                    />
                  </div>
                </div>
              )}

              {selectedHwid && !isSidebarOpen ? (
                <div className="flex-1">
                  {fileTree.length > 0 ? (
                    fileTree
                      .sort((a, b) => {
                        if (a.type === "folder" && b.type !== "folder")
                          return -1;
                        if (a.type !== "folder" && b.type === "folder")
                          return 1;
                        return 0;
                      })
                      .map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          {/* Files */}
                          <div
                            className="flex items-center gap-2 flex-1"
                            onClick={() => {
                              if (file.type === "folder") {
                                setPath(
                                  (prevPath) => `${prevPath}/${file.name}`
                                );
                                apiClient.clients.fileExplorer
                                  .getFileTree(
                                    selectedHwid,
                                    `${path}/${file.name}`
                                  )
                                  .then((response) => {
                                    if (response.status) {
                                      setFileTree(response.data);
                                    } else {
                                      toast.error("Failed to get file tree");
                                    }
                                  });
                              }
                            }}
                          >
                            <Icon
                              icon={
                                file.type === "folder"
                                  ? "mdi:folder"
                                  : "mdi:file-document"
                              }
                              className={clsx({
                                "text-primary": file.type === "folder",
                                "text-secondary": file.type !== "folder",
                              })}
                            />
                            <p className="text-ellipsis overflow-hidden whitespace-nowrap">
                              {file.name}
                            </p>
                          </div>

                          {/* Button List */}
                          {/* Button List */}
                          {actionList
                            .filter(
                              (action) =>
                                !(
                                  file.type === "folder" &&
                                  action.icon === "ant-design:read-filled"
                                )
                            )
                            .map((action, index) => (
                              <div className="flex items-center" key={index}>
                                {downloadingFiles[file.name] &&
                                action.icon === "ic:outline-file-download" ? (
                                  <div className="mr-2">
                                    <CircularProgress
                                      aria-label="Downloading..."
                                      color="primary"
                                      showValueLabel={true}
                                      size="lg"
                                      value={downloadProgress[file.name] || 0}
                                    />
                                  </div>
                                ) : (
                                  <Button
                                    color={action.color}
                                    isIconOnly
                                    size="sm"
                                    onPress={() =>
                                      action.onPress(file.name, file.type)
                                    }
                                  >
                                    <Icon icon={action.icon} fontSize={20} />
                                  </Button>
                                )}
                              </div>
                            ))}
                        </div>
                      ))
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <h1 className="font-semibold text-2xl">
                        There is no file in this folder
                      </h1>
                    </div>
                  )}
                </div>
              ) : isSidebarOpen ? (
                <div className="flex justify-center items-center h-full">
                  <h1 className="font-semibold text-2xl">Wait for selection</h1>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <h1 className="font-semibold text-2xl">
                    Select a File Explorer
                  </h1>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full w-full">
            <h1 className="font-semibold text-2xl">No File Explorer found</h1>
          </div>
        )}
      </div>
      <CreateFileModal
        isOpen={isOpenCreateFile}
        onOpen={onOpenCreateFile}
        onOpenChange={onOpenChangeCreateFile}
        modalHeader={modalHeader}
        fileName={fileName}
        setFileName={setFileName}
        fileContent={fileCreateContent}
        setFileContent={setFileCreateContent}
        onConfirm={handleCreate}
      />
      <ReadFileModal
        isOpen={isOpenReadFile}
        onOpen={onOpenReadFile}
        onClose={onOpenChangeReadFile}
        content={fileContent}
        setFileContent={setFileContent}
        fileType={fileType}
      />
      <UpdateFileModal
        isOpen={isOpenUpdateFile}
        onOpen={onOpenUpdateFile}
        onOpenChange={onOpenChangeUpdateFile}
        fileContent={fileUpdateContent}
        setFileUpdateContent={setFileUpdateContent}
        setFileName={setFileName}
        onConfirm={handleUpdateFile}
      />
    </>
  );
};

export default FileExplorerPage;
