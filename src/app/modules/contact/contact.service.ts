
interface ContactData {
    name: string,
    email: string,
    phone: string,
    comName: string,
    description: string
}

const submitContactForm = async (data: ContactData) => {
    console.log("Contact form submitted : ", data);
    return{
        success : true,
        message : "Form Submitted Successfully"
    };
}

export const contactService = {
    submitContactForm
}