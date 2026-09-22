import { useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'

const examples = {
  variables: {
    title: 'Variables & Types',
    code: `name = "Alice"
age = 30
skills: list[str] = ["Python", "AI"]

print(f"Hello, {name}!")
print(f"Age: {age}")
print(f"Skills: {', '.join(skills)}")`,
    output: `Hello, Alice!
Age: 30
Skills: Python, AI`,
  },
  list_comp: {
    title: 'List Comprehension',
    code: `numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]

print("Original:", numbers)
print("Squared:", squared)
print("Even numbers:", evens)`,
    output: `Original: [1, 2, 3, 4, 5]
Squared: [1, 4, 9, 16, 25]
Even numbers: [2, 4]`,
  },
  functions: {
    title: 'Functions with Type Hints',
    code: `def calculate_tax(amount: float, rate: float = 0.18) -> float:
    return amount * rate

def format_price(price: float) -> str:
    return f"₹{price:.2f}"

total = 1000
tax = calculate_tax(total)
print(f"Amount: {format_price(total)}")
print(f"Tax (18%): {format_price(tax)}")
print(f"Total: {format_price(total + tax)}")`,
    output: `Amount: ₹1000.00
Tax (18%): ₹180.00
Total: ₹1180.00`,
  },
  dataclass: {
    title: 'Dataclass',
    code: `from dataclasses import dataclass

@dataclass
class Agent:
    name: str
    model: str
    temperature: float = 0.7

assistant = Agent("AI Helper", "gpt-4", 0.8)
print(f"Agent: {assistant.name}")
print(f"Model: {assistant.model}")
print(f"Temperature: {assistant.temperature}")`,
    output: `Agent: AI Helper
Model: gpt-4
Temperature: 0.8`,
  },
  dict_ops: {
    title: 'Dictionary Operations',
    code: `expenses = {
    "food": 50,
    "transport": 25,
    "entertainment": 40,
}

total = sum(expenses.values())
print("Expenses:")
for category, amount in expenses.items():
    print(f"  {category}: ₹{amount}")
print(f"Total: ₹{total}")`,
    output: `Expenses:
  food: ₹50
  transport: ₹25
  entertainment: ₹40
Total: ₹115`,
  },
}

export default function PythonPlayground() {
  const [selectedExample, setSelectedExample] = useState('variables')
  const example = examples[selectedExample]
  const [output, setOutput] = useState(example.output)
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    // Simulate running the code
    setTimeout(() => {
      setOutput(example.output)
      setIsRunning(false)
    }, 500)
  }

  const handleReset = () => {
    setOutput('')
  }

  const handleExampleChange = (exampleId) => {
    setSelectedExample(exampleId)
    setOutput(examples[exampleId].output)
  }

  return (
    <div className="p-6 bg-slate-900 rounded-lg border border-slate-700 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Python Playground</h3>
        <p className="text-xs text-slate-400">Interactive examples you can run</p>
      </div>

      {/* Example selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(examples).map(([id, ex]) => (
          <button
            key={id}
            onClick={() => handleExampleChange(id)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              selectedExample === id
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* Code editor area (read-only for Phase 1) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">Code</label>
        <div className="bg-slate-950 border border-slate-700 rounded overflow-hidden">
          <pre className="p-4 text-sm text-slate-300 font-mono overflow-x-auto">
            <code>{example.code}</code>
          </pre>
        </div>
        <p className="text-xs text-slate-500">
          Read-only in Phase 1 • Full editor coming in Phase 2
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium text-sm disabled:opacity-50 transition-colors"
        >
          <Play size={16} />
          {isRunning ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium text-sm transition-colors"
        >
          <RotateCcw size={16} />
          Clear
        </button>
      </div>

      {/* Output */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">Output</label>
        <div className="bg-black border border-slate-700 rounded p-4 min-h-24 font-mono text-sm text-green-400">
          {output ? (
            output.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))
          ) : (
            <div className="text-slate-500">(output appears here)</div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        💡 This is Phase 1 — a visual playground. In Phase 2, you'll write custom code in a full Python notebook interface.
      </p>
    </div>
  )
}
