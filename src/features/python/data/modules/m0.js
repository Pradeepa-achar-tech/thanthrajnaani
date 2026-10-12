// Module 1: Hello, Python!
// Guided lessons, animation frames, knowledge checks, and practice.
export const m0 = {
  "id": "py-m0",
  "title": "Hello, Python!",
  "description": "Meet your patient computer: give instructions, read output, and learn to experiment.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s0",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m0-t0",
          "title": "Your first conversation",
          "analogy": "Python is a kitchen helper. It follows your written instructions in order.",
          "code": "print(\"Hello, Kundapura!\")\nprint(\"Let us learn Python.\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "instruction": "print a greeting"
              },
              "say": "print sends the text inside the quotes to the screen.",
              "output": "Hello, Kundapura!"
            },
            {
              "line": 2,
              "state": {
                "instruction": "print another message"
              },
              "say": "Python moves to the next line. Output appears in the same order.",
              "output": "Hello, Kundapura!\nLet us learn Python."
            }
          ],
          "question": "Which message appears first?",
          "options": [
            "Hello, Kundapura!",
            "Let us learn Python."
          ],
          "answer": 0,
          "why": "Python executes these statements from top to bottom.",
          "practice": "Install Python 3 from python.org. Save these lines as hello.py. Run python hello.py (or python3 hello.py). Change the greeting and run again.",
          "pitfall": "Quotes surround text; print is lowercase. A # comment is a note Python ignores."
        },
        {
          "id": "py-m0-t1",
          "title": "Numbers and expressions",
          "analogy": "Use Python like the calculator at a cafe counter.",
          "code": "price = 20\nquantity = 3\nprint(price * quantity)",
          "frames": [
            {
              "line": 1,
              "state": {
                "price": 20
              },
              "say": "First remember the price of one tea.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "price": 20,
                "quantity": 3
              },
              "say": "Now remember how many teas we sold.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "price": 20,
                "quantity": 3,
                "total": 60
              },
              "say": "Multiplication combines the two numbers.",
              "output": "60"
            }
          ],
          "question": "What does 20 * 3 produce?",
          "options": [
            "23",
            "60",
            "203"
          ],
          "answer": 1,
          "why": "The * operator multiplies numbers.",
          "practice": "Print 17 // 5 and 17 % 5. Explain the quotient (3) and remainder (2). Then compare /, which produces 3.4.",
          "pitfall": "Use ** for powers. Parentheses control order: (2 + 3) * 4 is 20."
        },
        {
          "id": "py-m0-t2",
          "title": "Input: listen before answering",
          "analogy": "input is the helper asking a customer a question. The reply always arrives as text.",
          "code": "cups = input(\"How many cups? \")\ncount = int(cups)\nprint(count + 1)",
          "frames": [
            {
              "line": 1,
              "state": {
                "cups": "\"3\" (str)"
              },
              "say": "For this example the customer types 3. input returns the string \"3\".",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "cups": "\"3\" (str)",
                "count": "3 (int)"
              },
              "say": "int converts numeric text into a whole number.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "count": 3,
                "next": 4
              },
              "say": "Now arithmetic is possible.",
              "output": "4"
            }
          ],
          "question": "What type does input return?",
          "options": [
            "int",
            "str",
            "bool"
          ],
          "answer": 1,
          "why": "Even a reply containing digits is text until you convert it.",
          "practice": "Ask for a name, then greet the person. Ask for an age, convert it with int, and print the age next year.",
          "pitfall": "int(\"three\") raises ValueError. We will handle invalid input in module 7."
        }
      ]
    }
  ],
  "projects": []
}
