require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, '../build')));

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

app.post('/api/extract', upload.single('file'), async (req, res) => {
    console.log('Received a request to /api/extract');

    if (!process.env.REACT_APP_DASHSCOPE_API_KEY) {
        console.error('DashScope API key is missing from .env file.');
        return res.status(500).json({ message: 'Server configuration error: The DashScope API key is missing.' });
    }

    if (!req.file) {
        console.log('No file uploaded.');
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    console.log('File received:', req.file.originalname);

    try {
        const imageBuffer = req.file.buffer;
        const base64Image = imageBuffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        console.log('Calling DashScope API...');
        const response = await openai.chat.completions.create({
            model: "qwen-vl-plus",
            messages: [{
                role: "user",
                content: [{
                        type: "image_url",
                        image_url: {
                            "url": imageUrl
                        }
                    },
                    {
                        type: "text",
                        text: `You are an expert AI assistant for analyzing trade documents. Your task is to extract information and return a strict JSON object.

**--- VERY IMPORTANT RULES ---**

**1. IDENTIFY THE ROLES:**
   - The **BUYER** is the one paying for the goods/services. This is the 'sender' or 'applicant'.
   - The **SELLER** is the one receiving the payment. This is the 'beneficiary'.

**2. EXTRACT BUYER (SENDER) INFORMATION:**
   - "senderName": The full name of the **BUYER**.
   - "address": The full address of the **BUYER**.
   - "contactNumber": The contact telephone number of the **BUYER**.
   - "debitAc": The **BUYER's** bank account number from which the payment will be made.
   - "debitAcCurrency": The currency of the **BUYER's** bank account.
   - "chargesDebitAc": The **BUYER's** account for fees. If not specified, use the main debit account.
   - "chargesDebitAcCurrency": The currency of the **BUYER's** account for fees.

**3. EXTRACT SELLER (BENEFICIARY) INFORMATION:**
   - "beneficiaryName": The full name of the **SELLER**.
   - "beneficiaryBank": The full, complete name of the **SELLER's** bank. Example: "Standard Chartered Bank (Hong Kong) Limited".
   - "beneficiaryAccount": The **SELLER's** bank account number where they will receive the money.

**4. EXTRACT INTERMEDIARY BANK INFORMATION:**
   - "intermediaryBank": The intermediary bank, if mentioned.

**--- JSON OUTPUT FORMAT ---**
Your response MUST be ONLY the JSON object with the fields listed above.
If any information cannot be found, the value must be null.
Do not include explanations or markdown.`
                    },
                ]
            }]
        });

        const rawContent = response.choices[0].message.content;
        console.log('Raw DashScope API response:', rawContent);

        const jsonString = rawContent.replace(/`{3}json\n|`{3}/g, '').replace(/[\n\r\t]/g, '').trim();
        console.log('Cleaned JSON string:', jsonString);
        
        let extractedJson;
        try {
            extractedJson = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError);
            return res.status(500).json({ message: 'AI response was not valid JSON.', raw: rawContent });
        }
        
        console.log('Parsed JSON object:', extractedJson);
        res.json(extractedJson);
    } catch (error) {
        console.error('Error calling DashScope API or processing file:', error);
        res.status(500).json({ message: error.message || 'Failed to extract information from image.' });
    }
});

app.post('/api/risk-analysis', async (req, res) => {
    console.log('Received a request to /api/risk-analysis');

    try {
        if (!process.env.REACT_APP_DASHSCOPE_API_KEY) {
            console.error('DashScope API key is missing.');
            return res.status(500).json({ message: 'Server configuration error: API key is missing.' });
        }

        const { remittanceData } = req.body;
        if (!remittanceData) {
            return res.status(400).json({ message: 'Remittance data is required.' });
        }

        console.log('Calling DashScope API for risk analysis...');
        const response = await openai.chat.completions.create({
            model: "qwen-vl-plus",
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `You are a senior risk analyst. Analyze the provided remittance data and return ONLY a single, raw JSON object with the specified structure. DO NOT include markdown, explanations, or any text outside the JSON object.

**Transaction Data:**
${JSON.stringify(remittanceData, null, 2)}

**Required JSON Output Structure:**
{
  "overallRiskLevel": "Low|Medium|High",
  "riskScore": <number 0-100>,
  "riskFactors": [ { "factor": "<string>", "reason": "<string>", "status": "pass|fail" } ],
  "recommendations": [ "<string>" ]
}`
                    },
                ]
            }]
        });

        const rawContent = response.choices[0].message.content;
        console.log('Raw DashScope API response for risk analysis:', rawContent);

        let extractedJson;
        try {
            // Attempt to parse the entire response directly
            extractedJson = JSON.parse(rawContent);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError, 'Raw content:', rawContent);
            // If direct parsing fails, try to find JSON within the string
            const jsonMatch = rawContent.match(/\{.*\}/s);
            if (jsonMatch && jsonMatch[0]) {
                try {
                    extractedJson = JSON.parse(jsonMatch[0]);
                } catch (nestedParseError) {
                    console.error('Failed to parse extracted JSON from raw content:', nestedParseError);
                    return res.status(500).json({ message: 'AI response was not valid JSON and could not be extracted.', raw: rawContent });
                }
            } else {
                 return res.status(500).json({ message: 'No valid JSON found in AI response.', raw: rawContent });
            }
        }

        // Final validation of the JSON structure
        if (!extractedJson.overallRiskLevel || typeof extractedJson.riskScore === 'undefined' || !Array.isArray(extractedJson.riskFactors) || !Array.isArray(extractedJson.recommendations)) {
            console.error('Parsed JSON is missing required fields or has incorrect types:', extractedJson);
            return res.status(500).json({ message: 'AI response is missing required data fields or has incorrect format.', raw: rawContent });
        }

        console.log('Successfully parsed risk analysis JSON:', extractedJson);
        res.json(extractedJson);

    } catch (error) {
        console.error('[GLOBAL CATCH] Error in /api/risk-analysis:', error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred during risk analysis.' });
    }
});

// The "catchall" handler: for any request that doesn't match one of the API routes,
// send back the React app's index.html file.
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});