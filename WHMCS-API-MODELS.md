# WHMCS API Model Implementation Guide (Database Replacement)

This document details how each WHMCS API model will be implemented in the backend to replace the Prisma/PostgreSQL database.

## 1. Client Model (Profile & Account)
*   **API Endpoints**: `GetClients`, `GetClientsDetails`, `AddClient`, `UpdateClient`, `DeleteClient`, `CloseClient`, `GetClientGroups`.
*   **Performance**: Direct API calls. No local storage.
*   **Role**: Manages the user's personal information, contact details, and account status. 
*   **Implementation**: The `/me` endpoint and profile update routes will map directly to `GetClientsDetails` and `UpdateClient`.

## 2. User & Auth Model (Identity)
*   **API Endpoints**: `AddUser`, `GetUsers`, `UpdateUser`, `UpdateUserPermissions`, `ValidateLogin`, `CreateSsoToken`, `ResetPassword`.
*   **Performance**: Extremely sensitive. Uses WHMCS native authentication.
*   **Role**: Handles login, registration, and password resets.
*   **Implementation**: Replaces Prisma-backed sessions. Logins are verified via `ValidateLogin`. SSO tokens allow the user to jump into the WHMCS standard client area if needed.

## 3. Order Model (Provisioning Flow)
*   **API Endpoints**: `GetOrders`, `AddOrder`, `AcceptOrder`, `CancelOrder`, `DeleteOrder`, `OrderFraudCheck`, `PendingOrder`.
*   **Performance**: Transactional.
*   **Role**: Manages the conversion of a shopping cart into a billable service.
*   **Implementation**: When a user selects a server on the frontend, the backend calls `AddOrder`. Upon payment verification, `AcceptOrder` triggers the actual provisioning.

## 4. Billing & Invoice Model (Financials)
*   **API Endpoints**: `GetInvoices`, `GetInvoice`, `CreateInvoice`, `UpdateInvoice`, `AddInvoicePayment`, `GetTransactions`, `AddTransaction`, `GetPaymentMethods`, `GetCurrencies`.
*   **Performance**: High consistency required.
*   **Role**: Tracks payments, generates invoices, and shows billing history.
*   **Implementation**: All billing dashboards fetch data directly from `GetInvoices`. Payments are processed through WHMCS gateways.

## 5. Product Model (Catalog)
*   **API Endpoints**: `GetProducts`, `AddProduct`, `UpdateProduct` (via System).
*   **Performance**: Can be cached in memory for high performance as product catalogs change infrequently.
*   **Role**: Defines what servers/plans are available for purchase.
*   **Implementation**: The store front calls `GetProducts`. Metadata like CPU/RAM are parsed from the product description or custom fields.

## 6. Service & Module Model (Resources)
*   **API Endpoints**: `GetClientsProducts`, `UpdateClientProduct`, `ModuleCreate`, `ModuleSuspend`, `ModuleTerminate`, `ModuleCustom`.
*   **Performance**: **CRITICAL**. Replaces `ServerInstance` table.
*   **Role**: Manages active servers (Reboot, Reinstall, etc.).
*   **Implementation**: Cloud metadata (IP, Instance ID) is stored in **WHMCS Service Custom Fields**. The backend fetches these fields via `GetClientsProducts` every time a user manages their server.

## 7. Support Model (Communication)
*   **API Endpoints**: `GetTickets`, `GetTicket`, `OpenTicket`, `UpdateTicket`, `AddTicketReply`, `AddTicketNote`, `GetSupportDepartments`.
*   **Performance**: Direct API calls.
*   **Role**: Customer support portal inside the panel.
*   **Implementation**: All messages are synced in real-time with the WHMCS support desk.

## 8. Domain Model (DNS/Registrar)
*   **API Endpoints**: `GetClientsDomains`, `DomainRegister`, `DomainRenew`, `DomainTransfer`, `DomainUpdateNameservers`, `DomainGetWhoisInfo`.
*   **Performance**: Integration with external registrars via WHMCS.
*   **Role**: Manages domain names and DNS settings.
*   **Implementation**: Maps directly to WHMCS registrar modules.

## 9. System & Audit Model (Logs)
*   **API Endpoints**: `LogActivity`, `GetActivityLog`, `GetStats`, `GetConfigurationValue`.
*   **Performance**: High-volume logging.
*   **Role**: Replaces the local `AuditLog` table.
*   **Implementation**: Every action in the custom panel (e.g., "User rebooted server") is logged to WHMCS via `LogActivity`.

## 10. Affiliate Model (Marketing)
*   **API Endpoints**: `AffiliateActivate`, `GetAffiliates`.
*   **Performance**: Basic data fetching.
*   **Role**: Tracks referrals and commissions.
*   **Implementation**: Shows the user their referral link and earned balance.

## 11. Project Management Model (Workflows)
*   **API Endpoints**: `GetProjects`, `CreateProject`, `UpdateProjectTask`.
*   **Performance**: Structured workflow management.
*   **Role**: For complex enterprise setups or custom deployment tracking.
*   **Implementation**: Fetches and updates project milestones for VIP clients.
