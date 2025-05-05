import { Role } from "@/types/user";
import axios from "axios";

export class Helper {
  constructor() {}

  async createCheckoutSession(plan: Role | null) {
    return axios
      .post(`payment/create-checkout-session?plan=${plan}`)
      .then((response) => {
        if (response.status !== 201) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch((error) => {
        return {
          data: error.response.status === 403 ? 403 : null,
          status: false,
        };
      });
  }

  async getSessionStatus(sessionId: string) {
    return axios
      .get(`payment/session-status?session_id=${sessionId}`)
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async getAllInvoices() {
    return axios
      .get("payment/invoices")
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async getCurrentSubscription() {
    return axios
      .get("payment/subscription")
      .then((response) => {
        if (response.status !== 200) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async cancelSubscription() {
    return axios
      .post("payment/cancel-subscription")
      .then((response) => {
        if (response.status !== 201) return { data: null, status: false };

        const data = response.data;
        return { data: data, status: true };
      })
      .catch(() => {
        return { data: null, status: false };
      });
  }

  async updateSubscription(plan: Role) {
    return axios
      .post(`payment/update-subscription?plan=${plan}`)
      .then((response) => {
        if (response.status !== 201)
          return {
            data: null,
            status: false,
            message: "Error updating subscription",
          };

        const data = response.data;
        return { data: data, status: true, message: "Subscription updated" };
      })
      .catch((error) => {
        return {
          data: null,
          status: false,
          message: error.response.data.message,
        };
      });
  }
}
