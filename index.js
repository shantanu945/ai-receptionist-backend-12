import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Retell from 'retell-sdk';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const retellClient = new Retell({
    apiKey: process.env.RETELL_API_KEY,
});

app.post('/create-web-call', async (req, res) => {
    console.log('Received request to create web call');
    console.log('Agent ID:', process.env.RETELL_AGENT_ID);

    try {
        const webCallResponse = await retellClient.call.createWebCall({
            agent_id: process.env.RETELL_AGENT_ID,
        });
        console.log('Web call created successfully:', webCallResponse);
        res.status(201).send(webCallResponse);
    } catch (err) {
        console.error('Error creating web call:', err);
        console.error('Error details:', err.message);
        console.error('Error response:', err.response?.data);

        // Determine error type and send appropriate response
        if (err.message?.includes('ENOTFOUND') || err.message?.includes('Connection error')) {
            res.status(503).send({
                message: 'Network error: Unable to connect to Retell AI service',
                error: 'Connection error',
                details: 'Please check your internet connection and try again.'
            });
        } else if (err.status === 401 || err.status === 403) {
            res.status(err.status).send({
                message: 'Authentication error with Retell AI',
                error: 'Invalid API key',
                details: 'Please check your RETELL_API_KEY in the .env file.'
            });
        } else {
            res.status(500).send({
                message: 'Failed to create web call',
                error: err.message,
                details: err.response?.data || 'Unknown error occurred.'
            });
        }
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
