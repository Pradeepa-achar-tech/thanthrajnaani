// Module 3: Decisions & branching
// Guided lessons, animation frames, knowledge checks, and practice.
export const m2 = {
  "id": "py-m2",
  "title": "Decisions & branching",
  "description": "Follow a decision road and see exactly which branch Python chooses.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s2",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m2-t0",
          "title": "Choose with if and else",
          "analogy": "Like checking whether a customer has enough money before serving tea.",
          "code": "money = 15\nif money >= 20:\n    print(\"Serve tea\")\nelse:\n    print(\"Need more money\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "money": 15
              },
              "say": "The customer has 15.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "money": 15,
                "money >= 20": "False"
              },
              "say": "Compare the money with the price. The condition is False.",
              "output": ""
            },
            {
              "line": 5,
              "state": {
                "branch": "else"
              },
              "say": "Skip the if body and follow the else branch.",
              "output": "Need more money"
            }
          ],
          "question": "Which branch runs with money = 15?",
          "options": [
            "if",
            "else"
          ],
          "answer": 1,
          "why": "15 is less than 20, so money >= 20 is False.",
          "practice": "Change money to 20. Predict the output before running. Keep the body indented by four spaces.",
          "pitfall": "Indentation defines blocks. A colon starts the block. >= includes the boundary value."
        },
        {
          "id": "py-m2-t1",
          "title": "More than two choices",
          "analogy": "A menu can have small, medium, and large portions. elif checks another possibility.",
          "code": "cups = 5\nif cups >= 10:\n    print(\"Big order\")\nelif cups >= 4:\n    print(\"Group order\")\nelse:\n    print(\"Small order\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "cups": 5
              },
              "say": "We have five cups.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "cups >= 10": "False"
              },
              "say": "The first test fails, so continue.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "cups >= 4": "True"
              },
              "say": "The next test passes.",
              "output": ""
            },
            {
              "line": 5,
              "state": {
                "branch": "elif"
              },
              "say": "Run this body. Remaining branches are skipped.",
              "output": "Group order"
            }
          ],
          "question": "How many branches in this chain execute?",
          "options": [
            "All matching branches",
            "At most one"
          ],
          "answer": 1,
          "why": "Python takes the first matching branch in an if/elif/else chain.",
          "practice": "Add an extra branch for cups >= 20. Place it before cups >= 10.",
          "pitfall": "Check the most restrictive threshold first; otherwise an earlier branch may capture it."
        },
        {
          "id": "py-m2-t2",
          "title": "Combine conditions",
          "analogy": "Two checks can work together: the shop must be open AND tea must be available.",
          "code": "is_open = True\nstock = 0\nprint(is_open and stock > 0)\nprint(is_open or stock > 0)",
          "frames": [
            {
              "line": 1,
              "state": {
                "is_open": true
              },
              "say": "The shop is open.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "is_open": true,
                "stock": 0
              },
              "say": "But there is no stock.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "True and False": "False"
              },
              "say": "and needs both conditions to be true.",
              "output": "False"
            },
            {
              "line": 4,
              "state": {
                "True or False": "True"
              },
              "say": "or needs at least one condition to be true.",
              "output": "False\nTrue"
            }
          ],
          "question": "What is True and False?",
          "options": [
            "True",
            "False"
          ],
          "answer": 1,
          "why": "Both sides must be true for this boolean and expression.",
          "practice": "Try not is_open. Then write a condition for age >= 18 and has_ticket.",
          "pitfall": "Use and, or, not for boolean logic. Python treats zero and empty collections as false in conditions."
        }
      ]
    }
  ],
  "projects": []
}
