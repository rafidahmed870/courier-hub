import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Redx from "../src/providers/redx";

const BASE_URL = "https://openapi.redx.com.bd/v1.0.0-beta";
const config = { api_token: "test-token" };

const createParcelRequest = {
  customer_name: "Rafid",
  customer_phone: "01700000000",
  delivery_area: "Mohammadpur(Dhaka)",
  delivery_area_id: 1,
  customer_address: "House 1, Road 2",
  cash_collection_amount: "100",
  parcel_weight: "500",
  value: "1000",
};

const updateParcelRequest = {
  entity_type: "parcel-tracking-id",
  entity_id: "TRACK-1",
  update_details: {
    property_name: "status",
    new_value: "cancelled",
    reason: "Customer request",
  },
};

const createPickupStoreRequest = {
  name: "Main Store",
  phone: "8801898000999",
  address: "Test Address",
  area_id: 1,
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

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Redx", () => {
  describe("constructor", () => {
    it("uses the production base url by default", async () => {
      fetchMock.mockResolvedValue(mockResponse({ tracking: [] }));

      const client = new Redx(config);
      await client.trackParcel("TRACK-1");

      expect(fetchMock.mock.calls[0][0]).toBe(
        `${BASE_URL}/parcel/track/TRACK-1`,
      );
    });

    it("uses a custom base_url when provided", async () => {
      fetchMock.mockResolvedValue(mockResponse({ tracking: [] }));

      const client = new Redx({
        ...config,
        base_url: "https://example.test/api",
      });
      await client.trackParcel("TRACK-1");

      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://example.test/api/parcel/track/TRACK-1",
      );
    });
  });

  describe("headers", () => {
    it("sends the api access token", async () => {
      fetchMock.mockResolvedValue(mockResponse({ areas: [] }));

      const client = new Redx(config);
      await client.getAreas();

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).toEqual({ "API-ACCESS-TOKEN": "test-token" });
    });

    it("adds the json content type on write requests", async () => {
      fetchMock.mockResolvedValue(mockResponse({ tracking_id: "T1" }));

      const client = new Redx(config);
      await client.createParcel(createParcelRequest);

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).toEqual({
        "API-ACCESS-TOKEN": "test-token",
        "Content-Type": "application/json",
      });
    });
  });

  describe("GET endpoints", () => {
    type Case = [string, (client: Redx) => Promise<unknown>, string];

    const cases: Case[] = [
      [
        "trackParcel",
        (client) => client.trackParcel("TRACK-1"),
        "/parcel/track/TRACK-1",
      ],
      [
        "parcelInfo",
        (client) => client.parcelInfo("TRACK-1"),
        "/parcel/info/TRACK-1",
      ],
      ["getAreas", (client) => client.getAreas(), "/areas"],
      [
        "getAreasByPostCode",
        (client) => client.getAreasByPostCode(1206),
        "/areas?post_code=1206",
      ],
      [
        "getAreasByDistrict",
        (client) => client.getAreasByDistrict("Dhaka"),
        "/areas?district_name=Dhaka",
      ],
      [
        "getPickupStores",
        (client) => client.getPickupStores(),
        "/pickup/stores",
      ],
      [
        "pickupStoreDetails",
        (client) => client.pickupStoreDetails(7),
        "/pickup/store/info/7",
      ],
      [
        "calculateCharge",
        (client) =>
          client.calculateCharge({
            delivery_area_id: 1,
            pickup_area_id: 2,
            cash_collection_amount: 100,
            weight: 500,
          }),
        "/charge/charge_calculator?delivery_area_id=1&pickup_area_id=2&cash_collection_amount=100&weight=500",
      ],
    ];

    it.each(cases)(
      "%s calls the correct endpoint with GET",
      async (_name, call, path) => {
        fetchMock.mockResolvedValue(mockResponse({}));

        const client = new Redx(config);
        await call(client);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe(`${BASE_URL}${path}`);
        // No method set means the fetch default of GET is used.
        expect(init.method).toBeUndefined();
      },
    );
  });

  describe("createParcel", () => {
    it("posts the payload and returns the parsed response", async () => {
      const response = { tracking_id: "20A312THJDJ8" };
      fetchMock.mockResolvedValue(mockResponse(response));

      const client = new Redx(config);
      const result = await client.createParcel(createParcelRequest);

      expect(result).toEqual(response);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/parcel`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual(createParcelRequest);
    });

    it("forwards optional fields such as parcel details", async () => {
      fetchMock.mockResolvedValue(mockResponse({ tracking_id: "T1" }));

      const payload = {
        ...createParcelRequest,
        merchant_invoice_id: "INV-1",
        is_closed_box: true,
        parcel_details_json: [
          { name: "Book", category: "Stationery", value: 250 },
        ],
      };

      const client = new Redx(config);
      await client.createParcel(payload);

      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init.body)).toEqual(payload);
    });
  });

  describe("updateParcel", () => {
    it("patches the payload to the parcels endpoint", async () => {
      const response = { success: true, message: "Request Accepted" };
      fetchMock.mockResolvedValue(mockResponse(response));

      const client = new Redx(config);
      const result = await client.updateParcel(updateParcelRequest);

      expect(result).toEqual(response);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/parcels`);
      expect(init.method).toBe("PATCH");
      expect(JSON.parse(init.body)).toEqual(updateParcelRequest);
    });
  });

  describe("createPickupStore", () => {
    it("posts the payload to the pickup store endpoint", async () => {
      const response = {
        id: 1,
        name: "Main Store",
        address: "Test Address",
        area_name: "Mohammadpur(Dhaka)",
        area_id: 1,
        phone: "8801898000999",
      };
      fetchMock.mockResolvedValue(mockResponse(response));

      const client = new Redx(config);
      const result = await client.createPickupStore(createPickupStoreRequest);

      expect(result).toEqual(response);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/pickup/store`);
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body)).toEqual(createPickupStoreRequest);
    });
  });

  describe("query encoding", () => {
    it("encodes district names with spaces and special characters", async () => {
      fetchMock.mockResolvedValue(mockResponse({ areas: [] }));

      const client = new Redx(config);
      await client.getAreasByDistrict("Cox's Bazar");

      expect(fetchMock.mock.calls[0][0]).toBe(
        `${BASE_URL}/areas?district_name=Cox%27s+Bazar`,
      );
    });

    it("sends the post code as a string query value", async () => {
      fetchMock.mockResolvedValue(mockResponse({ areas: [] }));

      const client = new Redx(config);
      await client.getAreasByPostCode(1207);

      const [url] = fetchMock.mock.calls[0];
      const query = new URL(url).searchParams;
      expect(query.get("post_code")).toBe("1207");
    });
  });

  describe("response parsing", () => {
    it("returns the parsed json body", async () => {
      const response = {
        tracking: [
          { message_en: "In transit", message_bn: "পথে", time: "2024-01-01" },
        ],
      };
      fetchMock.mockResolvedValue(mockResponse(response));

      const client = new Redx(config);
      await expect(client.trackParcel("TRACK-1")).resolves.toEqual(response);
    });

    it("returns every area from the areas response", async () => {
      const response = {
        areas: [
          {
            id: 1,
            name: "Mohammadpur(Dhaka)",
            post_code: 1207,
            division_name: "Dhaka",
            zone_id: 1,
          },
        ],
      };
      fetchMock.mockResolvedValue(mockResponse(response));

      const client = new Redx(config);
      const result = await client.getAreas();

      expect(result.areas).toHaveLength(1);
      expect(result.areas[0].name).toBe("Mohammadpur(Dhaka)");
    });
  });

  describe("error handling", () => {
    it("throws with the status code and response body", async () => {
      fetchMock.mockResolvedValue(
        mockResponse("Unauthorized", { ok: false, status: 401 }),
      );

      const client = new Redx(config);

      await expect(client.getAreas()).rejects.toThrow(
        "Redx API error 401: Unauthorized",
      );
    });

    it("throws using the raw text body for failed writes", async () => {
      fetchMock.mockResolvedValue(
        mockResponse('{"message":"invalid"}', { ok: false, status: 422 }),
      );

      const client = new Redx(config);

      await expect(client.createParcel(createParcelRequest)).rejects.toThrow(
        'Redx API error 422: {"message":"invalid"}',
      );
    });
  });
});
