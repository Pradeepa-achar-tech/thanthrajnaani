// Week 4 — Data Handling and JSON
// Working with JSON, parsing, transforming, validating data structures

export const m3 = {
  id: 'm3',
  title: 'Week 4 — Data Handling and JSON',
  hours: 5,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'All AI agent work is data in, data out. Master JSON, structured data, type validation, and transformations. Build data pipelines that chain API calls and LLM outputs.',
  sections: [
    {
      id: 'm3-s1',
      title: 'JSON and Structured Data',
      topics: [
        {
          id: 'm3-t1',
          title: 'JSON basics: objects, arrays, types',
          explain:
            'JSON is the universal data format. Objects {}, arrays [], strings "", numbers, booleans, null. Master it and you can work with any API.',
          analogy:
            'JSON is like a structured filing cabinet. Objects are folders with labeled contents. Arrays are stacks of items. Types keep things organized.',
          theory:
            'JSON data types:\n- object: {"key": value}\n- array: [item1, item2]\n- string: "text"\n- number: 42 or 3.14\n- boolean: true/false\n- null: absence of value\n\nIn Python:\n- JSON object -> dict\n- JSON array -> list\n- JSON string -> str\n- JSON number -> int or float\n- JSON boolean -> bool\n- JSON null -> None\n\nNesting: {"user": {"name": "Alice", "age": 30}, "messages": ["Hi", "Bye"]}\n\nAccess: data["user"]["name"] = "Alice"',
          whyItMatters:
            'Every API returns JSON. Every LLM output you parse is structured data. Understanding JSON deeply makes you 10x faster at integration work.',
          steps: [
            'Copy a JSON response from an API.',
            'Parse it in Python: data = json.loads(json_string)',
            'Access nested values.',
            'Modify the data.',
            'Convert back to JSON string: json.dumps(data)',
          ],
          code: `import json

# Parse JSON string to Python dict
json_string = '{"user": {"name": "Alice", "age": 30}, "active": true}'
data = json.loads(json_string)

# Access values
print(data["user"]["name"])  # "Alice"
print(data["active"])  # True (note: lowercase true becomes True)

# Modify
data["user"]["age"] = 31
data["tags"] = ["admin", "verified"]

# Convert back to JSON string
output = json.dumps(data, indent=2)
print(output)
# {
#   "user": {
#     "name": "Alice",
#     "age": 31
#   },
#   "active": true,
#   "tags": ["admin", "verified"]
# }`,
          pitfalls: [
            'Forgetting that JSON keys must be strings. {"name": "Alice"} is valid, {name: "Alice"} is NOT.',
            'Mixing Python syntax with JSON. Python uses True, JSON uses true.',
            'Not handling None/null. In JSON, null = Python None.',
          ],
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'Validation and Type Safety',
      topics: [
        {
          id: 'm3-t2',
          title: 'Validating data with Pydantic',
          explain:
            'Pydantic ensures data conforms to a schema. Define what fields exist, what types they are, and Pydantic will validate and transform.',
          analogy:
            'Pydantic is like a bouncer at a nightclub. You define the rules (age >= 18, must have ID). The bouncer checks everyone and lets through only valid people.',
          theory:
            'Without Pydantic:\ndata = {"name": "Alice", "age": "thirty"}  # age is string, not int!\nif not isinstance(data["age"], int):  # Need manual checks\n    raise ValueError("age must be int")\n\nWith Pydantic:\nfrom pydantic import BaseModel, validator\n\nclass User(BaseModel):\n    name: str\n    age: int\n\nuser = User(name="Alice", age=30)  # Valid\nuser = User(name="Alice", age="thirty")  # Raises ValidationError\nuser = User(name="Alice", age="30")  # Auto-converts string to int!\n\nPydantic also supports custom validators, nested models, and defaults.',
          whyItMatters:
            'Validation catches bugs early. Without it, you\'ll spend hours debugging "why is age a string?" Pydantic saves you that pain.',
          steps: [
            'Install: pip install pydantic',
            'Define a model class with typed fields.',
            'Create instances. Pydantic validates.',
            'Try passing wrong types. See ValidationError.',
            'Add defaults and optional fields.',
          ],
          code: `from pydantic import BaseModel, validator, Field
from typing import Optional, List

class User(BaseModel):
    name: str
    age: int
    email: str
    tags: List[str] = []  # Default to empty list
    active: bool = True  # Default to True

    @validator("age")
    def age_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("age must be >= 0")
        return v

# Valid
user = User(name="Alice", age=30, email="alice@example.com")

# Auto-converts types
user = User(name="Alice", age="30", email="alice@example.com")

# Raises ValidationError: age must be >= 0
try:
    user = User(name="Alice", age=-5, email="alice@example.com")
except Exception as e:
    print(e)

# Optional fields
user = User(name="Alice", age=30, email="alice@example.com", tags=["admin"])`,
          pitfalls: [
            'Not using Pydantic. Your AI agent code becomes brittle.',
            'Over-validating. Not every field needs a custom validator.',
            'Forgetting to handle Optional[T]. If age can be None, declare it explicitly.',
          ],
        },
      ],
    },
  ],
}
