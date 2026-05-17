import { Router, type IRouter } from "express";

const router: IRouter = Router();

const ALL_TIPS = [
  { id: "hydration", title: "Stay Hydrated", body: "Drink 8 glasses of water daily to prevent fatigue, improve cognition, and support kidney function.", category: "Nutrition", icon: "droplets" },
  { id: "sleep", title: "Prioritize Sleep", body: "Aim for 7-8 hours of quality sleep. Poor sleep is linked to weakened immunity and increased disease risk.", category: "Lifestyle", icon: "moon" },
  { id: "exercise", title: "Move Your Body", body: "30 minutes of moderate activity daily improves heart health, mood, and energy levels.", category: "Fitness", icon: "activity" },
  { id: "fruits", title: "Eat More Fruits & Vegetables", body: "Colorful produce is packed with antioxidants that help fight inflammation and chronic disease.", category: "Nutrition", icon: "apple" },
  { id: "stress", title: "Manage Stress", body: "Chronic stress elevates cortisol. Try deep breathing, meditation, or a 10-minute walk to reset.", category: "Mental Health", icon: "brain" },
  { id: "sunscreen", title: "Protect Your Skin", body: "Apply SPF 30+ sunscreen daily, even on cloudy days. UV exposure is the leading cause of skin cancer.", category: "Prevention", icon: "sun" },
  { id: "handwash", title: "Wash Your Hands", body: "Frequent handwashing for 20 seconds removes 99% of germs and prevents the spread of illness.", category: "Prevention", icon: "shield" },
  { id: "posture", title: "Mind Your Posture", body: "Poor posture causes neck and back pain. Check your sitting position every hour and adjust.", category: "Lifestyle", icon: "user" },
  { id: "breakfast", title: "Don't Skip Breakfast", body: "A nutritious breakfast kickstarts your metabolism and improves focus and memory throughout the day.", category: "Nutrition", icon: "sunrise" },
  { id: "screentime", title: "Reduce Screen Time Before Bed", body: "Blue light from screens suppresses melatonin. Put devices away 1 hour before sleep.", category: "Lifestyle", icon: "monitor" },
  { id: "checkup", title: "Schedule Regular Checkups", body: "Annual physical exams catch health issues early when they are easiest to treat.", category: "Prevention", icon: "stethoscope" },
  { id: "dental", title: "Don't Neglect Dental Health", body: "Brush twice daily and floss once. Poor oral health is linked to heart disease and diabetes.", category: "Prevention", icon: "smile" },
  { id: "alcohol", title: "Limit Alcohol Intake", body: "Excessive alcohol damages the liver, heart, and brain. Stick to recommended limits.", category: "Lifestyle", icon: "wine" },
  { id: "social", title: "Stay Socially Connected", body: "Strong social bonds reduce loneliness, lower stress, and are linked to longer lifespan.", category: "Mental Health", icon: "users" },
  { id: "breathing", title: "Practice Deep Breathing", body: "Box breathing (4-4-4-4 seconds) activates the parasympathetic nervous system and reduces anxiety.", category: "Mental Health", icon: "wind" },
  { id: "fiber", title: "Get Enough Fiber", body: "25-30g of dietary fiber daily supports gut health, controls blood sugar, and lowers cholesterol.", category: "Nutrition", icon: "leaf" },
  { id: "stretch", title: "Stretch Daily", body: "5-10 minutes of stretching improves flexibility, reduces injury risk, and relieves muscle tension.", category: "Fitness", icon: "zap" },
  { id: "outdoor", title: "Spend Time Outdoors", body: "Natural light regulates your circadian rhythm and vitamin D production, improving mood and sleep.", category: "Lifestyle", icon: "trees" },
  { id: "limit_sugar", title: "Reduce Added Sugar", body: "High sugar intake causes inflammation, weight gain, and increases diabetes risk. Read food labels.", category: "Nutrition", icon: "x-circle" },
  { id: "gratitude", title: "Practice Gratitude", body: "Writing 3 things you are grateful for daily is clinically shown to reduce depression and anxiety.", category: "Mental Health", icon: "heart" },
  { id: "snack_smart", title: "Snack Smart", body: "Choose nuts, fruit, or yogurt over processed snacks. Healthy snacks stabilize blood sugar.", category: "Nutrition", icon: "package" },
];

router.get("/tips/daily", (_req, res): void => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const startIdx = dayOfYear % ALL_TIPS.length;
  const tips = [];
  for (let i = 0; i < 3; i++) {
    tips.push(ALL_TIPS[(startIdx + i) % ALL_TIPS.length]);
  }
  res.json(tips);
});

export default router;
