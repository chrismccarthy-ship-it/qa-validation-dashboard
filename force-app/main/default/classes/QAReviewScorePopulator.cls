public class QAReviewScorePopulator {

    @InvocableMethod(
        label='Populate AI Scores on QA Review'
        description='Reads the Service_Quality_Analysis__c JSON from the related Voice Call or Messaging Session and populates AI score fields on the QA Review record.'
    )
    public static List<Result> populateScores(List<Request> requests) {
        List<Result> results = new List<Result>();

        for (Request req : requests) {
            Result res = new Result();
            try {
                String jsonData = req.analysisJson;
                if (String.isBlank(jsonData)) {
                    res.success = false;
                    res.errorMessage = 'No analysis JSON provided';
                    results.add(res);
                    continue;
                }

                String cleaned = jsonData.replaceAll('```json', '').replaceAll('```', '').trim();
                Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(cleaned);
                Map<String, Object> alignment = (Map<String, Object>) parsed.get('ServiceQualityAlignment');
                Map<String, Object> effectiveness = (Map<String, Object>) parsed.get('RepEffectivenessScore');

                // Extract category scores
                res.aiBuildRapport = getPoints(alignment, 'BuildRapport');
                res.aiActiveListening = getPoints(alignment, 'ActiveListeningAndNeedsIdentification');
                res.aiExplainProcess = getPoints(alignment, 'ExplainProcess');
                res.aiDemonstrateKnowledge = getPoints(alignment, 'DemonstrateKnowledge');
                res.aiHandleConcerns = getPoints(alignment, 'HandleConcernsAndDeescalation');
                res.aiResolution = getPoints(alignment, 'ResolutionAndProblemSolving');
                res.aiConfirmNextSteps = getPoints(alignment, 'ConfirmNextSteps');

                // Extract total score
                if (effectiveness != null && effectiveness.containsKey('score')) {
                    Object scoreObj = effectiveness.get('score');
                    res.aiTotalScore = scoreObj instanceof Integer
                        ? (Decimal) ((Integer) scoreObj)
                        : (Decimal) scoreObj;
                }

                // Extract coaching context
                if (parsed.containsKey('Summary')) {
                    res.summary = (String) parsed.get('Summary');
                }
                if (effectiveness != null && effectiveness.containsKey('justification')) {
                    res.justification = (String) effectiveness.get('justification');
                }

                res.success = true;
            } catch (Exception e) {
                res.success = false;
                res.errorMessage = e.getMessage();
            }
            results.add(res);
        }
        return results;
    }

    private static Decimal getPoints(Map<String, Object> alignment, String key) {
        if (alignment == null || !alignment.containsKey(key)) return 0;
        Map<String, Object> category = (Map<String, Object>) alignment.get(key);
        if (category == null || !category.containsKey('pointsAwarded')) return 0;
        Object pts = category.get('pointsAwarded');
        if (pts instanceof Integer) return (Decimal) ((Integer) pts);
        if (pts instanceof Decimal) return (Decimal) pts;
        return 0;
    }

    public class Request {
        @InvocableVariable(label='Analysis JSON' required=true)
        public String analysisJson;
    }

    public class Result {
        @InvocableVariable(label='Success')
        public Boolean success;
        @InvocableVariable(label='Error Message')
        public String errorMessage;
        @InvocableVariable(label='AI Build Rapport')
        public Decimal aiBuildRapport;
        @InvocableVariable(label='AI Active Listening')
        public Decimal aiActiveListening;
        @InvocableVariable(label='AI Explain Process')
        public Decimal aiExplainProcess;
        @InvocableVariable(label='AI Demonstrate Knowledge')
        public Decimal aiDemonstrateKnowledge;
        @InvocableVariable(label='AI Handle Concerns')
        public Decimal aiHandleConcerns;
        @InvocableVariable(label='AI Resolution')
        public Decimal aiResolution;
        @InvocableVariable(label='AI Confirm Next Steps')
        public Decimal aiConfirmNextSteps;
        @InvocableVariable(label='AI Total Score')
        public Decimal aiTotalScore;
        @InvocableVariable(label='Summary')
        public String summary;
        @InvocableVariable(label='Justification')
        public String justification;
    }
}
