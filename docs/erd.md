# Database Entity Relationship Diagrams (ERD)

This document contains Mermaid diagrams for all PostgreSQL database schemas in NexaCommerce.

## 1. Auth Schema (`auth` namespace)

```mermaid
erDiagram
    User ||--o{ RefreshToken : has
    User ||--o{ PasswordResetToken : has
    User ||--o{ EmailVerificationToken : has
    User ||--o{ LoginHistory : has
    
    User {
        uuid id PK
        string name
        string email UK
        string passwordHash
        string role "ADMIN | SELLER | CUSTOMER | COURIER"
        string status "ACTIVE | INACTIVE | SUSPENDED"
        boolean emailVerified
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }
    
    RefreshToken {
        uuid id PK
        string token UK
        uuid userId FK
        datetime expiresAt
        boolean isRevoked
        datetime createdAt
        datetime revokedAt
    }
    
    PasswordResetToken {
        uuid id PK
        string token UK
        uuid userId FK
        datetime expiresAt
        boolean isUsed
        datetime createdAt
    }
    
    EmailVerificationToken {
        uuid id PK
        string token UK
        uuid userId FK
        datetime expiresAt
        boolean isUsed
        datetime createdAt
    }
    
    LoginHistory {
        uuid id PK
        uuid userId FK
        string ipAddress
        string userAgent
        datetime loginAt
    }
```

---

## 2. Users Schema (`users` namespace)

```mermaid
erDiagram
    UserProfile {
        uuid id PK
        uuid userId UK
        string displayName
        string phone
        string avatar
        string gender
        datetime dateOfBirth
        datetime createdAt
        datetime updatedAt
    }
    
    SellerProfile {
        uuid id PK
        uuid userId UK
        string storeName
        string storeDescription
        string storeLogo
        string storeBanner
        string storeAddress
        boolean isVerified
        datetime verifiedAt
        datetime createdAt
        datetime updatedAt
    }
    
    Address {
        uuid id PK
        uuid userId FK
        string label "Home | Office | etc"
        string recipientName
        string phone
        string street
        string city
        string province
        string postalCode
        boolean isDefault
        datetime createdAt
        datetime updatedAt
    }
```

---

## 3. Products Schema (`products` namespace)

```mermaid
erDiagram
    Category ||--o{ Product : classifies
    Brand ||--o{ Product : manufactures
    Product ||--o{ ProductImage : contains
    
    Category {
        uuid id PK
        string name
        string slug UK
        datetime createdAt
        datetime updatedAt
    }
    
    Brand {
        uuid id PK
        string name UK
        string slug UK
        string logo
        datetime createdAt
        datetime updatedAt
    }
    
    ProductImage {
        uuid id PK
        uuid productId FK
        string url
        string alt
        integer sortOrder
        boolean isMain
        datetime createdAt
    }
    
    Product {
        uuid id PK
        string name
        string slug UK
        string description
        decimal price
        integer stock
        string status "DRAFT | ACTIVE | INACTIVE | ARCHIVED | REJECTED"
        uuid categoryId FK
        uuid brandId FK
        string sku
        integer weight
        decimal minPrice
        decimal maxPrice
        decimal rating
        integer totalReviews
        integer totalSold
        uuid sellerId
        datetime createdAt
        datetime updatedAt
    }
```

---

## 4. Inventory Schema (`inventory` namespace)

```mermaid
erDiagram
    Inventory ||--o{ StockMovement : has
    Inventory ||--o{ StockReservation : has
    
    Inventory {
        uuid id PK
        uuid productId UK
        string sku
        integer currentStock
        integer reservedStock
        integer availableStock
        integer lowStockThreshold
        string warehouseId
        datetime createdAt
        datetime updatedAt
    }
    
    StockMovement {
        uuid id PK
        uuid inventoryId FK
        string type "IN | OUT | ADJUSTMENT | RESERVE | CONFIRM | RELEASE"
        integer quantity
        string referenceType "ORDER | MANUAL | SYSTEM"
        string referenceId
        string note
        string createdBy
        datetime createdAt
    }
    
    StockReservation {
        uuid id PK
        uuid inventoryId FK
        uuid orderId
        integer quantity
        string status "RESERVED | CONFIRMED | RELEASED | EXPIRED"
        datetime expiresAt
        datetime confirmedAt
        datetime releasedAt
        datetime createdAt
    }
```

---

## 5. Orders Schema (`orders` namespace)

```mermaid
erDiagram
    Order ||--o{ OrderItem : has
    Order ||--o{ OrderStatusHistory : tracks
    
    Order {
        uuid id PK
        uuid userId
        string orderNumber UK
        string status "PENDING_PAYMENT | PAID | PROCESSING | SHIPPED | DELIVERED | COMPLETED | CANCELLED"
        decimal totalOriginalItemsPrice
        decimal totalDiscount
        decimal totalShippingCost
        decimal grandTotal
        string voucherCode
        string note
        string shippingRecipientName
        string shippingPhone
        string shippingStreet
        string shippingCity
        string shippingProvince
        string shippingPostalCode
        string shippingCourierCode
        string shippingCourierName
        string shippingServiceCode
        string shippingServiceName
        datetime paymentDeadline
        datetime paidAt
        datetime shippedAt
        datetime deliveredAt
        datetime completedAt
        datetime cancelledAt
        datetime createdAt
        datetime updatedAt
    }
    
    OrderItem {
        uuid id PK
        uuid orderId FK
        uuid productId
        string productName
        string productSku
        string productImage
        decimal originalPrice
        decimal discountAmount
        decimal finalPrice
        integer quantity
        integer weight
        uuid sellerId
        datetime createdAt
        datetime updatedAt
    }
    
    OrderStatusHistory {
        uuid id PK
        uuid orderId FK
        string fromStatus
        string toStatus
        string note
        string updatedBy
        datetime createdAt
    }
```

---

## 6. Payments Schema (`payments` namespace)

```mermaid
erDiagram
    Payment ||--o{ PaymentRefund : triggers
    
    Payment {
        uuid id PK
        uuid orderId UK
        string transactionNumber UK
        decimal amount
        string paymentMethod "QRIS | BANK_TRANSFER | etc"
        string status "PENDING | SUCCESS | FAILED | EXPIRED | REFUNDED"
        string referenceId
        string snapToken
        string redirectUrl
        string failureReason
        datetime paidAt
        datetime createdAt
        datetime updatedAt
    }
    
    PaymentRefund {
        uuid id PK
        uuid paymentId FK
        string refundNumber UK
        decimal amount
        string reason
        string status "PENDING | SUCCESS | FAILED"
        string referenceId
        datetime processedAt
        datetime createdAt
        datetime updatedAt
    }
```

---

## 7. Vouchers Schema (`vouchers` namespace)

```mermaid
erDiagram
    Voucher ||--o{ VoucherUsage : registers
    
    Voucher {
        uuid id PK
        string code UK
        string type "PERCENTAGE | FIXED_AMOUNT"
        decimal value
        decimal minPurchase
        decimal maxDiscount
        integer usageLimit
        integer usageLimitPerUser
        integer usedCount
        string scope "ALL | CATEGORY | SELLER"
        string scopeReferenceId
        datetime startsAt
        datetime endsAt
        string status "ACTIVE | INACTIVE | EXPIRED"
        string createdBy
        datetime createdAt
        datetime updatedAt
    }
    
    VoucherUsage {
        uuid id PK
        uuid voucherId FK
        uuid userId
        uuid orderId
        decimal discountAmount
        datetime usedAt
    }
```

---

## 8. Shipping Schema (`shipping` namespace)

```mermaid
erDiagram
    Courier ||--o{ ShippingRate : provides
    Courier ||--o{ ShippingOrder : schedules
    ShippingOrder ||--o{ ShippingStatusHistory : tracks
    
    Courier {
        uuid id PK
        string name
        string code UK
        string services
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    ShippingRate {
        uuid id PK
        uuid courierId FK
        string originCity
        string destinationCity
        string serviceCode
        decimal cost
        integer estimatedDays
        datetime createdAt
        datetime updatedAt
    }
    
    ShippingOrder {
        uuid id PK
        uuid orderId UK
        uuid courierId FK
        string courierName
        string serviceCode
        string serviceName
        string trackingNumber UK
        string originAddress
        string destinationAddress
        integer weight
        decimal cost
        string status "WAITING_PICKUP | PICKED_UP | IN_TRANSIT | DELIVERED"
        datetime shippedAt
        datetime deliveredAt
        datetime createdAt
        datetime updatedAt
    }
    
    ShippingStatusHistory {
        uuid id PK
        uuid shippingOrderId FK
        string fromStatus
        string toStatus
        string location
        string note
        string updatedBy
        datetime createdAt
    }
```

---

## 9. Reviews Schema (`reviews` namespace)

```mermaid
erDiagram
    Review ||--o{ ReviewImage : has
    Review ||--o{ ReviewReport : logs
    
    Review {
        uuid id PK
        uuid productId
        uuid customerId
        string customerName
        uuid orderId
        uuid orderItemId UK
        integer rating
        string title
        string content
        boolean isVerifiedPurchase
        boolean isVisible
        boolean isEdited
        string moderationStatus "APPROVED | HIDDEN"
        datetime createdAt
        datetime updatedAt
    }
    
    ReviewImage {
        uuid id PK
        uuid reviewId FK
        string url
        integer sortOrder
        datetime createdAt
    }
    
    ReviewReport {
        uuid id PK
        uuid reviewId FK
        uuid reportedBy
        string reason
        string description
        string status "PENDING | REVIEWED | IGNORED"
        uuid reviewedBy
        datetime reviewedAt
        datetime createdAt
    }
    
    ProductRatingSummary {
        uuid id PK
        uuid productId UK
        decimal averageRating
        integer totalReviews
        integer rating5Count
        integer rating4Count
        integer rating3Count
        integer rating2Count
        integer rating1Count
        datetime updatedAt
    }
```

---

## 10. Notifications Schema (`notifications` namespace)

```mermaid
erDiagram
    Notification ||--o{ EmailLog : sends
    
    Notification {
        uuid id PK
        uuid userId
        string type "ORDER_CREATED | PAYMENT_SUCCESS | PAYMENT_FAILED | ORDER_SHIPPED | ORDER_DELIVERED | LOW_STOCK | WELCOME"
        string title
        string message
        json data
        string channel "IN_APP | EMAIL | BOTH"
        boolean isRead
        datetime readAt
        datetime createdAt
    }
    
    EmailLog {
        uuid id PK
        uuid notificationId FK
        string to
        string subject
        string templateName
        json templateData
        string status "SENT | FAILED"
        datetime sentAt
        datetime failedAt
        string error
        integer retryCount
        datetime createdAt
    }
    
    EmailTemplate {
        uuid id PK
        string name UK
        string subject
        string htmlBody
        string textBody
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
```

---

## 11. Analytics Schema (`analytics` namespace)

```mermaid
erDiagram
    DailySalesReport {
        uuid id PK
        datetime date UK
        integer totalOrders
        integer totalCompletedOrders
        integer totalCancelledOrders
        decimal totalRevenue
        integer totalItemsSold
        decimal averageOrderValue
        datetime createdAt
        datetime updatedAt
    }
    
    MonthlySalesReport {
        uuid id PK
        integer year
        integer month
        integer totalOrders
        integer totalCompletedOrders
        integer totalCancelledOrders
        decimal totalRevenue
        integer totalItemsSold
        decimal averageOrderValue
        integer newCustomers
        integer newSellers
        datetime createdAt
        datetime updatedAt
    }
    
    ProductSalesReport {
        uuid id PK
        uuid productId
        string productName
        uuid sellerId
        string sellerName
        uuid categoryId
        string categoryName
        integer totalUnitsSold
        decimal totalRevenue
        integer totalOrders
        float averageRating
        string periodType "DAILY | MONTHLY | ALL_TIME"
        datetime periodDate
        datetime createdAt
        datetime updatedAt
    }
    
    SellerPerformanceReport {
        uuid id PK
        uuid sellerId
        string sellerName
        integer totalProducts
        integer totalOrders
        decimal totalRevenue
        integer totalItemsSold
        integer totalCancelled
        float averageRating
        integer totalReviews
        float cancellationRate
        string periodType "MONTHLY | ALL_TIME"
        datetime periodDate
        datetime createdAt
        datetime updatedAt
    }
    
    PaymentReport {
        uuid id PK
        datetime date UK
        integer totalTransactions
        integer successCount
        integer failedCount
        integer expiredCount
        float successRate
        decimal totalAmount
        decimal averageAmount
        datetime createdAt
        datetime updatedAt
    }
    
    CategoryPerformanceReport {
        uuid id PK
        uuid categoryId
        string categoryName
        integer totalProducts
        integer totalOrders
        decimal totalRevenue
        integer totalUnitsSold
        string periodType "MONTHLY | ALL_TIME"
        datetime periodDate
        datetime createdAt
        datetime updatedAt
    }
    
    AnalyticsEvent {
        uuid id PK
        string eventName
        json eventData
        datetime processedAt
        boolean isProcessed
        datetime createdAt
    }
```
