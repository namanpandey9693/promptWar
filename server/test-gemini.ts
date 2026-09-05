import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  console.log(`GEMINI_API_KEY:`);
  console.log(`- variable exists: ${!!key}`);
  console.log(`- length: ${key ? key.length : 0}`);
  
  if (!key) {
    console.error('No API key found in process.env');
    process.exit(1);
  }

  try {
    const client = new GoogleGenAI({ apiKey: key });
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Return exactly the word OK.',
    });
    console.log(`GEMINI DIRECT TEST STATUS: SUCCESS`);
    console.log(`Response text: ${response.text}`);
  } catch (err: any) {
    console.error(`GEMINI DIRECT TEST STATUS: FAIL`);
    console.error(`Status: ${err.status}`);
    console.error(`Error message: ${err.message}`);
    process.exit(1);
  }
}

testGemini();
