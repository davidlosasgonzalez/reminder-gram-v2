/**
 * @file scripts/generate-token.ts
 * @description Script to generate and store OAuth2 tokens for Google Calendar API per user, requesting the full redirect URL for easy code extraction.
 * @usage pnpm run generate-token
 */

import * as fs from 'fs/promises';
import { Auth, google } from 'googleapis';
import * as path from 'path';
import readline from 'readline';

/**
 * Path to OAuth2 credentials file.
 */
const CREDENTIALS_PATH: string = path.resolve(
    process.cwd(),
    'private/credentials.json',
);
/**
 * Directory to store OAuth2 tokens.
 */
const TOKEN_DIR: string = path.resolve(process.cwd(), 'private/tokens');

/**
 * Loads OAuth2 credentials from credentials.json.
 * @returns {Promise<GoogleOAuth2Credentials>} Parsed credentials object.
 * @throws {Error} If credentials.json is not found or invalid.
 */
async function getCredentials(): Promise<GoogleOAuth2Credentials> {
    try {
        await fs.access(CREDENTIALS_PATH);
    } catch {
        throw new Error(`credentials.json not found at: ${CREDENTIALS_PATH}`);
    }

    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.installed || parsed.web;
}

interface GoogleOAuth2Credentials {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
}

/**
 * Creates an OAuth2 client using the loaded credentials.
 * @returns {Promise<Auth.OAuth2Client>} OAuth2 client instance.
 */
async function getOAuth2Client(): Promise<Auth.OAuth2Client> {
    const credentials = await getCredentials();

    if (!credentials) {
        throw new Error('credentials.json not found or invalid');
    }

    return new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0] || 'http://localhost',
    );
}

/**
 * Prompts the user for input in the terminal.
 * @param query The prompt message to display.
 * @returns Promise resolving to the user's input string.
 */
export function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        }),
    );
}

/**
 * Extracts the authorization code from a redirect URL.
 * @param urlString The full redirect URL returned by Google OAuth.
 * @returns The authorization code or null if not found.
 */
export function extractCodeFromUrl(urlString: string): string | null {
    try {
        const url = new URL(urlString);
        return url.searchParams.get('code');
    } catch {
        return null;
    }
}

/**
 * Main script flow: prompts user for email, handles OAuth2 flow, saves token, and lists accessible calendars.
 */
async function main(): Promise<void> {
    try {
        await fs.access(TOKEN_DIR);
    } catch {
        await fs.mkdir(TOKEN_DIR, { recursive: true });
    }

    const email = (
        await askQuestion('Enter the Google account email to authorize: ')
    ).trim();
    const oAuth2Client = await getOAuth2Client();

    const SCOPES: string[] = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });

    console.log('\n1. Open this URL in your browser and complete the sign-in:');
    console.log(authUrl);

    const redirectUrl = await askQuestion(
        '\n2. Paste here the FULL redirect URL after accepting permissions: ',
    );

    const code = extractCodeFromUrl(redirectUrl.trim());
    if (!code) {
        console.error(
            '\nERROR: Could not extract "code" from the URL. Please paste the entire URL shown in the browser after accepting permissions.',
        );
        process.exit(1);
    }

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const tokenPath = path.resolve(
        TOKEN_DIR,
        `${email.replace(/[@.]/g, '_')}_token.json`,
    );
    await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
    console.log(`\nToken saved to: ${tokenPath}`);

    // Optional: list accessible calendars for verification
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const res = await calendar.calendarList.list();
    console.log('\nAccessible calendars:');
    if (res.data.items) {
        for (const cal of res.data.items) {
            console.log(`- ${cal.summary} (${cal.id})`);
        }
    } else {
        console.log('No calendars found for this account.');
    }
}

main().catch((e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
});
