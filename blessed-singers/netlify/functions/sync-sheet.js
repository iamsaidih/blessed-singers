// netlify/functions/sync-sheet.js
const { google } = require('googleapis');

const CREDENTIALS = {
  "type": "service_account",
  "project_id": "blessed-singers",
  "private_key_id": "4f733408c035ce286ff08cca7227b008886cfc43",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDPSa0+Ek7CO3Um\nHvUgVgju4cuctj9hmxo14jKs1jgecRuB1QAEm0fKClmP2w6wz33lR+ialzyNpYob\nXQobUbPPNsh9C+PYZ46RKdHSkS1J8RYspz1h4e17o9460vypCaqomQ7sfNdK99rd\nqmUvdmSGFvqQetvWboNfni9PB9GSH9DCwe5GIoeuLmom6O2a5oBGpTDi3aM1Smd7\niZ9dMCIM+bq7HYF59o4NhegjrOjsw6pQ+2ynr+BvZ8CfYIMfteoilb8Uz6Y+7gYQ\ngni3an8E8wGJ2/rEQI+kiU88++G85YN8kBKP1kC8KvEogWtF3bQaKiaGDz80u3sM\nPSptDAjXAgMBAAECggEAE4nSS+OAi6D8bddv1i3F3HO+tCAe4UhetBgvcUh6ia6y\nSmPqrdnPw8+DRE1VmSeK/62Y0y7Q2lkcJ3Ahn77tFT8IrsthcpMa8RE2ty5P99mY\nSXqKDUvft/kTiAqTHivMa4/hxDtlilTKddJghJTC7OYFlXtpyqXSuZSOHljnpr+F\nbFAwIoRe8EyqlYT6lrmXuI+ZD4KP1F79T9UGZ33sqJz8aVRPFcMxBNuOqpVzditQ\nMOgq7lCa4iB7RUemlFQqS/oBye+7usVn6hB/StC0m5s6Vzt5Byf4QtlVtwHq/qb3\n0cuEQ9FdHdIqsMRbGRcPefWqoFAV4qmgwVYrcc43gQKBgQD30UwfgJfkQpxoBvBZ\nj8E2McN+jentwwZc7sajpNWgpsWY0cCbssglyJcW+Xvp8YENXdUB4QACB4FpsPIO\nXLliTxUC/v77mjhH0tWz+8KA7D/cSNwU4PsWzHxXs4FFXdyvVDcJnMgb1PSr75YE\nbgVtucsB1bH2s6M7F7s3VjsnxwKBgQDWIcwnZnsNGMIgiRXqJPFNh1g1UzMPK7Km\nFqNzN4non1NBFyPbP7XVnlAWQZ1vACxpt/TN23t97TP4pbROI4PaicdxtpoBPGUt\n704dSAGH5DavIChjwxI4Bcqi+0QLsB+2dCGHLmNBLDNuYHeJNSM7x8NaXupe4SZA\n7/dHzBi2cQKBgEazHl2KaUsEuexvtlhGy99zOQu83vUnA4S11lPPbebkTVE43hNN\nYQ5ueLRkPrbSYHf4whFEKKVrkL8fbR8t0vG6EAuHxiTvrYjIHJG5jJcNT3bADpGi\nUeACPKMkogexLImUpBMI+IoAKkF3G7xtyvyv2bvPRHNWcoYkUhQKdNv3AoGAEHbS\nyqi/h1dC/dtseu9SOmLQrnDyORVkDA8rjB1WFjPB4/xSfnYclgsxHzT2VOWPhKVn\nRji8+wa0+0ZKYcOrTK9RTXX7y2KIaQrAV9IEhB1Q8xAm6tzB1trjJLrrFXb6ST4O\noeU4LnemkLMMHdmfFuaaJ6WqoZbwKQgKXFPeBpECgYAS9pkILB5X1cjdislItowF\naOQQo63z84buh+1D6Wdk7WBC4fkeR79/G6QX8oMmSKnKww7wARIwZwLc8ZFthXsx\nLdGI2z7GL7mqd8VEUn1pJ8+G9UgjtCJqr1qZbY4OMEyjMrR3lpondaDAhjSsRw4I\njAW82UIvFIdsVMePON4nfA==\n-----END PRIVATE KEY-----\n",
  "client_email": "blessed-singers-sync@blessed-singers.iam.gserviceaccount.com",
  "client_id": "104243594471797942577",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/blessed-singers-sync%40blessed-singers.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const SHEET_ID = '1mV3u5_N4OybSAM0R0iakEcf5RlNhWtXGiKzk6bKb14M';

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 200,
            body: JSON.stringify({ status: 'API is running' })
        };
    }

    try {
        const { rows } = JSON.parse(event.body);
        
        const auth = new google.auth.JWT(
            CREDENTIALS.client_email,
            null,
            CREDENTIALS.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Get current sheet info
        const sheetInfo = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'ChoirData!A:G'
        });
        
        const lastRow = sheetInfo.data.values ? sheetInfo.data.values.length : 1;
        
        // Clear existing data (keep headers)
        if (lastRow > 1) {
            await sheets.spreadsheets.values.clear({
                spreadsheetId: SHEET_ID,
                range: `ChoirData!A2:G${lastRow}`
            });
        }
        
        // Write headers if empty
        if (!sheetInfo.data.values || sheetInfo.data.values.length === 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: 'ChoirData!A1:G1',
                valueInputOption: 'RAW',
                requestBody: {
                    values: [['ID', 'Name', 'Phone', 'VoicePart', 'JoinedDate', 'Month', 'Paid']]
                }
            });
        }
        
        // Write data
        if (rows && rows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: 'ChoirData!A2',
                valueInputOption: 'RAW',
                requestBody: { values: rows }
            });
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, rowsWritten: rows ? rows.length : 0 })
        };
        
    } catch (error) {
        console.error('Sync error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};