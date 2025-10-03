export interface User {
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    organization: string;
    password: string;
    isOrganizer: boolean;
    
}
export interface LoginCredentials {
   email: string;
   password: string;
}
