import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export async function getAuthToken() {
  const { privateKey } = JSON.parse(process.env.GOOGLE_PRIVATE_KEY || '{ privateKey: null }')

  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      private_key: privateKey,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
  });
  const authToken = await auth.getClient();
  return authToken;
}