// Week 7 — Agents and Tool Calling
// Building agents that can decide which tools to use, multi-step reasoning

export const m6 = {
  id: 'm6',
  title: 'Week 7 — Agents and Tool Calling',
  hours: 7,
  color: 'from-indigo-500/20 to-indigo-700/10',
  accent: 'indigo',
  description:
    'The magic of AI agents: define tools (search, calculation, database queries), and let the LLM decide which to use and in what order. Build autonomous agents that reason through multi-step problems.',
  sections: [
    {
      id: 'm6-s1',
      title: 'Tool Definition and Calling',
      topics: [
        {
          id: 'm6-t1',
          title: 'What is tool calling?',
          explain:
            'Tool calling means the LLM decides to invoke a function (search, API, calculation) based on user request, then you execute it and feed the result back.',
          analogy:
            'Tool calling is like a human asking a colleague: "Can you look up the profit margin for Q3?" The colleague decides which file to check, retrieves it, and reports back.',
          theory:
            'Agent loop:\n1. User asks a question\n2. LLM analyzes and decides which tool(s) to call\n3. You execute those tools\n4. Feed tool results back to LLM\n5. LLM generates final response\n\nLLM never directly accesses tools. LLM says "call search_web with query=X" and you do it.\n\nTools are defined as JSON schema:\n{\n  "type": "function",\n  "function": {\n    "name": "search",\n    "description": "Search the web",\n    "parameters": {\n      "type": "object",\n      "properties": {\n        "query": {"type": "string"},\n        "num_results": {"type": "integer"}\n      }\n    }\n  }\n}',
          whyItMatters:
            'Tool calling makes agents autonomous. Instead of "call this specific function", you say "here are your tools, figure out which is best". The LLM adapts to new problems automatically.',
          steps: [
            'Define tools as JSON schemas',
            'Register them with the LLM',
            'LLM chooses tools and generates arguments',
            'You parse the LLM response',
            'Execute tools and return results',
            'Loop until LLM stops calling tools',
          ],
          code: `from openai import OpenAI
import json

client = OpenAI()

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Search the web",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Evaluate a math expression",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string"}
                },
                "required": ["expression"]
            }
        }
    }
]

# Call LLM with tools
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "What is 5 + 3 times 2?"}],
    tools=tools
)

# Check if LLM wants to call a tool
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        print(f"Tool: {tool_call.function.name}")
        print(f"Args: {tool_call.function.arguments}")`,
          pitfalls: [
            'Forgetting that LLM can call MULTIPLE tools in one response.',
            'Not handling tool execution errors gracefully. If a tool fails, tell the LLM and loop.',
            'Creating tools that are too specific. Make them generic enough to reuse.',
          ],
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'Building an Agent Loop',
      topics: [
        {
          id: 'm6-t2',
          title: 'Agent execution loop',
          explain:
            'An agent loop runs until the LLM says it\'s done. Each iteration: LLM plans, calls tools, you execute, loop continues.',
          analogy:
            'Agent loop is like a conversation with a problem-solver. You ask them a question. They ask for info (tools). You provide it. They process and ask for more. Eventually they have the answer.',
          theory:
            'Pseudocode:\nwhile not done:\n    response = llm.ask_question()\n    if response.needs_tools():\n        for tool in response.tools:\n            result = execute_tool(tool)\n            feedback = "Tool {name} returned: {result}"\n        # Loop: ask LLM again with feedback\n    else:\n        return response.final_answer\n\nLLM automatically stops when it has enough info. You detect this via:\n- response.stop_reason == "end_turn"\n- No more tool calls\n- response contains final text (not tool calls)\n\nSafeguards:\n- Max iterations (100) to prevent infinite loops\n- Token limit tracking\n- Timeout per request',
          whyItMatters:
            'Agent loops are the backbone of autonomous AI agents. Without them, you\'re just chaining prompts. With them, the LLM reasons and adapts.',
          steps: [
            'Start with a user question',
            'Loop: call LLM',
            'Check if LLM wants to call tools',
            'If yes: execute and loop',
            'If no: return final answer',
          ],
          code: `from openai import OpenAI
import json

client = OpenAI()
tools = [...]  # Define tools as before

def run_agent(user_question, max_iterations=10):
    messages = [{"role": "user", "content": user_question}]

    for iteration in range(max_iterations):
        # Call LLM
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            tools=tools
        )

        # Add LLM response to messages
        messages.append(response.choices[0].message)

        # Check if LLM wants to call tools
        if not response.choices[0].message.tool_calls:
            # No more tools, return final answer
            return response.choices[0].message.content

        # Execute tools
        for tool_call in response.choices[0].message.tool_calls:
            tool_name = tool_call.function.name
            tool_args = json.loads(tool_call.function.arguments)

            # Execute (simplified)
            if tool_name == "search":
                result = f"Search results for '{tool_args['query']}'"
            elif tool_name == "calculate":
                result = str(eval(tool_args['expression']))

            # Add tool result to messages
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "name": tool_name,
                "content": result
            })

    return "Max iterations reached"

# Run the agent
answer = run_agent("What is the capital of France and 2+2?")
print(answer)`,
          pitfalls: [
            'Infinite loops: LLM keeps calling the same tool. Add max iterations.',
            'Wrong message format: tool results must have role="tool" and tool_call_id.',
            'Not handling JSON parse errors in tool arguments.',
          ],
        },
      ],
    },
  ],
}
