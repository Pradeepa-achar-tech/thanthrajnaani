// Week 5 — LangChain Basics
// Building with LLM frameworks, chains, prompts, memory

export const m4 = {
  id: 'm4',
  title: 'Week 5 — LangChain Essentials',
  hours: 6,
  color: 'from-teal-500/20 to-teal-700/10',
  accent: 'teal',
  description:
    'Stop reinventing the wheel. LangChain abstracts common patterns: chaining prompts, working with memory, calling tools. Build production agents in hours, not weeks.',
  sections: [
    {
      id: 'm4-s1',
      title: 'LangChain Architecture',
      topics: [
        {
          id: 'm4-t1',
          title: 'Models, Prompts, and Chains',
          explain:
            'LangChain has three core concepts: Models (the LLMs), Prompts (templates), Chains (connecting them). Together they form agents.',
          analogy:
            'Model = engine. Prompt = instruction manual. Chain = assembly line. Chain connects them and moves data through.',
          theory:
            'LangChain core concepts:\n\n1. LLM: Interface to language models\nfrom langchain_openai import ChatOpenAI\nllm = ChatOpenAI(model="gpt-4")\n\n2. Prompt Template: Reusable prompt with placeholders\nfrom langchain.prompts import ChatPromptTemplate\nprompt = ChatPromptTemplate.from_template("Tell me about {topic}")\n\n3. Chains: Connect models and prompts\nchain = prompt | llm\nresult = chain.invoke({"topic": "Python"})\n\n4. Memory: Keep conversation history\n5. Agents: Let LLM decide which tools to call',
          whyItMatters:
            'LangChain handles boilerplate (rate limiting, retries, token counting). You focus on logic.',
          steps: [
            'pip install langchain-openai',
            'Create a ChatOpenAI model.',
            'Create a prompt template.',
            'Pipe them: chain = prompt | llm',
            'Call chain.invoke() with data.',
          ],
          code: `from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# Initialize LLM
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)

# Define prompt template
prompt_template = ChatPromptTemplate.from_template(
    "Explain {concept} to a {audience}. Keep it under 100 words."
)

# Create chain by piping
chain = prompt_template | llm

# Run the chain
result = chain.invoke({
    "concept": "async/await",
    "audience": "C# developers learning Python"
})

print(result.content)`,
          pitfalls: [
            'Forgetting to install langchain and LLM packages separately.',
            'Using old LangChain syntax. LangChain v0.1+ uses LCEL (pipe operator). Don\'t use the old .run() methods.',
            'Not specifying model parameters like temperature.',
          ],
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Memory and State Management',
      topics: [
        {
          id: 'm4-t2',
          title: 'Conversation memory',
          explain:
            'Keep conversation history so the LLM understands context across messages.',
          analogy:
            'Memory is like a human conversation. You don\'t repeat everything every time. The LLM remembers what you said before.',
          theory:
            'Without memory: Each request is independent. The LLM doesn\'t know previous context.\n\nWith memory: You build a list of (user_message, assistant_response) and send it with each request.\n\nLangChain Memory types:\n- ConversationBufferMemory: Keep all messages\n- ConversationSummaryMemory: Summarize old messages\n- ConversationTokenBufferMemory: Keep recent N tokens\n\nTrade-off: More memory = better context but higher cost and latency.',
          whyItMatters:
            'Without memory, multi-turn conversations feel broken. "Remember what I said earlier?" will fail.',
          steps: [
            'Create ConversationBufferMemory.',
            'Add (user, assistant) pairs to it.',
            'Pass it to your chain.',
            'Memory automatically includes context in each request.',
          ],
          code: `from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4-turbo")
memory = ConversationBufferMemory()

prompt = ChatPromptTemplate.from_template(
    "Chat history: {history}\\n\\nUser: {input}\\n\\nAssistant:"
)

chain = LLMChain(llm=llm, prompt=prompt, memory=memory)

# First turn
response = chain.run(input="My name is Alice. I\'m learning Python.")
print(response)

# Second turn: Memory includes first message
response = chain.run(input="What was my name?")
print(response)  # Alice
# LLM remembers because memory included the first exchange`,
          pitfalls: [
            'Not using memory. Multi-turn chats will fail.',
            'Storing memory in a plain list. Use LangChain Memory classes which handle formatting.',
            'Memory growing infinitely. Use SummaryMemory or token-limited memory for long conversations.',
          ],
        },
      ],
    },
  ],
}
