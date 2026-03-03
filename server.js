require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate-quiz', async (req, res) => {
    try {
        const { topic, difficulty, count } = req.body;

        // --- 2026 STABLE MODEL UPDATE ---
        // 'gemini-1.5-flash' is now retired. Use 'gemini-3-flash' or 'gemini-2.5-flash'.
        // We will also use the stable 'v1' endpoint.
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash" }, 
            { apiVersion: "v1" }
        );

        const prompt = `Generate a ${count} question quiz about ${topic} at ${difficulty} level. 
        Return ONLY a JSON array of objects. 
        Format: [{"question": "text", "choices": ["a", "b", "c", "d"], "answer": "correct_choice"}]
        Strictly no markdown backticks or explanations.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Safety: Clean any markdown blocks
        const cleanJson = text.replace(/```json|```/g, "").trim();

        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("--- SERVER ERROR ---");
        console.log("Error Message:", error.message);
        
        // If gemini-3 is too new for your key, try gemini-2.5-flash
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));