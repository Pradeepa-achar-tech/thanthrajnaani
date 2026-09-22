// Week 12 — Testing, Evaluation, and Production Deployment
// Testing agents, evaluating quality, deployment strategies, next steps

export const m11 = {
  id: 'm11',
  title: 'Week 12 — Testing & Production Deployment',
  hours: 7,
  color: 'from-lime-500/20 to-lime-700/10',
  accent: 'lime',
  description:
    'Shipping production agents. Learn to test agent behavior, measure quality metrics (accuracy, latency, cost), deploy safely with gradual rollouts, and iterate on live systems. Then, next steps: specialized agents for your domain.',
  sections: [
    {
      id: 'm11-s1',
      title: 'Evaluation and Quality Metrics',
      topics: [
        {
          id: 'm11-t1',
          title: 'Testing agent behavior',
          explain:
            'Test agents like you test functions: given input X, expect output Y. Build test suites that verify correct behavior.',
          analogy:
            'Agent testing is like testing a search engine. Input: query. Expected: top-K relevant results. Measure: precision, recall, MRR.',
          theory:
            'What to test:\n\n1. Tool selection\n   - Agent chooses correct tool for task\n   - Example: "weather in London" -> use weather_api, not calculator\n\n2. Tool usage\n   - Agent calls tools with correct arguments\n   - Example: search_tool("Python async") not search_tool("async")\n\n3. Response quality\n   - Answers are accurate, complete, helpful\n   - Measure with human evaluation or automated metrics\n\n4. Edge cases\n   - Handles errors gracefully\n   - Doesn\'t hallucinate when tools fail\n   - Timeouts and retries work\n\nTest framework:\n```python\ndef test_agent_selects_correct_tool():\n    result = agent.run("What\'s the weather?")\n    assert "weather_api" in result.tools_used\n    assert "calculator" not in result.tools_used\n```',
          whyItMatters:
            'Without tests, you ship broken agents and find out from users. Tests catch regressions before production.',
          steps: [
            'Create test cases (input + expected behavior)',
            'Run agent on each test case',
            'Verify tool selection and output quality',
            'Set up CI/CD to run tests on every change',
          ],
          code: `import pytest
from agent import run_agent

class TestAgent:
    def test_weather_query_uses_weather_tool(self):
        result = run_agent("What's the weather in Paris?")
        assert "weather_tool" in result["tools_used"]

    def test_math_query_uses_calculator(self):
        result = run_agent("Calculate 15% of 200")
        assert "calculator" in result["tools_used"]

    def test_malformed_input_handled(self):
        result = run_agent("@#$%^&*()")
        assert result["error"] is None
        assert "could not understand" in result["response"].lower()

    def test_response_time_under_limit(self):
        import time
        start = time.time()
        result = run_agent("Quick test")
        duration = time.time() - start
        assert duration < 5.0, f"Agent took {duration}s, max 5s"

# Run: pytest test_agent.py
# CI/CD runs this on every commit`,
          pitfalls: [
            'Only testing happy path. Test errors and edge cases.',
            'Tests too specific. If you change system prompt, all tests break.',
            'Not measuring latency. Slow agents are useless in production.',
          ],
        },
        {
          id: 'm11-t2',
          title: 'Metrics: accuracy, latency, cost',
          explain:
            'Track three key metrics for every agent in production.',
          analogy:
            'Metrics are like dashboards in a car: speed (latency), fuel efficiency (cost), accuracy of speedometer (quality).',
          theory:
            'Key metrics:\n\n1. Accuracy\n   - % of correct answers\n   - % of successful tool calls\n   - User satisfaction rating (1-5)\n   - Measure via: human review, automated checks, user feedback\n\n2. Latency\n   - Time from request to response\n   - Should be < 5s for user-facing (< 100ms for real-time)\n   - Track p50, p95, p99 (percentiles)\n\n3. Cost\n   - Tokens used * price/token\n   - Track per-user, per-feature\n   - Optimize when cost > business value\n\nExample dashboard:\n- Accuracy: 94.3% (up 2.1% this week)\n- Latency: p50=450ms, p99=2.1s\n- Cost: $0.003 per request (avg)\n- Errors: 12 in last 24h (0.3% error rate)',
          whyItMatters:
            'Without metrics, you don\'t know if your agent is working. Metrics drive product decisions.',
          steps: [
            'Set up monitoring (Datadog, New Relic, custom)',
            'Log key events (tool calls, latency, errors)',
            'Build dashboard',
            'Set alerts (accuracy drops below 90%)',
          ],
          code: `import time
from datetime import datetime

def log_metrics(user_id, request, response, latency, tokens_used):
    """Log agent metrics for monitoring"""
    cost = (tokens_used * 0.003) / 1000  # $0.003 per 1K tokens

    metrics = {
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "request": request,
        "accuracy": 1 if response["error"] is None else 0,
        "latency_ms": latency * 1000,
        "tokens_used": tokens_used,
        "cost_usd": cost,
        "tools_used": response.get("tools_used", [])
    }

    # Send to monitoring service
    send_to_datadog(metrics)

    # Also log locally for debugging
    print(f"Request: {request[:50]}... | Accuracy: {metrics['accuracy']} | Latency: {metrics['latency_ms']:.1f}ms | Cost: {cost:.4f}")

# Use in production
start = time.time()
response = run_agent(user_input)
latency = time.time() - start
log_metrics(user_id, user_input, response, latency, response["tokens_used"])`,
          pitfalls: [
            'Not tracking metrics at all. Can\'t improve what you don\'t measure.',
            'Logging too much data. Costs money and makes dashboards slow.',
            'Not setting alerts. You\'ll miss problems until users complain.',
          ],
        },
      ],
    },
    {
      id: 'm11-s2',
      title: 'Deployment and Iteration',
      topics: [
        {
          id: 'm11-t3',
          title: 'Deploying safely: canary and blue/green',
          explain:
            'Don\'t deploy to 100% of users immediately. Test with 5%, then 25%, then 100%.',
          analogy:
            'Canary deployment: send a canary (bird) into the mine first to check if it\'s safe. If it survives, it\'s safe for humans.',
          theory:
            'Deployment strategies:\n\n1. Canary (5% -> 25% -> 100%)\n   - Route 5% of traffic to new version\n   - Monitor metrics (accuracy, errors)\n   - If good, expand to 25%, then 100%\n   - If bad, rollback\n\n2. Blue-Green (switch all at once)\n   - Run old (blue) and new (green) in parallel\n   - Route all traffic to blue\n   - When ready, switch all to green\n   - If problem, switch back to blue\n\n3. A/B test\n   - Half users get version A, half get B\n   - Measure which is better\n   - Permanent winner becomes standard\n\nRollback: Always keep old version running so you can switch back instantly if something breaks.',
          whyItMatters:
            'Canary prevents disasters. A bad deploy affects only 5% of users initially, not 100%.',
          steps: [
            'Deploy new version alongside old',
            'Route 5% traffic to new',
            'Monitor for 1-2 hours',
            'Expand to 25%, monitor',
            'Expand to 100%',
            'Keep old version for fast rollback',
          ],
          code: `# Pseudo-code for canary deployment
import random

def route_request(user_id, request):
    """Route request to old or new version"""

    # 5% of traffic to new version (canary)
    if random.random() < 0.05:
        version = "new_v2"
    else:
        version = "old_v1"

    # Tag request for monitoring
    request["_version"] = version

    if version == "new_v2":
        return run_agent_v2(request)  # New code
    else:
        return run_agent_v1(request)  # Old code

# Monitor metrics separately per version
metrics_by_version = {
    "old_v1": {"accuracy": 0.94, "latency": 450, "errors": 12},
    "new_v2": {"accuracy": 0.947, "latency": 480, "errors": 8}
}

# New version looks good, expand canary
if metrics_by_version["new_v2"]["accuracy"] > metrics_by_version["old_v1"]["accuracy"]:
    print("New version better, expanding to 25%")
    # Change: if random.random() < 0.25:`,
          pitfalls: [
            'Deploying without monitoring. You won\'t know if something broke.',
            'Going from 0% to 100% directly. One bad deploy kills everything.',
            'Deleting old version too quickly. If something breaks, you can\'t rollback.',
          ],
        },
      ],
    },
  ],
}
