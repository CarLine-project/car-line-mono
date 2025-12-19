# CarLine Class Diagram

## UML Class Diagram with Entities and Key Methods

```mermaid
classDiagram
    %% Entities
    class User {
        +UUID id
        +String email
        +String password
        +String name
        +String phone
        +String avatar
        +String role
        +Date createdAt
        +Date updatedAt
    }

    class RefreshToken {
        +UUID id
        +String token
        +UUID userId
        +Date expiresAt
        +Date createdAt
    }

    class Car {
        +UUID id
        +UUID userId
        +String make
        +String model
        +Integer year
        +Integer initialMileage
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Mileage {
        +UUID id
        +UUID carId
        +Integer value
        +Date recordedAt
        +String comment
        +Date createdAt
        +Date updatedAt
    }

    class Expense {
        +UUID id
        +UUID carId
        +UUID categoryId
        +Decimal amount
        +Date expenseDate
        +String description
        +Date createdAt
        +Date updatedAt
    }

    class ExpenseCategory {
        +UUID id
        +String name
        +String icon
        +Date createdAt
        +Date updatedAt
    }

    class Maintenance {
        +UUID id
        +UUID carId
        +String serviceType
        +Integer mileageAtService
        +Date serviceDate
        +Decimal cost
        +String description
        +Date createdAt
        +Date updatedAt
    }

    %% Services
    class UsersService {
        +findOne(id: string) User
        +findByEmail(email: string) User
        +create(userData: object) User
        +update(id: string, updateData: Partial) User
        +validatePassword(plain: string, hashed: string) boolean
    }

    class AuthService {
        +register(registerDto: RegisterDto) AuthResponseDto
        +login(loginDto: LoginDto) AuthResponseDto
        +validateUser(email: string, password: string) User
        +refresh(refreshToken: string, userId: string) AuthResponseDto
        +logout(refreshToken: string) void
        +generateTokensForUser(user: User) Tokens
        +getUserById(id: string) User
        +sanitizeUser(user: User) SanitizedUser
        -generateTokens(user: User) Tokens
        -cleanupExpiredTokens() void
    }

    class CarsService {
        +create(userId: string, createCarDto: CreateCarDto) Car
        +findAll(userId: string) Car[]
        +findOne(id: string, userId: string) Car
        +update(id: string, userId: string, updateCarDto: UpdateCarDto) Car
        +remove(id: string, userId: string) void
        +activate(id: string, userId: string) Car
        +getActiveCar(userId: string) Car
        +verifyOwnership(carId: string, userId: string) Car
    }

    class MileageService {
        +create(carId: string, createMileageDto: CreateMileageDto) Mileage
        +findAll(carId: string, query: QueryMileageDto) PaginatedResult
        +findOne(id: string) Mileage
        +update(id: string, updateMileageDto: UpdateMileageDto) Mileage
        +remove(id: string) void
        +getCurrentMileage(carId: string) Mileage
        -getLastMileage(carId: string) Mileage
    }

    class ExpensesService {
        +create(carId: string, createExpenseDto: CreateExpenseDto) Expense
        +findAll(carId: string, query: QueryExpenseDto) PaginatedResult
        +findOne(id: string) Expense
        +update(id: string, updateExpenseDto: UpdateExpenseDto) Expense
        +remove(id: string) void
        +getCategories() ExpenseCategory[]
        +getExpenseStats(carId: string, period: Period) ExpenseStats
    }

    class MaintenanceService {
        +create(carId: string, createMaintenanceDto: CreateMaintenanceDto) Maintenance
        +findAll(carId: string, query: QueryMaintenanceDto) PaginatedResult
        +findOne(id: string) Maintenance
        +update(id: string, updateMaintenanceDto: UpdateMaintenanceDto) Maintenance
        +remove(id: string) void
        +getNextMaintenanceRecommendation(carId: string) MaintenanceRecommendation
        -getLastMaintenance(carId: string) Maintenance
    }

    %% Relationships between Entities
    User "1" --o "0..*" RefreshToken : has
    User "1" --o "0..*" Car : owns
    Car "1" --o "0..*" Mileage : tracks
    Car "1" --o "0..*" Expense : has
    Car "1" --o "0..*" Maintenance : maintains
    ExpenseCategory "1" --o "0..*" Expense : categorizes

    %% Service Dependencies
    AuthService ..> UsersService : uses
    AuthService ..> RefreshToken : manages
    AuthService ..> User : authenticates

    UsersService ..> User : manages

    CarsService ..> Car : manages
    CarsService ..> User : validates

    MileageService ..> Mileage : manages
    MileageService ..> Car : validates

    ExpensesService ..> Expense : manages
    ExpensesService ..> ExpenseCategory : uses
    ExpensesService ..> Car : validates

    MaintenanceService ..> Maintenance : manages
    MaintenanceService ..> MileageService : uses
    MaintenanceService ..> Car : validates

```

## Relationship Legend

### UML Relationships Used:

- **`--o`** (Aggregation): "has-a" relationship where the child can exist independently
  - Example: `User --o Car` (User has Cars, but Cars could theoretically exist without being tied to a specific user in the domain model)
- **`..>`** (Dependency): One class uses another class temporarily
  - Example: `AuthService ..> UsersService` (AuthService depends on UsersService methods)

### Multiplicity:

- `1` : Exactly one
- `0..*` : Zero or more
- `1..*` : One or more

## Key Features by Domain:

### Authentication & Users

- **User Management**: CRUD operations, password hashing and validation
- **Authentication**: JWT-based auth with refresh tokens, register/login/logout
- **Security**: Automatic cleanup of expired tokens

### Car Management

- **Car CRUD**: Full lifecycle management of user vehicles
- **Active Car**: System to mark one car as currently active
- **Ownership Verification**: Security checks for car-related operations

### Mileage Tracking

- **Mileage Records**: Track vehicle mileage over time
- **Validation**: Ensures new mileage is always greater than previous
- **Current Mileage**: Quick access to latest mileage reading

### Expense Management

- **Expense Tracking**: Record all vehicle-related expenses
- **Categorization**: Expenses organized by categories (fuel, maintenance, etc.)
- **Analytics**: Statistics by category and time period
- **Filtering**: Query expenses by date range and category

### Maintenance Management

- **Service Records**: Track all maintenance activities
- **Cost Tracking**: Monitor maintenance expenses
- **Smart Recommendations**: Automatic suggestions based on mileage and time
- **Integration**: Uses MileageService for intelligent recommendations

## Database Design Patterns:

- **UUID Primary Keys**: For distributed systems and security
- **Soft Relationships**: Foreign keys with proper indexes
- **Timestamps**: Automatic tracking of creation and modification times
- **Cascade Deletion**: RefreshToken automatically deleted when User is removed
- **Nullable Fields**: Optional descriptive fields (description, comment, etc.)
