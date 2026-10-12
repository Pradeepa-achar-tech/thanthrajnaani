

// Module 5: Collections: organize your world
// Guided lessons, animation frames, knowledge checks, and practice.
export const m4 = {
  "id": "py-m4",
  "title": "Collections: organize your world",
  "description": "Arrange lists, look up dictionary entries, and understand shared references.",
  "hours": 3,
  "sections": [
    {
      "id": "py-s4",
      "title": "Watch, predict, practice",
      "topics": [
        {
          "id": "py-m4-t0",
          "title": "Lists and indexes",
          "analogy": "A list is a row of numbered menu slots. The first slot is numbered zero.",
          "code": "menu = [\"tea\", \"coffee\"]\nmenu.append(\"juice\")\nprint(menu[1])",
          "frames": [
            {
              "line": 1,
              "state": {
                "[0]": "tea",
                "[1]": "coffee"
              },
              "say": "A list keeps items in order.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "[0]": "tea",
                "[1]": "coffee",
                "[2]": "juice"
              },
              "say": "append adds an item at the end.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "selected index": 1,
                "selected value": "coffee"
              },
              "say": "Index 1 means the second item.",
              "output": "coffee"
            }
          ],
          "question": "What is menu[0]?",
          "options": [
            "tea",
            "coffee",
            "juice"
          ],
          "answer": 0,
          "why": "List indexing starts at zero.",
          "practice": "Print menu[-1] for the last item. Print menu[:2] for a slice containing the first two.",
          "pitfall": "An index outside the list raises IndexError. A tuple, such as (1, 2), cannot have its items reassigned."
        },
        {
          "id": "py-m4-t1",
          "title": "Dictionaries and sets",
          "analogy": "A dictionary is a menu lookup: ask by item name instead of slot number.",
          "code": "prices = {\"tea\": 20, \"coffee\": 30}\nprices[\"tea\"] = 25\nprint(prices[\"tea\"])",
          "frames": [
            {
              "line": 1,
              "state": {
                "tea": 20,
                "coffee": 30
              },
              "say": "Keys connect to values.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "tea": 25,
                "coffee": 30
              },
              "say": "Update just the value connected to tea.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "lookup": "tea \u2192 25"
              },
              "say": "Read using the key.",
              "output": "25"
            }
          ],
          "question": "How do you read the tea price?",
          "options": [
            "prices[\"tea\"]",
            "prices[0]"
          ],
          "answer": 0,
          "why": "This dictionary uses item names as its keys.",
          "practice": "Try prices.get(\"juice\", 0). Then make set([\"tea\", \"tea\", \"coffee\"]) and observe that duplicates disappear.",
          "pitfall": "A missing key accessed with [] raises KeyError. Sets hold unique hashable values and do not support positional indexing."
        },
        {
          "id": "py-m4-t2",
          "title": "Shared references and copies",
          "analogy": "Two name tags can point to the same menu. Editing that menu affects both names.",
          "code": "a = [\"tea\"]\nb = a\nb.append(\"juice\")\nprint(a)",
          "frames": [
            {
              "line": 1,
              "state": {
                "a": "\u2192 list A",
                "list A": "[tea]"
              },
              "say": "Create a list and point a to it.",
              "output": ""
            },
            {
              "line": 2,
              "state": {
                "a": "\u2192 list A",
                "b": "\u2192 list A",
                "list A": "[tea]"
              },
              "say": "Assignment shares the reference; it does not copy the list.",
              "output": ""
            },
            {
              "line": 3,
              "state": {
                "a": "\u2192 list A",
                "b": "\u2192 list A",
                "list A": "[tea, juice]"
              },
              "say": "Mutate the shared object through b.",
              "output": ""
            },
            {
              "line": 4,
              "state": {
                "a": "[tea, juice]"
              },
              "say": "Reading through a sees the same modified list.",
              "output": "['tea', 'juice']"
            }
          ],
          "question": "Does b = a copy a list?",
          "options": [
            "Yes",
            "No"
          ],
          "answer": 1,
          "why": "Both names refer to the same list object.",
          "practice": "Replace b = a with b = a.copy(). Repeat the append and compare a with b.",
          "pitfall": "copy() is shallow: nested mutable objects are still shared. Strings and numbers are immutable."
        }
      ]
    }
  ],
  "projects": []
}
