# AWS Cost Analysis for Perkins News Service (amplify-roark)

## Current Infrastructure Summary

### **AWS Services in Use:**
- **AWS Amplify**: App ID `d3cia60j16f4j7` (amplify-roark)
- **Amazon Cognito**: 2 User Pools with 3 total users
- **AWS AppSync**: 2 GraphQL APIs (different environments)
- **Amazon DynamoDB**: 18 tables (9 per environment)
- **AWS Lambda**: Multiple functions (512MB and 128MB memory)
- **AWS Key Management Service**: For encryption

### **Current Monthly Costs (November 2024):**
- **AWS Lambda**: $0.0001940583
- **Amazon DynamoDB**: $0.1322779375
- **AWS Key Management Service**: $0
- **Total Identified**: ~$0.13/month

*Note: Amplify, Cognito, AppSync, and CloudFront costs may be in the free tier or below reporting threshold*

## Cost Breakdown Analysis

### **1. Amazon Cognito (User Management)**
- **Current Users**: 3 users across 2 pools
- **Cost Structure**: 
  - Monthly Active Users (MAU): $0.0055 per user
  - Storage: $0.0055 per user per month
- **Current Cost**: ~$0.033/month (3 users × $0.011)
- **Per User Cost**: $0.011/month

### **2. Amazon DynamoDB (Database)**
- **Current Cost**: $0.1322779375/month
- **Tables**: 18 tables with 59 articles in main table
- **Storage**: ~52KB in Article table
- **Cost Structure**:
  - On-demand pricing: $1.25 per million reads, $6.25 per million writes
  - Storage: $0.25/GB/month
- **Per User Cost**: ~$0.044/month (assuming 3 users)

### **3. AWS Lambda (Serverless Functions)**
- **Current Cost**: $0.0001940583/month
- **Functions**: Multiple functions with 512MB and 128MB memory
- **Cost Structure**:
  - Requests: $0.20 per million requests
  - Compute: $0.0000166667 per GB-second
- **Per User Cost**: ~$0.000065/month

### **4. AWS AppSync (GraphQL API)**
- **Current Cost**: Likely in free tier (first 250,000 requests free)
- **Cost Structure**:
  - GraphQL requests: $4.00 per million requests
  - Real-time subscriptions: $2.00 per million subscription minutes
- **Per User Cost**: $0 (within free tier)

### **5. AWS Amplify (Hosting)**
- **Current Cost**: Likely in free tier
- **Cost Structure**:
  - Build minutes: $0.01 per build minute
  - Data transfer: $0.15/GB
- **Per User Cost**: $0 (within free tier)

### **6. Amazon CloudFront (CDN)**
- **Current Cost**: Likely in free tier (1TB transfer free)
- **Cost Structure**: $0.085/GB for data transfer
- **Per User Cost**: $0 (within free tier)

## **Current Per-User Cost Estimate**

### **For 3 Active Users:**
- **Cognito**: $0.011/user/month
- **DynamoDB**: $0.044/user/month
- **Lambda**: $0.000065/user/month
- **AppSync**: $0/user/month (free tier)
- **Amplify**: $0/user/month (free tier)
- **CloudFront**: $0/user/month (free tier)

**Total Current Per-User Cost: ~$0.055/user/month**

## **Projected Costs at Scale**

### **100 Users:**
- **Monthly Total**: ~$5.50
- **Per User**: $0.055

### **1,000 Users:**
- **Monthly Total**: ~$55
- **Per User**: $0.055

### **10,000 Users:**
- **Monthly Total**: ~$550
- **Per User**: $0.055

## **Cost Optimization Opportunities**

1. **DynamoDB Optimization**:
   - Consider on-demand vs provisioned capacity
   - Implement TTL for Article table to reduce storage costs
   - Optimize query patterns

2. **Lambda Optimization**:
   - Right-size memory allocation
   - Implement connection pooling
   - Use provisioned concurrency for predictable workloads

3. **AppSync Optimization**:
   - Monitor subscription usage
   - Implement request caching where possible

## **Key Findings**

1. **Very Low Current Costs**: Total monthly cost is only ~$0.13 for 3 users
2. **Scalable Architecture**: Per-user costs remain consistent at scale
3. **Free Tier Benefits**: Most services are within free tier limits
4. **DynamoDB is Main Cost Driver**: Represents ~99% of current costs

## **Recommendations**

1. **Monitor Usage Growth**: Set up CloudWatch alarms for cost thresholds
2. **Implement Cost Allocation Tags**: Better track costs by environment/feature
3. **Regular Cost Reviews**: Monthly cost analysis to identify trends
4. **Optimize DynamoDB**: Review table design and access patterns

## **Next Steps**

1. Monitor actual usage patterns over 30 days
2. Set up AWS Cost Anomaly Detection
3. Implement cost alerts at $10, $50, $100 monthly thresholds
4. Review and optimize DynamoDB table design
