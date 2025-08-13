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
| POST   | `http://localhost:5000/api/rating/driver` |Rating |
| GET   | `http://localhost:5000/api/users/all-users` |  User All Users|
| GET   | `http://localhost:5000/api/driver/drivers` |   All Drivers|
| GET   | `http://localhost:5000/api/ride/cancel-complete-history` | Cancel Complete History |
| GET   | `http://localhost:5000/api/driver/drivers` | All drivers |
| GET   | `http://localhost:5000/api/driver/earning` |  Drivers  Earning|
| GET   | `http://localhost:5000/api/driver/complete` |  Complete Ride|
| GET   | `http://localhost:5000/api/ride/analytics` | Admin Analytics|
| PATCH   | `http://localhost:5000/api/driver/set-availability` |  Drivers  Available status|


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
| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| PATCH   | `http://localhost:5000/api/users/driver/68936170726322a50493f683/status` | Login User |

```
{
	"status": "APPROVED"
}

```


---
## 🚕 Ride Request Business Logic

When a rider requests a ride, the system first checks for nearby available drivers based on the rider's pickup location. If a nearby driver is found, the system assigns the ride to that driver or keeps it in a pending state until a driver accepts.

If no drivers are found near the rider's location, the system will throw an error message saying:
"No drivers available near your location."

# 🧑 Rider JSON
```
{
  "name": "Rider One",
  "email": "rider1@example.com",
  "password": "123456",
  "role": "RIDER",
  "location": {
    "type": "Point",
    "coordinates": [90.3950, 23.7380]
  }
}

```
# 🚗 Driver JSON

```
{
  "name": "Driver One",
  "email": "driver1@example.com",
  "password": "123456",
  "role": "DRIVER",
  "isAvailable": true,
  "isBlocked": false,
  "status": "APPROVED",
  "location": {
    "type": "Point",
    "coordinates": [90.3760, 23.7465]
  }
}

```
# A ride request:

`like --- PENDING → REQUESTED `

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| POST   | `http://localhost:5000/api/ride/request` | Login User |

---

# Rider update status By Driver 
`like ---  REQUESTED -> ACCEPTED -> PICKED -> IN_TRANSIT -> COMPLETED`

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| PATCH   | `http://localhost:5000/api/ride/689448ad9c394cc11771949a/status` | Login User |

---
# Ride Cancel By Rider  
`like ---  REQUESTED -> ACCEPTED -> PICKED -> IN_TRANSIT   To ----->  CANCEL_BY_RIDER`

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| PATCH   | `http://localhost:5000/api/ride/689448ad9c394cc11771949a/cancel` | CANCEL_BY_RIDER |

---
# Driver Change Location 

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| PATCH   | `http://localhost:5000/api/users/64f9d0e7e4b3f94e74b5a1c7/online` | Change location in Driver |

```

{
    "location": {
        "type": "Point",
        "coordinates": [
            90.4059,
            23.7935
        ] // [longitude, latitude]
    }
}

```
# Driver Rating 

| Method | Endpoint               | Description                       |
|--------|------------------------|-----------------------------------|
| PATCH   | `http://localhost:5000/api/rating/driver` | Rating |



```
{
  "rideId": "6894b8b1159da91c29116880",
  "rating": 5,
  "feedback": "Great ride!"
}

```

---