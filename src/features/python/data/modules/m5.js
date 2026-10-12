// Module 6: Functions: teach a reusable skill
// Guided lessons, animation frames, knowledge checks, and practice.
export const m5 = {
  "id": "py-m5",
  "title": "Functions: teach a reusable skill",
  "description": "Watch arguments enter a function and a return value travel back to the caller.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s5",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m5-t0",
          "title": "Define, call, return",
          "analogy": "Teach the helper a recipe once; call the recipe whenever an order arrives.",
          "code": "def bill(cups):\n    return cups * 20\ntotal = bill(3)\nprint(total)",
          "frames": [
            {
              "line": 1,
              "state": {
                "function": "bill(cups)"
              },
              "say": "def creates the function. Its body does not run yet.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "call": "bill(3)",
                "cups": 3
              },
              "say": "Call the function and bind the argument 3 to cups.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "cups": 3,
                "return": 60
              },
              "say": "Compute 60 and send it back to the caller.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "total": 60
              },
              "say": "Store the returned value, then print it.",
              "output": "60"
            }
          ],
          "question": "What sends a value to the caller?",
          "options": [
            "print",
            "return"
          ],
          "answer": 1,
          "why": "return passes a result back; print only displays output.",
          "practice": "Call bill(5). Then add a price parameter so bill(3, 25) returns 75.",
          "pitfall": "A function with no executed return statement returns None. A parameter is a local name."
        },
        {
          "id": "py-m5-t1",
          "title": "Defaults and local scope",
          "analogy": "A recipe can assume the usual price, but a caller can request another price.",
          "code": "def bill(cups, price=20):\n    total = cups * price\n    return total\nprint(bill(2, price=25))",
          "frames": [
            {
              "line": 1,
              "state": {
                "default price": 20
              },
              "say": "The default is used only when a price argument is omitted.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "cups": 2,
                "price": 25
              },
              "say": "This call supplies price=25, overriding the default.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "local total": 50
              },
              "say": "total belongs to this function call.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "return": 50
              },
              "say": "Return the result; the caller prints it.",
              "output": "50"
            }
          ],
          "question": "What is bill(2) with the default price?",
          "options": [
            "40",
            "50"
          ],
          "answer": 0,
          "why": "Without a price argument the function uses 20.",
          "practice": "Call bill(cups=4, price=15). Try reading total outside the function and explain the NameError.",
          "pitfall": "Avoid mutable defaults such as items=[]. Use None and create a fresh list inside instead."
        },
        {
          "id": "py-m5-t2",
          "title": "Comprehensions: a compact assembly line",
          "analogy": "Transform every price on a conveyor belt into a doubled price.",
          "code": "prices = [10, 20, 30]\ndoubled = [p * 2 for p in prices]\nprint(doubled)",
          "frames": [
            {
              "line": 1,
              "state": {
                "prices": "[10, 20, 30]",
                "result": "[]"
              },
              "say": "Start with the original list.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "p": 10,
                "result": "[20]"
              },
              "say": "Take 10, transform it, collect 20.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "p": 20,
                "result": "[20, 40]"
              },
              "say": "Take 20 and collect 40.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "p": 30,
                "result": "[20, 40, 60]"
              },
              "say": "Collect the last result.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "prices": "[10, 20, 30]",
                "doubled": "[20, 40, 60]"
              },
              "say": "The new list is ready; the original is unchanged.",
              "output": "[20, 40, 60]"
            }
          ],
          "question": "Does this change prices?",
          "options": [
            "Yes",
            "No"
          ],
          "answer": 1,
          "why": "The comprehension constructs a new list.",
          "practice": "Add if p >= 20 at the end of the comprehension. Predict which prices are transformed.",
          "pitfall": "Prefer an ordinary loop if a comprehension becomes hard to read."
        }
      ]
    }
  ],
  "projects": []
}
