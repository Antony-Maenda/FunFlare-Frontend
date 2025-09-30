export interface User {
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
    organizationName?: string;
    password: string;
    isOrganizer: boolean;
    
}
export interface LoginCredentials {
   email: string;
   password: string;
   isOrganizer: boolean;
}
