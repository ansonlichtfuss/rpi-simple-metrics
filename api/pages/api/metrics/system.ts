import Cors from 'cors';
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import initMiddleware from '../../../lib/init-middleware';
import { generateSystemPayload } from '../../../lib/metrics/generateSystemPayload';

const { GOOGLE_SHEETS_API_KEY, GOOGLE_SHEET_ID } = process.env;

const MAX_TABLE_ROWS = 300;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES
  });
  const authToken = await auth.getClient();
  return authToken;
}

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
      auth: await getAuthToken(),
    });
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Metrics!A1:G',
    });

    // Truncate more than max number of rows
    const rowCount = (data.values || []).length;
    if (rowCount > MAX_TABLE_ROWS) {
      const startOffset = 1;
      const rowsToDelete = rowCount - MAX_TABLE_ROWS;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: GOOGLE_SHEET_ID,
        requestBody: {
          "requests":
          [
            {
              "deleteDimension": {
                "range": {
                  "sheetId": 0,
                  "dimension": "ROWS",
                  "startIndex": startOffset, // Start at second row, first row is column titles
                  "endIndex": rowsToDelete + startOffset
                }
              }
            },
          ]
        }
      });
    }

    const rows = generateSystemPayload(data);

    res.statusCode = 200;
    res.json({ response: rows });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.json({ error: 'Something went wrong.' });
  }
};
