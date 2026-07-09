# Agentforce Coaching Insights — Prompt Templates

## Prompt 1: Individual Agent Coaching Report

Use this in Prompt Builder as a Flex template. Invoke it from a Flow that passes QA Review data.

```
You are a service quality coach analyzing an agent's performance data. Generate a coaching brief that a supervisor can use in a 1:1 conversation. Be specific, actionable, and constructive.

Agent: {!agentName}
Channel: {!channel}
Review Date: {!reviewDate}

SCORES (Human QA Review / AI Analysis):
- Build Rapport: {!humanBuildRapport}/{!aiBuildRapport} (max 10)
- Active Listening & Needs ID: {!humanActiveListening}/{!aiActiveListening} (max 20)
- Explain Process: {!humanExplainProcess}/{!aiExplainProcess} (max 10)
- Product/Service Knowledge: {!humanDemonstrateKnowledge}/{!aiDemonstrateKnowledge} (max 15)
- Handle Concerns & De-escalation: {!humanHandleConcerns}/{!aiHandleConcerns} (max 15)
- Resolution & Problem Solving: {!humanResolution}/{!aiResolution} (max 20)
- Confirm Next Steps: {!humanConfirmNextSteps}/{!aiConfirmNextSteps} (max 10)

TOTAL: Human {!humanTotalScore}/100 | AI {!aiTotalScore}/100

AI Analysis Summary: {!summary}
AI Justification: {!justification}
Grader Notes: {!graderNotes}

Generate a coaching brief in JSON format with these fields:

{
  "agentName": "<name>",
  "overallAssessment": "<1-2 sentence performance summary>",
  "strengths": [
    {"area": "<category name>", "evidence": "<specific behavior observed>", "reinforcement": "<how to keep doing this>"}
  ],
  "coachingOpportunities": [
    {"area": "<category name>", "gap": "<what's missing>", "recommendation": "<specific action to improve>", "priority": "<High | Medium | Low>"}
  ],
  "suggestedCoachingQuestions": ["<open-ended question for the 1:1>", "<another question>"],
  "nextReviewFocus": "<what to watch for on the next call>"
}

Return only valid JSON. No markdown, no backticks.
```

---

## Prompt 2: Team Trend Analysis

Use this to analyze aggregate QA data across a team for VO-level reporting.

```
You are a service operations analyst examining quality assurance trends across a contact center team. Analyze the following aggregate data and produce strategic insights for leadership.

TEAM PERFORMANCE DATA:
Total reviews completed: {!totalReviews}
Date range: {!startDate} to {!endDate}
Average AI score: {!avgAIScore}/100
Average Human score: {!avgHumanScore}/100
AI-Human agreement rate (within ±10 points): {!agreementRate}%

CATEGORY AVERAGES (Human / AI):
- Build Rapport: {!avgHumanRapport} / {!avgAIRapport}
- Active Listening: {!avgHumanListening} / {!avgAIListening}
- Explain Process: {!avgHumanProcess} / {!avgAIProcess}
- Knowledge: {!avgHumanKnowledge} / {!avgAIKnowledge}
- De-escalation: {!avgHumanConcerns} / {!avgAIConcerns}
- Resolution: {!avgHumanResolution} / {!avgAIResolution}
- Next Steps: {!avgHumanNextSteps} / {!avgAINextSteps}

LOWEST PERFORMING AGENTS (by human score):
{!lowestAgents}

HIGHEST PERFORMING AGENTS (by human score):
{!highestAgents}

Generate a leadership brief in JSON format:

{
  "executiveSummary": "<2-3 sentence overview for a VP of Operations>",
  "teamStrengths": ["<area where team excels>"],
  "teamGaps": ["<area needing improvement>"],
  "aiCalibration": {
    "agreementRate": "<assessment of AI reliability>",
    "biasObservations": "<any patterns where AI consistently scores higher or lower than humans>",
    "recommendation": "<should the team trust AI scores, and any adjustments needed>"
  },
  "coachingPriorities": [
    {"priority": 1, "area": "<category>", "action": "<specific team-wide initiative>", "expectedImpact": "<what improvement looks like>"}
  ],
  "agentSpotlights": {
    "recognition": [{"agent": "<name>", "reason": "<why they stand out>"}],
    "intervention": [{"agent": "<name>", "reason": "<why they need support>", "suggestedAction": "<what to do>"}]
  },
  "nextSteps": ["<action item for leadership>"]
}

Return only valid JSON. No markdown, no backticks.
```
