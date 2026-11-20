# courier-hub

One SDK for every courier in Bangladesh.

`courier-hub` gives you a single, type-safe API for creating orders, tracking parcels, and cancelling shipments — across Pathao, Steadfast, RedX, and more. Write it once. Ship everywhere.

<img width="1983" height="793" alt="courier-hub" src="https://github.com/user-attachments/assets/3a065ec3-16ad-4f80-b2ab-17f3d8013e9a" />

<div align="center">
  <a href="https://www.npmjs.com/package/courier-hub"><img src="https://img.shields.io/npm/v/courier-hub.svg" alt="npm version" /></a> <a href="https://www.npmjs.com/package/courier-hub"><img src="https://img.shields.io/npm/dm/courier-hub.svg" alt="npm downloads" /></a>  <a href="https://github.com/rafidahmed870/courier-hub/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/courier-hub.svg" alt="license" /></a> <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/courier-hub.svg" alt="node version" /></a>
</div>

## Install

```bash
npm install courier-hub
```

## Quick start

Create one client and configure the providers you need:

```ts
import { CourierHub } from "courier-hub";

const hub = new CourierHub({
  steadfast: { api_key: "your-api-key", secret_key: "your-secret-key" },
  pathao: {
    client_id: "your-client-id",
    client_secret: "your-client-secret",
    username: "your-username",
    password: "your-password",
    store_id: 12345,
  },
});

const order = await hub.Steadfast.createOrder({
  invoice: "INV-1001",
  recipient_name: "Rafid Ahmed",
  recipient_phone: "01700000000",
  recipient_address: "Mirpur, Dhaka",
  cod_amount: "1200",
});

console.log(order.consignment.tracking_code);
```

Only the providers you configure are available. Calling an unconfigured one throws a clear error.

## Single provider

Don't need the hub? Import a provider on its own:

```ts
import { Steadfast } from "courier-hub/providers";

const steadfast = new Steadfast({
  api_key: "your-api-key",
  secret_key: "your-secret-key",
});

await steadfast.getBalance();
```

```ts
import { Pathao } from "courier-hub/providers";

const pathao = new Pathao({
  client_id: "your-client-id",
  client_secret: "your-client-secret",
  username: "your-username",
  password: "your-password",
  store_id: 12345,
});

const cities = await pathao.getCities();

await pathao.createOrder({
  merchant_order_id: "INV-1001",
  recipient_name: "Rafid Ahmed",
  recipient_phone: "01700000000",
  recipient_address: "Mirpur, Dhaka",
  recipient_city: 1,
  recipient_zone: 2,
  delivery_type: 48,
  item_type: 2,
  item_quantity: 1,
  item_weight: 0.5,
  amount_to_collect: 1200,
});
```

## License

This project is licensed under the [MIT License.](./LICENSE)
