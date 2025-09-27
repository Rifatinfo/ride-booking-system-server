import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
    import bcrypt from 'bcryptjs';
export const seedSuperAdmin = async () => {
    const isSuperAdminExits = await User.findOne({email : envVars.SUPER_ADMIN_EMAIL});
    if(isSuperAdminExits){
       return;
    }

    const hashedPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));

    const authProvider : IAuthProvider = {
        provider : "credential",
        providerId : envVars.SUPER_ADMIN_EMAIL
    }

    const payload : IUser = {
        name : "Super Admin",
        role : Role.SUPER_ADMIN,
        email :  envVars.SUPER_ADMIN_EMAIL,
        password : hashedPassword,
        auth : authProvider,
        isVerified : true,
        isAvailable : true,
        emergency_phone : "01792842921"
    }

    const superAdmin = await User.create(payload)
    
}