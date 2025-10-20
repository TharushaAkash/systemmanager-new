## 📚 Role Study Guide (Backend - Java)

Purpose: Help you quickly prepare for the viva by mapping each role to the responsibilities and the most relevant Java files to study.

Notes
- Authentication/authorization utilities: `src/main/java/com/autofuellanka/systemmanager/service/RoleCheckService.java`
- Common domains used by all roles: `model` package (e.g., `Invoice`, `Payment`, `Booking`, `Vehicle`, `ServiceType`, enums)
- Controllers expose REST endpoints; Services hold business logic; Repositories interact with the DB.

---

### 🛡️ ADMIN
- Responsibilities:
  - Can perform all operations available to other roles.
  - Exclusives: User Management and Customer Management.
- Key Java files to study (focus on exclusives):
    - User Management:
      - `src/main/java/com/autofuellanka/systemmanager/controller/AdminUserController.java`
      - `src/main/java/com/autofuellanka/systemmanager/controller/UserController.java`
    - Customer Management:
      - `src/main/java/com/autofuellanka/systemmanager/controller/CustomerController.java`
      - `src/main/java/com/autofuellanka/systemmanager/controller/CustomerVehicleController.java`
    - Role checks:
      - `src/main/java/com/autofuellanka/systemmanager/service/RoleCheckService.java`
    - Model:
      - `src/main/java/com/autofuellanka/systemmanager/model/Location.java`
      - `src/main/java/com/autofuellanka/systemmanager/model/LocationType.java`
      - `src/main/java/com/autofuellanka/systemmanager/model/Role.java`
      - `src/main/java/com/autofuellanka/systemmanager/model/User.java`
    - Repository:
      - `src/main/java/com/autofuellanka/systemmanager/repository/LocationRepository.java`
      - `src/main/java/com/autofuellanka/systemmanager/repository/ServiceTypeRepository.java`
      - `src/main/java/com/autofuellanka/systemmanager/repository/VehicleRepository.java`
      - `src/main/java/com/autofuellanka/systemmanager/repository/VehicleTypeRepository.java`
    - Service:
      - `src/main/java/com/autofuellanka/systemmanager/service/RoleCheckService.java`

---

### 🧭 Manager
- Responsibilities:
  - Service Management, Vehicle Management.
- Key Java files to study:
  - Service Management:
    - `src/main/java/com/autofuellanka/systemmanager/controller/ServiceTypeController.java`
  - Vehicle Management:
    - `src/main/java/com/autofuellanka/systemmanager/controller/VehicleController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/VehicleTypeController.java`
  - Reports:
    - `src/main/java/com/autofuellanka/systemmanager/controller/ReportController.java` 
  - Model:
    - `src/main/java/com/autofuellanka/systemmanager/Model/FuelType.java`
    - `src/main/java/com/autofuellanka/systemmanager/model/ServiceType.java`
    - `src/main/java/com/autofuellanka/systemmanager/model/Vehicle.java`
    - `src/main/java/com/autofuellanka/systemmanager/model/VehicleType.java`
  - Repository:
    - `src/main/java/com/autofuellanka/systemmanager/repository/ServiceTypeRepository.java`
  - Service:
    - `src/main/java/com/autofuellanka/systemmanager/service/FuelpricingService.java`


---

### 🛠️ Technician
- Responsibilities:
  - Assign a job to technician, update job status, view technicians, etc.
- Key Java files to study:
  - Controllers:
    - `src/main/java/com/autofuellanka/systemmanager/controller/JobController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/StaffController.java` (view technicians/listing)
    - `src/main/java/com/autofuellanka/systemmanager/controller/TechnicianController.java`
  - Models/Enums:
    - `src/main/java/com/autofuellanka/systemmanager/model/JobStatus.java`
    - `src/main/java/com/autofuellanka/systemmanager/model/Job.java`
  - DTO:
    - `src/main/java/com/autofuellanka/systemmanager/dto/JobCreateRequest.java`
    - `src/main/java/com/autofuellanka/systemmanager/dto/JobDTO.java`
  - Repository:
    - `src/main/java/com/autofuellanka/systemmanager/repository/JobRepository.java`
   

---

### 👤 Customer
- Responsibilities:
  - Create booking, update booking, delete booking, create feedback, login, register, update profile, vehicle adding.
- Key Java files to study:
  - Bookings:
    - `src/main/java/com/autofuellanka/systemmanager/controller/CustomerBookingController.java`
  - Feedback:
    - `src/main/java/com/autofuellanka/systemmanager/controller/FeedbackController.java`
  - Payment:
    - `src/main/java/com/autofuellanka/systemmanager/controller/PaymentGatewayController.java` 
  - Auth:
    - `src/main/java/com/autofuellanka/systemmanager/controller/AuthController.java`
  - Profile & Vehicles:
    - `src/main/java/com/autofuellanka/systemmanager/controller/CustomerController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/CustomerVehicleController.java`
  - Model:
    - `src/main/java/com/autofuellanka/systemmanager/Model/Booking.java`
    - `src/main/java/com/autofuellanka/systemmanager/Model/BookingStatus.java`
    - `src/main/java/com/autofuellanka/systemmanager/Model/BookingType.java`
    - `src/main/java/com/autofuellanka/systemmanager/Model/Customer.java`
    - `src/main/java/com/autofuellanka/systemmanager/Model/Feedback.java`
    - `src/main/java/com/autofuellanka/systemmanager/model/Payment.java`
    - `src/main/java/com/autofuellanka/systemmanager/model/PaymentMethod.java`
  - DTO:
    - `src/main/java/com/autofuellanka/systemmanager/dto/BookingcreateRequest.java`
    - `src/main/java/com/autofuellanka/systemmanager/dto/BookingDTO.java`
    - `src/main/java/com/autofuellanka/systemmanager/dto/FeedbackDTO.java`
  - Repository:
    - `src/main/java/com/autofuellanka/systemmanager/repository/BookingRepository.java`
    - `src/main/java/com/autofuellanka/systemmanager/repository/CustomerRepository.java`
    - `src/main/java/com/autofuellanka/systemmanager/repository/FeedbackRepository.java`
  - Service:
    - `src/main/java/com/autofuellanka/systemmanager/service/BookingValidationService.java` 
    - `src/main/java/com/autofuellanka/systemmanager/service/FeedbackService.java`

---

### 💰 Finance
- Responsibilities:
  - Invoice management, finance ledger.
- Key Java files to study:
  - Controllers:
    - `src/main/java/com/autofuellanka/systemmanager/controller/BillingController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/FinanceController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/PaymentGatewayController.java`
    - Strategy Pattern (payments):
      - `src/main/java/com/autofuellanka/systemmanager/service/payment/PaymentProcessor.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/payment/PaymentStrategyFactory.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/payment/PaymentProcessingStrategy.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/payment/CashPaymentStrategy.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/payment/CardPaymentStrategy.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/payment/OnlinePaymentStrategy.java`
    - Template Method (invoice workflows):
      - `src/main/java/com/autofuellanka/systemmanager/service/invoice/InvoiceCreationTemplate.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/invoice/BookingInvoiceWorkflow.java`
      - `src/main/java/com/autofuellanka/systemmanager/service/invoice/FuelOnlyInvoiceWorkflow.java`
    - PDF and reports:
      - `src/main/java/com/autofuellanka/systemmanager/service/InvoicePdfService.java`
    - Model:
      - `src/main/java/com/autofuellanka/systemmanager/Model/FinanceLedger.java`
      - `src/main/java/com/autofuellanka/systemmanager/Model/Invoice.java`
      - `src/main/java/com/autofuellanka/systemmanager/Model/InvoiceLine.java`
  - Repositories:
    - `InvoiceRepository.java`, `PaymentRepository.java`, `FinanceLedgerRepository.java`
  - Service:
    - `src/main/java/com/autofuellanka/systemmanager/service/InvoicePDFService.java`
    - `src/main/java/com/autofuellanka/systemmanager/service/BillingService.java`
  - Models/Enums:
    - `Invoice`, `InvoiceLine`, `InvoiceStatus`, `InvoiceLineType`, `Payment`, `PaymentMethod`, `TransactionType`, `FinanceLedger`

---

### 🧑‍💼 Staff
- Responsibilities:
  - Booking management, inventory management.
- Key Java files to study:
  - Booking management:
    - `src/main/java/com/autofuellanka/systemmanager/controller/StaffBookingController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/BookingController.java`
  - Inventory management:
    - `src/main/java/com/autofuellanka/systemmanager/controller/InventoryController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/StockMoveController.java`
    - `src/main/java/com/autofuellanka/systemmanager/controller/ServiceTypeController.java`
  - Reports:
    - `src/main/java/com/autofuellanka/systemmanager/controller/ReportController.java`
  - Model:
    - `src/main/java/com/autofuellanka/systemmanager/Model/InventoryItem.java`
  - DTO:
    - `src/main/java/com/autofuellanka/systemmanager/dto/ReportDTO.java`
  - Repository:
    - `src/main/java/com/autofuellanka/systemmanager/repository/InventoryRepository.java`
  - Service:
    - `src/main/java/com/autofuellanka/systemmanager/service/InventoryService.java`

---

### 🔗 Cross-cutting files (all roles should skim)
- Security and application bootstrap:
  - `src/main/java/com/autofuellanka/systemmanager/SystemmanagerApplication.java`
  - `src/main/java/com/autofuellanka/systemmanager/config/*`
  - `src/main/java/com/autofuellanka/systemmanager/security/*`
- Auth and session:
  - `src/main/java/com/autofuellanka/systemmanager/controller/AuthController.java`
  - `src/main/java/com/autofuellanka/systemmanager/service/RoleCheckService.java`



---

## 🔄 Frontend ↔ Backend mapping (how screens call APIs)

### 🧩 Overall flow
- React component (frontend) → calls REST endpoint (`/api/...`) → Spring `controller` → `service` with business logic → `repository` for DB using `model` entities → JSON back to React.

### 🔐 Auth and roles
- Frontend: `frontend/src/contexts/AuthContext.jsx`, `components/ProtectedRoute.jsx`, `components/RoleBasedNavigation.jsx`
- Backend: `controller/AuthController.java`, `service/RoleCheckService.java`
- Flow: Login returns auth/role → React attaches role header/authorization → backend checks role per endpoint/logic.

### 🧾 Billing, invoices, payments
- Frontend: `frontend/src/components/finance/InvoiceList.jsx`, `InvoiceDetail.jsx`, `Invoices.jsx`, `InvoicePDFGenerator.jsx`
- Backend controllers: `controller/BillingController.java`, `controller/FinanceController.java`, `controller/PaymentGatewayController.java`
- Backend services: `service/BillingService.java`, payment Strategy in `service/payment/*`, invoice Template Method in `service/invoice/*`, PDF in `service/InvoicePdfService.java`
- Typical endpoints used by screens:
  - GET `/api/billing/invoices` → list in `InvoiceList.jsx`
  - GET `/api/billing/invoices/{id}` → detail in `InvoiceDetail.jsx`
  - POST `/api/billing/payments` → pay from `InvoiceDetail.jsx` (uses Payment Strategy)
  - POST `/api/billing/refunds` → refund from `InvoiceDetail.jsx`
  - GET `/api/billing/invoices/{id}/pdf` → download in `InvoicePDFGenerator.jsx`

### 📅 Bookings (Customer/Staff)
- Frontend (customer): `components/customer/ServiceBookingForm.jsx`, `CustomerMyBookings.jsx`, `ServiceCenterBooking.jsx`, `FuelStationBooking.jsx`
- Frontend (staff): `components/staff/Bookings.jsx`, `OperationsDashboard.jsx`
- Backend controllers: `controller/CustomerBookingController.java`, `BookingController.java`, `StaffBookingController.java`
- Services: `service/BookingValidationService.java`, `service/FuelPricingService.java`
- Endpoints examples used by screens:
  - POST `/api/customer/bookings` → create booking
  - GET `/api/customer/bookings?customerId=...` → list my bookings
  - POST `/api/billing/invoices/from-booking/{bookingId}` → create invoice from booking (Template Method)

### 🧰 Jobs (Technician)
- Frontend: `components/technician/TechnicianDashboard.jsx`, `CurrentJobs.jsx`, `PendingJobs.jsx`, `JobManagement.jsx`
- Backend: `controller/JobController.java`
- Examples:
  - GET `/api/jobs?status=PENDING` → `PendingJobs.jsx`
  - PATCH `/api/jobs/{id}/status` → update from `JobManagement.jsx`

### 📦 Inventory and stock
- Frontend: `components/staff/inventory.jsx`, `NewInventoryItem.jsx`, `StockMoves.jsx`, `ServiceTypes.jsx`
- Backend: `controller/InventoryController.java`, `StockMoveController.java`, `ServiceTypeController.java`
- Examples:
  - POST `/api/inventory` → create item (from `NewInventoryItem.jsx`)
  - POST `/api/stock-moves` → record move (from `StockMoves.jsx`)
  - GET `/api/service-types` → list services (from `ServiceTypes.jsx`)

### 📈 Reports and finance dashboards (Manager/Finance)
- Frontend: `components/staff/Reports.jsx`, finance pages under `components/finance/*`
- Backend: `controller/ReportsController.java`, `controller/FinanceController.java`
- Examples:
  - GET `/api/reports/sales?from=...&to=...` → charts/tables in `Reports.jsx`

### 🚗 Customers and vehicles
- Frontend: `components/customer/MyVehicles.jsx`, `CustomerProfile.jsx`
- Backend: `controller/CustomerController.java`, `CustomerVehicleController.java`, `VehicleController.java`
- Examples:
  - POST `/api/customer/vehicles` → add vehicle
  - GET `/api/customer/vehicles?customerId=...` → list vehicles

### ▶️ Concrete end-to-end example
1) Customer submits booking in `ServiceBookingForm.jsx` → POST `/api/customer/bookings`.
2) Staff/Manager issues invoice → POST `/api/billing/invoices/from-booking/{bookingId}` → `BillingService` delegates to `BookingInvoiceWorkflow` to build lines/totals/ledger.
3) Finance records payment in `InvoiceDetail.jsx` → POST `/api/billing/payments` → `PaymentProcessor` selects strategy (Cash/Card/Online) → updates invoice + ledger → JSON response updates UI.


