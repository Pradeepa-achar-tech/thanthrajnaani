// Week 10 — Multi-Agent Systems
// Orchestrating multiple specialized agents, agent communication, delegation

export const m9 = {
  id: 'm9',
  title: 'Week 10 — Multi-Agent Systems',
  hours: 6,
  color: 'from-fuchsia-500/20 to-fuchsia-700/10',
  accent: 'fuchsia',
  description:
    'One agent can\'t do everything. Learn to build teams: a router agent that delegates to specialists (research, analysis, coding, writing), agents that communicate with each other, and orchestration patterns.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Agent Routing and Delegation',
      topics: [
        {
          id: 'm9-t1',
          title: 'Router agent: delegating to specialists',
          explain:
            'A router agent reads the user request, decides which specialist agent should handle it, and delegates the work.',
          analogy:
            'Router is like a receptionist. User calls with a problem. Receptionist routes to the right department: sales, support, technical.',
          theory:
            'Multi-agent architecture:\n\n1. User request comes in\n2. Router agent analyzes: "Is this a research task? Coding task? Analysis?"\n3. Router picks the best specialist agent\n4. Specialist runs its task\n5. Router collects results and summarizes for user\n\nSpecialist agents:\n- Research agent: Uses search tools, RAG\n- Code agent: Writes, tests, debugs code\n- Analysis agent: Statistical analysis, data interpretation\n- Writing agent: Generates content, summaries\n\nEach specialist has specialized tools and system prompts tuned for their domain.',
          whyItMatters:
            'Specialists are more accurate than generalists. A coding-focused agent with access to linters, debuggers, test runners will write better code than a general agent.',
          steps: [
            'Define specialist agents with domain-specific tools',
            'Build router that classifies user requests',
            'Route to appropriate specialist',
            'Combine results into final response',
          ],
          code: `from openai import OpenAI

client = OpenAI()

# Define specialist agents
research_agent = {
    "name": "research",
    "system": "You are a research expert. Use search tools to find accurate, current information."
}

code_agent = {
    "name": "code",
    "system": "You are a Python expert. Write clean, tested code with explanations."
}

# Router decides which agent to use
def route_request(user_input):
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role": "user",
            "content": f"Classify this request as 'research', 'code', 'analysis', or 'general':\\n{user_input}"
        }]
    )
    classification = response.choices[0].message.content.lower()

    if "research" in classification:
        return research_agent
    elif "code" in classification or "python" in classification:
        return code_agent
    else:
        return {"name": "general", "system": "You are a helpful assistant."}

# Use router
agent = route_request("How do I install Python packages?")
print(f"Routed to: {agent['name']}")`,
          pitfalls: [
            'Making specialists too specific. They should still handle edge cases.',
            'Not giving specialists their own tools. A code agent without a linter is just a general agent.',
            'Router making wrong classification. Use few-shot examples to teach the router.',
          ],
        },
        {
          id: 'm9-t2',
          title: 'Inter-agent communication',
          explain:
            'Agents can call other agents as tools. One agent can ask another for help.',
          analogy:
            'Inter-agent communication is like asking a colleague for input. Agent A realizes it needs specialized knowledge, calls Agent B, and incorporates the result.',
          theory:
            'Pattern: Agent A calls Agent B as a tool\n\n1. Agent A: "I need analysis on this data"\n2. Calls tool: analyze_data()\n3. Tool invokes Agent B (analysis specialist)\n4. Agent B processes and returns result\n5. Agent A continues with the result\n\nImplement by wrapping agent calls as functions that other agents can invoke.',
          whyItMatters:
            'Agents can decompose complex tasks by asking each other for help. This creates hierarchical problem-solving.',
          steps: [
            'Define agents as callable functions',
            'Register them as tools for other agents',
            'Use the tool calling mechanism',
          ],
          code: `def analyze_data_agent(data):
    """Specialist agent for data analysis"""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role": "system",
            "content": "You are a data analyst. Provide insights."
        }, {
            "role": "user",
            "content": f"Analyze this data: {data}"
        }]
    )
    return response.choices[0].message.content

# Main agent can call analysis agent as a tool
tools = [
    {
        "type": "function",
        "function": {
            "name": "analyze_data",
            "description": "Get deep analysis from the analysis specialist",
            "parameters": {"type": "object", "properties": {"data": {"type": "string"}}}
        }
    }
]

# Main agent uses the tool
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "Analyze this sales data..."}],
    tools=tools
)`,
          pitfalls: [
            'Circular dependencies: Agent A calls Agent B, which calls Agent A.',
            'Infinite delegation: Agent keeps asking for help instead of solving.',
            'Not passing enough context to called agents.',
          ],
        },
      ],
    },
  ],
}
