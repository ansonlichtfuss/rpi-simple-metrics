import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateSystemPayload } from '../../../lib/metrics/generateSystemPayload';

const { GOOGLE_SHEETS_API_KEY, GOOGLE_SHEET_ID } = process.env;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: GOOGLE_SHEETS_API_KEY,
    });
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Metrics!A1:G',
    });

    const rows = generateSystemPayload(data);

    res.statusCode = 200;
    res.json({ response: rows });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.json({ error: 'Something went wrong.' });
  }
};
