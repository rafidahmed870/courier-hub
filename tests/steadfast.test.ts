import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Steadfast from "../src/providers/steadfast";

const BASE_URL = "https://portal.packzy.com/api/v1";
const config = { api_key: "test-key", secret_key: "test-secret" };

const fetchMock = vi.fn();

function mockResponse(
  body: unknown,
  init: { ok?: boolean; status?: number } = {},
) {
  const { ok = true, status = 200 } = init;

  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
    text: vi
      .fn()
      .mockResolvedValue(
        typeof body === "string" ? body : JSON.stringify(body),
      ),
  } as unknown as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Steadfast", () => {
  describe("constructor", () => {
    it("uses the production base url by default", async () => {
      fetchMock.mockResolvedValue(mockResponse({ status: 200 }));

      const client = new Steadfast(config);
      await client.getBalance();

      expect(fetchMock.mock.calls[0][0]).toBe(`${BASE_URL}/get_balance`);
    });

    it("strips trailing slashes from a custom base_url", async () => {
      fetchMock.mockResolvedValue(mockResponse({ status: 200 }));

      const client = new Steadfast({
        ...config,
        base_url: "https://example.test/api///",
      });
      await client.getBalance();

      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://example.test/api/get_balance",
      );
    });
  });

  describe("request headers", () => {
    it("sends the api key, secret key and content type", async () => {
      fetchMock.mockResolvedValue(mockResponse({ status: 200 }));

      const client = new Steadfast(config);
      await client.getBalance();

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).toEqual({
        "Api-Key": "test-key",
        "Secret-Key": "test-secret",
        "Content-Type": "application/json",
      });
    });
  });

  describe("createOrder", () => {
    it("posts the payload and returns the parsed response", async () => {
      const response = {
        status: 200,
        message: "Consignment has been created successfully.",
        consignment: { id: 1, invoice: "INV-1" },
      };
      fetchMock.mockResolvedValue(mockResponse(response));

      const client = new Steadfast(config);
      const order = {
        invoice: "INV-1",
        recipient_name: "Rafid",
        recipient_phone: "01700000000",
        recipient_address: "Dhaka",
        cod_amount: "100",
      };

      const result = await client.createOrder(order);

      expect(result).toEqual(response);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/create_order`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual(order);
    });
  });

  describe("createBulkOrders", () => {
    it("posts to the bulk-order endpoint", async () => {
      fetchMock.mockResolvedValue(
        mockResponse({ status: 200, message: "ok", data: [] }),
      );

      const client = new Steadfast(config);
      await client.createBulkOrders({ data: [] });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/create_order/bulk-order`);
      expect(init.method).toBe("POST");
    });
  });

  describe("GET endpoints", () => {
    type GetCase = [string, (client: Steadfast) => Promise<unknown>, string];

    const cases: GetCase[] = [
      [
        "statusByConsignmentId",
        (client) => client.statusByConsignmentId(123),
        "/status_by_cid/123",
      ],
      [
        "statusByInvoice",
        (client) => client.statusByInvoice("INV-1"),
        "/status_by_invoice/INV-1",
      ],
      [
        "statusByTrackingCode",
        (client) => client.statusByTrackingCode("TC-9"),
        "/status_by_trackingcode/TC-9",
      ],
      [
        "trackingsByInvoice",
        (client) => client.trackingsByInvoice("INV-1"),
        "/trackings_by_invoice/INV-1",
      ],
      ["getBalance", (client) => client.getBalance(), "/get_balance"],
      [
        "fraudCheck",
        (client) => client.fraudCheck("01700000000"),
        "/fraud_check/score/01700000000",
      ],
    ];

    it.each(cases)(
      "%s calls the correct endpoint with GET",
      async (_name, call, path) => {
        fetchMock.mockResolvedValue(mockResponse({ status: 200 }));

        const client = new Steadfast(config);
        await call(client);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${BASE_URL}${path}`);
        expect(init.method).toBe("GET");
      },
    );
  });

  describe("error handling", () => {
    it("throws with the status code when the response is not ok", async () => {
      fetchMock.mockResolvedValue(
        mockResponse("Unauthorized", { ok: false, status: 401 }),
      );

      const client = new Steadfast(config);

      await expect(client.getBalance()).rejects.toThrow(
        "Steadfast API error 401: Unauthorized",
      );
    });
  });
});
