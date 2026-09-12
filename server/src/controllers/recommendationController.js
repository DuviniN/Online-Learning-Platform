const openai = require('../config/openai');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/recommendations (student)
// Sends the student's goal + the current course catalog to GPT and asks it to
// pick the most relevant courses from that catalog (never invent new ones).
const getRecommendations = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'A prompt is required' });
  }

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your-')) {
    return res.status(503).json({ message: 'AI recommendations are not configured on the server yet' });
  }

  const courses = await Course.find().select('title description').lean();

  if (courses.length === 0) {
    return res.json({ advice: 'There are no courses available yet — check back soon.', recommendations: [] });
  }

  const courseList = courses
    .map((c) => `- id: ${c._id} | title: ${c.title} | description: ${c.description}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a course advisor for an online learning platform. Given a student\'s goal and a list of ' +
          'available courses, recommend the most relevant ones. Only recommend courses from the provided list — ' +
          'never invent courses that are not listed. Reply strictly as JSON in this shape: ' +
          '{"advice": string, "courseIds": string[]}. "advice" is 2-4 sentences of personalized guidance for the ' +
          'student. "courseIds" is an ordered list (most relevant first) of the ids of matching courses from the ' +
          'list — it may be an empty array if nothing in the catalog fits.',
      },
      {
        role: 'user',
        content: `Student goal: "${prompt.trim()}"\n\nAvailable courses:\n${courseList}`,
      },
    ],
  });

  let parsed;
  try {
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch {
    parsed = { advice: completion.choices[0].message.content, courseIds: [] };
  }

  const courseIds = Array.isArray(parsed.courseIds) ? parsed.courseIds.map(String) : [];
  const byId = new Map(courses.map((c) => [String(c._id), c]));
  const recommendations = courseIds.map((id) => byId.get(id)).filter(Boolean);

  res.json({ advice: parsed.advice || '', recommendations });
});

module.exports = { getRecommendations };
