# Ride Booking API  

###  **Project Overview**

### 🚕 Ride Booking System

A full-stack ride-hailing platform where riders can request rides and drivers can accept and complete them. It includes role-based access, ride lifecycle management, and real-time driver availability.

---

### 👤 User Roles 

- Rider – Can request, cancel, and view ride history.
- Driver – Can go online, accept rides, and complete them.
- Admin  – Can manage users and monitor activity.

### 🔄 Ride Lifecycle

- REQUESTED – Rider requests a ride.
- ACCEPTED – Driver accepts the ride.
- PICKED_UP – Driver picks up the rider.
- IN_TRANSIT – Ride is in progress.
- COMPLETED – Ride is finished.
- CANCELED – Rider or driver cancels.

### 🧠 Core Features

- 🚗 Nearby driver detection using 2dsphere geo queries.
- 🛑 Prevent multiple active rides per rider/driver.
- 🔐 Auth with JWT + role-based access control.
- 📍 Driver location tracking.
- ❌ Cancel attempt tracking (cancelAttemptCount).
- ⛔ Suspension handling (blocked users can't ride/drive).
- 📜 Ride history per user.

### 🧩 Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, Role-based middleware
- Validation: Zod
- Geo Queries: MongoDB 2dsphere index

---

## Designing the API endpoints

### 🥖 Auth Routes

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| POST   | `http://localhost:5000/api/users/register` | Register user |
| POST   | `http://localhost:5000/api/auth/login` | Login User |
| POST   | `http://localhost:5000/api/auth/logout` | Login User |

---


```
{
  "name": "Super Admin",
  "email": "super@admin.com",
  "password" : "YvG7p!k2B*e1zW9"
}

{
  "name": "admin",
  "email": "admin@gmail.com",
  "password" : "123456",
}

```

## Admin Route for Updating Driver Status 

`like --- PENDING → APPROVED or SUSPENDED`

| POST   | `http://localhost:5000/api/users/driver/68936170726322a50493f683/status` | Login User |

```
{
	"status": "APPROVED"
}
```


---


