# Service Quality Validation Dashboard

AI-powered QA validation system for Salesforce Service Cloud. Compares human grader scores against Einstein AI scores across voice calls and messaging sessions, surfaces coaching opportunities, and provides VO-level analytics.

## What It Does

- **Validates AI accuracy** — Side-by-side comparison of human QA scores vs Einstein AI scores across 7 weighted service quality standards
- **Surfaces coaching opportunities** — Automatically identifies agents performing below threshold and flags their weakest categories
- **Tracks AI calibration** — Detects systemic bias where AI consistently scores higher or lower than human graders
- **Drives 1:1 coaching** — Agentforce prompt templates generate agent-specific coaching briefs with strengths, gaps, and suggested questions
- **Executive reporting** — VO-level dashboard with KPI cards, agreement rates, agent leaderboard, and trend analysis

## Architecture

```
Human QA Grader creates QA_Review__c
        │
        ├── Enters scores for 7 categories manually
        │
        ▼
Record-Triggered Flow
        │
        ├── Reads Service_Quality_Analysis__c from related VoiceCall/MessagingSession
        ├── Calls QAReviewScorePopulator (Apex) to parse AI scores from JSON
        ├── Populates AI score fields, computes variances
        └── Sets Within_Threshold flag (±10 points)
        │
        ▼
QA Validation Dashboard (LWC)
        │
        ├── AI-Human Agreement Rate
        ├── Score Comparison by Category
        ├── Agent Leaderboard with Status
        ├── Coaching Opportunities
        └── AI Calibration Bias Detection
```

## Scoring Standards (100 points total)

| Standard | Points | Weight |
|----------|--------|--------|
| Build Rapport | 10 | 10% |
| Active Listening & Needs ID | 20 | 20% |
| Explain Process | 10 | 10% |
| Product/Service Knowledge | 15 | 15% |
| Handle Concerns & De-escalation | 15 | 15% |
| Resolution & Problem Solving | 20 | 20% |
| Confirm Next Steps | 10 | 10% |

## Package Contents

### Deploys Automatically

| Component | Type | Description |
|-----------|------|-------------|
| `QA_Review__c` | Custom Object | 33 fields — human scores, AI scores, variance, metadata |
| `QAReviewScorePopulator` | Apex Class | Invocable action that parses AI scores from JSON |
| `QAValidationDashboardController` | Apex Class | SOQL controller for the dashboard LWC |
| `qaValidationDashboard` | LWC | VO-level dashboard with KPIs, comparisons, leaderboard |
| `QA_Validation_Dashboard` | Permission Set | Object + field + Apex access |

### Requires Manual Setup

| Component | Description |
|-----------|-------------|
| Agentforce Prompt Templates | Individual coaching + team trend analysis (see `AGENTFORCE-PROMPTS.md`) |
| Record-Triggered Flow | Auto-populates AI scores when a QA Review is created |

## Prerequisites

This solution works alongside the **Service Quality Scorecard** package, which provides:
- `Service_Quality_Analysis__c` field on VoiceCall and MessagingSession
- `serviceQualityScorecard` LWC for per-interaction scorecards
- `ServiceQualityScoreParser` Apex class
- Einstein prompt template for transcript analysis
- Record-triggered flows for automatic analysis

Install the scorecard package first, then deploy this validation layer on top.

## Deployment

```powershell
# Clone the repo
git clone https://github.com/chrismccarthy-ship-it/qa-validation-dashboard.git
cd qa-validation-dashboard

# Authorize your org
sf org login web --set-default

# Deploy
sf project deploy start --source-dir force-app --ignore-conflicts

# Assign permission set
sf org assign permset --name QA_Validation_Dashboard
```

## Post-Deploy Setup

### 1. Build the QA Review Flow

Create a Record-Triggered Flow on `QA_Review__c`:

1. **Trigger:** Record is created or updated
2. **Entry Condition:** `Human_Total_Score__c` is not null
3. **Get Records:** Fetch the related VoiceCall or MessagingSession to get `Service_Quality_Analysis__c`
4. **Action:** Invoke `Populate AI Scores on QA Review` with the JSON
5. **Update Record:** Write AI scores, compute variances, set threshold flag

### 2. Create Agentforce Prompt Templates

See `AGENTFORCE-PROMPTS.md` for two ready-to-paste prompts:
- **Individual Agent Coaching Report** — for 1:1 conversations
- **Team Trend Analysis** — for VO-level leadership briefs

### 3. Add Dashboard to App Page

1. Create a new **Lightning App Page** (e.g., "Service Quality Operations")
2. Drag **QA Validation Dashboard** onto the page
3. Save and add to your Service Console navigation

## QA Review Fields

### Human Scores (entered by QA grader)
`Human_Build_Rapport__c` · `Human_Active_Listening__c` · `Human_Explain_Process__c` · `Human_Demonstrate_Knowledge__c` · `Human_Handle_Concerns__c` · `Human_Resolution__c` · `Human_Confirm_Next_Steps__c` · `Human_Total_Score__c`

### AI Scores (auto-populated from JSON)
`AI_Build_Rapport__c` · `AI_Active_Listening__c` · `AI_Explain_Process__c` · `AI_Demonstrate_Knowledge__c` · `AI_Handle_Concerns__c` · `AI_Resolution__c` · `AI_Confirm_Next_Steps__c` · `AI_Total_Score__c`

### Variance (AI - Human)
`Variance_Build_Rapport__c` · `Variance_Active_Listening__c` · `Variance_Explain_Process__c` · `Variance_Demonstrate_Knowledge__c` · `Variance_Handle_Concerns__c` · `Variance_Resolution__c` · `Variance_Confirm_Next_Steps__c` · `Total_Variance__c`

### Metadata
`Voice_Call__c` · `Messaging_Session__c` · `Agent_Name__c` · `Grader__c` · `Review_Date__c` · `Channel__c` · `Within_Threshold__c` · `AI_Coaching_Insights__c` · `Grader_Notes__c`

## License

MIT
