public with sharing class QAValidationDashboardController {

    @AuraEnabled(cacheable=true)
    public static List<QA_Review__c> getQAReviews() {
        return [
            SELECT Id, Name, Agent_Name__c, Channel__c, Review_Date__c,
                   Grader__c, Grader__r.Name,
                   Human_Build_Rapport__c, AI_Build_Rapport__c, Variance_Build_Rapport__c,
                   Human_Active_Listening__c, AI_Active_Listening__c, Variance_Active_Listening__c,
                   Human_Explain_Process__c, AI_Explain_Process__c, Variance_Explain_Process__c,
                   Human_Demonstrate_Knowledge__c, AI_Demonstrate_Knowledge__c, Variance_Demonstrate_Knowledge__c,
                   Human_Handle_Concerns__c, AI_Handle_Concerns__c, Variance_Handle_Concerns__c,
                   Human_Resolution__c, AI_Resolution__c, Variance_Resolution__c,
                   Human_Confirm_Next_Steps__c, AI_Confirm_Next_Steps__c, Variance_Confirm_Next_Steps__c,
                   Human_Total_Score__c, AI_Total_Score__c, Total_Variance__c,
                   Within_Threshold__c, AI_Coaching_Insights__c, Grader_Notes__c
            FROM QA_Review__c
            ORDER BY Review_Date__c DESC
            LIMIT 500
        ];
    }
}