import axios from "axios";

export class Console {
  constructor() {}

  async sendCommand(hwid: string, command: string) {
    return axios
      .post(`clients/${hwid}/command`, {
        command: command,
      })
      .then((response) => {
        if (response.status !== 201) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async createConsole(hwid: string) {
    return axios
      .post(`clients/${hwid}/console/create`)
      .then((response) => {
        if (response.status !== 201) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async getConsolesByUserId() {
    return axios
      .get("clients/consoles")
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async getConsoleByHwid(hwid: string) {
    return axios
      .get(`clients/${hwid}/console`)
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async deleteConsole(hwid: string) {
    return axios
      .delete(`clients/${hwid}/console/delete`)
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }
}
