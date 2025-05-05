"use client";

import ApiClient from "@/api";
import { Consoles } from "@/types/consoles";
import { useEffect, useState, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Avatar, Chip, Input, Button, Spinner } from "@heroui/react";
import { toast } from "sonner";
import { Messages } from "@/types/message";
import clsx from "clsx";
import useIsMobile from "@/hooks/use-mobile";

const apiClient = new ApiClient();

const ConsolePage = () => {
  const [consoles, setConsoles] = useState<Consoles[]>([]);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHwid, setSelectedHwid] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [confirmClose, setConfirmClose] = useState<{
    [hwid: string]: NodeJS.Timeout | null;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedHwid]);

  useEffect(() => {
    apiClient.clients.console
      .getConsolesByUserId()
      .then((response) => {
        if (response.status) {
          setConsoles(
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
      apiClient.clients.console
        .getConsoleByHwid(selectedHwid)
        .then((response) => {
          if (response.status && response.data?.messages) {
            setMessages(response.data.messages);
          } else {
            setMessages([]);
          }
        });
    }
  }, [selectedHwid]);

  useEffect(() => {
    apiClient.clients.helper.initSocket((data) => {
      setConsoles((prevConsoles) => {
        return prevConsoles.map((console) =>
          console.hwid === data.hwid
            ? { ...console, client: { ...console.client, online: data.online } }
            : console
        );
      });
    });

    return () => {
      apiClient.clients.helper.disconnectSocket();
    };
  }, []);

  const closeConsole = (hwid: string) => {
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
      apiClient.clients.console.deleteConsole(hwid).then((response) => {
        if (response.status) {
          setConsoles(consoles.filter((console) => console.hwid !== hwid));
          setSelectedHwid(null);
          toast.success("Console closed successfully");
          setConfirmClose((prev) => {
            const updated = { ...prev };
            delete updated[hwid];
            return updated;
          });
        } else {
          toast.error("Failed to close console");
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

  const sendCommand = (hwid: string, command: string) => {
    apiClient.clients.console.sendCommand(hwid, command).then((response) => {
      if (response.status) {
        const newMessage: Messages = {
          content: command,
          response: response.data.output,
          timestamp: new Date(),
        };

        if (newMessage.response?.length === 0) {
          newMessage.response = `The command "${command}" was successfully executed but there was no output`;
        }

        setMessages((prev) => [...prev, newMessage]);
      } else {
        toast.error("Failed to send command");
      }
    });
  };

  const isOnline = (hwid: string) => {
    return consoles.find((console) => console.hwid === hwid)?.client?.online;
  };

  const formatResponse = (response: string) => {
    return response
      .replace(/\\n/g, "\n")
      .replace(/^"|"$/g, "")
      .split("\n")
      .map((line, index) => (
        <span className="flex" key={index}>
          {line}
        </span>
      ));
  };

  const filteredConsoles = consoles.filter((console) =>
    console.name.toLowerCase().includes(filterValue.toLowerCase())
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
          Total {consoles.length} consoles
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
        ) : consoles.length > 0 ? (
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
              {filteredConsoles.length > 0 ? (
                filteredConsoles.map((console) => (
                  <div
                    key={console.hwid}
                    className={clsx(
                      "mb-2 bg-slate-100 p-4 rounded-xl flex items-center cursor-pointer group",
                      {
                        "bg-slate-200 shadow-md": selectedHwid === console.hwid,
                      }
                    )}
                    onClick={() => {
                      setSelectedHwid(console.hwid);
                      setIsSidebarOpen(false);
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
                        {console.name}
                      </p>
                      <Chip
                        className="capitalize border-none"
                        color={console.client?.online ? "success" : "danger"}
                        size="md"
                        variant="dot"
                      >
                        {console.client?.online ? "online" : "offline"}
                      </Chip>
                    </div>
                    {/* Close Icon */}
                    <div
                      className="ml-2 p-1 rounded-full hover:bg-gray-500/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeConsole(console.hwid);
                      }}
                    >
                      <Icon
                        icon="mdi:close"
                        className={clsx({
                          "text-red-500 hover:text-red-700":
                            confirmClose[console.hwid],
                          "text-gray-500 hover:text-gray-700":
                            !confirmClose[console.hwid],
                        })}
                        fontSize={20}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <h1 className="font-semibold text-2xl">No consoles found</h1>
                </div>
              )}
            </div>

            {/* Console */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
              {selectedHwid && !isSidebarOpen ? (
                <div className="flex-1">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div key={index} className="mb-2 flex flex-col">
                        {/* Sended Command */}
                        <div className="flex justify-end">
                          <p className="text-sm bg-blue-500 text-white py-2 px-6 rounded-lg max-w-full break-words">
                            {message.content}
                          </p>
                        </div>
                        {/* Response */}
                        <div className="flex justify-start mt-1">
                          <p className="text-sm bg-gray-200 p-2 rounded-lg max-w-full break-words">
                            {message.response
                              ? formatResponse(message.response)
                              : null}
                          </p>
                        </div>
                        {/* Timestamp */}
                        {message.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            <strong>Timestamp:</strong>{" "}
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <h1 className="font-semibold text-2xl">
                        Right now there are no commands in the history for this
                        console
                      </h1>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : isSidebarOpen ? (
                <div className="flex justify-center items-center h-full">
                  <h1 className="font-semibold text-2xl">Wait for selection</h1>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <h1 className="font-semibold text-2xl">Select a console</h1>
                </div>
              )}

              {/* Input and Button Container */}
              {!isSidebarOpen && (
                <div className="flex justify-center items-center p-4 border-t">
                  <Input
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder={
                      isOnline(selectedHwid!)
                        ? "Enter command"
                        : "The Client is offline so you can't send commands"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (selectedHwid && commandInput) {
                          sendCommand(selectedHwid, commandInput);
                          setCommandInput("");
                        }
                      }
                    }}
                    isDisabled={isOnline(selectedHwid!) ? false : true}
                    className="mr-2"
                  />
                  <Button
                    onPress={() => {
                      if (selectedHwid && commandInput) {
                        sendCommand(selectedHwid, commandInput);
                        setCommandInput("");
                      }
                    }}
                    isDisabled={!selectedHwid || !commandInput}
                    color="primary"
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full w-full">
            <h1 className="font-semibold text-2xl">No consoles found</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default ConsolePage;
