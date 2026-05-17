import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  AnalyzeSymptomsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SYMPTOM_LIST = [
  { id: "headache", label: "Headache", category: "Head & Neck" },
  { id: "fever", label: "Fever", category: "General" },
  { id: "cough", label: "Cough", category: "Respiratory" },
  { id: "sore_throat", label: "Sore Throat", category: "Head & Neck" },
  { id: "fatigue", label: "Fatigue", category: "General" },
  { id: "nausea", label: "Nausea", category: "Digestive" },
  { id: "vomiting", label: "Vomiting", category: "Digestive" },
  { id: "diarrhea", label: "Diarrhea", category: "Digestive" },
  { id: "stomach_pain", label: "Stomach Pain", category: "Digestive" },
  { id: "chest_pain", label: "Chest Pain", category: "Chest" },
  { id: "shortness_of_breath", label: "Shortness of Breath", category: "Respiratory" },
  { id: "runny_nose", label: "Runny Nose", category: "Respiratory" },
  { id: "congestion", label: "Congestion", category: "Respiratory" },
  { id: "sneezing", label: "Sneezing", category: "Respiratory" },
  { id: "body_aches", label: "Body Aches", category: "Musculoskeletal" },
  { id: "joint_pain", label: "Joint Pain", category: "Musculoskeletal" },
  { id: "back_pain", label: "Back Pain", category: "Musculoskeletal" },
  { id: "dizziness", label: "Dizziness", category: "Neurological" },
  { id: "rash", label: "Rash", category: "Skin" },
  { id: "itching", label: "Itching", category: "Skin" },
  { id: "swelling", label: "Swelling", category: "General" },
  { id: "chills", label: "Chills", category: "General" },
  { id: "night_sweats", label: "Night Sweats", category: "General" },
  { id: "loss_of_appetite", label: "Loss of Appetite", category: "General" },
  { id: "frequent_urination", label: "Frequent Urination", category: "Urinary" },
  { id: "painful_urination", label: "Painful Urination", category: "Urinary" },
  { id: "anxiety", label: "Anxiety", category: "Mental Health" },
  { id: "depression", label: "Depression", category: "Mental Health" },
  { id: "insomnia", label: "Insomnia", category: "Sleep" },
  { id: "eye_pain", label: "Eye Pain", category: "Eyes" },
  { id: "blurred_vision", label: "Blurred Vision", category: "Eyes" },
  { id: "ear_pain", label: "Ear Pain", category: "Head & Neck" },
  { id: "heart_palpitations", label: "Heart Palpitations", category: "Chest" },
  { id: "numbness", label: "Numbness or Tingling", category: "Neurological" },
  { id: "weakness", label: "Weakness", category: "General" },
  { id: "abdominal_pain", label: "Abdominal Pain", category: "Digestive" },
  { id: "bloating", label: "Bloating", category: "Digestive" },
  { id: "weight_loss", label: "Unexplained Weight Loss", category: "General" },
  { id: "weight_gain", label: "Unexplained Weight Gain", category: "General" },
];

router.get("/symptoms/suggestions", async (req, res): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q.toLowerCase() : "";
  const filtered = q
    ? SYMPTOM_LIST.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
    : SYMPTOM_LIST;
  res.json(filtered.slice(0, 20));
});

router.post("/symptoms/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeSymptomsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { symptoms, duration, ageRange, severity, additionalNotes } = parsed.data;

  const durationLabel: Record<string, string> = {
    few_hours: "a few hours",
    one_day: "about 1 day",
    several_days: "several days",
    one_week_plus: "1 week or more",
    chronic: "chronically / long-term",
  };

  const systemPrompt = `You are VitaSense AI, an educational health guidance assistant.
You provide general wellness information for educational purposes only.
IMPORTANT: You do NOT diagnose. Use language like "may be associated with", "possible related conditions", "educational purposes only".
Never claim definitive diagnosis. Always recommend consulting a healthcare professional.
Respond ONLY with valid JSON matching the exact schema provided.`;

  const userPrompt = `Patient profile:
- Symptoms: ${symptoms.join(", ")}
- Duration: ${durationLabel[duration] ?? duration}
- Age range: ${ageRange}
- Severity: ${severity}
${additionalNotes ? `- Additional notes: ${additionalNotes}` : ""}

Provide educational health guidance in this exact JSON format:
{
  "urgencyLevel": "mild_concern" | "moderate_concern" | "seek_medical_attention" | "emergency_care",
  "urgencyLabel": "human-readable label e.g. 'Mild Concern'",
  "summary": "1-2 sentence educational overview",
  "possibleConditions": [
    {
      "name": "condition name",
      "description": "brief educational description",
      "likelihood": 75,
      "commonCauses": ["cause1", "cause2"],
      "riskFactors": ["factor1", "factor2"],
      "basicApproaches": ["general approach1", "approach2"]
    }
  ],
  "lifestyleAdvice": ["advice1", "advice2", "advice3"],
  "whenToSeeDoctor": ["warning sign1", "warning sign2"],
  "disclaimer": "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."
}

Include 3-4 possible related conditions. Each must have a "likelihood" integer (0-100) representing how likely it is given the symptoms — rank them from highest to lowest likelihood. Keep language educational and non-diagnostic.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);

    // Ensure conditions are sorted by likelihood descending
    if (Array.isArray(result.possibleConditions)) {
      result.possibleConditions.sort(
        (a: { likelihood: number }, b: { likelihood: number }) =>
          (b.likelihood ?? 0) - (a.likelihood ?? 0)
      );
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "AI analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
