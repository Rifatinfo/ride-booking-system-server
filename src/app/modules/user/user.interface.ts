/**
 * name  Full name.
    email Must be unique.
    password Hashed using bcrypt.
    role  Enum: 'admin' | 'rider' | 'driver'.
    phone  Optional, but useful for ride communication.
    isBlocked  Boolean flag.If true, user cant access the system.
 */

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    RIDER = "RIDER",
    DRIVER = "DRIVER"
}

export interface IAuthProvider {
    provider: "google" | "credential";
    providerId: string;
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
    UNBLOCK = "UNBLOCK"
} 

export type UserState = 'PENDING' | 'APPROVED' | 'SUSPENDED'

export interface IUser {
    userId : string,
    _id? : string;
    name: string;
    email: string;
    password?: string;         // Remind hash 
    phone?: string;

    // Account Status 
    isBlocked?: boolean;
    isDeleted?: boolean;     /* Soft delete */
    isActive?: IsActive;
    
    //  Role Base 
    role: Role;
    auth? : IAuthProvider;
  
    // Driver - specific  (conditionally use them)
    isAvailable ? : boolean;   /* Diver : online/offline */ 
    isApproved ? : boolean;    /* Diver : Admin Approved */ 
    isSuspended ? : boolean;   /* Diver : Admin Action */
    vehicleInfo ? : {
        model : string;
        licensePlate : string;
    };

    status? : UserState; 

    location : {
        type : 'Point';
        coordinates : [number, number]    // [lng, lat]
    };

    cancelAttemptCount? : {
        type : Number,
    }

    /* Relational  */
    riderHistory? : string[];   /* RIDER : ride IDs , ist of all completed/cancelled rides*/
    currentRideId ? : string;   /* DIVER OR RIDER : assigned ride  , one active ride at a time */
}




