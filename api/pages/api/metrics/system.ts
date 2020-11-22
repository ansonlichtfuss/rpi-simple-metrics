import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { cors } from '../../../lib/cors';
import { getAuthToken } from '../../../lib/googleapis/auth';
import { generateSystemPayload } from '../../../lib/metrics/generateSystemPayload';

const { GOOGLE_SHEET_ID } = process.env;

const MAX_TABLE_ROWS = 300;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  try {
    // Initialize sheets instance
    const sheets = google.sheets({
      version: 'v4',
      auth: await getAuthToken(),
    });

    // Get all rows in data sheet
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
                  // Start at second row, first row is column titles
                  "startIndex": startOffset,
                  "endIndex": rowsToDelete + startOffset
                }
              }
            },
          ]
        }
      });
    }

    // Build pretty payload for frontend
    const rows = generateSystemPayload(data);

    res.statusCode = 200;
    res.json({ response: rows });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.json({ error: 'Something went wrong.' });
  }
};
