// Week 8 — Deployment and Production
// Hosting agents, scaling, monitoring, error handling in production

export const m7 = {
  id: 'm7',
  title: 'Week 8 — Deployment and Production',
  hours: 6,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Your agent works locally. Now ship it to production. Learn Streamlit for UIs, FastAPI for APIs, logging, monitoring, cost tracking, and handling failures gracefully.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Building Agent UIs',
      topics: [
        {
          id: 'm7-t1',
          title: 'Streamlit for quick prototypes',
          explain:
            'Streamlit turns Python scripts into interactive web apps in minutes. No HTML/CSS/JavaScript needed.',
          analogy:
            'Streamlit is like sketching a UI with Python. You write code, Streamlit renders it as a web page.',
          theory:
            'Streamlit basics:\n- st.title() - heading\n- st.input_text() - text box\n- st.button() - button\n- st.write() - output\n- st.chat_message() - chat UI\n- st.session_state - keep state across reruns\n\nStreamlit reruns the entire script on every interaction. Use session_state to persist data.',
          whyItMatters:
            'Prototyping agents in web UIs is 100x faster than building React/Vue. Ship demos in hours.',
          steps: [
            'pip install streamlit',
            'Create app.py with UI code',
            'streamlit run app.py',
            'Add agent logic to handle user input',
          ],
          code: `import streamlit as st
from agent import run_agent

st.set_page_config(page_title="AI Agent")
st.title("🤖 Research Agent")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    role = message["role"]
    content = message["content"]
    st.chat_message(role).write(content)

# User input
user_input = st.chat_input("Ask me anything...")

if user_input:
    # Add user message to history
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Run agent
    with st.spinner("Thinking..."):
        response = run_agent(user_input)

    # Add agent response to history
    st.session_state.messages.append({"role": "assistant", "content": response})

    # Rerun to display new messages
    st.rerun()`,
          pitfalls: [
            'Forgetting to use session_state. Every rerun loses state.',
            'Long-running tasks block the UI. Use st.spinner() and cache with @st.cache_data.',
            'Not handling errors. User sees stack trace instead of friendly message.',
          ],
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Production Monitoring',
      topics: [
        {
          id: 'm7-t2',
          title: 'Logging and error tracking',
          explain:
            'In production, you can\'t see the console. Log everything: requests, LLM calls, errors, timing.',
          analogy:
            'Logging is like a flight recorder. If something goes wrong, you replay the logs to understand what happened.',
          theory:
            'Log levels:\n- DEBUG: Detailed info (tokens, parameters)\n- INFO: Key events (agent started, tool called)\n- WARNING: Something odd but not critical\n- ERROR: Failure that needs attention\n- CRITICAL: System down\n\nLogging best practices:\n- Log input/output (sanitized of secrets)\n- Log timing (how long did the LLM take?)\n- Log cost (tokens used = cost)\n- Use structured logging (JSON, not text)\n- Ship logs to centralized service (Datadog, Sentry)',
          whyItMatters:
            'Without logs, production bugs are invisible. With logs, you can debug production issues without ssh-ing into servers.',
          steps: [
            'Set up Python logging',
            'Log agent execution steps',
            'Track costs (tokens * price)',
            'Send logs to external service',
          ],
          code: `import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def run_agent_with_logging(user_input):
    start_time = datetime.now()
    logger.info(json.dumps({
        "event": "agent_start",
        "user_input": user_input,
        "timestamp": start_time.isoformat()
    }))

    try:
        # Run agent
        result = run_agent(user_input)

        duration = (datetime.now() - start_time).total_seconds()
        cost = 0.001  # Placeholder: actual cost based on tokens

        logger.info(json.dumps({
            "event": "agent_complete",
            "duration_seconds": duration,
            "cost_cents": cost * 100,
            "status": "success"
        }))

        return result

    except Exception as e:
        logger.error(json.dumps({
            "event": "agent_error",
            "error": str(e),
            "error_type": type(e).__name__
        }))
        raise`,
          pitfalls: [
            'Logging sensitive data (API keys, passwords).',
            'Not logging enough detail to debug. Include context.',
            'Logging everything at INFO level. Separate debug from info.',
          ],
        },
      ],
    },
  ],
}
