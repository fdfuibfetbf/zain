# Roadmap: Full WHMCS Direct Integration (No Local Database)

This roadmap outlines the complete migration of the backend to treat **WHMCS API** as the primary and only data source, removing the Prisma/PostgreSQL dependency entirely.

## Phase 1: Infrastructure & Foundation (Current)
- [x] **Universal Type Definitions**: Created `whmcs/types.ts` to map all WHMCS entities (Clients, Invoices, Tickets, etc.).
- [x] **Massive API Client**: Created `WhmcsApiClient.ts` covering 100+ endpoints across all categories (Orders, Billing, Support, etc.).
- [x] **API Client Factory**: Initialized `whmcsClientFactory.ts` for unified instantiation.

## Phase 2: Stateless Authentication (Identity Model)
- [ ] **Direct Login**: Refactor `AuthService.ts` to use WHMCS `ValidateLogin`.
- [ ] **Stateless JWT**: Remove `AuthSession` and `RefreshToken` database tables. Encrypt all session data in the JWT.
- [ ] **Role Mapping**: Fetch user roles (Admin vs. User) in real-time via `GetClientsDetails`.

## Phase 3: Financial & Billing Module (Billing Model)
- [ ] **Invoice API**: Implement standard controllers for fetching, creating, and paying invoices.
- [ ] **Transaction Feed**: Expose transaction history directly from WHMCS.
- [ ] **Quotes & Pricing**: Integrate Quote management and dynamic currency conversion.

## Phase 4: Customer Support Module (Support Model)
- [ ] **Ticket Portal**: Create endpoints for opening, replying to, and closing tickets.
- [ ] **Department Sync**: Dynamically fetch support departments and statuses.
- [ ] **Announcements**: Serve company news directly from the WHMCS database via API.

## Phase 5: Service & Resource Management (Service Model)
- [ ] **Cloud Metadata**: Store Server IPs and Provider IDs in WHMCS **Service Custom Fields** (removing the `ServerInstance` table).
- [ ] **Module Operations**: Implementation of Reboot, Reinstall, and Power actions via WHMCS Module hooks.
- [ ] **Product Catalog**: Fetch available VPS plans directly from WHMCS Products.

## Phase 6: Domain & Registrar Module (Domain Model)
- [ ] **Domain Management**: Full CRUD for nameservers, whois info, and locking.
- [ ] **Domain Purchases**: Implementation of `DomainRegister` and `DomainTransfer` flows.

## Phase 7: Order & Storefront Module (Order Model)
- [ ] **Automated Ordering**: Bridge the frontend shopping cart to `AddOrder` and `AcceptOrder`.
- [ ] **Fraud Protection**: Integrate WHMCS `OrderFraudCheck`.

## Phase 8: System & Analytics Module (System Model)
- [ ] **Activity Sync**: Port all application logging to WHMCS `LogActivity`.
- [ ] **Stats Dashboard**: Real-time stats from `GetStats` for the Admin panel.
- [ ] **Project Management**: (Optional) Integrate WHMCS Project Management endpoints.

---

### Implementation Starting Point
I am starting with **Phase 2 (Stateless Authentication)**. 
I will rewrite the `AuthService` to validate logins against WHMCS and generate a signed JWT that contains the WHMCS User ID, removing the need for the `AuthSession` table.

### Models to be Implemented:
1. **ClientModel**: Handled by `GetClientsDetails`.
2. **InvoiceModel**: Handled by `GetInvoices`.
3. **TicketModel**: Handled by `GetTickets`.
4. **OrderModel**: Handled by `GetOrders`.
5. **ProductModel**: Handled by `GetProducts`.
6. **ServiceModel**: Handled by `GetClientsProducts`.
7. **DomainModel**: Handled by `GetClientsDomains`.
