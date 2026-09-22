// Week 2 — LLM Fundamentals
// Tokens, context windows, temperature, prompting strategies, structured output

export const m1 = {
  id: 'm1',
  title: 'Week 2 — LLM Fundamentals',
  hours: 5,
  color: 'from-purple-500/20 to-purple-700/10',
  accent: 'purple',
  description:
    'Stop treating LLMs as black boxes. Understand tokens, context windows, temperature, prompting strategies, and how to get structured output from models.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Tokens and Encoding',
      topics: [
        {
          id: 'm1-t1',
          title: 'What is a token?',
          explain:
            'Tokens are the atomic units that LLMs process. A token is roughly 4 characters in English, but varies by language and content.',
          analogy:
            'Tokens are like words in a human conversation — you don\'t process individual letters, you process words. LLMs process tokens the same way.',
          theory:
            'When you send text to an LLM, it doesn\'t receive the raw string. Instead, a tokenizer (a lookup table + algorithm) converts your text into a sequence of token IDs — integers. The model processes these integers, not the text itself. This is why prompts in different languages or with special characters have different token counts.\n\nCommon tokenizers:\n- OpenAI: GPT-2 tokenizer (used by gpt-3.5-turbo, gpt-4)\n- Anthropic Claude: Tokens are similar but Claude\'s tokenizer is slightly different\n- Open source: Hugging Face Transformers (tiktoken for OpenAI, sentencepiece for others)\n\nExample: "Hello, world!" = 4 tokens (roughly). But "Hello, 世界!" = 6 tokens (non-ASCII takes more).',
          whyItMatters:
            'Tokens = cost and latency. You pay per token. Understanding tokens helps you estimate costs before hitting the API, optimize prompts to fit context limits, and predict response time.',
          steps: [
            'Open https://platform.openai.com/tokenizer and paste some text.',
            'Count the tokens returned. Notice how "Hello, world!" is ~4 tokens.',
            'Paste a sentence in a different language. Notice it takes MORE tokens.',
            'Try special characters, URLs, JSON. See how token count changes.',
            'Remember: 1 token ≈ 4 characters in English, but varies by content type.',
          ],
          code: `# Python: count tokens before calling an API
import tiktoken

# Initialize tokenizer for gpt-4
enc = tiktoken.encoding_for_model("gpt-4")

text = "Hello, world! How are you today?"
tokens = enc.encode(text)
print(f"Token count: {len(tokens)}")
# -> Token count: 8

# Decode tokens back to text
decoded = enc.decode(tokens[:5])
print(decoded)
# -> "Hello, world! How"`,
          pitfalls: [
            'Assuming 1 token = 1 word. It\'s roughly 4 chars, not 1 word. A URL or JSON with special chars takes WAY more tokens than the character count suggests.',
            'Forgetting to count tokens in your prompt template. If you\'re sending 500 prompts and each prompt is 200 tokens, that\'s 100k tokens already before the model responds.',
            'Not accounting for whitespace and newlines. Extra formatting costs tokens.',
          ],
        },
        {
          id: 'm1-t2',
          title: 'Context window limits',
          explain:
            'Every model has a maximum number of tokens it can process in one request — the "context window."',
          analogy:
            'Think of context window like a whiteboard. gpt-4-turbo has a 128k-token board (huge). An older model might have 4k tokens (small). Once you fill it, you can\'t add more.',
          theory:
            'Context window = max_tokens_input + max_tokens_output.\n\nCommon context windows:\n- gpt-3.5-turbo: 4k or 16k tokens\n- gpt-4: 8k or 128k tokens\n- Claude 3.5 Sonnet: 200k tokens (huge!)\n- Llama 2 (open): 4k tokens\n\nWhen you exceed the context window, the API returns an error. You must either:\n1. Shorten your prompt\n2. Truncate old conversation history\n3. Switch to a model with a larger window\n\nFor RAG systems, this is why you retrieve only the TOP-K most relevant chunks, not the entire database.',
          whyItMatters:
            'Context window determines what you can do. A 4k-token limit means you can\'t feed a whole book into the prompt. Large windows (128k+) let you do things like "analyze all of my customer emails" without truncation.',
          steps: [
            'Check the docs for your model\'s context window.',
            'Calculate: tokens_in_prompt + tokens_in_history + tokens_you_want_in_response',
            'If it exceeds the limit, either split the task or use a bigger model.',
            'For chat: keep a rolling window of the last N messages, not the entire history.',
          ],
          code: `# Example: Stay within context limits
import tiktoken
from openai import OpenAI

enc = tiktoken.encoding_for_model("gpt-4-turbo")
client = OpenAI()

prompt = "Analyze this dataset and find trends..."
max_tokens_budget = 128000  # gpt-4-turbo window
max_response = 2000  # leave room for response

available_for_context = max_tokens_budget - max_response
prompt_tokens = len(enc.encode(prompt))

if prompt_tokens > available_for_context:
    print(f"Prompt too long: {prompt_tokens} tokens, max {available_for_context}")
else:
    print(f"Safe. Prompt: {prompt_tokens}, Budget: {available_for_context}")`,
          pitfalls: [
            'Not checking the model\'s context window before sending a request. You\'ll get an error after paying for partial processing.',
            'Including the entire chat history in every request. Older messages from hours ago don\'t need to be resent — keep a rolling window of the last 10-20 messages.',
            'Forgetting that BOTH input and output count toward the limit. If your window is 8k and you use 7k for input, you have only 1k left for the response.',
          ],
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Temperature and Randomness',
      topics: [
        {
          id: 'm1-t3',
          title: 'Temperature: controlling randomness',
          explain:
            'Temperature is a parameter (0.0 to 2.0) that controls how "creative" or "random" the model is. Low = deterministic, high = creative.',
          analogy:
            'Temperature is like turning up the heat. At 0°, molecules don\'t move (deterministic). At high heat, they move randomly (creative, risky).',
          theory:
            'Temperature affects the probability distribution of the next token.\n\nTemperature = 0: The model always picks the single most likely token. Deterministic. Same input = same output every time.\n\nTemperature = 1 (default): Normal behavior. The model samples from its predicted distribution.\n\nTemperature > 1: Higher randomness. The model explores less-likely tokens. Can lead to creative but sometimes nonsensical outputs.\n\nMathematically: higher temperature = softer probability distribution = more uniform sampling = more randomness.\n\nUse cases:\n- Temperature 0 for factual Q&A, code generation, classification (you want correct, not creative)\n- Temperature 0.5-0.7 for writing, brainstorming (balanced)\n- Temperature 1.5+ for creative writing, generating multiple diverse ideas.',
          whyItMatters:
            'Temperature determines whether the model is reliable or creative. For production (APIs, customer-facing), use low temperature. For brainstorming or generating variations, use higher temperature.',
          steps: [
            'In your API call, set temperature=0 for a factual task.',
            'Send the same request 3 times. You should get identical responses.',
            'Now set temperature=1.5 and send the same request 3 times.',
            'Notice the responses vary. Some might be great, some off-topic.',
            'Find your sweet spot based on your use case.',
          ],
          code: `from openai import OpenAI

client = OpenAI()

# Deterministic response (always same)
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "What is 2+2?"}],
    temperature=0,  # No randomness
)
print(response.choices[0].message.content)
# -> "2 + 2 = 4"

# Creative response (varies each time)
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "Write a short poem about coding."}],
    temperature=1.5,  # High randomness
)
print(response.choices[0].message.content)
# -> Different poem each time`,
          pitfalls: [
            'Using high temperature for tasks that need accuracy (customer support, code generation, calculations). You\'ll get wrong answers sometimes.',
            'Using temperature=0 for creative work. You\'ll get boring, repetitive output.',
            'Not realizing that temperature ONLY affects randomness. It doesn\'t make the model smarter or dumber — just less or more consistent.',
          ],
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'Prompting Strategies',
      topics: [
        {
          id: 'm1-t4',
          title: 'System prompts and role-playing',
          explain:
            'A system prompt is the "instruction set" for the model\'s behavior. It defines who the model is and how it should respond.',
          analogy:
            'The system prompt is like briefing an actor before a scene. You tell them their role, their personality, their constraints. Then they act accordingly.',
          theory:
            'In chat APIs, messages have roles:\n- "system": The instruction/context (sent once, sets the tone)\n- "user": What the person is asking\n- "assistant": Previous responses from the model\n\nExample system prompt:\n"You are a Python expert. Respond with code examples. Never make up libraries that don\'t exist."\n\nThe model doesn\'t "read" this like a human. Instead, the system message is added to the context and the model learns from the pattern of what\'s expected.\n\nBest practices:\n- Be specific about role and constraints\n- Give examples of desired behavior in the system prompt\n- Keep it concise (long system prompts waste tokens)',
          whyItMatters:
            'A good system prompt can make the model 10x more useful for your specific task. Without it, the model is generic. With it, it\'s an expert consultant.',
          steps: [
            'Write a generic prompt without a system message.',
            'Call the API with just user message.',
            'Write a system prompt that clearly defines the task and constraints.',
            'Call the API again with the system prompt.',
            'Compare the quality. Notice how specific the second response is.',
          ],
          code: `from openai import OpenAI

client = OpenAI()

# WITHOUT system prompt (generic)
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "user", "content": "What is async/await in Python?"}
    ],
    temperature=0,
)
print(response.choices[0].message.content)
# -> Generic explanation

# WITH system prompt (expert mode)
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {
            "role": "system",
            "content": "You are a Python expert teaching async programming to C# developers. Use C# comparisons. Include runnable code examples. Avoid theory, focus on practical patterns."
        },
        {"role": "user", "content": "What is async/await in Python?"}
    ],
    temperature=0,
)
print(response.choices[0].message.content)
# -> Expert explanation with C# comparisons and code`,
          pitfalls: [
            'System prompt is too generic: "You are helpful." Everyone is helpful. Be specific: "You are a Python linter. Find bugs in this code snippet."',
            'System prompt is too long. It wastes tokens. 2-3 sentences is usually enough.',
            'Changing the system prompt for every request. It should stay consistent across a conversation so the model maintains personality/context.',
          ],
        },
        {
          id: 'm1-t5',
          title: 'Few-shot prompting',
          explain:
            'Few-shot means providing 2-3 examples of the desired input/output pattern, then asking the model to do the same for new input.',
          analogy:
            'Few-shot is showing someone 2-3 solved math problems, then asking them to solve a similar one. The examples teach the pattern.',
          theory:
            'Instead of describing the task, show examples.\n\nZero-shot (no examples): "Classify this as positive or negative sentiment."\nFew-shot (with examples):\n"Classify the sentiment:\n\n1. I love this product! -> positive\n2. This broke after one day. -> negative\n3. The UI is confusing. -> negative\n4. It\'s okay, nothing special. -> ???\n\nFor category/classification tasks, few-shot is MUCH more reliable than zero-shot. The model learns the pattern from examples.',
          whyItMatters:
            'Few-shot dramatically improves accuracy for classification and structured tasks. You can often skip fine-tuning if you provide good examples.',
          steps: [
            'Pick 2-3 good examples that cover the range of outputs you expect.',
            'Format them consistently.',
            'Include the new input to classify.',
            'The model will follow the pattern.',
          ],
          code: `from openai import OpenAI

client = OpenAI()

# Few-shot prompting for sentiment classification
response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {
            "role": "system",
            "content": "Classify sentiment as positive, negative, or neutral."
        },
        {
            "role": "user",
            "content": """
Examples:
1. "I love this product!" -> positive
2. "Worst purchase ever." -> negative
3. "It works as described." -> neutral

Now classify: "The app is fast but crashes sometimes."
            """
        }
    ],
    temperature=0,
)
print(response.choices[0].message.content)
# -> mixed / negative (depends on the model's judgment)`,
          pitfalls: [
            'Providing bad examples. If your examples are inconsistent or wrong, the model will mimic the mistakes.',
            'Too few examples. 1-2 might not be enough. Provide at least 3-5 for complex tasks.',
            'Not formatting examples consistently. "Example: X -> Y" is clear. Inconsistent formatting confuses the model.',
          ],
        },
      ],
    },
  ],
}
