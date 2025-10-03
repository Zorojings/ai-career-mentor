import { Client, Account, Databases, Functions } from 'appwrite';

// IMPORTANT: Replace with your actual Appwrite project details
export const APPWRITE_PROJECT_ID = "68dfa9380016bb8c1e3e"
export const APPWRITE_PROJECT_NAME = "AI-career-mentor"
export const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1"
export const APPWRITE_PROFILES_DB_ID = '68dfc0bb001e16c0860c'; // The Database ID you created
export const APPWRITE_PROFILES_COLLECTION_ID = '68dfc111002c0f47053c'; // The Collection ID you created
export const APPWRITE_MENTOR_FUNCTION_ID = '68dfc98a002cab1f6772'; // The Function ID you created

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

export default client;