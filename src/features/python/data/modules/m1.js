// Module 2: Names, values & text
// Guided lessons, animation frames, knowledge checks, and practice.
export const m1 = {
  "id": "py-m1",
  "title": "Names, values & text",
  "description": "Watch names point to values, learn types, and build readable messages.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s1",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m1-t0",
          "title": "Variables can change",
          "analogy": "A variable is a name tag for a value. Assignment attaches the name to a value.",
          "code": "cups = 2\ncups = cups + 1\nprint(cups)",
          "frames": [
            {
              "line": 1,
              "state": {
                "cups": 2
              },
              "say": "Attach the name cups to the value 2.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "cups": 3
              },
              "say": "Read the old value, add 1, then assign the result to cups.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "cups": 3
              },
              "say": "The name now refers to 3.",
              "output": "3"
            }
          ],
          "question": "What is cups at the end?",
          "options": [
            "2",
            "3",
            "4"
          ],
          "answer": 1,
          "why": "The right side is evaluated before the name is reassigned.",
          "practice": "Start with score = 10. Add 5 using score += 5, then print it.",
          "pitfall": "Assignment uses =. Equality testing uses ==. A variable is not a permanently fixed box."
        },
        {
          "id": "py-m1-t1",
          "title": "Types tell us what values can do",
          "analogy": "Numbers count cups; strings label cups; booleans answer yes or no.",
          "code": "price = 12.5\nname = \"Tea\"\navailable = True\nprint(type(price).__name__)",
          "frames": [
            {
              "line": 1,
              "state": {
                "price": "12.5 \u2192 float"
              },
              "say": "float represents a number with a fractional part.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "price": "12.5 \u2192 float",
                "name": "Tea \u2192 str"
              },
              "say": "str holds text.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "price": "12.5 \u2192 float",
                "name": "Tea \u2192 str",
                "available": "True \u2192 bool"
              },
              "say": "bool has two values: True and False.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "type(price)": "float"
              },
              "say": "type lets us inspect a value.",
              "output": "float"
            }
          ],
          "question": "Which value is a boolean?",
          "options": [
            "\"True\"",
            "True",
            "12.5"
          ],
          "answer": 1,
          "why": "True without quotes is a boolean; \"True\" is text.",
          "practice": "Print type(4), type(4.0), and type(\"4\"). Explain all three.",
          "pitfall": "\"2\" + \"3\" joins strings into \"23\"; it does not add numbers. None represents the absence of a value."
        },
        {
          "id": "py-m1-t2",
          "title": "Friendly messages with f-strings",
          "analogy": "An f-string is a message with spaces reserved for your values.",
          "code": "name = \"Asha\"\ncups = 3\nprint(f\"{name} ordered {cups} teas.\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "name": "Asha"
              },
              "say": "Remember the customer name.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "name": "Asha",
                "cups": 3
              },
              "say": "Remember the order size.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "{name}": "Asha",
                "{cups}": 3
              },
              "say": "Each expression inside braces becomes part of the text.",
              "output": "Asha ordered 3 teas."
            }
          ],
          "question": "Where do values go in an f-string?",
          "options": [
            "Inside {}",
            "Inside []",
            "After #"
          ],
          "answer": 0,
          "why": "Curly braces contain expressions that Python evaluates.",
          "practice": "Make a receipt with item, quantity, and total. Use {total:.2f} to display two decimal places.",
          "pitfall": "The f before the opening quote enables interpolation. Without it, braces remain ordinary text."
        }
      ]
    }
  ],
  "projects": []
}
