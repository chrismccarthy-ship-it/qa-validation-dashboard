import { LightningElement, wire, track } from 'lwc';
import getQAReviews from '@salesforce/apex/QAValidationDashboardController.getQAReviews';

const CATEGORIES = [
    { key: 'BuildRapport', label: 'Build Rapport', humanField: 'Human_Build_Rapport__c', aiField: 'AI_Build_Rapport__c', max: 10 },
    { key: 'ActiveListening', label: 'Active Listening & Needs ID', humanField: 'Human_Active_Listening__c', aiField: 'AI_Active_Listening__c', max: 20 },
    { key: 'ExplainProcess', label: 'Explain Process', humanField: 'Human_Explain_Process__c', aiField: 'AI_Explain_Process__c', max: 10 },
    { key: 'DemonstrateKnowledge', label: 'Product/Service Knowledge', humanField: 'Human_Demonstrate_Knowledge__c', aiField: 'AI_Demonstrate_Knowledge__c', max: 15 },
    { key: 'HandleConcerns', label: 'Handle Concerns & De-escalation', humanField: 'Human_Handle_Concerns__c', aiField: 'AI_Handle_Concerns__c', max: 15 },
    { key: 'Resolution', label: 'Resolution & Problem Solving', humanField: 'Human_Resolution__c', aiField: 'AI_Resolution__c', max: 20 },
    { key: 'ConfirmNextSteps', label: 'Confirm Next Steps', humanField: 'Human_Confirm_Next_Steps__c', aiField: 'AI_Confirm_Next_Steps__c', max: 10 }
];

export default class QaValidationDashboard extends LightningElement {
    @track reviews = [];
    @track isLoading = true;
    @track errorMessage = null;

    @wire(getQAReviews)
    wiredReviews({ data, error }) {
        this.isLoading = false;
        if (data) {
            this.reviews = data;
            this.errorMessage = null;
        } else if (error) {
            this.errorMessage = 'Failed to load QA review data: ' + (error.body ? error.body.message : error.message);
        }
    }

    get hasData() {
        return this.reviews.length > 0 && !this.isLoading && !this.errorMessage;
    }

    get showNoData() {
        return this.reviews.length === 0 && !this.isLoading && !this.errorMessage;
    }

    get reviewCount() {
        return this.reviews.length;
    }

    // ── KPI Calculations ──

    get avgHumanScore() {
        if (!this.reviews.length) return 0;
        const sum = this.reviews.reduce((acc, r) => acc + (r.Human_Total_Score__c || 0), 0);
        return Math.round(sum / this.reviews.length);
    }

    get avgAIScore() {
        if (!this.reviews.length) return 0;
        const sum = this.reviews.reduce((acc, r) => acc + (r.AI_Total_Score__c || 0), 0);
        return Math.round(sum / this.reviews.length);
    }

    get avgVariance() {
        const diff = this.avgAIScore - this.avgHumanScore;
        return (diff >= 0 ? '+' : '') + diff;
    }

    get varianceClass() {
        const diff = Math.abs(this.avgAIScore - this.avgHumanScore);
        if (diff <= 5) return 'kpi-value kpi-green';
        if (diff <= 10) return 'kpi-value kpi-amber';
        return 'kpi-value kpi-red';
    }

    get agreementRate() {
        if (!this.reviews.length) return 0;
        const within = this.reviews.filter(r => {
            const diff = Math.abs((r.AI_Total_Score__c || 0) - (r.Human_Total_Score__c || 0));
            return diff <= 10;
        }).length;
        return Math.round((within / this.reviews.length) * 100);
    }

    get agreementClass() {
        const rate = this.agreementRate;
        if (rate >= 90) return 'kpi-value kpi-green';
        if (rate >= 75) return 'kpi-value kpi-amber';
        return 'kpi-value kpi-red';
    }

    // ── Category Comparison ──

    get categoryComparison() {
        return CATEGORIES.map(cat => {
            const humanSum = this.reviews.reduce((acc, r) => acc + (r[cat.humanField] || 0), 0);
            const aiSum = this.reviews.reduce((acc, r) => acc + (r[cat.aiField] || 0), 0);
            const count = this.reviews.length || 1;
            const humanAvg = (humanSum / count).toFixed(1);
            const aiAvg = (aiSum / count).toFixed(1);
            const humanPct = Math.round((humanAvg / cat.max) * 100);
            const aiPct = Math.round((aiAvg / cat.max) * 100);

            return {
                key: cat.key,
                label: cat.label,
                humanAvg,
                aiAvg,
                max: cat.max,
                humanBarStyle: `width: ${humanPct}%`,
                aiBarStyle: `width: ${aiPct}%`
            };
        });
    }

    // ── Agent Leaderboard ──

    get agentLeaderboard() {
        const agentMap = {};
        this.reviews.forEach(r => {
            const name = r.Agent_Name__c || 'Unknown';
            if (!agentMap[name]) {
                agentMap[name] = { humanScores: [], aiScores: [] };
            }
            agentMap[name].humanScores.push(r.Human_Total_Score__c || 0);
            agentMap[name].aiScores.push(r.AI_Total_Score__c || 0);
        });

        return Object.keys(agentMap)
            .map(name => {
                const data = agentMap[name];
                const humanAvg = Math.round(data.humanScores.reduce((a, b) => a + b, 0) / data.humanScores.length);
                const aiAvg = Math.round(data.aiScores.reduce((a, b) => a + b, 0) / data.aiScores.length);
                const variance = aiAvg - humanAvg;
                let status = 'On Track';
                let statusClass = 'status-badge status-good';
                if (humanAvg < 60) {
                    status = 'Needs Coaching';
                    statusClass = 'status-badge status-alert';
                } else if (humanAvg < 75) {
                    status = 'Developing';
                    statusClass = 'status-badge status-warn';
                }

                return {
                    name,
                    reviewCount: data.humanScores.length,
                    humanAvg,
                    aiAvg,
                    variance: (variance >= 0 ? '+' : '') + variance,
                    varianceClass: Math.abs(variance) <= 5 ? 'td-variance-ok' : 'td-variance-flag',
                    status,
                    statusClass
                };
            })
            .sort((a, b) => b.humanAvg - a.humanAvg);
    }

    // ── Coaching Opportunities ──

    get coachingOpportunities() {
        const opps = [];
        const agentMap = {};

        this.reviews.forEach(r => {
            const name = r.Agent_Name__c || 'Unknown';
            if (!agentMap[name]) agentMap[name] = [];
            agentMap[name].push(r);
        });

        Object.keys(agentMap).forEach(name => {
            const agentReviews = agentMap[name];
            let worstCategory = null;
            let worstPct = 100;

            CATEGORIES.forEach(cat => {
                const avg = agentReviews.reduce((acc, r) => acc + (r[cat.humanField] || 0), 0) / agentReviews.length;
                const pct = (avg / cat.max) * 100;
                if (pct < worstPct) {
                    worstPct = pct;
                    worstCategory = { label: cat.label, score: avg.toFixed(1), max: cat.max };
                }
            });

            if (worstPct < 60) {
                const humanAvg = Math.round(
                    agentReviews.reduce((acc, r) => acc + (r.Human_Total_Score__c || 0), 0) / agentReviews.length
                );
                let priority = 'Medium';
                let priorityClass = 'priority-badge priority-medium';
                if (worstPct < 30) {
                    priority = 'High';
                    priorityClass = 'priority-badge priority-high';
                }

                opps.push({
                    key: name,
                    agentName: name,
                    weakestCategory: worstCategory.label,
                    weakestScore: worstCategory.score,
                    maxPoints: worstCategory.max,
                    priority,
                    priorityClass,
                    detail: `Overall human score: ${humanAvg}/100. Weakest category at ${Math.round(worstPct)}% of max points.`
                });
            }
        });

        return opps.sort((a, b) => {
            const order = { High: 0, Medium: 1, Low: 2 };
            return order[a.priority] - order[b.priority];
        });
    }

    get hasCoachingOpps() {
        return this.coachingOpportunities.length > 0;
    }

    // ── AI Calibration ──

    get aiHigherCategories() {
        return this._getCalibrationCategories('higher');
    }

    get aiLowerCategories() {
        return this._getCalibrationCategories('lower');
    }

    get hasAIHigher() {
        return this.aiHigherCategories.length > 0;
    }

    get hasAILower() {
        return this.aiLowerCategories.length > 0;
    }

    _getCalibrationCategories(direction) {
        const count = this.reviews.length || 1;
        return CATEGORIES
            .map(cat => {
                const humanAvg = this.reviews.reduce((acc, r) => acc + (r[cat.humanField] || 0), 0) / count;
                const aiAvg = this.reviews.reduce((acc, r) => acc + (r[cat.aiField] || 0), 0) / count;
                const delta = aiAvg - humanAvg;
                return { key: cat.key, label: cat.label, delta: Math.abs(delta).toFixed(1), rawDelta: delta };
            })
            .filter(c => direction === 'higher' ? c.rawDelta > 1 : c.rawDelta < -1)
            .sort((a, b) => Math.abs(b.rawDelta) - Math.abs(a.rawDelta));
    }

    handleRefresh() {
        this.isLoading = true;
        // Re-trigger the wire by using refreshApex or navigation
        window.location.reload();
    }
}
