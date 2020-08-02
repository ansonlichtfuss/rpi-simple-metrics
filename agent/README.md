# rpi-simple-metrics-agent

The server-side portion of the Raspberry Pi Simple Metrics package, written in Go.

Requires these config files:

- `sheet.json`

  Put the ID of the google sheet here in a JSON object under the key `sheet_id`, like so:

```json
{ "sheet_id": "...your id here..." }
```

- `credentials.json`

  Go to the Google Sheets API docs and click "Enable the Google Sheets API". In resulting dialog click DOWNLOAD CLIENT CONFIGURATION and save the file credentials.json to your working directory.

- `token.json`

  When running the agent for the first time it will guide you through authorizing this application and saving the token locally.
