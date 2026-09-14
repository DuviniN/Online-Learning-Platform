const { getOpenAIClient, getGroqClient } = require('../config/aiProviders');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');

const SYSTEM_PROMPT =
  'You are a course advisor for an online learning platform. Given a student\'s goal and a list of ' +
  'available courses, recommend the most relevant ones. Only recommend courses from the provided list — ' +
  'never invent courses that are not listed. Reply strictly as JSON in this shape: ' +
  '{"advice": string, "courseIds": string[]}. "advice" is 2-4 sentences of personalized guidance for the ' +
  'student. "courseIds" is an ordered list (most relevant first) of the ids of matching courses from the ' +
  'list — it may be an empty array if nothing in the catalog fits.';

async function requestCompletion(client, model, prompt, courseList) {
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Student goal: "${prompt.trim()}"\n\nAvailable courses:\n${courseList}` },
    ],
  });
  return completion.choices[0].message.content;
}

// @route POST /api/recommendations (student)
// Sends the student's goal + the current course catalog to an LLM and asks it
// to pick the most relevant courses from that catalog (never invent new ones).
// Tries OpenAI first; if it isn't configured, or the request fails for any
// reason (bad/expired key, quota exceeded, outage), transparently falls back
// to Groq so one provider's downtime doesn't take the feature down.
const getRecommendations = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'A prompt is required' });
  }

  const openai = getOpenAIClient();
  const groq = getGroqClient();

  if (!openai && !groq) {
    return res.status(503).json({ message: 'AI recommendations are not configured on the server yet' });
  }

  const courses = await Course.find().select('title description').lean();

  if (courses.length === 0) {
    return res.json({ advice: 'There are no courses available yet — check back soon.', recommendations: [] });
  }

  const courseList = courses
    .map((c) => `- id: ${c._id} | title: ${c.title} | description: ${c.description}`)
    .join('\n');

  let rawContent;

  if (openai) {
    try {
      rawContent = await requestCompletion(openai, process.env.OPENAI_MODEL || 'gpt-4o-mini', prompt, courseList);
    } catch (err) {
      console.error('OpenAI recommendation request failed, falling back to Groq if available:', err.message);
    }
  }

  if (!rawContent && groq) {
    try {
      rawContent = await requestCompletion(
        groq,
        process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
        prompt,
        courseList
      );
    } catch (err) {
      console.error('Groq recommendation request failed:', err.message);
    }
  }

  if (!rawContent) {
    return res.status(502).json({ message: 'AI recommendations are temporarily unavailable. Please try again shortly.' });
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    parsed = { advice: rawContent, courseIds: [] };
  }

  const courseIds = Array.isArray(parsed.courseIds) ? parsed.courseIds.map(String) : [];
  const byId = new Map(courses.map((c) => [String(c._id), c]));
  const recommendations = courseIds.map((id) => byId.get(id)).filter(Boolean);

  res.json({ advice: parsed.advice || '', recommendations });
});

module.exports = { getRecommendations };
