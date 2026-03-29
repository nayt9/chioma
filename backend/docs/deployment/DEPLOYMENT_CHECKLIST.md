# Deployment Checklist

Use this checklist for staging and production releases. For detailed procedure,
see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Pre-Deployment

- Confirm target environment: `staging` or `production`
- Confirm release branch/tag is correct
- Confirm CI pipelines are green:
  - backend
  - frontend
  - contracts
- Review database migrations included in the release
- Confirm required secrets exist in the target environment
- Confirm monitoring dashboards and alert channels are available
- Confirm rollback owner is identified
- Confirm latest backup exists or trigger a fresh backup
- Confirm release notes / change summary is available
- Confirm on-call or release stakeholders are aware of the deploy window

## Infrastructure

- Database is healthy and reachable
- Redis is healthy and reachable
- Load balancer / ingress config is unchanged or validated
- Disk space and memory headroom are acceptable
- TLS certificates are valid
- Monitoring stack is scraping targets successfully

## Deployment Execution

- Pull or build the approved image/tag
- Apply configuration changes
- Run migrations
- Deploy application instances
- Wait for readiness/health checks to pass
- Verify no unexpected restarts or crash loops

## Post-Deployment Validation

- `/health` returns success
- `/health/detailed` returns success where enabled
- `/api/docs` loads
- Authentication flow works
- One read endpoint works
- One write endpoint works
- Background jobs/queues are processing
- Error rate is normal
- Latency is within expected range
- No critical alerts triggered

## Rollback Decision Gate

If any of the following are true, pause and consider rollback:

- repeated health check failures
- sustained 5xx increase
- migration failure
- data integrity concern
- authentication failure
- queue backlog growth caused by the release

## Rollback

- Revert to previous image/tag if application-only issue
- Revert configuration if config-only issue
- Revert or restore database only with approved operator process
- Re-run smoke tests after rollback
- Announce rollback completion

## Closeout

- Announce deployment completion
- Record deployed commit SHA/image tag
- Record any follow-up actions
- Record any temporary mitigations
- Link incident ticket if relevant
