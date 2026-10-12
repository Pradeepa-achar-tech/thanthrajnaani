// Module 7: Files, errors & useful tools
// Guided lessons, animation frames, knowledge checks, and practice.
export const m6 = {
  "id": "py-m6",
  "title": "Files, errors & useful tools",
  "description": "Keep data after the program ends and recover from expected mistakes.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s6",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m6-t0",
          "title": "Read and write a file",
          "analogy": "A file is the notebook the cafe keeps after closing time.",
          "code": "with open(\"note.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Tea: 20\")\nwith open(\"note.txt\", encoding=\"utf-8\") as f:\n    print(f.read())",
          "frames": [
            {
              "line": 1,
              "state": {
                "file": "note.txt",
                "mode": "write"
              },
              "say": "Open for writing; w creates or truncates the file.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "disk": "Tea: 20"
              },
              "say": "Write text. Leaving the block closes the file.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "file": "note.txt",
                "mode": "read"
              },
              "say": "Reopen the saved file for reading.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "read": "Tea: 20"
              },
              "say": "Read its content and display it.",
              "output": "Tea: 20"
            }
          ],
          "question": "What does mode \"w\" do to an existing file?",
          "options": [
            "Appends only",
            "Replaces its content"
          ],
          "answer": 1,
          "why": "Opening with w truncates existing content. Use a to append.",
          "practice": "Use a temporary practice file. Write your name, reopen it, and read it. Use json.dump/load to save a dictionary in a .json file.",
          "pitfall": "with closes the file even on an error. File paths are relative to the working directory unless absolute."
        },
        {
          "id": "py-m6-t1",
          "title": "Handle expected errors",
          "analogy": "If a customer gives words instead of a number, explain the problem and recover.",
          "code": "try:\n    cups = int(\"three\")\nexcept ValueError:\n    print(\"Please enter digits.\")",
          "frames": [
            {
              "line": 1,
              "state": {
                "block": "try"
              },
              "say": "Attempt the operation that may fail.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "input": "three",
                "error": "ValueError"
              },
              "say": "int cannot convert this text. Execution jumps to a matching handler.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "handler": "except ValueError"
              },
              "say": "Catch this specific expected error.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "status": "handled"
              },
              "say": "Give a helpful message instead of crashing.",
              "output": "Please enter digits."
            }
          ],
          "question": "Which error does this conversion raise?",
          "options": [
            "ValueError",
            "KeyError"
          ],
          "answer": 0,
          "why": "The input has the wrong value format for integer conversion.",
          "practice": "Replace \"three\" with \"3\" and see that the except block is skipped. Then use input and ask again in a loop after invalid input.",
          "pitfall": "Catch specific errors. Catching every exception can hide bugs. finally is for cleanup regardless of success."
        },
        {
          "id": "py-m6-t2",
          "title": "Modules and a tidy workspace",
          "analogy": "Import a tool from a toolbox instead of writing it again.",
          "code": "import math\nroot = math.sqrt(81)\nprint(root)",
          "frames": [
            {
              "line": 1,
              "state": {
                "toolbox": "math"
              },
              "say": "Import the standard-library math module. No package installation is needed.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "argument": 81,
                "math.sqrt": 9.0
              },
              "say": "Call the square-root function from the module.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "root": 9.0
              },
              "say": "Read the result.",
              "output": "9.0"
            }
          ],
          "question": "Does math require pip install?",
          "options": [
            "Yes",
            "No"
          ],
          "answer": 1,
          "why": "math ships with Python as part of its standard library.",
          "practice": "Create tools.py with a bill function. Import it in main.py. For external packages, create a virtual environment with python -m venv .venv, activate it, and use python -m pip install package-name.",
          "pitfall": "Do not name your file math.py: it can shadow the real module. Keep external dependencies in a requirements file."
        }
      ]
    }
  ],
  "projects": []
}
