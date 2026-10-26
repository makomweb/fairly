# AWS Deployment Guide: Fairly

> **Status**: 🚧 Work in Progress  
> **Branch**: `aws-deployment-guide`  
> **Last Updated**: 2026-10-26

---

## 📋 Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [AWS Services Selection](#aws-services-selection)
3. [Migration Phases](#migration-phases)
4. [Implementation Steps](#implementation-steps)
5. [Cost Estimation](#cost-estimation)
6. [Monitoring & Observability](#monitoring--observability)
7. [Security & Compliance](#security--compliance)

---

## Overview & Architecture

### Current Architecture (Kubernetes)
```
┌─────────────────────────────────────────────────────┐
│          Kubernetes Cluster (Self-managed)          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  nginx (web) ──→ PHP-FPM (app) ─┬─→ MySQL           │
│                                 └─→ Worker (async)  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Target AWS Architecture
```
┌────────────────────────────────────────────────────────────────┐
│                    AWS Cloud                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Route 53 (DNS)                                                │
│      │                                                         │
│      ├─→ ALB (Application Load Balancer)                       │
│      │       │                                                 │
│      │       └─→ ECS Fargate (App: nginx + PHP-FPM)            │
│      │                └─→ Auto Scaling (CPU/Memory)            │
│      │                                                         │
│      └─→ CloudFront (CDN) ──→ S3 (React SPA)                   │
│                                                                │
│  SQS Queue (Messenger async)                                   │
│      │                                                         │
│      └─→ ECS Fargate Task (Worker)                             │
│                                                                │
│  RDS Aurora MySQL (Serverless v2)                              │
│      └─→ Event Store + Sessions + App Data                     │
│                                                                │
│  CloudWatch (Logs & Metrics)                                   │
│  ACM (SSL Certificates)                                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## AWS Services Selection

### ✅ Recommended Services

| Component | AWS Service | Rationale | Notes |
|-----------|-------------|-----------|-------|
| **Compute (App)** | ECS Fargate | Containerized, no infra mgmt, ideal for Symfony | Not Lambda (long-running + Messenger) |
| **Compute (Worker)** | ECS Fargate Task | Process async messages, one-shot pattern | Or: Bref + Lambda (SQS trigger) for serverless |
| **Database** | RDS Aurora MySQL | MySQL 8 compatible, Aurora Serverless v2 | Auto-scaling, encrypted, automated backups |
| **Async Queue** | AWS SQS | Native AWS service, integrates with Symfony | Replace internal queue transport |
| **Frontend** | S3 + CloudFront | Static SPA hosting, global CDN | Standard for React apps |
| **DNS** | Route 53 | AWS native, alias records, health checks | Simplifies domain management |
| **SSL/TLS** | AWS Certificate Manager | Free, auto-renewal, AWS integrated | Certificates for ALB + CloudFront |
| **Logging** | CloudWatch | Centralized logs from ECS, RDS, Lambda | Integrate with Grafana Alloy |
| **Monitoring** | CloudWatch + X-Ray | Metrics, traces, dashboards | Optional: DataDog, New Relic |

### ❌ Not Recommended

| Service | Why | Alternative |
|---------|-----|-------------|
| **Lambda** (PHP backend) | Cold starts, timeout limits, stateless only | ECS Fargate |
| **Bref** (Symfony on Lambda) | Works for sync HTTP, but async Messenger = complexity | ECS Fargate + SQS |
| **DynamoDB** | Overkill, you have structured relational data | Aurora MySQL |
| **ElastiCache** | Session management via MySQL is simpler | MySQL Sessions |

---

## Migration Phases

### **Phase 1: Preparation & Setup** ⏱️ ~2-3h
- [ ] AWS Account setup (IAM, VPC, security groups)
- [ ] Container registry: Push images to ECR
- [ ] Domain & SSL certificate in ACM
- [ ] Database backup strategy

**Artifacts:**
- ECR repositories for: `fairly-app`, `fairly-worker`, `fairly-web` (nginx)
- ACM certificate for `yourdomain.com`

---

### **Phase 2: Database Migration** ⏱️ ~1-2h
- [ ] Provision RDS Aurora MySQL Serverless v2
- [ ] Restore/migrate MySQL data from local
- [ ] Update `DATABASE_URL` env var
- [ ] Test connection from local Fargate task

**Checklist:**
- [ ] Encryption at rest enabled
- [ ] Automated backups (retention: 7 days minimum)
- [ ] Enhanced monitoring enabled
- [ ] Security group allows Fargate only
- [ ] Verify all migrations run successfully

**Environment Variable:**
```bash
DATABASE_URL=mysql://user:password@aurora-endpoint.rds.amazonaws.com:3306/fairly?serverVersion=8.0
```

---

### **Phase 3: Backend Service (ECS Fargate)** ⏱️ ~3-4h
- [ ] Create ECS Cluster
- [ ] Define Task Definition for `app` (nginx + PHP-FPM)
- [ ] Configure ALB (Application Load Balancer)
- [ ] Set up Auto Scaling (CPU: 70%, Memory: 80%)
- [ ] Health checks & target groups

**Task Definition:**
```
Container: fairly-app
Image: ECR/fairly-app:latest
Port: 9000 (PHP-FPM)
Port: 80 (nginx)
CPU: 512 | Memory: 1024 MB (adjust per load test)
Environment: DATABASE_URL, APP_ENV=prod, APP_VERSION=X.X.X
```

**ALB Configuration:**
```
Listener: 80 → 443 (redirect HTTPS)
Listener: 443 (ACM cert) → Target Group → ECS Tasks
Health Check: /health or /
```

**Auto Scaling:**
```
Min: 2 tasks (HA)
Max: 10 tasks
Target: CPU 70%, Memory 80%
Scale-out cooldown: 60s
Scale-in cooldown: 300s
```

---

### **Phase 4: Async Messaging (SQS + Worker)** ⏱️ ~1.5-2h
- [ ] Migrate Symfony Messenger transport to SQS
- [ ] Create SQS queue(s) for async jobs
- [ ] Define ECS Task for Worker
- [ ] Configure CloudWatch alarms for queue depth

**Messenger Configuration (Symfony):**
```yaml
framework:
  messenger:
    transports:
      async:
        dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
        # dsn: 'sqs://...' (AWS SQS DSN)
        options:
          auto_setup: true
          queue_name: fairly-async
```

**Environment Variable:**
```bash
MESSENGER_TRANSPORT_DSN=sqs://AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY@sqs.eu-central-1.amazonaws.com/fairly-async
```

**Worker Task (ECS):**
```
Container: fairly-worker
Image: ECR/fairly-app:latest
Command: bin/console messenger:consume async --limit=1 --time-limit=60
Environment: DATABASE_URL, SQS queue credentials
Desired Count: 2 (scale via CloudWatch alarm on queue depth)
```

---

### **Phase 5: Frontend Deployment (S3 + CloudFront)** ⏱️ ~1-1.5h
- [ ] Create S3 bucket for React build artifacts
- [ ] Build React app: `npm run build`
- [ ] Upload to S3
- [ ] Create CloudFront distribution
- [ ] Configure cache policies (long TTL for hashed assets, short for index.html)
- [ ] Route 53 alias to CloudFront

**Build & Deploy Script:**
```bash
npm run build
aws s3 sync dist/ s3://fairly-frontend-prod/ --delete
aws cloudfront create-invalidation --distribution-id E1234ABCD --paths "/*"
```

**S3 Configuration:**
```
Block Public Access: Yes
Versioning: Enabled
CORS: Allow from ALB origin
Server-side encryption: AES-256
```

**CloudFront Behaviors:**
```
Path: /index.html
  Cache: 60s (no-cache, always check)
  
Path: /assets/*
  Cache: 31536000s (1 year, versioned assets)
  
Path: /api/*
  Cache: 0s (disable, forward to ALB)
  Origin: ALB
```

---

### **Phase 6: DNS & SSL** ⏱️ ~30-45min
- [ ] Register domain in Route 53 (or import existing)
- [ ] Create ACM certificate for `yourdomain.com` + `*.yourdomain.com`
- [ ] Route 53 records:
  - [ ] `yourdomain.com` → ALB (alias)
  - [ ] `cdn.yourdomain.com` → CloudFront (alias) *(optional, if separate domain)*

**Route 53 Alias Records:**
```
Name: yourdomain.com
Type: A (IPv4)
Alias Target: ALB DNS name
Evaluate Target Health: Yes

Name: cdn.yourdomain.com (optional)
Type: A (IPv4)
Alias Target: CloudFront domain
```

**SSL/TLS:**
- Certificate: `yourdomain.com`, `*.yourdomain.com`
- Auto-renewal: ACM handles automatically
- ALB listener: 443 (HTTPS with ACM cert)
- CloudFront: Viewer protocol policy = Redirect HTTP to HTTPS

---

### **Phase 7: Monitoring & Observability** ⏱️ ~1-2h
- [ ] CloudWatch dashboards for:
  - ECS task metrics (CPU, memory, network)
  - RDS metrics (connections, query performance)
  - ALB latency & request count
  - SQS queue depth
- [ ] CloudWatch alarms:
  - High CPU/Memory on ECS tasks
  - RDS database CPU > 80%
  - SQS queue depth > threshold
  - ALB 5xx errors
- [ ] Grafana Alloy integration (optional)

**Dashboard Metrics:**
```
ECS:
  - CPUUtilization
  - MemoryUtilization
  - RunningCount (desired vs actual)

RDS:
  - DatabaseConnections
  - QueryExecutionTime
  - ReadLatency, WriteLatency

ALB:
  - TargetResponseTime
  - RequestCount
  - HTTPCode_Target_5XX_Count

SQS:
  - ApproximateNumberOfMessagesVisible (queue depth)
  - ApproximateAgeOfOldestMessage
```

---

### **Phase 8: Testing & Cutover** ⏱️ ~2-4h
- [ ] Blue-Green deployment test
- [ ] Load testing (k6, Apache Bench)
- [ ] Database failover test
- [ ] Smoke tests (login, expense creation, calculations)
- [ ] DNS cutover (update nameservers or Route 53)

---

## Implementation Steps

### Step 1: Prepare AWS Environment
```bash
# 1. Create IAM policy for ECS, RDS, SQS, S3, CloudFront
# 2. Create ECR repositories
aws ecr create-repository --repository-name fairly-app
aws ecr create-repository --repository-name fairly-worker
aws ecr create-repository --repository-name fairly-web

# 3. Authenticate Docker to ECR
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-central-1.amazonaws.com

# 4. Build and push images
docker build -t fairly-app:latest -f build/app.Dockerfile .
docker tag fairly-app:latest <account-id>.dkr.ecr.eu-central-1.amazonaws.com/fairly-app:latest
docker push <account-id>.dkr.ecr.eu-central-1.amazonaws.com/fairly-app:latest
```

### Step 2: Provision RDS Aurora MySQL
```bash
# Via AWS Console or CLI
aws rds create-db-cluster \
  --db-cluster-identifier fairly-prod \
  --engine aurora-mysql \
  --engine-version 8.0.mysql_aurora.3.02.0 \
  --master-username admin \
  --master-user-password <strong-password> \
  --database-name fairly \
  --db-subnet-group-name default \
  --storage-encrypted \
  --enable-cloudwatch-logs-exports error general slowquery

# Create instance (Serverless v2)
aws rds create-db-instance \
  --db-instance-identifier fairly-prod-instance \
  --db-instance-class db.serverless \
  --engine aurora-mysql \
  --db-cluster-identifier fairly-prod
```

### Step 3: Create ECS Cluster & Service
```bash
# Create cluster
aws ecs create-cluster --cluster-name fairly-prod

# Register task definition (see below for full definition)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster fairly-prod \
  --service-name fairly-app \
  --task-definition fairly-app:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=fairly-app,containerPort=80
```

### Step 4: Create ALB
```bash
aws elbv2 create-load-balancer \
  --name fairly-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name fairly-app-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxx \
  --health-check-path /health

# Create listener (HTTPS redirect)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:...
```

### Step 5: SQS Queue Setup
```bash
aws sqs create-queue \
  --queue-name fairly-async.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true

# Get queue URL & ARN
aws sqs get-queue-attributes \
  --queue-url https://sqs.eu-central-1.amazonaws.com/.../fairly-async.fifo \
  --attribute-names QueueArn VisibilityTimeout
```

### Step 6: S3 + CloudFront
```bash
# Create S3 bucket
aws s3 mb s3://fairly-frontend-prod --region eu-central-1

# Build React app
cd frontend && npm run build

# Upload to S3
aws s3 sync dist/ s3://fairly-frontend-prod/ --delete

# Create CloudFront distribution (via Console, complex for CLI)
# OR use CDK/Terraform (see below)
```

---

## Cost Estimation

### Monthly Cost Breakdown (Rough Estimate)

| Service | Config | Monthly Cost | Notes |
|---------|--------|--------------|-------|
| **ECS Fargate (App)** | 2 tasks × 0.5 CPU, 1GB RAM, 730h | $30-40 | Compute costs vary by region |
| **ECS Fargate (Worker)** | 2 tasks × 0.25 CPU, 512MB RAM, variable | $10-20 | Scale with queue depth |
| **RDS Aurora Serverless v2** | ACU 2 (on-demand), 10GB storage | $40-60 | Pay per ACU + storage |
| **SQS** | 1M requests/month | $0.40 | Very cheap |
| **S3** | 100GB storage, 10M requests | $2-5 | Frontend assets |
| **CloudFront** | 1TB egress/month | $50-100 | Data transfer costs vary |
| **Route 53** | 1 hosted zone | $0.50 | Minimal |
| **ACM** | Certificates | FREE | Auto-renewal included |
| **CloudWatch** | Logs + metrics | $5-15 | Within free tier mostly |
| **Data Transfer** | Out-of-region, ALB→RDS | $10-20 | Same AZ = cheaper |
| **Backup Storage** | RDS automated backups | $5-10 | Proportional to DB size |
| **---** | **TOTAL** | **~$150-270/month** | Production-grade setup |

### Cost Optimization Tips
1. **Use Aurora Serverless v2** (pause during low-traffic periods)
2. **S3 Intelligent Tiering** for archival
3. **Spot instances** for workers (not available for Fargate, but for EC2)
4. **Reserved Capacity** for steady-state compute (save ~30%)
5. **CloudFront caching** reduces ALB load

---

## Monitoring & Observability

### CloudWatch Dashboards
```json
{
  "DashboardName": "Fairly-Production",
  "DashboardBody": {
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
            ["AWS/ECS", "MemoryUtilization", {"stat": "Average"}],
            ["AWS/RDS", "DatabaseConnections"],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible"],
            ["AWS/ApplicationELB", "TargetResponseTime"]
          ],
          "period": 60,
          "stat": "Average",
          "region": "eu-central-1",
          "title": "Key Metrics"
        }
      }
    ]
  }
}
```

### Alarms
```bash
# High ECS CPU
aws cloudwatch put-metric-alarm \
  --alarm-name fairly-ecs-cpu-high \
  --alarm-description "ECS CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:eu-central-1:xxx:alerts

# SQS queue depth
aws cloudwatch put-metric-alarm \
  --alarm-name fairly-sqs-depth-high \
  --metric-name ApproximateNumberOfMessagesVisible \
  --namespace AWS/SQS \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold
```

### Logging
- **ECS logs** → CloudWatch Logs
- **RDS logs** → CloudWatch Logs (configure in RDS)
- **ALB access logs** → S3 (optional, for audit)
- **Application logs** → Monolog → CloudWatch (or ELK)

---

## Security & Compliance

### Network Security
- [ ] VPC: Private subnets for RDS, public for ALB
- [ ] Security groups: Least privilege (ALB→ECS, ECS→RDS)
- [ ] NAT Gateway for egress (if needed)
- [ ] VPC Flow Logs for audit

### Data Security
- [ ] Encryption at rest: RDS, S3, EBS
- [ ] Encryption in transit: TLS 1.3 for ALB, HTTPS for frontend
- [ ] Secrets Manager for: DB passwords, API keys, OAuth secrets
- [ ] Regular backups + tested restore process

### Access Control
- [ ] IAM roles for ECS tasks (no hardcoded creds)
- [ ] Cross-account access disabled
- [ ] MFA for AWS Console
- [ ] CloudTrail logging enabled

### Application Security
- [ ] CORS configured (frontend ↔ API)
- [ ] Rate limiting on API (WAF or ALB)
- [ ] OWASP security headers (Symfony middleware)
- [ ] SQL injection prevention (Doctrine ORM native)
- [ ] CSRF protection (Symfony native)

---

## Next Steps

1. **Finalize AWS service selection** (get team sign-off)
2. **Choose IaC tool**: Terraform, AWS CDK, CloudFormation, or Pulumi
3. **Create detailed task definitions** (CPU/memory profiles)
4. **Load test baseline** (for cost & capacity planning)
5. **Blue-Green deployment strategy** (canary rollouts)
6. **Disaster recovery plan** (RTO/RPO targets)
7. **Cost monitoring** (AWS Budgets, cost anomaly detection)

---

## Resources

- [AWS Elastic Container Service (ECS)](https://docs.aws.amazon.com/ecs/)
- [RDS Aurora MySQL](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [AWS SQS](https://docs.aws.amazon.com/sqs/)
- [CloudFront Distributions](https://docs.aws.amazon.com/AmazonCloudFront/)
- [Symfony AWS Integration](https://symfony.com/doc/current/deployment.html)
- [Bref (PHP on Lambda)](https://bref.sh/) - Alternative for some components
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Questions?** Add them as GitHub issues and tag them `aws-deployment`.
