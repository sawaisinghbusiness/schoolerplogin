/**
 * Modal.com Serverless / AI Endpoint Client Service
 * Configured with Modal-Key, Modal-Secret, and Bearer Authorization.
 */

const MODAL_KEY = process.env.MODAL_KEY || "wk-qeT70UaYdJtsCKcOh0rq7G";
const MODAL_SECRET = process.env.MODAL_SECRET || "ws-MA8EM4NdtYb9mfh1cdg3ih";
const MODAL_AUTH_TOKEN =
  process.env.MODAL_AUTH_TOKEN ||
  `${MODAL_KEY}.${MODAL_SECRET}`;

export interface ModalRequestOptions {
  authType?: "headers" | "bearer";
  timeoutMs?: number;
}

export const modalService = {
  /**
   * Get the authentication headers required for Modal proxy webhooks or OpenAI-compatible servers
   */
  getAuthHeaders(authType: "headers" | "bearer" = "headers"): Record<string, string> {
    if (authType === "bearer") {
      return {
        Authorization: `Bearer ${MODAL_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      };
    }
    return {
      "Modal-Key": MODAL_KEY,
      "Modal-Secret": MODAL_SECRET,
      "Content-Type": "application/json",
    };
  },

  /**
   * Execute an HTTP POST request to a deployed Modal serverless endpoint
   */
  async callEndpoint<T = any>(
    endpointUrl: string,
    payload: any,
    options: ModalRequestOptions = { authType: "headers" }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const headers = this.getAuthHeaders(options.authType);

      const res = await fetch(endpointUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          error: `Modal request failed with status ${res.status}: ${errorText}`,
        };
      }

      const data = (await res.json()) as T;
      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to communicate with Modal endpoint",
      };
    }
  },
};
