import { logoutUser as originalLogoutUser } from './api';
import type { UserProfile } from '../types/api';

const dispatchAuthChangeEvent = () => {
    window.dispatchEvent(new Event('authStatusChange'));
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('accessToken');
};

export const decodeAccessToken = (): Pick<UserProfile, 'id' | 'username' | 'email' | 'role'> | null => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        return null;
    }
    try {
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedPayload = JSON.parse(jsonPayload) as Pick<UserProfile, 'id' | 'username' | 'email' | 'role'>;
        return decodedPayload;
    } catch (error) {
        console.error("Error decoding access token:", error);
        return null;
    }
};


export const logout = async (): Promise<boolean> => {
    const success = await originalLogoutUser();
    if (success) {
        dispatchAuthChangeEvent();
    }
    return success;
};

export const setAccessTokenAndDispatch = (token: string) => {
    localStorage.setItem('accessToken', token);
    dispatchAuthChangeEvent();
};