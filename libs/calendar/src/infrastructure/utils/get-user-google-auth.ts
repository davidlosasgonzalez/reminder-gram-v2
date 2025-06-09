/**
 * @file google-auth.helpers.ts
 * @description Helper functions to load Google OAuth2 credentials and tokens.
 */

import { env } from '@config/env/env.config';
import * as fs from 'fs/promises';
import { Auth, google } from 'googleapis';
import * as path from 'path';

/**
 * Google OAuth2 credentials interface.
 */
interface GoogleOAuth2Credentials {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
}

/**
 * Google token object (minimal, puede ampliarse según tus scopes).
 */
interface GoogleOAuth2Token {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
    [key: string]: unknown;
}

/**
 * Loads Google OAuth2 credentials from credentials.json.
 * @returns Promise resolving to Google API credentials object.
 */
async function loadOAuth2Credentials(): Promise<GoogleOAuth2Credentials> {
    const credentialsPath = env.CREDENTIALS_PATH;
    const data = await fs.readFile(credentialsPath, 'utf8');
    const credentials = JSON.parse(data);
    const src = credentials.installed || credentials.web;
    return {
        client_id: src.client_id,
        client_secret: src.client_secret,
        redirect_uris: src.redirect_uris,
    };
}

/**
 * Loads an OAuth2 token for a specific user (by email).
 * @param email User's Google account email address.
 * @returns Promise resolving to the parsed OAuth2 token object.
 * @throws Error if the token file does not exist.
 */
async function loadUserToken(email: string): Promise<GoogleOAuth2Token> {
    const safeEmail = email.replace(/[@.]/g, '_');
    const tokenPath = path.resolve(
        process.cwd(),
        'private',
        'tokens',
        `${safeEmail}_token.json`,
    );
    try {
        const data = await fs.readFile(tokenPath, 'utf8');
        return JSON.parse(data) as GoogleOAuth2Token;
    } catch {
        throw new Error(`Token file not found for ${email} at ${tokenPath}`);
    }
}

/**
 * Returns an authenticated Google OAuth2 client for the given user.
 * @param email Google account email (used to identify the token file).
 * @returns Promise resolving to Google Auth OAuth2 client instance.
 */
export async function getUserGoogleAuth(
    email: string,
): Promise<Auth.OAuth2Client> {
    const credentials = await loadOAuth2Credentials();
    const tokens = await loadUserToken(email);

    const oauth2Client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0] || 'http://localhost',
    );
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
}
