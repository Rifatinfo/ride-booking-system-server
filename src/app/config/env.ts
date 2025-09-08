
import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: string,
    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES: string,
    BCRYPT_SALT_ROUND: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PASSWORD: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRES: string,
    FRONTEND_URL: string,
    SMTP_HOST: string,
    SMTP_PORT: string,
    SMTP_USER: string,
    SMTP_PASS: string,
    SMTP_FROM: string,
    REDIS_HOST: string,
    REDIS_PORT: string,
    REDIS_USERNAME: string,
    REDIS_PASSWORD: string,

    STORE_ID: string,
    STORE_PASS: string,
    SSL_PAYMENT_API: string,
    SSL_VALIDATION_API: string,
    SSL_SUCCESS_FRONTEND_URL: string,
    SSL_FAIL_FRONTEND_URL: string,
    SSL_CANCEL_FRONTEND_URL: string,
    SSL_SUCCESS_BACKEND_URL: string,
    SSL_FAIL_BACKEND_URL: string,
    SSL_CANCEL_BACKEND_URL: string,
}

const loadEnvVariable = (): EnvConfig => {
    const requiredEnvVariable: string[] = ['PORT', "DB_URL", "NODE_ENV"];
    requiredEnvVariable.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    })

    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        SMTP_HOST: process.env.SMTP_HOST as string,
        SMTP_PORT: process.env.SMTP_PORT as string,
        SMTP_USER: process.env.SMTP_USER as string,
        SMTP_PASS: process.env.SMTP_PASS as string,
        SMTP_FROM: process.env.SMTP_FROM as string,
        REDIS_HOST: process.env.REDIS_HOST as string,
        REDIS_PORT: process.env.REDIS_PORT as string,
        REDIS_USERNAME: process.env.REDIS_USERNAME as string,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,

        STORE_ID: process.env.SSL_STORE_ID as string,
        STORE_PASS: process.env.SSL_STORE_PASS as string,
        SSL_PAYMENT_API: process.env.SSL_PAYMENT_API as string,
        SSL_VALIDATION_API: process.env.SSL_VALIDATION_API as string,
        SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL as string,
        SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL as string,
        SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL as string,
        SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL as string,
        SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL as string,
        SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL as string,
    }
}



export const envVars = loadEnvVariable();