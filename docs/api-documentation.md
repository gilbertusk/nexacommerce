# API Documentation Reference

This document summarizes the core API endpoints of the NexaCommerce platform, base paths, and authorization matrices.

## 1. Swagger UI Access

When running NexaCommerce locally, the aggregated API documentation is served at:
- **Base URL:** `http://localhost:3000/api/docs`
- **Spec JSON:** `http://localhost:3000/api/docs/spec.json`

---

## 2. Microservice Base Paths Summary

| Service | Base Path (Gateway) | Internal Port | Description |
|---|---|---|---|
| Auth Service | `/api/v1/auth` | 3001 | Registration, Login, Token Refresh, Password Resets |
| User Service | `/api/v1/users` | 3002 | Customer Profile, Seller Profile, Address Book |
| Product Service | `/api/v1/products` | 3003 | Catalog, Categories, Brands, Stock and Rating Synced |
| Cart Service | `/api/v1/cart` | 3004 | Redis Shopping Cart management |
| Order Service | `/api/v1/orders` | 3005 | Checkout Orchestrator, Order Tracking, Auto-complete |
| Payment Service | `/api/v1/payments` | 3006 | Midtrans Token Creation & Webhook Receiver |
| Inventory Service | `/api/v1/inventory` | 3007 | Stock level modifications, Reserves, Movements |
| Voucher Service | `/api/v1/vouchers` | 3008 | Discounts creation and validation |
| Shipping Service | `/api/v1/shipping` | 3009 | Couriers listing, Rate Calculator, Tracking |
| Review Service | `/api/v1/reviews` | 3010 | Product Reviews, Moderation, Recalculations |
| Notification Service | `/api/v1/notifications` | 3011 | Bell alerts, Email dispatch logs |
| Analytics Service | `/api/v1/analytics` | 3012 | Reports, Performance matrices |

---

## 3. Core API Endpoint Definitions

### 3.1 Authentication & Registration (`/api/v1/auth`)

* **POST `/register`** - Registers a new user account.
  * *Auth:* None
  * *Payload:*
    ```json
    {
      "name": "Customer Name",
      "email": "customer1@nexacommerce.com",
      "password": "Customer123!"
    }
    ```
  * *Response (201):*
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": { "id": "uuid-xxx-yyy", "name": "Customer Name", "email": "customer1@nexacommerce.com" }
    }
    ```

* **POST `/login`** - Authenticates credentials, generates JWT access token, and sets secure refresh token cookie.
  * *Auth:* None
  * *Payload:*
    ```json
    {
      "email": "customer1@nexacommerce.com",
      "password": "Customer123!"
    }
    ```
  * *Response (200):*
    ```json
    {
      "success": true,
      "data": { "token": "eyJhbGciOi..." }
    }
    ```

### 3.2 Product Catalog (`/api/v1/products`)

* **GET `/`** - Searches and filters products. Supports sort, limit, page, minPrice, maxPrice, search, brand, category.
  * *Auth:* None
  * *Response (200):*
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "prod-uuid",
          "name": "Nike Air Force 1 Low",
          "price": 1549000.00,
          "rating": 4.8,
          "stock": 50
        }
      ],
      "meta": { "page": 1, "limit": 10, "total": 1 }
    }
    ```

### 3.3 Shopping Cart (`/api/v1/cart`)

* **POST `/`** - Adds or updates items in the cart (validates product price & available stock).
  * *Auth:* Authenticated
  * *Payload:*
    ```json
    {
      "productId": "prod-uuid",
      "quantity": 2
    }
    ```

### 3.4 Checkout & Orders (`/api/v1/orders`)

* **POST `/checkout`** - Orchestrates order creation and reserves stock.
  * *Auth:* Authenticated (Customer role)
  * *Payload:*
    ```json
    {
      "addressId": "address-uuid",
      "courierCode": "jne",
      "serviceCode": "REG",
      "voucherCode": "WELCOME10"
    }
    ```
  * *Response (201):*
    ```json
    {
      "success": true,
      "data": {
        "order": {
          "id": "order-uuid",
          "orderNumber": "NXC-ORD-20260620-XXXX",
          "grandTotal": 1949000.00
        },
        "payment": {
          "snapToken": "midtrans-snap-token-here",
          "redirectUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/token"
        }
      }
    }
    ```

### 3.5 Payment Webhook (`/api/v1/payments`)

* **POST `/webhook`** - Midtrans notification callback receiver.
  * *Auth:* Signature key validation
  * *Payload:*
    ```json
    {
      "order_id": "ORDER-UUID-XXXX",
      "status_code": "200",
      "gross_amount": "1949000.00",
      "transaction_status": "settlement",
      "signature_key": "sha512-signature-generated-key"
    }
    ```
  * *Response (200):*
    ```json
    { "status": "processed" }
    ```
