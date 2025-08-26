
import nodemailer from "nodemailer" ;
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import path from "path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
  secure: true,
  host: envVars.SMTP_HOST,
  port: Number(envVars.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
    to : string,
    subject : string,
    templateName : string,
    templateData? : Record<string, any>
    attachments? : {
        filename : string,
        content  : Buffer | string,
        contentType : string
    }[]
}

export const sendEmail = async({
    to,
    subject,
    templateName,
    templateData,
    attachments
} : SendEmailOptions) => {
  try{
    const templatePath = path.join(__dirname, `template/${templateName}.ejs`)
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
        from : envVars.SMTP_FROM,
        to: to,
        subject : subject,
        html : html,
        attachments : attachments?.map(attachment => ({
            filename : attachment.filename,
            content : attachment.content,
            contentType : attachment.contentType
        }))
    })
    console.log(`\u20709\uFE0F Email send to ${to} : ${info.messageId}`);
    
  }catch(error : any){
    throw new AppError(401, "Email error");
  }
}