// Week 3 — APIs and HTTP
// Making API calls, error handling, rate limits, working with responses

export const m2 = {
  id: 'm2',
  title: 'Week 3 — APIs and HTTP',
  hours: 6,
  color: 'from-green-500/20 to-green-700/10',
  accent: 'green',
  description:
    'Every AI agent talks to APIs. Learn HTTP verbs, status codes, authentication, rate limits, and how to build resilient API clients that handle failures gracefully.',
  sections: [
    {
      id: 'm2-s1',
      title: 'HTTP Basics',
      topics: [
        {
          id: 'm2-t1',
          title: 'HTTP verbs: GET, POST, PUT, DELETE',
          explain:
            'HTTP verbs tell the server what you want to do. GET reads data, POST creates, PUT updates, DELETE removes.',
          analogy:
            'HTTP verbs are like CRUD operations in databases: Create (POST), Read (GET), Update (PUT), Delete (DELETE).',
          theory:
            'GET: Fetch data. Idempotent (safe to repeat). No body, data in URL query params.\nPOST: Create new resource or trigger action. Has body with data. Not idempotent.\nPUT: Update entire resource. Has body. Idempotent.\nPATCH: Partial update. Has body.\nDELETE: Remove resource. No body. Idempotent.\n\nExample:\nGET /api/users/123 -> Read user #123\nPOST /api/users -> Create new user (send user data in body)\nPUT /api/users/123 -> Replace entire user #123\nDELETE /api/users/123 -> Remove user #123\n\nIdempotent means: calling it 10 times = calling it once. GET and DELETE are safe to retry.',
          whyItMatters:
            'Knowing the right verb prevents bugs. If you accidentally use POST when you should use GET, you might create duplicates. Using the right verb makes your code intent clear.',
          steps: [
            'Open a weather API docs (e.g., OpenWeatherMap).',
            'Find the GET endpoint for current weather.',
            'Make a GET request with your API key.',
            'Check the response. Extract temperature.',
            'Try POST with wrong data. See the error.',
          ],
          code: `import requests

# GET: Fetch data (idempotent, safe to retry)
response = requests.get(
    "https://api.openweathermap.org/data/2.5/weather",
    params={"q": "London", "appid": "YOUR_API_KEY"}
)
data = response.json()
print(f"Temperature: {data['main']['temp']}")

# POST: Create something (not idempotent)
response = requests.post(
    "https://api.example.com/messages",
    json={"text": "Hello, world!"}  # Data in body, not URL
)
print(response.status_code)

# PUT: Update something (idempotent)
response = requests.put(
    "https://api.example.com/users/123",
    json={"name": "Alice", "age": 30}
)

# DELETE: Remove something (idempotent)
response = requests.delete("https://api.example.com/users/123")`,
          pitfalls: [
            'Using POST for reads. POST should CREATE, not READ. Use GET.',
            'Not making DELETE/PUT idempotent. If the network fails, your retry code might cause problems.',
            'Assuming all APIs follow REST conventions. Some don\'t. Always check the docs.',
          ],
        },
      ],
    },
  ],
}
