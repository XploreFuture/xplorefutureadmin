// frontend/src/utils/api.ts

// Use 'import type' for importing interfaces (types) when 'verbatimModuleSyntax' is enabled
import type { ApiErrorResponse } from '../types/api';

// Define the base URL for your backend API
// Ensure this matches the port your Node.js server is running on
const BACKEND_URL = 'http://31.97.205.152:5000';

/**
 * Utility function to request a new access token using the refresh token.
 * This function handles the logic for session renewal.
 * @returns A Promise that resolves with the new access token string, or null if refresh fails.
 */
async function getNewAccessToken(): Promise<string | null> {
    try {
        // Send a GET request to the backend's refresh token endpoint
        // 'credentials: 'include'' is crucial for sending the HttpOnly refresh token cookie
        const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (response.ok) {
            // If the refresh token request is successful, parse the JSON response
            const data: { accessToken: string } = await response.json();
            // Store the newly obtained access token in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            console.log('New access token obtained successfully.');
            return data.accessToken;
        } else {
            // If refresh token request fails (e.g., 401 Unauthorized, 403 Forbidden)
            console.error('Refresh token failed:', response.status, response.statusText);
            // Clear any potentially stale access token from localStorage
            localStorage.removeItem('accessToken');
            // Alert the user and redirect to the login page to force re-authentication
            alert('Your session has expired or is invalid. Please log in again.');
            // Redirect to the login page (assuming '/login' is your React Router path)
            window.location.href = '/login';
            return null;
        }
    } catch (error: unknown) { // Catch any network or unexpected errors
        // Log the error for debugging
        if (error instanceof Error) {
            console.error('Error during access token refresh:', error.message);
        } else {
            console.error('An unknown error occurred during access token refresh:', error);
        }
        // Clear token and redirect on error
        localStorage.removeItem('accessToken');
        alert('A network error occurred while refreshing your session. Please log in again.');
        window.location.href = '/login';
        return null;
    }
}

/**
 * Generic utility function to make authenticated API requests.
 * It automatically includes the access token in the Authorization header
 * and handles access token refresh if the current token is expired.
 * @param path The API endpoint path (e.g., '/api/profile', '/api/protected'). DO NOT include BACKEND_URL here.
 * @param options Standard RequestInit options for the fetch request.
 * @returns A Promise that resolves with the parsed JSON response data (type T), or null if the request fails.
 */
export async function fetchWithAuth<T>(
    path: string,
    options: RequestInit = {}
): Promise<T | null> {
    // Retrieve the current access token from localStorage
    // Changed 'let' to 'const' as 'accessToken' is not reassigned within this function scope.
    const accessToken = localStorage.getItem('accessToken'); 

    // If no access token is found, the user is not logged in.
    if (!accessToken) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = '/login';
        return null;
    }

    // Prepare headers for the fetch request, including the Authorization header
    const requestHeaders = new Headers(options.headers);
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    options.headers = requestHeaders;

    // Make the initial fetch request to the backend API
    // IMPORTANT: Concatenate BACKEND_URL with the provided 'path'
    let response = await fetch(`${BACKEND_URL}${path}`, options);

    // If the response status is 401 (Unauthorized), it might mean the access token has expired
    if (response.status === 401) {
        console.log('Access token expired or invalid. Attempting to refresh...');
        // Try to get a new access token
        const newAccessToken = await getNewAccessToken();

        if (newAccessToken) {
            // If a new token is successfully obtained, retry the original request
            requestHeaders.set('Authorization', `Bearer ${newAccessToken}`);
            options.headers = requestHeaders; // Update headers with the new token
            response = await fetch(`${BACKEND_URL}${path}`, options); // Retry the fetch
        } else {
            // If getting a new token failed, getNewAccessToken would have already redirected
            return null;
        }
    }

    // Check if the final response is successful (status code 2xx)
    if (response.ok) {
        // Check content type to avoid parsing non-JSON responses (e.g., 204 No Content)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return (await response.json()) as T; // Parse and return JSON data
        } else {
            // If successful but no JSON content (e.g., 204 No Content), return an empty object
            return {} as T;
        }
    } else {
        // Handle API errors (non-2xx status codes)
        let errorData: ApiErrorResponse = { msg: 'An unknown API error occurred.' };
        try {
            // Attempt to parse the error response as JSON
            errorData = (await response.json()) as ApiErrorResponse;
        } catch (jsonError: unknown) {
            // If the error response is not JSON, construct a generic message
            console.error("Failed to parse error response as JSON:", jsonError); // Log jsonError
            errorData.msg = `Server error (${response.status}): ${response.statusText || 'No response body'}`;
        }

        const errorMessage = errorData.msg || 'An API error occurred.';
        console.error('API Error:', response.status, errorMessage, errorData.errors);

        // If the error is still 401 or 403 after potential refresh, force re-login
        if (response.status === 401 || response.status === 403) {
            alert('Access denied. Please log in again.');
            localStorage.removeItem('accessToken'); // Ensure token is cleared
            window.location.href = '/login'; // Redirect to login page
        } else {
            // For other types of errors, just show an alert
            alert(`Error: ${errorMessage}`);
        }
        return null; // Return null to indicate failure
    }
}

/**
 * Utility function to handle user logout.
 * Clears the access token from localStorage and sends a logout request to the backend.
 * @returns A Promise that resolves to true if logout is successful, false otherwise.
 */
export async function logoutUser(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Important for sending the HttpOnly refresh token cookie
        });

        // Backend might respond with 200 OK or 204 No Content for successful logout
        if (response.ok || response.status === 204) {
            localStorage.removeItem('accessToken'); // Clear access token from frontend
            console.log('Logged out successfully on frontend.');
            return true;
        } else {
            // If backend logout fails for some reason
            const errorData: ApiErrorResponse = await response.json();
            console.error('Logout failed:', errorData.msg || response.statusText);
            alert(`Logout failed: ${errorData.msg || response.statusText}`);
            return false;
        }
    } catch (error: unknown) { // Catch network errors
        if (error instanceof Error) {
            console.error('Logout network error:', error.message);
        } else {
            console.error('An unknown network error occurred during logout:', error);
        }
        alert('A network error occurred during logout.');
        return false;
    }
}