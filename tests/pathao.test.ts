import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Pathao from "../src/providers/pathao";

const BASE_URL = "https://api-hermes.pathao.com";
const TOKEN_URL = `${BASE_URL}/aladdin/api/v1/issue-token`;
const config = {
  client_id: "cid",
  client_secret: "csecret",
  username: "user",
  password: "pass",
  store_id: 42,
};

const tokenResponse = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 3600,
  token_type: "Bearer",
};

const orderRequest = {
  merchant_order_id: "INV-1",
  recipient_name: "Rafid",
  recipient_phone: "01700000000",
  recipient_address: "Dhaka",
  recipient_city: 1,
  recipient_zone: 2,
  recipient_area: 3,
  delivery_type: 48,
  item_type: 2,
  item_quantity: 1,
  item_weight: 0.5,
  amount_to_collect: 100,
  item_description: "Book",
};

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

/** First call issues a token, second call returns the endpoint response. */
function mockTokenThen(body: unknown) {
  fetchMock
    .mockResolvedValueOnce(mockResponse(tokenResponse))
    .mockResolvedValueOnce(mockResponse(body));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Pathao", () => {
  describe("constructor", () => {
    it("uses the production base url by default", async () => {
      mockTokenThen({ status: 200 });

      const client = new Pathao(config);
      await client.getCities();

      expect(fetchMock.mock.calls[1][0]).toBe(
        `${BASE_URL}/aladdin/api/v1/city-list`,
      );
    });

    it("uses a custom base_url when provided", async () => {
      fetchMock
        .mockResolvedValueOnce(mockResponse(tokenResponse))
        .mockResolvedValueOnce(mockResponse({ status: 200 }));

      const client = new Pathao({
        ...config,
        base_url: "https://example.test",
      });
      await client.getCities();

      expect(fetchMock.mock.calls[1][0]).toBe(
        "https://example.test/aladdin/api/v1/city-list",
      );
    });
  });

  describe("authentication", () => {
    it("logs in with the password grant", async () => {
      mockTokenThen({ status: 200 });

      const client = new Pathao(config);
      await client.getCities();

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(TOKEN_URL);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual({
        client_id: "cid",
        client_secret: "csecret",
        grant_type: "password",
        username: "user",
        password: "pass",
      });
    });

    it("sends the bearer token on API requests", async () => {
      mockTokenThen({ status: 200 });

      const client = new Pathao(config);
      await client.getCities();

      const [, init] = fetchMock.mock.calls[1];
      expect(init.headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
      });
    });

    it("caches the token across requests", async () => {
      mockTokenThen({ status: 200 });
      fetchMock.mockResolvedValue(mockResponse({ status: 200 }));

      const client = new Pathao(config);
      await client.getCities();
      await client.getZones(1);

      const tokenCalls = fetchMock.mock.calls.filter(
        ([url]) => url === TOKEN_URL,
      );
      expect(tokenCalls).toHaveLength(1);
    });
  });

  describe("token refresh", () => {
    const shortLived = { ...tokenResponse, expires_in: 30 };

    it("refreshes an expired token with the refresh token", async () => {
      fetchMock
        .mockResolvedValueOnce(mockResponse(shortLived))
        .mockResolvedValueOnce(mockResponse({ status: 200 }))
        .mockResolvedValueOnce(mockResponse(tokenResponse))
        .mockResolvedValueOnce(mockResponse({ status: 200 }));

      const client = new Pathao(config);
      await client.getCities();
      await client.getCities();

      const [url, init] = fetchMock.mock.calls[2];
      expect(url).toBe(TOKEN_URL);
      expect(JSON.parse(init.body)).toEqual({
        client_id: "cid",
        client_secret: "csecret",
        grant_type: "refresh_token",
        refresh_token: "refresh-token",
      });
    });

    it("falls back to the password grant when the refresh fails", async () => {
      fetchMock
        .mockResolvedValueOnce(mockResponse(shortLived))
        .mockResolvedValueOnce(mockResponse({ status: 200 }))
        .mockResolvedValueOnce(
          mockResponse({ error: "expired" }, { ok: false, status: 401 }),
        )
        .mockResolvedValueOnce(mockResponse(tokenResponse))
        .mockResolvedValueOnce(mockResponse({ status: 200 }));

      const client = new Pathao(config);
      await client.getCities();
      await client.getCities();

      const [url, init] = fetchMock.mock.calls[3];
      expect(url).toBe(TOKEN_URL);
      expect(JSON.parse(init.body)).toEqual({
        client_id: "cid",
        client_secret: "csecret",
        grant_type: "password",
        username: "user",
        password: "pass",
      });
    });
  });

  describe("endpoints", () => {
    type Case = [string, (client: Pathao) => Promise<unknown>, string, string];

    const cases: Case[] = [
      [
        "getCities",
        (client) => client.getCities(),
        "GET",
        "/aladdin/api/v1/city-list",
      ],
      [
        "getZones",
        (client) => client.getZones(3),
        "GET",
        "/aladdin/api/v1/zones?city_id=3",
      ],
      [
        "getAreas",
        (client) => client.getAreas(5),
        "GET",
        "/aladdin/api/v1/areas?zone_id=5",
      ],
      [
        "getOrderInfo",
        (client) => client.getOrderInfo("ord-1"),
        "GET",
        "/aladdin/api/v1/orders/ord-1/info",
      ],
      [
        "calculatePrice",
        (client) => client.calculatePrice(2, 12),
        "POST",
        "/aladdin/api/v1/merchant/price-plan",
      ],
      [
        "createOrder",
        (client) => client.createOrder(orderRequest),
        "POST",
        "/aladdin/api/v1/orders",
      ],
      [
        "createBulkOrder",
        (client) => client.createBulkOrder([orderRequest]),
        "POST",
        "/aladdin/api/v1/orders/bulk",
      ],
      [
        "cancelOrder",
        (client) => client.cancelOrder("ord-1"),
        "POST",
        "/aladdin/api/v1/orders/ord-1/cancel",
      ],
    ];

    it.each(cases)(
      "%s calls the correct endpoint",
      async (_name, call, method, path) => {
        mockTokenThen({ status: 200 });

        const client = new Pathao(config);
        await call(client);

        const [url, init] = fetchMock.mock.calls[1];
        expect(url).toBe(`${BASE_URL}${path}`);
        expect(init.method).toBe(method);
      },
    );
  });

  describe("createOrder", () => {
    it("adds the store id and forwards the order payload", async () => {
      mockTokenThen({ status: 200, data: {} });

      const client = new Pathao(config);
      await client.createOrder(orderRequest);

      const [, init] = fetchMock.mock.calls[1];
      expect(JSON.parse(init.body)).toEqual({
        store_id: 42,
        ...orderRequest,
      });
    });
  });

  describe("createBulkOrder", () => {
    it("maps every order and adds the store id", async () => {
      mockTokenThen({ status: 200, data: [] });

      const client = new Pathao(config);
      await client.createBulkOrder([orderRequest, orderRequest]);

      const [, init] = fetchMock.mock.calls[1];
      expect(JSON.parse(init.body)).toEqual([
        { store_id: 42, ...orderRequest },
        { store_id: 42, ...orderRequest },
      ]);
    });
  });

  describe("calculatePrice", () => {
    it("posts the weight and delivery type", async () => {
      mockTokenThen({ status: 200 });

      const client = new Pathao(config);
      await client.calculatePrice(1.5, 12);

      const [, init] = fetchMock.mock.calls[1];
      expect(JSON.parse(init.body)).toEqual({
        delivery_type: 12,
        item_weight: 1.5,
      });
    });

    it("defaults delivery_type to 48", async () => {
      mockTokenThen({ status: 200 });

      const client = new Pathao(config);
      await client.calculatePrice(1.5);

      const [, init] = fetchMock.mock.calls[1];
      expect(JSON.parse(init.body)).toEqual({
        delivery_type: 48,
        item_weight: 1.5,
      });
    });
  });

  describe("error handling", () => {
    it("throws with the status code and response body", async () => {
      fetchMock
        .mockResolvedValueOnce(mockResponse(tokenResponse))
        .mockResolvedValueOnce(
          mockResponse({ error: "Unauthorized" }, { ok: false, status: 401 }),
        );

      const client = new Pathao(config);

      await expect(client.getCities()).rejects.toThrow(
        'Pathao API Error 401: {"error":"Unauthorized"}',
      );
    });
  });
});
