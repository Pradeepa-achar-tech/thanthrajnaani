// Week 9 — Advanced Patterns
// Reflection, iterative refinement, multi-agent systems, cost optimization

export const m8 = {
  id: 'm8',
  title: 'Week 9 — Advanced Patterns',
  hours: 6,
  color: 'from-red-500/20 to-red-700/10',
  accent: 'red',
  description:
    'Advanced techniques for production agents: reflection loops (agent checks its own work), routing (send requests to best agent), cost optimization, and building multi-agent teams.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Reflection and Self-Improvement',
      topics: [
        {
          id: 'm8-t1',
          title: 'Reflection loops: agent audits itself',
          explain:
            'After the agent produces an answer, have it review its own work and improve it. Reflection can catch errors and refine reasoning.',
          analogy:
            'Reflection is like self-review. You write something, read it back, notice mistakes, revise.',
          theory:
            'Reflection pattern:\n1. Agent generates initial response\n2. Reflection agent reviews: "Is this accurate? Complete? Clear?"\n3. If flaws found, agent revises\n4. Repeat until satisfactory\n\nThis is "chain-of-thought on steroids". It\'s more expensive (multiple LLM calls) but produces better answers.',
          whyItMatters:
            'Reflection catches errors that single-pass agents miss. Perfect for high-stakes tasks (legal analysis, medical info).',
          steps: [
            'Agent generates answer',
            'Separate reflection model reviews it',
            'If issues found, route back to agent for revision',
            'Repeat 1-2 times',
          ],
          code: `from openai import OpenAI

client = OpenAI()

def agent_with_reflection(user_query, max_reflections=2):
    # Generate initial response
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": user_query}]
    )
    answer = response.choices[0].message.content

    # Reflection loop
    for reflection_round in range(max_reflections):
        reflection = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "user", "content": f"Review this answer for accuracy and completeness:\\n\\n{answer}"},
                {"role": "system", "content": "You are a critical reviewer. Be specific about flaws."}
            ]
        )
        feedback = reflection.choices[0].message.content

        # If no major issues, done
        if "no issues" in feedback.lower() or "accurate" in feedback.lower():
            break

        # Refine answer based on feedback
        refined = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "user", "content": user_query},
                {"role": "assistant", "content": answer},
                {"role": "user", "content": f"Address these issues:\\n{feedback}"}
            ]
        )
        answer = refined.choices[0].message.content

    return answer`,
          pitfalls: [
            'Reflection loops costing too much. Use smaller models for reflection.',
            'Infinite loops where reflection finds new issues every time. Set max iterations.',
            'Reflection being generic. Teach it to look for specific flaws.',
          ],
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Cost Optimization',
      topics: [
        {
          id: 'm8-t2',
          title: 'Reducing token costs',
          explain:
            'LLM API costs scale linearly with tokens. Small optimizations save thousands of dollars on production workloads.',
          analogy:
            'Cost optimization is like fuel efficiency. Small changes (lightweight prompts, caching) compound into huge savings.',
          theory:
            'Token cost breakdown:\n- Input tokens: cheaper (e.g., $0.003/1K for gpt-4-turbo)\n- Output tokens: 2-3x more expensive\n- Cached tokens: 90% discount (if using prompt caching)\n\nOptimization strategies:\n1. Cache repeated prompts (system messages, RAG context)\n2. Use cheaper models when accuracy allows\n3. Batch requests\n4. Reduce output token count (max_tokens parameter)\n5. Use embeddings instead of LLM for simple classification',
          whyItMatters:
            'At scale, token costs dominate. 1M requests/day with poor optimization = $10K/day. With optimization = $1K/day.',
          steps: [
            'Track token usage per request',
            'Profile where tokens are spent',
            'Apply optimization strategies',
            'Re-measure and iterate',
          ],
          code: `from openai import OpenAI

client = OpenAI()

# Track tokens
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    max_tokens=10  # Force short response
)

input_tokens = response.usage.prompt_tokens
output_tokens = response.usage.completion_tokens
total = response.usage.total_tokens

cost = (input_tokens * 0.003 + output_tokens * 0.006) / 1000
print("Tokens: {} in, {} out = {:.4f}".format(input_tokens, output_tokens, cost))

# Use prompt caching (requires special setup)
# Cached tokens cost 90% less but require cache to warm up
messages_with_cache = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "You are a helpful assistant.",
                "cache_control": {"type": "ephemeral"}
            },
            {
                "type": "text",
                "text": "What is 2+2?"
            }
        ]
    }
]`,
          pitfalls: [
            'Optimizing for wrong metrics. Focus on total cost, not per-request cost.',
            'Switching to cheaper models and getting wrong answers.',
            'Over-caching. Cached prompts only save if reused many times.',
          ],
        },
      ],
    },
  ],
}
