# Scalability Research Notes

## Service Scaling

Cloud Run scales stateless revisions using CPU and request concurrency. It can retain warm capacity with a minimum instance count, while maximum instance settings must be selected with the database connection budget in mind. On-demand scaling can queue requests before additional capacity becomes available, so the application needs bounded work per request and a tested overload posture.

## Reliability Operations

The target production posture uses user-facing service-level objectives, progressive rollouts, explicit rollback triggers, load-tested capacity, and monitored error budgets. Overload handling should prefer bounded queues, dynamic timeouts, and graceful shedding over unbounded retries. Retries must use exponential backoff with jitter.

## Source Material

- Google Cloud, [About instance autoscaling in Cloud Run services](https://docs.cloud.google.com/run/docs/about-instance-autoscaling)
- Google SRE, [A Collection of Best Practices for Production Services](https://sre.google/sre-book/service-best-practices/)
