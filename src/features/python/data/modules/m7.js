// Module 8: Build a cafe billing program
// Guided lessons, animation frames, knowledge checks, and practice.
export const m7 = {
  "id": "py-m7",
  "title": "Build a cafe billing program",
  "description": "Put the pieces together, test your assumptions, and build a small useful program.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s7",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m7-t0",
          "title": "Objects keep related data together",
          "analogy": "A class is a recipe for order objects. Each order has its own cup count.",
          "code": "class Order:\n    def __init__(self, cups):\n        self.cups = cups\norder = Order(3)\nprint(order.cups)",
          "frames": [
            {
              "line": 1,
              "state": {
                "class": "Order"
              },
              "say": "Define a new type with a constructor method.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "call": "Order(3)"
              },
              "say": "Create an instance; Python calls __init__ to initialize it.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "order.cups": 3
              },
              "say": "self refers to the instance being initialized.",
              "output": ""
            },
            {
              "line": 5,
              "state": {
                "instance": "order",
                "cups": 3
              },
              "say": "Read the attribute on that instance.",
              "output": "3"
            }
          ],
          "question": "What does self refer to here?",
          "options": [
            "The instance",
            "Every order at once"
          ],
          "answer": 0,
          "why": "self is the conventional name for the current instance parameter.",
          "practice": "Create a second Order(5). Change order.cups and verify that the second instance is unaffected.",
          "pitfall": "Use classes when data and behavior belong together. Simple functions and dictionaries are enough for many small programs."
        },
        {
          "id": "py-m7-t1",
          "title": "Test before trusting",
          "analogy": "A test checks a recipe against a result you already know.",
          "code": "def bill(cups):\n    return cups * 20\nassert bill(3) == 60\nassert bill(0) == 0",
          "frames": [
            {
              "line": 1,
              "state": {
                "function": "bill"
              },
              "say": "Define the behavior to test.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "actual": 60,
                "expected": 60,
                "test": "pass"
              },
              "say": "Check a normal order.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "actual": 0,
                "expected": 0,
                "test": "pass"
              },
              "say": "Check the zero boundary. No output means these assertions passed.",
              "output": ""
            }
          ],
          "question": "What if an assertion is false?",
          "options": [
            "It is ignored",
            "AssertionError is raised"
          ],
          "answer": 1,
          "why": "A failed assertion interrupts normal execution and reports a failed check.",
          "practice": "Temporarily change the multiplier to 25. Run the tests and locate the failure. Restore 20. Test a negative quantity policy too.",
          "pitfall": "Assertions are for developer checks, not user validation: Python can disable them with optimization flags."
        },
        {
          "id": "py-m7-t2",
          "title": "Your final project: a receipt",
          "analogy": "The whole cafe team now works together: menu lookup, iteration, totals, and a receipt.",
          "code": "prices = {\"tea\": 20, \"coffee\": 30}\norder = [\"tea\", \"coffee\", \"tea\"]\ntotal = 0\nfor item in order:\n    total += prices[item]\nprint(f\"Total: {total}\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "tea": 20,
                "coffee": 30
              },
              "say": "Keep the price lookup in a dictionary.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "order": "tea \u2192 coffee \u2192 tea"
              },
              "say": "Keep the selected items in order.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "total": 0
              },
              "say": "Initialize the accumulator once.",
              "output": ""
            },
            {
              "line": 5,
              "state": {
                "item": "tea",
                "total": 20
              },
              "say": "Look up tea and add its price.",
              "output": ""
            },
            {
              "line": 5,
              "state": {
                "item": "coffee",
                "total": 50
              },
              "say": "Look up coffee and add 30.",
              "output": ""
            },
            {
              "line": 5,
              "state": {
                "item": "tea",
                "total": 70
              },
              "say": "Add the final tea.",
              "output": ""
            },
            {
              "line": 6,
              "state": {
                "total": 70
              },
              "say": "Leave the loop and format the receipt.",
              "output": "Total: 70"
            }
          ],
          "question": "What is the receipt total?",
          "options": [
            "50",
            "60",
            "70"
          ],
          "answer": 2,
          "why": "Two teas cost 40, and one coffee costs 30.",
          "practice": "Build this in cafe.py. Add a calculate_total(order, prices) function. Ask for comma-separated item names, strip spaces, reject unknown items with a friendly message, print a receipt, and save it to receipt.txt. Test an empty order, repeated items, and an unknown item.",
          "pitfall": "Separate input, calculation, and file writing. First make the fixed example work; then add one feature at a time."
        }
      ]
    }
  ],
  "projects": [
    {
      "id": "py-cafe",
      "title": "Caf? receipt builder",
      "description": "Build, validate, test, and save a receipt using the concepts from all eight modules."
    }
  ]
}
