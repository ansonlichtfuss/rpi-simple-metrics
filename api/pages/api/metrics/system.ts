import Cors from 'cors';
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import initMiddleware from '../../../lib/init-middleware';
import { generateSystemPayload } from '../../../lib/metrics/generateSystemPayload';

const { GOOGLE_SHEETS_API_KEY, GOOGLE_SHEET_ID } = process.env;

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    origin: ['https://www.ansonlichtfuss.com', 'http://localhost:8000'],
    methods: ['GET', 'OPTIONS'],
  })
);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Run cors
  await cors(req, res);

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
