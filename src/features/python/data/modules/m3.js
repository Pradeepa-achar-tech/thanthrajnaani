// Module 4: Loops: patient repetition
// Guided lessons, animation frames, knowledge checks, and practice.
export const m3 = {
  "id": "py-m3",
  "title": "Loops: patient repetition",
  "description": "See the execution pointer return, items move through a loop, and totals grow.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s3",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m3-t0",
          "title": "Visit each item with for",
          "analogy": "A waiter visits every table in a list, one at a time.",
          "code": "for table in [1, 2, 3]:\n    print(f\"Serve table {table}\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "table": 1,
                "remaining": "2 \u2192 3"
              },
              "say": "Take the first item.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "table": 1
              },
              "say": "Run the body for table 1.",
              "output": "Serve table 1"
            },
            {
              "line": 2,
              "state": {
                "table": 2
              },
              "say": "Return to the loop, take 2, then run the body again.",
              "output": "Serve table 1\nServe table 2"
            },
            {
              "line": 2,
              "state": {
                "table": 3
              },
              "say": "Take the final item. After this body the loop ends.",
              "output": "Serve table 1\nServe table 2\nServe table 3"
            }
          ],
          "question": "How many times does the body run?",
          "options": [
            "2",
            "3",
            "Forever"
          ],
          "answer": 1,
          "why": "There are three items to visit.",
          "practice": "Use range(1, 4) instead of the list. Then try range(3) and notice it gives 0, 1, 2.",
          "pitfall": "The stop value in range is excluded. for visits iterable items; it does not require numeric indexes."
        },
        {
          "id": "py-m3-t1",
          "title": "Keep going with while",
          "analogy": "Keep pouring cups while there are cups left to fill.",
          "code": "cups = 3\nwhile cups > 0:\n    cups -= 1\nprint(\"Done\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "cups": 3
              },
              "say": "Start with three unfilled cups.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "cups": 2,
                "cups > 0": true
              },
              "say": "The condition passed; fill one and decrease cups.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "cups": 1,
                "cups > 0": true
              },
              "say": "Test again, then decrease again.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "cups": 0
              },
              "say": "The last cup is filled.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "cups > 0": false
              },
              "say": "The next test fails. Leave the loop.",
              "output": "Done"
            }
          ],
          "question": "What happens if cups never decreases?",
          "options": [
            "The loop stops immediately",
            "The loop keeps running"
          ],
          "answer": 1,
          "why": "With cups staying positive, the condition never becomes false.",
          "practice": "Write a countdown from 5 to 1. Print before subtracting.",
          "pitfall": "Update the state that controls the condition. break exits a loop; continue skips to the next iteration."
        },
        {
          "id": "py-m3-t2",
          "title": "Build a running total",
          "analogy": "Put each sale into a money jar. The jar remembers everything added so far.",
          "code": "total = 0\nfor price in [20, 30, 10]:\n    total += price\nprint(total)",
          "frames": [
            {
              "line": 1,
              "state": {
                "total": 0
              },
              "say": "Begin with an empty jar.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "price": 20,
                "total": 20
              },
              "say": "Add the first sale.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "price": 30,
                "total": 50
              },
              "say": "Keep the previous total and add 30.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "price": 10,
                "total": 60
              },
              "say": "Add the final sale.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "total": 60
              },
              "say": "The loop is over; print once.",
              "output": "60"
            }
          ],
          "question": "Where should total = 0 go?",
          "options": [
            "Before the loop",
            "Inside the loop"
          ],
          "answer": 0,
          "why": "Initializing inside would erase the running total on every iteration.",
          "practice": "Compute the sum of [5, 10, 15] manually with a loop, then compare with sum([5, 10, 15]).",
          "pitfall": "Printing inside the loop displays intermediate totals. Printing after it displays the final total."
        }
      ]
    }
  ],
  "projects": []
}
