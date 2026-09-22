import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const concepts = [
  {
    id: 'variables',
    title: 'Variables & Type Hints',
    csharp: `// C# — explicit types required
string name = "Alice";
int age = 30;
double salary = 95000.50;

// Nullable types
string? nullable = null;
int? maybeAge = null;`,
    python: `# Python — types inferred, hints optional
name = "Alice"
age = 30
salary = 95000.50

# Type hints (modern Python)
name: str = "Alice"
age: int = 30

# Optional types (can be None)
nullable: str | None = None
maybe_age: int | None = None`,
  },
  {
    id: 'functions',
    title: 'Functions & Methods',
    csharp: `// C# — methods in classes
public int Add(int a, int b)
{
    return a + b;
}

// Overloading (same name, different args)
public string GetCustomer(int id) => $"User {id}";
public string GetCustomer(string email) => $"Email {email}";`,
    python: `# Python — standalone functions
def add(a: int, b: int) -> int:
    return a + b

# No overloading — use defaults instead
def get_customer(id: int | None = None,
                 email: str | None = None) -> str:
    if id:
        return f"User {id}"
    if email:
        return f"Email {email}"
    return "No customer"`,
  },
  {
    id: 'classes',
    title: 'Classes & Objects',
    csharp: `public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }

    public Customer(int id, string name)
    {
        Id = id;
        Name = name;
    }
}`,
    python: `# Traditional Python class
class Customer:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

# Modern: dataclass (auto-generates __init__)
from dataclasses import dataclass

@dataclass
class Customer:
    id: int
    name: str`,
  },
  {
    id: 'control',
    title: 'Control Flow',
    csharp: `// if/else
if (age >= 18) {
    Console.WriteLine("Adult");
} else {
    Console.WriteLine("Child");
}

// for loop
for (int i = 0; i < 5; i++) {
    Console.WriteLine(i);
}

// foreach
foreach (var item in items) {
    Console.WriteLine(item);
}`,
    python: `# if/else (no braces, indentation = syntax)
if age >= 18:
    print("Adult")
else:
    print("Child")

# for loop (iterate items, not index)
for i in range(5):
    print(i)

# for-each (simpler in Python)
for item in items:
    print(item)

# List comprehension (Python-only, powerful)
doubled = [x * 2 for x in numbers]`,
  },
  {
    id: 'async',
    title: 'Async / Await',
    csharp: `// C# async/await
public async Task<string> FetchData(string url)
{
    using (var client = new HttpClient())
    {
        return await client.GetStringAsync(url);
    }
}

// Call it
var result = await FetchData("https://...");`,
    python: `# Python async/await (very similar!)
import aiohttp

async def fetch_data(url: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

# Call it
import asyncio
result = asyncio.run(fetch_data("https://..."))`,
  },
  {
    id: 'packages',
    title: 'Packages & Dependencies',
    csharp: `// C# — NuGet packages in .csproj
<ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="Microsoft.Extensions.Http" Version="7.0.0" />
</ItemGroup>

// Install via NuGet Package Manager
Install-Package Newtonsoft.Json`,
    python: `# Python — pip packages in requirements.txt
anthropic==0.7.0
langchain==0.1.0
fastapi==0.104.0

# Install via pip
pip install -r requirements.txt

# Or install individual packages
pip install anthropic langchain fastapi`,
  },
]

export default function PythonComparison() {
  const [selectedId, setSelectedId] = useState('variables')
  const selected = concepts.find((c) => c.id === selectedId)

  return (
    <div className="p-6 bg-slate-900 rounded-lg border border-slate-700 space-y-4">
      <h3 className="text-lg font-semibold text-slate-100">Coming from .NET?</h3>
      <p className="text-sm text-slate-400">
        Click a concept to see the C# vs Python comparison
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <button
            key={concept.id}
            onClick={() => setSelectedId(concept.id)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              selectedId === concept.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {concept.title}
          </button>
        ))}
      </div>

      {/* Code comparison */}
      {selected && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* C# side */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">C#</h4>
            <pre className="bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto border border-slate-700">
              <code>{selected.csharp}</code>
            </pre>
          </div>

          {/* Python side */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-200">Python</h4>
            <pre className="bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto border border-slate-700">
              <code>{selected.python}</code>
            </pre>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-4">
        💡 Hover over code to copy. Try running examples in the Python Playground below.
      </p>
    </div>
  )
}
