# Sequence Diagram — GreenGrid

## Main Flow: End-to-End Energy Trade (Prosumer Sells → Consumer Buys → Settlement)

This sequence diagram illustrates the complete lifecycle of an energy trade — from a prosumer listing surplus energy, a consumer placing a buy order, the matching engine pairing them, through to settlement and notification.

---

```mermaid
sequenceDiagram
    actor P as Prosumer
    actor C as Consumer
    participant FE as Frontend (React)
    participant API as API Gateway
    participant Auth as Auth Service
    participant OS as Order Service
    participant ME as Matching Engine
    participant PS as Pricing Service
    participant TS as Trade Service
    participant SS as Settlement Service
    participant WS as Wallet Service
    participant NS as Notification Service
    participant DB as PostgreSQL
    participant Cache as Redis
    participant WSocket as WebSocket Server

    Note over P, WSocket: Phase 1 — Prosumer Creates Sell Order

    P ->> FE: Click "Sell Energy"
    FE ->> API: POST /api/orders/sell (qty, price, timeWindow, sourceType)
    API ->> Auth: Validate JWT Token
    Auth -->> API: Token Valid (userId, role: PROSUMER)
    API ->> OS: createSellOrder(orderDto)
    OS ->> OS: Validate order (Chain of Responsibility)
    Note right of OS: Validators: QuantityValidator →<br/>PriceValidator → TimeWindowValidator →<br/>GridZoneValidator → ComplianceValidator
    OS ->> PS: getCurrentMarketPrice(zoneId)
    PS ->> Cache: GET zone:{zoneId}:price
    Cache -->> PS: Current market price
    PS -->> OS: MarketPrice data
    OS ->> DB: INSERT INTO orders (type=SELL, status=ACTIVE)
    DB -->> OS: Order created (orderId)
    OS ->> Cache: UPDATE order book cache
    OS ->> ME: notifyNewOrder(sellOrder)
    OS -->> API: 201 Created (orderId)
    API -->> FE: Order confirmation
    FE -->> P: "Sell order placed successfully"
    OS ->> WSocket: Broadcast order book update
    WSocket -->> FE: Real-time order book refresh

    Note over P, WSocket: Phase 2 — Consumer Creates Buy Order & Matching

    C ->> FE: Click "Buy Energy"
    FE ->> API: POST /api/orders/buy (qty, maxPrice, zoneId)
    API ->> Auth: Validate JWT Token
    Auth -->> API: Token Valid (userId, role: CONSUMER)
    API ->> OS: createBuyOrder(orderDto)
    OS ->> OS: Validate order (Chain of Responsibility)
    OS ->> DB: INSERT INTO orders (type=BUY, status=ACTIVE)
    DB -->> OS: Order created (orderId)
    OS ->> ME: notifyNewOrder(buyOrder)
    OS -->> API: 201 Created (orderId)
    API -->> FE: Order confirmation
    FE -->> C: "Buy order placed successfully"

    Note over ME: Matching Engine (Strategy Pattern)<br/>Selects best algorithm:<br/>PriceTimePriority / ProximityFirst / GreenFirst

    ME ->> ME: findMatchingOrders(buyOrder)
    ME ->> Cache: GET active sell orders in zone
    Cache -->> ME: Matching sell orders
    ME ->> ME: Apply matching strategy
    ME ->> ME: Best match found!

    Note over P, WSocket: Phase 3 — Trade Execution

    ME ->> TS: executeTrade(buyOrder, sellOrder, matchedPrice)
    TS ->> DB: BEGIN TRANSACTION
    TS ->> DB: UPDATE orders SET status=MATCHED
    TS ->> DB: INSERT INTO trades (buyOrderId, sellOrderId, qty, price, status=PENDING)
    DB -->> TS: Trade created (tradeId)

    TS ->> WS: holdFunds(consumerId, amount)
    WS ->> DB: UPDATE wallets SET balance = balance - amount (escrow)
    WS -->> TS: Funds held in escrow

    TS ->> DB: COMMIT TRANSACTION
    TS -->> ME: Trade executed (tradeId)

    TS ->> WSocket: Emit trade update to both parties
    WSocket -->> FE: Trade notification (Prosumer)
    WSocket -->> FE: Trade notification (Consumer)
    FE -->> P: "Your energy matched with a buyer!"
    FE -->> C: "Energy source found! Trade pending delivery."

    Note over P, WSocket: Phase 4 — Energy Delivery Confirmation & Settlement

    Note over TS: After energy delivery window passes,<br/>smart meter data confirms delivery

    TS ->> TS: Simulate meter confirmation (delivery verified)
    TS ->> DB: UPDATE trades SET status=DELIVERED

    TS ->> SS: initiateSettlement(tradeId)
    SS ->> DB: SELECT trade details
    DB -->> SS: Trade data (qty, price, buyerId, sellerId)

    Note right of SS: Settlement Process (Template Method)<br/>1. Calculate amounts<br/>2. Apply platform fee<br/>3. Transfer funds<br/>4. Generate certificates<br/>5. Update carbon credits

    SS ->> SS: calculateSettlement(trade)
    SS ->> WS: releaseFunds(escrowId)
    WS ->> DB: UPDATE wallets — release escrow
    WS -->> SS: Escrow released

    SS ->> WS: creditSeller(sellerId, amount - fee)
    WS ->> DB: UPDATE wallets SET balance = balance + earnings
    WS -->> SS: Seller credited

    SS ->> WS: creditPlatformFee(feeAmount)
    WS -->> SS: Fee collected

    SS ->> DB: INSERT INTO settlements (tradeId, status=COMPLETED)
    SS ->> DB: INSERT INTO carbon_credits (prosumerId, kWh, certificate)
    DB -->> SS: Settlement & carbon credit recorded

    SS -->> TS: Settlement complete

    Note over P, WSocket: Phase 5 — Notifications & Updates

    TS ->> NS: sendTradeCompletionNotification(trade)
    NS ->> DB: INSERT INTO notifications (userId, type, message)
    NS ->> WSocket: Emit to prosumer
    NS ->> WSocket: Emit to consumer
    WSocket -->> FE: "Trade settled! Earnings credited."
    WSocket -->> FE: "Energy delivered! Payment processed."
    FE -->> P: Settlement confirmation + earnings summary
    FE -->> C: Delivery confirmation + payment receipt

    TS ->> PS: updateMarketPrice(zoneId, tradePrice)
    PS ->> Cache: UPDATE zone pricing
    PS ->> WSocket: Broadcast price update
```

---

## Flow Summary

| Phase | Description | Key Patterns Used |
|-------|-------------|-------------------|
| **1. Sell Order** | Prosumer lists surplus energy. Validated through a chain of validators, stored in DB, order book updated. | Chain of Responsibility, Observer |
| **2. Buy Order & Match** | Consumer places buy order. Matching engine selects the best pairing algorithm and finds a match. | Strategy Pattern |
| **3. Trade Execution** | Trade record created, consumer funds held in escrow. Both parties notified in real-time via WebSocket. | Command, Observer |
| **4. Settlement** | After delivery confirmation, settlement process runs: calculates amounts, transfers funds, generates green certificates. | Template Method |
| **5. Notifications** | Both parties receive real-time notifications. Market price updated for the zone. | Observer, Mediator |
