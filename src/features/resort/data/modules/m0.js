// Module 0 — C# & ASP.NET Core Foundations
// Gets a complete beginner ready to build the "TunMani Resort" management web app.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m0 = {
  id: 'm0',
  title: 'C# & ASP.NET Core Foundations',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Install the .NET 10 toolchain and PostgreSQL, learn just-enough C# (types, classes, records, enums, collections, LINQ, null safety, async), and the core of ASP.NET Core (MVC vs Web API, the request pipeline, Program.cs, controllers, routing, DI, configuration) — everything you need before building the TunMani Resort app.',
  sections: [
    {
      id: 'm0-s1',
      title: 'Setup',
      topics: [
        {
          id: 'm0-t1',
          title: 'Install the .NET 10 SDK & verify with dotnet --version',
          explain:
            'Download and install the .NET 10 SDK, then confirm it works by running `dotnet --version` in a fresh terminal.',
          analogy:
            'Think of opening the TunMani Resort kitchen near Byndoor beach. Before you cook a single ghee roast you need the gas, the water line, and the power meter all live. The .NET SDK is that whole utility connection for a C# developer — the compiler, the runtime, and the `dotnet` command all in one. Running `dotnet --version` is the meter reading that tells you the connection is on before you start building anything.',
          theory:
            'The **.NET SDK** (Software Development Kit) bundles three things: the **C# compiler**, the **.NET runtime** (which actually runs your compiled app), and the **`dotnet` CLI** (the command-line tool you use for everything — create, build, run, test).\n\nThe **runtime** alone can only *run* finished apps; the **SDK** can also *build* them. As a developer you always install the SDK.\n\n.NET is **cross-platform**: the same `dotnet` commands work on Windows, macOS, and Linux. Once installed, `dotnet --version` prints the SDK version and `dotnet --info` lists every runtime and SDK on the machine. Always verify in a brand-new terminal so PATH changes are picked up.',
          whyItMatters:
            'Every .NET interview eventually asks "can you build and run an app on your machine right now?" — they are checking you have done a real install at least once. The `dotnet` CLI is the same tool you will use thousands of times across this course and your career, so getting it green on day one removes the classic "works on my machine" excuse.',
          steps: [
            'Go to `https://dotnet.microsoft.com/download` and download the **.NET 10 SDK** (not just the Runtime) for your OS.',
            'Run the installer and accept the defaults; on Windows it adds `dotnet` to your PATH automatically.',
            'Close every open terminal, then open a **fresh** terminal (PowerShell or bash).',
            'Run `dotnet --version` — you should see a version starting with `10.`.',
            'Run `dotnet --info` to confirm the SDK and runtimes are listed.',
            'Run `dotnet --list-sdks` to see all installed SDK versions.',
          ],
          code: `# Terminal — what a healthy .NET install looks like
$ dotnet --version
10.0.100

$ dotnet --list-sdks
10.0.100 [C:\\Program Files\\dotnet\\sdk]

$ dotnet --info
.NET SDK:
 Version:   10.0.100
 Commit:    abc1234

Runtime Environment:
 OS Name:   Windows
 OS Version: 10.0.19045

.NET runtimes installed:
 Microsoft.AspNetCore.App 10.0.0
 Microsoft.NETCore.App 10.0.0`,
          pitfalls: [
            '**Installing only the Runtime, not the SDK.** `dotnet new` and `dotnet build` then fail. Fix: download the SDK package, which includes the runtime.',
            '**Not opening a fresh terminal.** The old terminal has the old PATH and says "command not found". Fix: close all terminals and reopen one.',
            "**Mixing many old SDKs.** Tutorials assume .NET 10. Fix: run `dotnet --list-sdks` and make sure a `10.x` line is present.",
            '**Using `dotnet` from inside an IDE-only install.** Some IDE bundles do not add the CLI to PATH. Fix: install the standalone SDK from the Microsoft site.',
            '**Corporate proxy blocking the download.** Fix: download the offline installer from the same page and run it locally.',
            '**Confusing .NET Framework (old, Windows-only) with .NET (modern, cross-platform).** This course uses modern .NET 10. Fix: ignore anything labelled ".NET Framework 4.x".',
          ],
          tryIt:
            'Run `dotnet --version` and `dotnet --list-sdks`. Screenshot the output. If you do not see a `10.x` version, re-run the installer and reopen your terminal before continuing. You are not allowed to write a line of C# until the SDK reports version 10.',
          takeaway: 'Install the SDK (not just the runtime) and verify with `dotnet --version` before writing any C#.',
        },
        {
          id: 'm0-t2',
          title: 'Install VS Code with the C# Dev Kit',
          explain:
            'Install VS Code (or Visual Studio) and add the C# Dev Kit extension so you get IntelliSense, debugging, and project tooling.',
          analogy:
            'The .NET SDK is the kitchen connection; your editor is the chef station — the counter, the knives, and the labelled spice jars laid out within reach. At the TunMani Resort kitchen a good station lets the cook work fast without hunting for things. The **C# Dev Kit** turns plain VS Code into that organised C# station: autocomplete suggests the next ingredient, the debugger lets you pause and taste, and errors light up red before the dish reaches the customer.',
          theory:
            'You can write C# in any text editor, but a good editor makes you far faster. The two main choices are **Visual Studio** (Windows, full-featured, heavier) and **VS Code** (light, cross-platform).\n\nFor VS Code you install the **C# Dev Kit** extension, which pulls in the base **C#** extension and adds a **Solution Explorer**, **IntelliSense** (autocomplete), inline error squiggles, a **debugger**, and test running.\n\nThe Dev Kit talks to the same `dotnet` CLI you installed earlier — the editor is just a friendly front-end. When you open a folder containing a `.csproj` file, the Dev Kit detects the project and lights up all its features.',
          whyItMatters:
            'A configured editor is what turns the slow "edit, save, run, read error" loop into an instant one. Teams expect you to navigate code, set breakpoints, and use IntelliSense fluently — these are daily skills, and being slow with your tools is obvious in a pair-programming interview.',
          steps: [
            'Install **VS Code** from `https://code.visualstudio.com`.',
            'Open the **Extensions** panel (Ctrl+Shift+X).',
            'Search for **C# Dev Kit** and install it (it auto-installs the base C# extension).',
            'Sign in if prompted (the Dev Kit uses a free Microsoft/Visual Studio licence).',
            'Open a folder that has a `.csproj` file and confirm the **Solution Explorer** appears.',
            'Type `Console.WriteLine` in a `.cs` file and confirm IntelliSense suggests it.',
          ],
          code: `# Terminal — create a project, then open it in VS Code
$ dotnet new console -o HelloResort
$ cd HelloResort
$ code .

# VS Code now shows:
#  - Solution Explorer (from C# Dev Kit)
#  - IntelliSense as you type
#  - A "Run and Debug" button (F5)`,
          pitfalls: [
            '**Installing only the base "C#" extension, not the Dev Kit.** You miss the Solution Explorer and test tools. Fix: install **C# Dev Kit** specifically.',
            '**Opening a single file instead of the folder.** IntelliSense needs project context. Fix: open the whole project folder with `code .`.',
            "**Old OmniSharp extension still enabled.** It conflicts with Dev Kit. Fix: disable the legacy OmniSharp setting.",
            '**Dev Kit not signed in.** Some features stay greyed out. Fix: sign in with a free Microsoft account.',
            '**Expecting Visual Studio features in VS Code.** They are different tools. Fix: if you prefer the full IDE, install Visual Studio Community instead.',
            '**Editing files outside the folder VS Code opened.** Changes will not be tracked. Fix: keep all project files under the opened folder.',
          ],
          tryIt:
            'Create a console project with `dotnet new console -o HelloResort`, open it with `code .`, and type `Console.WriteLine("TunMani Resort");`. Confirm IntelliSense suggested the method and that pressing F5 runs it.',
          takeaway: 'Install the C# Dev Kit so the editor gives you IntelliSense, debugging, and a Solution Explorer.',
        },
        {
          id: 'm0-t3',
          title: 'Install PostgreSQL locally',
          explain:
            'Install the PostgreSQL database server and the psql client locally so the app has somewhere to store resort data.',
          analogy:
            'TunMani Resort needs a strongroom where every booking, guest, and payment record is kept safe and findable. PostgreSQL is that strongroom — a real database server running on your computer. Just as the resort manager keeps a master ledger that survives even when the office closes for the night, PostgreSQL keeps your data on disk so it is still there after you stop and restart the app.',
          theory:
            '**PostgreSQL** (often "Postgres") is a powerful open-source **relational database**. It runs as a background **server** that listens on a port (default **5432**) and stores data in **tables** organised into **databases**.\n\nYou talk to it with **SQL**. The bundled command-line client is **`psql`**; graphical tools like **pgAdmin** ship alongside it.\n\nWhen you install Postgres you create a superuser (usually **`postgres`**) and set its password — remember this, you will need it in your connection string later. A single Postgres server can host many databases; the TunMani Resort app will use one called `tunmani_resort`.',
          whyItMatters:
            'PostgreSQL is one of the most in-demand databases in the industry and a frequent interview topic. Knowing how to install it, connect with `psql`, and create databases is the baseline every backend developer is expected to have — and it is the exact engine the TunMani Resort app stores all its data in.',
          steps: [
            'Download the **PostgreSQL** installer from `https://www.postgresql.org/download/`.',
            'Run it and accept the default port **5432**.',
            'Set a password for the **postgres** superuser and write it down somewhere safe.',
            'Let the installer also install **pgAdmin** and the **command-line tools**.',
            'After install, open a terminal and run `psql --version` to confirm the client is on your PATH.',
            'Connect with `psql -U postgres` and enter your password to reach the `postgres=#` prompt.',
          ],
          code: `# Terminal — verify and connect to PostgreSQL
$ psql --version
psql (PostgreSQL) 17.2

$ psql -U postgres
Password for user postgres: ********
psql (17.2)
postgres=# SELECT version();
postgres=# \\l           -- list all databases
postgres=# \\q           -- quit`,
          pitfalls: [
            '**Forgetting the postgres password.** You cannot connect later. Fix: write it down now; resetting it is painful.',
            '**`psql` not on PATH.** "command not found" on Windows. Fix: add the PostgreSQL `bin` folder to PATH, or use the SQL Shell shortcut the installer creates.',
            "**Port 5432 already in use.** A second Postgres or another service blocks it. Fix: pick a different port during install and remember it.",
            '**Confusing the server and the client.** You can install the client without a running server. Fix: ensure the Postgres **service** is running (check Services on Windows).',
            '**Using the postgres superuser for everything in production.** Fine for local dev, risky live. Fix: create a dedicated app user later.',
            '**Stopping the service and wondering why the app cannot connect.** Fix: start the PostgreSQL service before running the app.',
          ],
          tryIt:
            'Connect with `psql -U postgres`, then run `\\l` to list databases and `SELECT version();` to print the server version. Quit with `\\q`. You now have a real database server you can build against.',
          takeaway: 'PostgreSQL is the database server; install it, remember the postgres password, and confirm you can connect with `psql`.',
        },
        {
          id: 'm0-t4',
          title: 'Create your first app with dotnet new',
          explain:
            'Use `dotnet new web` and `dotnet new mvc` to scaffold starter web projects from templates.',
          analogy:
            'When TunMani Resort builds a new cottage, the carpenter does not start from raw timber — he uses a standard cottage plan with the walls, plumbing, and wiring already laid out, then customises it. `dotnet new` is that standard plan: it stamps out a working project skeleton in seconds so you start from a running building, not an empty plot.',
          theory:
            '`dotnet new` creates a project from a **template**. Two matter for web work:\n\n- **`dotnet new web`** — a minimal API / minimal web app. Tiny `Program.cs`, no controllers or views. Great for APIs and learning the pipeline.\n- **`dotnet new mvc`** — a full **Model-View-Controller** app with `Controllers/`, `Views/`, `wwwroot/`, and routing wired up. This is closer to what TunMani Resort uses for its pages.\n\nList every template with `dotnet new list`. The `-o` flag sets the output folder, so `dotnet new mvc -o TunMani.Web` creates the project inside a `TunMani.Web` folder. Each project gets a `.csproj` file describing its dependencies and target framework.',
          whyItMatters:
            'Scaffolding is the first thing you do on any new .NET task or interview take-home. Knowing the difference between `web` and `mvc` templates — and when to reach for each — shows you understand the spectrum from minimal API to full MVC app, which is exactly the architecture decision TunMani Resort makes (MVC for pages, Web API for JSON endpoints).',
          steps: [
            'Run `dotnet new list` to see the available templates.',
            'Create a minimal web app: `dotnet new web -o TunMani.Min`.',
            'Create a full MVC app: `dotnet new mvc -o TunMani.Web`.',
            'Open `TunMani.Web` and look at the `Controllers/`, `Views/`, and `wwwroot/` folders.',
            'Open the generated `Program.cs` in each and compare how small the minimal one is.',
            'Note the `.csproj` file — it lists the target framework `net10.0`.',
          ],
          code: `# Terminal — scaffold both kinds of web app
$ dotnet new web -o TunMani.Min      # minimal web app / API
$ dotnet new mvc -o TunMani.Web      # full MVC app

# The MVC project structure:
TunMani.Web/
  Controllers/HomeController.cs
  Views/Home/Index.cshtml
  Models/
  wwwroot/                # css, js, images
  Program.cs              # app startup
  TunMani.Web.csproj      # <TargetFramework>net10.0</TargetFramework>`,
          pitfalls: [
            '**Forgetting `-o` and scattering files into the current folder.** Fix: always pass `-o ProjectName` to keep each project in its own folder.',
            '**Using `dotnet new console` when you wanted a web app.** No web server. Fix: use `web` or `mvc` for web projects.',
            "**Creating a project inside another project's folder.** Builds get confused. Fix: keep each project in a separate sibling folder.",
            '**Expecting `web` to have Views.** It does not. Fix: use `mvc` if you need server-rendered HTML pages.',
            '**Spaces in the project name.** Causes namespace issues. Fix: use PascalCase with dots, like `TunMani.Web`.',
            '**Not reading the generated `Program.cs`.** You will not understand startup later. Fix: open and read it now.',
          ],
          tryIt:
            'Scaffold both `dotnet new web -o TunMani.Min` and `dotnet new mvc -o TunMani.Web`. Open each `Program.cs` and write one sentence describing how they differ. Notice how much more the MVC template gives you out of the box.',
          takeaway: '`dotnet new web` gives a minimal app; `dotnet new mvc` gives a full Model-View-Controller app with views and routing.',
        },
        {
          id: 'm0-t5',
          title: 'Run the app with dotnet run',
          explain:
            'Build and launch your web app with `dotnet run`, then open the printed localhost URL in a browser.',
          analogy:
            'Scaffolding the cottage is one thing; turning the lights on and opening the door for guests is another. `dotnet run` flips the master switch — it compiles your code and starts a local web server so you can walk through the TunMani Resort site in your browser, just like a guest would, before it ever goes online.',
          theory:
            '`dotnet run` does two jobs: it **builds** (compiles) your project, then **runs** the resulting app. For a web app it starts the built-in **Kestrel** web server, which listens on a `localhost` URL (often `https://localhost:5001`) printed in the terminal.\n\nWhile it runs, the terminal is occupied — press **Ctrl+C** to stop. Use `dotnet watch run` to auto-restart on file changes, which is handy during development.\n\nThe app reads `Properties/launchSettings.json` to decide which URL and environment (Development/Production) to use. In Development you get detailed error pages; never ship those to production.',
          whyItMatters:
            'Running the app is the heartbeat of development — you do it constantly. Knowing `dotnet run`, `dotnet watch run`, and how to read the localhost URL is the minimum to demonstrate a working app in any interview or demo, including showing off the TunMani Resort booking pages.',
          steps: [
            'Open a terminal inside the `TunMani.Web` folder.',
            'Run `dotnet run`.',
            'Read the terminal output for a line like `Now listening on: https://localhost:5001`.',
            'Open that URL in your browser to see the home page.',
            'Press **Ctrl+C** in the terminal to stop the server.',
            'Run `dotnet watch run` and edit a view — the browser refreshes automatically.',
          ],
          code: `# Terminal — run the MVC app
$ cd TunMani.Web
$ dotnet run
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.

# Auto-restart on every save:
$ dotnet watch run`,
          pitfalls: [
            '**Running from the wrong folder.** `dotnet run` needs a `.csproj`. Fix: `cd` into the project folder first.',
            '**Browser shows a certificate warning.** The dev HTTPS cert is untrusted. Fix: run `dotnet dev-certs https --trust` once.',
            "**Port already in use.** Another app holds 5001. Fix: stop it, or change the port in `launchSettings.json`.",
            '**Closing the terminal to "stop" the app cleanly.** It may leave the port locked. Fix: press Ctrl+C to stop gracefully.',
            '**Editing code and expecting changes without restart.** Plain `dotnet run` does not reload. Fix: use `dotnet watch run`.',
            '**Confusing Development and Production environments.** Detailed errors only show in Development. Fix: check `ASPNETCORE_ENVIRONMENT`.',
          ],
          tryIt:
            'Run `dotnet run` inside `TunMani.Web`, open the printed `https://localhost:5001` URL, and confirm the home page loads. Then stop with Ctrl+C and try `dotnet watch run`, editing `Views/Home/Index.cshtml` to see live reload.',
          takeaway: '`dotnet run` builds and launches your app on a localhost URL; use `dotnet watch run` for auto-reload during development.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'C# Essentials',
      topics: [
        {
          id: 'm0-t6',
          title: 'Variables & types (int, decimal, string, bool, dates)',
          explain:
            'C# is statically typed: every variable has a type. Use `decimal` for money, `DateOnly` for calendar dates, and `DateTime` for timestamps.',
          analogy:
            'At the TunMani Resort front desk, every form field has a fixed kind of value: the room number is a whole number, the tariff is rupees-and-paise, the guest name is text, and "breakfast included?" is a yes/no tick. C# types are exactly those labelled boxes — you cannot put a name where a number belongs, which stops a whole class of mistakes before they happen.',
          theory:
            'C# is **statically typed**: the compiler knows each variable\'s type at build time and rejects mismatches.\n\nThe everyday types are `int` (whole numbers), `decimal` (exact decimals — **always for money**), `double` (approximate decimals — never for money), `string` (text), and `bool` (true/false).\n\nFor dates, **.NET** gives you `DateOnly` (a calendar date with no time — perfect for a check-in date), `TimeOnly` (a time of day), and `DateTime` (date + time, used for created/updated timestamps). Use `var` to let the compiler infer the type when it is obvious, e.g. `var price = 2500m;`. The `m` suffix marks a `decimal` literal; without it the number is a `double`.',
          whyItMatters:
            'Using `double` for money is a classic bug that loses paise on every booking and gets flagged instantly in code review and interviews. Knowing `decimal` for money and `DateOnly` vs `DateTime` for dates signals you understand correctness, not just syntax — and it keeps the resort\'s billing accurate to the rupee.',
          steps: [
            'Declare an `int` room number: `int roomNumber = 101;`.',
            'Declare a money value with `decimal` and the `m` suffix: `decimal basePrice = 2500m;`.',
            'Declare a `string` guest name and a `bool` breakfast flag.',
            'Declare a check-in date with `DateOnly`: `DateOnly checkIn = new DateOnly(2026, 6, 22);`.',
            'Print them with string interpolation: `Console.WriteLine($"Room {roomNumber} costs {basePrice:C}");`.',
            'Try assigning a string to the int and watch the compiler error.',
          ],
          code: `// Program.cs — C# value types for the resort front desk
int roomNumber = 101;
decimal basePrice = 2500m;          // 'm' = decimal, exact, use for money
string guestName = "Anjali Shenoy";
bool breakfastIncluded = true;
DateOnly checkIn = new DateOnly(2026, 6, 22);
DateTime createdAt = DateTime.UtcNow; // timestamp with date + time

Console.WriteLine($"Room {roomNumber}: {basePrice:C} for {guestName}");
Console.WriteLine($"Check-in {checkIn}, breakfast: {breakfastIncluded}");`,
          pitfalls: [
            '**Using `double` or `float` for money.** Rounding errors lose paise. Fix: use `decimal` with the `m` suffix.',
            '**Forgetting the `m` suffix.** `decimal x = 2500.50;` will not compile. Fix: write `2500.50m`.',
            "**Storing a check-in date as `DateTime` with a meaningless time.** Causes timezone bugs. Fix: use `DateOnly` for pure dates.",
            '**Using local `DateTime.Now` for stored timestamps.** Servers in different zones disagree. Fix: store `DateTime.UtcNow`.',
            '**Over-using `var` where the type is unclear.** Hurts readability. Fix: use explicit types when the value is not obvious.',
            '**Comparing strings with `==` ignoring case unexpectedly.** Fix: use `string.Equals(a, b, StringComparison.OrdinalIgnoreCase)` when needed.',
          ],
          tryIt:
            'Write a console app that declares a room number, a `decimal` tariff, a guest name, and a `DateOnly` check-in date, then prints a one-line summary using `$"..."` interpolation and the `:C` currency format. Confirm `:C` shows your local currency symbol.',
          takeaway: 'Pick the right type: `decimal` for money, `DateOnly` for dates, `DateTime` (UTC) for timestamps — types catch bugs at compile time.',
        },
        {
          id: 'm0-t7',
          title: 'Classes & properties — a Room class',
          explain:
            'A class is a blueprint that bundles related data and behaviour. Build a `Room` class with RoomNumber, RoomType, and BasePrice properties.',
          analogy:
            'A class is the standard cottage plan for TunMani Resort: it describes what every room *has* — a number, a type (Deluxe, Sea-View, Suite), a base tariff. Each actual cottage you build from that plan is an **object**: same shape, different values. The plan is written once; the resort then has fifty rooms made from it.',
          theory:
            'A **class** groups **data** (fields/properties) and **behaviour** (methods) under one name. You create instances (**objects**) with `new`.\n\n**Properties** are the public, controlled way to expose data — `public decimal BasePrice { get; set; }` generates a getter and setter. Use **PascalCase** for property names by convention.\n\nA **constructor** lets you require values when an object is created. Properties can be **read-only** (`{ get; }` set only in the constructor) or **init-only** (`{ get; init; }`, set only during object creation). Modern C# also offers **auto-property initialisers** and **expression-bodied** members for concise code.',
          whyItMatters:
            'Object-oriented modelling is the backbone of C# and a guaranteed interview topic. A clean `Room` class with well-chosen properties is the first step toward the **Domain** layer of TunMani Resort, where entities like `Room`, `Booking`, and `Guest` are defined.',
          steps: [
            'Create a new file `Room.cs`.',
            'Declare `public class Room`.',
            'Add `public int RoomNumber { get; set; }`.',
            'Add `public string RoomType { get; set; }` and `public decimal BasePrice { get; set; }`.',
            'Add a constructor that takes the three values and assigns them.',
            'In `Program.cs`, create a room with `new Room(101, "Sea-View", 4500m)` and print its properties.',
          ],
          code: `// Room.cs — a domain entity for TunMani Resort
public class Room
{
    public int RoomNumber { get; set; }
    public string RoomType { get; set; }
    public decimal BasePrice { get; set; }

    public Room(int roomNumber, string roomType, decimal basePrice)
    {
        RoomNumber = roomNumber;
        RoomType = roomType;
        BasePrice = basePrice;
    }

    // A method that bundles behaviour with the data
    public decimal PriceForNights(int nights) => BasePrice * nights;
}

// Program.cs
var room = new Room(101, "Sea-View", 4500m);
Console.WriteLine($"Room {room.RoomNumber} ({room.RoomType}): {room.PriceForNights(3):C}");`,
          pitfalls: [
            '**Making fields public instead of properties.** Loses control over validation. Fix: use `{ get; set; }` properties.',
            '**Forgetting to initialise non-nullable `string` properties.** Compiler warns about null. Fix: require them in the constructor or use `string.Empty`.',
            "**camelCase property names.** Breaks C# convention. Fix: use PascalCase like `BasePrice`.",
            '**Putting business logic in random static helpers.** Fix: put room behaviour as methods on `Room`.',
            '**Confusing the class (blueprint) with an object (instance).** Fix: remember `new Room(...)` creates one object from the class.',
            '**Adding a setter where data should be immutable.** Fix: use `{ get; init; }` for values that should not change after creation.',
          ],
          tryIt:
            'Create the `Room` class with a constructor and a `PriceForNights(int nights)` method. Make three rooms (Deluxe, Sea-View, Suite) with different prices and print the 2-night cost of each.',
          takeaway: 'A class is a blueprint of properties and methods; objects are instances created with `new`.',
        },
        {
          id: 'm0-t8',
          title: 'Records & DTOs',
          explain:
            'Records are concise, immutable data-carriers. Use them for DTOs — the simple objects that move data between layers and over the wire.',
          analogy:
            'When the TunMani Resort front desk sends a booking summary to the manager, it does not hand over the whole live ledger — it sends a printed slip with just the facts: guest name, room, dates, total. A **DTO** (Data Transfer Object) is that printed slip, and a **record** is the fast way to print it. Once printed, the slip does not change — that immutability is exactly what records give you.',
          theory:
            'A **record** is a class designed to hold data. One line — `public record RoomDto(int RoomNumber, string RoomType, decimal BasePrice);` — gives you a constructor, read-only properties, value-based equality, and a readable `ToString()` for free.\n\nA **DTO** (Data Transfer Object) is a flat object whose only job is to **carry data** between layers (e.g. from a controller to a view, or from an API to a client). DTOs deliberately leave out behaviour and internal fields.\n\nRecords are **immutable** by default — you create a changed copy with the `with` expression: `dto with { BasePrice = 5000m }`. This makes DTOs safe to pass around without fear of accidental mutation.',
          whyItMatters:
            'Separating **entities** (rich domain objects) from **DTOs** (thin transfer objects) is a core clean-architecture habit interviewers probe. Records make DTOs a one-liner, and TunMani Resort uses them throughout its **Application** layer to shuttle data between controllers, services, and repositories.',
          steps: [
            'Declare a positional record: `public record RoomDto(int RoomNumber, string RoomType, decimal BasePrice);`.',
            'Create one: `var dto = new RoomDto(101, "Sea-View", 4500m);`.',
            'Print it: `Console.WriteLine(dto);` and notice the auto-generated readable output.',
            'Make a modified copy: `var pricier = dto with { BasePrice = 5000m };`.',
            'Compare two equal records with `==` and see value equality in action.',
            'Map a `Room` entity to a `RoomDto` in a small method.',
          ],
          code: `// RoomDto.cs — a transfer object as a record
public record RoomDto(int RoomNumber, string RoomType, decimal BasePrice);

// Program.cs
var dto = new RoomDto(101, "Sea-View", 4500m);
Console.WriteLine(dto);
// Output: RoomDto { RoomNumber = 101, RoomType = Sea-View, BasePrice = 4500 }

var pricier = dto with { BasePrice = 5000m }; // immutable copy with one change

var sameAgain = new RoomDto(101, "Sea-View", 4500m);
Console.WriteLine(dto == sameAgain); // True — value-based equality

// Map a domain entity to a DTO
RoomDto ToDto(Room r) => new(r.RoomNumber, r.RoomType, r.BasePrice);`,
          pitfalls: [
            '**Using records for entities you mutate constantly.** Records favour immutability. Fix: use classes for rich, changing entities; records for DTOs.',
            '**Exposing your domain entity directly in an API.** Leaks internals. Fix: map to a DTO record first.',
            "**Forgetting the `with` expression and mutating instead.** Records resist that. Fix: use `dto with { ... }` to make a changed copy.",
            '**Assuming records are reference-equal like classes.** They are value-equal. Fix: remember `==` compares contents.',
            '**Putting heavy logic inside a record.** Defeats the purpose. Fix: keep records data-only.',
            '**Confusing positional and nominal record syntax.** Fix: positional `record R(int X)` auto-creates properties; you can also write a body.',
          ],
          tryIt:
            'Define `RoomDto` as a positional record, create one, print it, then use `with` to produce a copy with a higher price. Confirm two records with identical values are equal with `==`.',
          takeaway: 'Records are concise, immutable data-carriers — ideal for DTOs that move data between layers.',
        },
        {
          id: 'm0-t9',
          title: 'Enums — BookingStatus',
          explain:
            'An enum is a fixed set of named values. Model a booking lifecycle with `enum BookingStatus { Pending, Confirmed, CheckedIn, CheckedOut, Cancelled }`.',
          analogy:
            'Every TunMani Resort booking moves through a fixed set of stamps on the register: Pending, then Confirmed, then Checked-In, Checked-Out, or Cancelled. You can never invent a stamp that is not on the list. An **enum** is exactly that official rubber-stamp set — a closed list of allowed states, so nobody can write "maybe" or "kinda confirmed" by accident.',
          theory:
            'An **enum** (enumeration) defines a named set of constant values: `enum BookingStatus { Pending, Confirmed, CheckedIn, CheckedOut, Cancelled }`. Each name maps to an integer (0, 1, 2...) by default.\n\nEnums make code **self-documenting** and **type-safe** — a method that takes a `BookingStatus` can only receive a valid status, not any random int or string.\n\nYou use them in conditionals (`if (b.Status == BookingStatus.Confirmed)`) and especially in `switch` expressions. When storing in PostgreSQL you typically save the **string name** (`"Confirmed"`) or the int; the TunMani Resort app stores readable strings for clarity.',
          whyItMatters:
            'Enums are how professionals model finite states — order status, payment status, user role. Interviewers like seeing a `switch` over an enum instead of "magic strings". For TunMani Resort, `BookingStatus` drives which actions are allowed (you cannot check out a Cancelled booking), so getting it right prevents real business bugs.',
          steps: [
            'Declare `public enum BookingStatus { Pending, Confirmed, CheckedIn, CheckedOut, Cancelled }`.',
            'Add a `Status` property of type `BookingStatus` to a `Booking` class.',
            'Set it: `booking.Status = BookingStatus.Confirmed;`.',
            'Use a `switch` expression to map status to a message.',
            'Convert to string with `status.ToString()` and back with `Enum.Parse`.',
            'Guard an action: only allow check-out if status is `CheckedIn`.',
          ],
          code: `// BookingStatus.cs
public enum BookingStatus
{
    Pending,
    Confirmed,
    CheckedIn,
    CheckedOut,
    Cancelled
}

// Using it
BookingStatus status = BookingStatus.Confirmed;

string message = status switch
{
    BookingStatus.Pending   => "Awaiting payment",
    BookingStatus.Confirmed => "Room is reserved",
    BookingStatus.CheckedIn => "Guest has arrived",
    BookingStatus.CheckedOut => "Stay complete",
    BookingStatus.Cancelled => "Booking cancelled",
    _ => "Unknown"
};

Console.WriteLine(message);
Console.WriteLine(status.ToString()); // "Confirmed" — store this in the DB`,
          pitfalls: [
            '**Using magic strings like "confirmed" everywhere.** Typos slip through. Fix: use the `BookingStatus` enum.',
            '**Forgetting the `_ =>` default arm in a switch.** Compiler warns about uncovered cases. Fix: add a default arm.',
            "**Renaming an enum after storing its int in the DB.** Breaks old rows. Fix: store the string name, or pin int values explicitly.",
            '**Casting any int to the enum blindly.** `(BookingStatus)99` is invalid. Fix: validate with `Enum.IsDefined`.',
            '**Treating enums as flags without `[Flags]`.** Fix: only use bitwise combos when the enum is marked `[Flags]`.',
            '**Comparing enum to a string.** Type mismatch. Fix: compare enum to enum, or convert deliberately.',
          ],
          tryIt:
            'Create the `BookingStatus` enum, give a `Booking` a `Status`, and write a method `CanCheckOut(Booking b)` that returns true only when the status is `CheckedIn`. Test it against a Cancelled and a CheckedIn booking.',
          takeaway: 'Enums model a closed set of valid states type-safely — perfect for a booking lifecycle.',
        },
        {
          id: 'm0-t10',
          title: 'Collections & LINQ basics',
          explain:
            'Use `List<T>` and `Dictionary<K,V>` to hold many items, then query them with LINQ — `Where`, `Select`, `Sum` over a list of bookings.',
          analogy:
            'The TunMani Resort manager keeps a register of all bookings — that register is a `List<Booking>`. When she asks "show me only the confirmed bookings and total their revenue", she is not flipping every page by hand; she runs a quick query. **LINQ** is that query language built into C#: `Where` filters the register, `Select` pulls out specific columns, and `Sum` totals them — all in one readable line.',
          theory:
            '`List<T>` is the everyday **growable array** — `var bookings = new List<Booking>();` then `bookings.Add(...)`. `Dictionary<K,V>` maps keys to values for fast lookup, e.g. rooms keyed by room number.\n\n**LINQ** (Language Integrated Query) gives collections SQL-like operators:\n- `Where(b => b.Status == BookingStatus.Confirmed)` — **filter**.\n- `Select(b => b.Total)` — **project** (transform each item).\n- `Sum()`, `Count()`, `Average()`, `OrderBy()`, `GroupBy()` — **aggregate/sort/group**.\n\nThese use **lambda expressions** (`b => ...`). LINQ is **lazy** for many operators — it does not run until you enumerate (e.g. with `ToList()` or a `foreach`).',
          whyItMatters:
            'LINQ is one of C#\'s superpowers and shows up in almost every interview. Being able to filter, project, and aggregate in-memory data fluently is daily backend work, and the same mental model carries over to the SQL you will write for TunMani Resort in the next module.',
          steps: [
            'Create `var bookings = new List<Booking>();` and add a few bookings with different statuses and totals.',
            'Filter confirmed ones: `bookings.Where(b => b.Status == BookingStatus.Confirmed)`.',
            'Project totals: `.Select(b => b.Total)`.',
            'Sum them: `.Sum()`.',
            'Chain it all into one expression for total confirmed revenue.',
            'Build a `Dictionary<int, Room>` keyed by room number and look one up.',
          ],
          code: `// Program.cs — collections + LINQ over bookings
var bookings = new List<Booking>
{
    new() { Id = 1, Status = BookingStatus.Confirmed, Total = 9000m },
    new() { Id = 2, Status = BookingStatus.Pending,   Total = 4500m },
    new() { Id = 3, Status = BookingStatus.Confirmed, Total = 13500m },
};

// Total revenue from confirmed bookings, in one readable line
decimal confirmedRevenue = bookings
    .Where(b => b.Status == BookingStatus.Confirmed)
    .Select(b => b.Total)
    .Sum();

Console.WriteLine($"Confirmed revenue: {confirmedRevenue:C}"); // 22,500

// Dictionary for fast lookup by room number
var roomsByNumber = new Dictionary<int, Room>
{
    [101] = new Room(101, "Sea-View", 4500m),
};
var room101 = roomsByNumber[101];`,
          pitfalls: [
            '**Using an array when you need to add/remove items.** Arrays are fixed-size. Fix: use `List<T>`.',
            '**Calling `.First()` on an empty result.** Throws. Fix: use `.FirstOrDefault()` and null-check.',
            "**Looking up a missing dictionary key with `dict[key]`.** Throws `KeyNotFoundException`. Fix: use `TryGetValue`.",
            '**Forgetting LINQ is lazy and re-enumerating expensively.** Fix: call `.ToList()` once to materialise.',
            '**Writing a `foreach` loop where one LINQ line is clearer.** Fix: use `Where`/`Select`/`Sum`.',
            '**Mutating a list while iterating it.** Throws. Fix: iterate a copy or build a new list.',
          ],
          tryIt:
            'Build a `List<Booking>` with a mix of statuses, then write one LINQ expression that returns the total revenue of only `Confirmed` bookings. Then add an `OrderByDescending(b => b.Total)` to list them highest-first.',
          takeaway: 'Use `List<T>`/`Dictionary` to hold data and LINQ (`Where`/`Select`/`Sum`) to query it in clean, readable lines.',
        },
        {
          id: 'm0-t11',
          title: 'Null safety & async/await',
          explain:
            'Nullable reference types make "can this be null?" explicit; async/await keeps the app responsive while waiting on slow work like database calls.',
          analogy:
            'At the TunMani Resort front desk, "no guest assigned yet" is a real, valid state — but you must handle it, not crash. Nullable types (`Guest?`) force you to acknowledge that empty slot. And when the desk clerk phones the bank to verify a payment, she does not freeze the entire lobby queue while waiting on hold — she takes the next guest and returns when the bank replies. `async/await` is that "do not freeze while waiting" behaviour for your server.',
          theory:
            'With **nullable reference types** enabled (default in new projects), `string` cannot be null but `string?` can. The compiler warns wherever you might dereference a null, nudging you to check first with `if (x is not null)` or the `?.` operator and `??` fallback.\n\n**`async`/`await`** handles operations that **wait** — database queries, HTTP calls, file I/O. A method marked `async` returns a `Task` (or `Task<T>`), and `await` pauses *that method* (not the whole server) until the work finishes, freeing the thread to serve other requests.\n\n**Database calls are always async** in ASP.NET Core because they involve network/disk waits; blocking the thread would limit how many users the server can handle at once.',
          whyItMatters:
            'Null-reference exceptions are the most common runtime crash in .NET, and async correctness is a top interview topic. TunMani Resort marks every repository method `async` (e.g. `Task<Room?> GetRoomAsync(int id)`) so the server scales to many simultaneous guests browsing rooms without each DB call hogging a thread.',
          steps: [
            'Confirm nullable is on: `<Nullable>enable</Nullable>` in the `.csproj`.',
            'Declare a nullable: `Guest? guest = FindGuest(id);`.',
            'Guard it: `if (guest is null) return;` before using it.',
            'Use `?.` and `??`: `var name = guest?.Name ?? "Walk-in";`.',
            'Write an async method returning `Task<Room?>`.',
            'Call it with `await`: `var room = await GetRoomAsync(101);`.',
          ],
          code: `// Null-safety and async together
public async Task<Room?> GetRoomAsync(int roomNumber)
{
    // Simulate a slow database lookup
    await Task.Delay(50);            // 'await' frees the thread while waiting
    if (roomNumber == 101)
        return new Room(101, "Sea-View", 4500m);
    return null;                     // nullable return: room may not exist
}

// Calling it
Room? room = await GetRoomAsync(202);
string name = room?.RoomType ?? "No such room"; // safe null handling
Console.WriteLine(name);`,
          pitfalls: [
            '**Dereferencing a `string?` without a null check.** Crashes with NullReferenceException. Fix: check with `is not null` or use `?.`.',
            '**Marking a method `async` but never `await`-ing inside.** It runs synchronously. Fix: `await` the real async call.',
            "**Using `.Result` or `.Wait()` on a Task.** Causes deadlocks in ASP.NET. Fix: `await` all the way up.",
            '**Forgetting `async` on the controller action.** You cannot `await` inside it. Fix: make the action `async Task<IActionResult>`.',
            '**Suppressing null warnings with `!` everywhere.** Hides real bugs. Fix: handle the null instead of silencing it.',
            '**Blocking DB calls synchronously.** Limits server throughput. Fix: use the `...Async` variants and `await` them.',
          ],
          tryIt:
            'Write an `async Task<Room?> GetRoomAsync(int n)` that returns a room for 101 and `null` otherwise. Call it with `await`, then print the room type using `?.` and `??` so a missing room shows "No such room" instead of crashing.',
          takeaway: 'Use `?`/`?.`/`??` to handle nulls safely and `async/await` so slow DB calls never freeze your server.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'ASP.NET Core Basics',
      topics: [
        {
          id: 'm0-t12',
          title: 'MVC vs Web API',
          explain:
            'MVC returns HTML pages (Model-View-Controller); Web API returns JSON data. TunMani Resort uses both — MVC for pages, Web API for data endpoints.',
          analogy:
            'TunMani Resort has two ways of serving information. The printed brochure handed to a walk-in guest is fully formatted, ready to read — that is **MVC**, which returns finished HTML pages. The raw availability sheet faxed to a travel agent\'s own system is just data they format themselves — that is a **Web API**, which returns JSON. Same resort, two delivery styles for two audiences.',
          theory:
            '**MVC (Model-View-Controller)** is a pattern for server-rendered web pages:\n- **Model** — the data (e.g. a `Room`).\n- **View** — a `.cshtml` template that renders HTML.\n- **Controller** — receives the request, gets the model, picks the view.\n\nA **Web API** controller returns **data** (usually JSON) instead of HTML — ideal for mobile apps, SPAs, or other servers. It uses the same controller concept but returns objects, not views.\n\nIn ASP.NET Core both live in the same app. TunMani Resort serves its admin/booking **pages** with MVC controllers + Razor views, and exposes **JSON endpoints** (e.g. room availability) via Web API controllers.',
          whyItMatters:
            'Knowing when to render HTML server-side versus expose a JSON API is a fundamental architecture decision interviewers test. Most real systems — including TunMani Resort — do both, so understanding the split lets you put each piece of functionality in the right place.',
          steps: [
            'Recall the three MVC parts: Model (data), View (HTML), Controller (logic).',
            'Note an MVC action returns a `View(model)` → HTML.',
            'Note a Web API action returns the object → JSON.',
            'Open the MVC project: see `Controllers/` and `Views/`.',
            'Picture a `RoomsController` MVC action listing rooms as a page.',
            'Picture a `RoomsApiController` returning the same rooms as JSON.',
          ],
          code: `// MVC controller — returns an HTML page
public class RoomsController : Controller
{
    public IActionResult Index()
    {
        var rooms = new List<Room> { new(101, "Sea-View", 4500m) };
        return View(rooms);          // renders Views/Rooms/Index.cshtml as HTML
    }
}

// Web API controller — returns JSON data
[ApiController]
[Route("api/rooms")]
public class RoomsApiController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var rooms = new List<Room> { new(101, "Sea-View", 4500m) };
        return Ok(rooms);            // serialised to JSON
    }
}`,
          pitfalls: [
            '**Returning a View from an API controller.** Sends HTML to a JSON client. Fix: return `Ok(data)` from API controllers.',
            '**Inheriting `Controller` for a pure API.** Carries view machinery you do not need. Fix: inherit `ControllerBase` and add `[ApiController]`.',
            "**Building a JSON API when you only need server pages.** Adds front-end complexity. Fix: use MVC + Razor for simple admin pages.",
            '**Mixing HTML and JSON in one endpoint.** Confuses clients. Fix: separate MVC and API controllers.',
            '**Forgetting `[ApiController]`.** You lose automatic model validation and binding niceties. Fix: add the attribute.',
            '**Hardcoding routes inconsistently.** Fix: use `[Route("api/...")]` conventions for API controllers.',
          ],
          tryIt:
            'In your MVC project, sketch two controllers on paper: a `RoomsController` MVC action that returns `View(rooms)` and a `RoomsApiController` that returns `Ok(rooms)`. Write one sentence explaining who consumes each (a browser vs another program).',
          takeaway: 'MVC returns HTML pages; Web API returns JSON — TunMani Resort uses MVC for pages and Web API for data.',
        },
        {
          id: 'm0-t13',
          title: 'The request pipeline & middleware',
          explain:
            'Every request flows through an ordered chain of middleware components before reaching your controller and on the way back.',
          analogy:
            'A guest arriving at TunMani Resort passes through a sequence of checkpoints: the security gate, the reception desk, the key counter, then finally the room. Each checkpoint can stop them, log them, or wave them through. ASP.NET Core **middleware** is exactly that ordered line of checkpoints — every web request walks through them in order, and the response walks back out the same way.',
          theory:
            'The **request pipeline** is an ordered series of **middleware** components. Each one can inspect the incoming request, do work, then either pass it to the **next** middleware or short-circuit and respond.\n\nTypical order in `Program.cs`: `UseHttpsRedirection` → `UseStaticFiles` → `UseRouting` → `UseAuthentication` → `UseAuthorization` → endpoint (your controller). **Order matters enormously** — for example, `UseAuthentication` must come before `UseAuthorization`.\n\nMiddleware is registered with `app.UseXxx()` calls. The request flows **down** the chain to the endpoint and the response flows **back up**, so a logging middleware near the top sees both the request and the final response.',
          whyItMatters:
            'Misordered middleware causes baffling bugs — auth that never triggers, static files that 404. Interviewers love asking "what is middleware and why does order matter?" Understanding the pipeline lets you correctly slot in authentication (Google OAuth), HTTPS, and error handling for TunMani Resort.',
          steps: [
            'Open `Program.cs` and find the block of `app.Use...()` calls.',
            'Read them top to bottom — that is the order requests flow.',
            'Note `UseRouting` comes before `UseAuthorization`.',
            'Note `UseAuthentication` must precede `UseAuthorization`.',
            'Add a tiny inline middleware that logs the request path.',
            'Run the app and watch the log line print for each request.',
          ],
          code: `// Program.cs — the middleware pipeline (order matters!)
var app = builder.Build();

app.UseHttpsRedirection();      // 1. force HTTPS
app.UseStaticFiles();           // 2. serve wwwroot files

app.Use(async (context, next) =>      // custom logging middleware
{
    Console.WriteLine($"--> {context.Request.Method} {context.Request.Path}");
    await next();                      // pass to the next middleware
    Console.WriteLine($"<-- {context.Response.StatusCode}");
});

app.UseRouting();               // 3. match the URL to an endpoint
app.UseAuthentication();        // 4. who are you?  (must be before AuthZ)
app.UseAuthorization();         // 5. are you allowed?

app.MapControllers();           // 6. run the matched controller
app.Run();`,
          pitfalls: [
            '**Putting `UseAuthorization` before `UseAuthentication`.** Auth never works. Fix: authentication first, then authorization.',
            '**Calling `UseStaticFiles` after routing.** Static files may not serve correctly. Fix: register it early.',
            "**Forgetting `await next()` in custom middleware.** The request stalls and nothing downstream runs. Fix: always call `next()` unless you intend to short-circuit.",
            '**Assuming order does not matter.** It is the most common pipeline bug. Fix: treat order as significant.',
            '**Adding heavy work in middleware for every request.** Slows everything. Fix: keep middleware lightweight.',
            '**Mixing up `app.Use` (chains) and `app.Run` (terminal).** Fix: use `Use` for chained middleware, `Run` to end the pipeline.',
          ],
          tryIt:
            'Add the custom logging middleware shown above to your `Program.cs`, run the app, and visit a couple of pages. Confirm you see the `-->` and `<--` lines and that they wrap the response. Move it above `UseRouting` and observe it still runs.',
          takeaway: 'Requests flow through an ordered middleware pipeline; the order of `app.Use...()` calls is critical.',
        },
        {
          id: 'm0-t14',
          title: 'Program.cs — builder, services, app, Run',
          explain:
            '`Program.cs` is the app\'s startup file: build a host, register services, build the app, configure the pipeline, then `Run()`.',
          analogy:
            'Before TunMani Resort opens each morning, the manager does a fixed routine: hire and brief the staff (register services), set up the checkpoint order (configure the pipeline), then unlock the doors (Run). `Program.cs` is that opening routine written in code — it runs once at startup and gets everything ready before the first guest (request) arrives.',
          theory:
            'Modern ASP.NET Core uses a **minimal hosting model** in `Program.cs`:\n\n1. `var builder = WebApplication.CreateBuilder(args);` — creates the host builder.\n2. **Register services** on `builder.Services` (this is the **DI container**): `builder.Services.AddControllersWithViews();`.\n3. `var app = builder.Build();` — builds the configured app.\n4. **Configure the pipeline** with `app.Use...()` middleware.\n5. `app.MapControllers();` (or `MapControllerRoute`) — wire up endpoints.\n6. `app.Run();` — start listening.\n\nThe two halves are easy to remember: **before `Build()`** you add *services*; **after `Build()`** you add *middleware*. TunMani Resort registers its repositories, services, the `DapperContext`, and Google authentication in the services section.',
          whyItMatters:
            '`Program.cs` is the first file any reviewer opens to understand how your app is wired. Knowing the services-then-middleware structure cold lets you confidently add a database, authentication, and your own services — which is exactly what later TunMani Resort modules do here.',
          steps: [
            'Open `Program.cs` in the MVC project.',
            'Find `WebApplication.CreateBuilder(args)`.',
            'Find `builder.Services.AddControllersWithViews()` — services go here.',
            'Find `builder.Build()` — the boundary.',
            'Find the `app.Use...()` middleware block.',
            'Find `app.Run()` at the very bottom.',
          ],
          code: `// Program.cs — the full minimal hosting model
var builder = WebApplication.CreateBuilder(args);

// ----- 1. Register services (the DI container) -----
builder.Services.AddControllersWithViews();
// Later modules add: DapperContext, repositories, services, Google auth
// builder.Services.AddSingleton<DapperContext>();
// builder.Services.AddScoped<IRoomRepository, RoomRepository>();

var app = builder.Build();   // <-- boundary: services above, middleware below

// ----- 2. Configure the HTTP pipeline -----
if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler("/Home/Error");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();   // start the server`,
          pitfalls: [
            '**Registering a service after `Build()`.** It is ignored. Fix: all `builder.Services.Add...` must come before `Build()`.',
            '**Adding middleware before `Build()`.** `app` does not exist yet. Fix: all `app.Use...` come after `Build()`.',
            "**Forgetting `app.Run()`.** The app exits immediately. Fix: keep `app.Run()` as the last line.",
            '**Mixing up `MapControllers` (API) and `MapControllerRoute` (MVC).** Fix: use `MapControllerRoute` for conventional MVC routing.',
            '**Putting business logic in `Program.cs`.** It is for wiring only. Fix: keep logic in services/controllers.',
            '**Not setting up the exception handler for production.** Users see stack traces. Fix: add `UseExceptionHandler` outside Development.',
          ],
          tryIt:
            'Open your MVC project\'s `Program.cs` and annotate it with comments marking the four phases: builder, services, build, pipeline+Run. Add a harmless service registration line in the services section and confirm the app still runs.',
          takeaway: 'In `Program.cs`: register services before `Build()`, configure middleware after, and finish with `app.Run()`.',
        },
        {
          id: 'm0-t15',
          title: 'Controllers, actions & routing',
          explain:
            'A controller groups related actions (methods); routing maps an incoming URL to the right action.',
          analogy:
            'Think of TunMani Resort\'s reception as a controller and its desk staff as actions. A guest asking "where are the rooms?" is routed to the staff member who handles rooms; "I want to book" goes to the bookings clerk. **Routing** is the reception sign that maps each request to the right person, and each **action** is a staff member who handles one specific job.',
          theory:
            'A **controller** is a class (ending in `Controller`) that groups related **actions** — public methods that handle requests and return a result (`IActionResult`).\n\n**Routing** decides which action runs for a URL. **Conventional routing** uses the pattern `{controller}/{action}/{id?}`, so `/Rooms/Details/101` calls `RoomsController.Details(101)`. **Attribute routing** puts the route on the action, e.g. `[HttpGet("api/rooms/{id}")]`.\n\nAction parameters are bound automatically from the route, query string, or request body (**model binding**). HTTP verb attributes (`[HttpGet]`, `[HttpPost]`) constrain which requests an action answers — important for forms and APIs.',
          whyItMatters:
            'Controllers and routing are the front door of every web app and a guaranteed interview topic. Getting routes, verbs, and model binding right is what makes TunMani Resort\'s URLs like `/Rooms/Details/101` and `/api/bookings` work predictably for users and integrations.',
          steps: [
            'Create a `RoomsController` inheriting `Controller`.',
            'Add an `Index()` action returning a list view.',
            'Add a `Details(int id)` action that uses the route `id`.',
            'Confirm `/Rooms` maps to `Index` and `/Rooms/Details/101` maps to `Details(101)`.',
            'Add `[HttpPost]` to a `Create` action so it only answers form submissions.',
            'Run the app and hit each URL in the browser.',
          ],
          code: `// Controllers/RoomsController.cs
public class RoomsController : Controller
{
    private readonly List<Room> _rooms = new()
    {
        new(101, "Sea-View", 4500m),
        new(102, "Deluxe", 3000m),
    };

    // GET /Rooms  or  /Rooms/Index
    public IActionResult Index() => View(_rooms);

    // GET /Rooms/Details/101  -> id bound from the route
    public IActionResult Details(int id)
    {
        var room = _rooms.FirstOrDefault(r => r.RoomNumber == id);
        if (room is null) return NotFound();
        return View(room);
    }

    // POST /Rooms/Create  -> only answers POST requests
    [HttpPost]
    public IActionResult Create(Room room) => RedirectToAction("Index");
}`,
          pitfalls: [
            '**Action not found because the class name lacks "Controller".** Fix: name it `RoomsController`, not `Rooms`.',
            '**Expecting `/Rooms/Details/101` to work without an `id` parameter.** Fix: the action must accept `int id`.',
            "**A GET action mutating data.** Browsers prefetch GETs. Fix: use `[HttpPost]` for create/update/delete.",
            '**Returning the wrong status for missing data.** Fix: return `NotFound()` when an item does not exist.',
            '**Forgetting that conventional routing needs `MapControllerRoute`.** Fix: ensure the default route is registered in `Program.cs`.',
            '**Putting database/business logic directly in the action.** Fix: delegate to a service (covered in later modules).',
          ],
          tryIt:
            'Create a `RoomsController` with `Index()` and `Details(int id)` actions over an in-memory list. Run the app and visit `/Rooms` and `/Rooms/Details/101`. Confirm a bad id like `/Rooms/Details/999` returns Not Found.',
          takeaway: 'Controllers group actions; routing maps URLs (like `/Rooms/Details/101`) to the right action and binds its parameters.',
        },
        {
          id: 'm0-t16',
          title: 'Dependency injection & appsettings.json',
          explain:
            'DI hands your classes the dependencies they need instead of them creating their own; appsettings.json stores configuration like connection strings.',
          analogy:
            'At TunMani Resort, a desk clerk does not go drill her own borewell for water — the resort\'s plumbing delivers it to the tap when she needs it. **Dependency injection** is that plumbing: the framework delivers a ready-made service (like a database connection) to your controller\'s "tap" (its constructor) so it never has to build its own. And **appsettings.json** is the resort\'s settings register where addresses and access keys (like the database connection string) are written down once.',
          theory:
            '**Dependency injection (DI)** means a class declares what it needs in its **constructor**, and the framework **supplies** it. You **register** services in `Program.cs` and **inject** them where needed:\n- `AddSingleton` — one instance for the whole app (e.g. `DapperContext`).\n- `AddScoped` — one per web request (e.g. repositories).\n- `AddTransient` — a new one every time.\n\nDI keeps classes **loosely coupled** and **testable** — you can swap a real repository for a fake one in tests.\n\n**`appsettings.json`** holds configuration: connection strings, API keys, feature flags. You read it via the injected `IConfiguration`, e.g. `config.GetConnectionString("DefaultConnection")`. Secrets for local dev go in **user secrets**, not this file.',
          whyItMatters:
            'DI is the backbone of ASP.NET Core and one of the most-asked interview concepts. Every service in TunMani Resort — the `DapperContext`, repositories, business services, email sender — is wired through DI, and its database connection string lives in `appsettings.json`. Mastering both is the gateway to the whole architecture.',
          steps: [
            'Define an interface, e.g. `IRoomService`, and a class implementing it.',
            'Register it in `Program.cs`: `builder.Services.AddScoped<IRoomService, RoomService>();`.',
            'Inject it into a controller via the constructor.',
            'Add a `ConnectionStrings:DefaultConnection` entry to `appsettings.json`.',
            'Inject `IConfiguration` and read it with `GetConnectionString("DefaultConnection")`.',
            'Run the app to confirm the service resolves without error.',
          ],
          code: `// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tunmani_resort;Username=postgres;Password=postgres"
  },
  "Logging": { "LogLevel": { "Default": "Information" } }
}

// Program.cs — register the service for DI
builder.Services.AddScoped<IRoomService, RoomService>();

// RoomsController.cs — the dependency is injected, not created
public class RoomsController : Controller
{
    private readonly IRoomService _rooms;
    public RoomsController(IRoomService rooms) => _rooms = rooms; // injected!

    public IActionResult Index() => View(_rooms.GetAll());
}

// Reading config anywhere via injected IConfiguration
// var cs = config.GetConnectionString("DefaultConnection");`,
          pitfalls: [
            '**Calling `new RoomService()` inside a controller.** Defeats DI and testability. Fix: inject `IRoomService` via the constructor.',
            '**Forgetting to register the service.** Throws "Unable to resolve service". Fix: add `builder.Services.Add...` in `Program.cs`.',
            "**Injecting a Scoped service into a Singleton.** Lifetime mismatch error. Fix: match lifetimes carefully.",
            '**Storing the real database password in `appsettings.json` and committing it.** Leaks secrets. Fix: use user secrets locally and environment variables in production.',
            '**Hardcoding the connection string in code.** Hard to change per environment. Fix: read it from `IConfiguration`.',
            '**Reading config with `config["ConnectionStrings:DefaultConnection"]` and typos.** Fix: use the `GetConnectionString(...)` helper.',
          ],
          tryIt:
            'Create an `IRoomService` interface and a `RoomService` returning a hardcoded list of rooms. Register it with `AddScoped`, inject it into `RoomsController`, and confirm the page lists the rooms. Then add a `DefaultConnection` string to `appsettings.json` and read it via `IConfiguration`.',
          takeaway: 'DI supplies dependencies through constructors (registered in `Program.cs`); `appsettings.json` holds config like the connection string.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'Resort Tariff Calculator (C# Console)',
      domain: 'C# / .NET CLI',
      duration: '2 hours',
      description:
        'Build a console app that calculates the total bill for a TunMani Resort room stay: base tariff × nights, plus 12% GST, printed as a clean receipt. You will use decimal for money, a Room class, and string interpolation.',
      tools: ['.NET 10 SDK', 'C#', 'VS Code + C# Dev Kit'],
      blueprint: {
        overview:
          'A simple but correct billing calculator. The user enters a room type, nights, and base tariff; the app computes the subtotal, adds 12% GST, and prints an itemised receipt. The focus is correct money handling with decimal and clean C# structure with a Room class.',
        functionalRequirements: [
          '**Room input.** Accept a room type (string), base tariff (decimal), and number of nights (int).',
          '**Subtotal.** Compute base tariff × nights as a decimal.',
          '**GST.** Add 12% GST on the subtotal.',
          '**Receipt.** Print an itemised receipt: room type, nights, subtotal, GST amount, grand total, all currency-formatted.',
          '**Validation.** Reject zero or negative nights and tariffs with a friendly message.',
        ],
        technicalImplementation: [
          '**Room class.** A `Room` with `RoomType` and `BasePrice` and a `PriceForNights(int)` method.',
          '**Decimal money.** All money values use `decimal`; the GST constant is `0.12m`.',
          '**Formatting.** Use `:C` currency format in string interpolation for the receipt.',
          '**Input parsing.** Use `decimal.TryParse` and `int.TryParse` to read and validate console input.',
          '**Structure.** Keep calculation logic in a method, not inline in Main, so it is testable.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold',
            outcome: 'A runnable console project with a Room class.',
            prompt:
              'Create a new C# console project for .NET 10 named TunMani.TariffCalculator. Add a Room class with RoomType (string) and BasePrice (decimal) properties, a constructor, and a PriceForNights(int nights) method that returns BasePrice * nights as a decimal. In Program.cs, create a sample Sea-View room at 4500 and print its 3-night price using the :C currency format. Use decimal for all money.',
          },
          {
            step: 2,
            label: 'GST & receipt',
            outcome: 'A method that totals a stay with 12% GST and prints an itemised receipt.',
            prompt:
              'Add a method CalculateBill(Room room, int nights) that returns the subtotal, the 12% GST amount (use a constant 0.12m), and the grand total. Then print an itemised receipt to the console showing room type, nights, subtotal, GST, and grand total, each formatted with :C. Keep the calculation in its own method, separate from the printing.',
          },
          {
            step: 3,
            label: 'Input & validation',
            outcome: 'Reads user input safely and rejects bad values.',
            prompt:
              'Update Program.cs to read the room type, base tariff, and number of nights from the console using decimal.TryParse and int.TryParse. If the tariff or nights are zero or negative, print a friendly error and ask again instead of crashing. Then run the bill calculation and print the receipt. Add a few sample inputs as comments showing expected output.',
          },
        ],
      },
    },
    {
      id: 'm0-p2',
      type: 'Mini Project',
      title: 'Resort Rooms List (ASP.NET Core MVC)',
      domain: 'ASP.NET Core MVC / C#',
      duration: '2 hours',
      description:
        'Build a minimal ASP.NET Core MVC app that shows a list of TunMani Resort rooms on a web page. You will create a Room model, a RoomsController, and a Razor view, and serve them via the MVC pipeline.',
      tools: ['.NET 10 SDK', 'ASP.NET Core MVC', 'C#', 'Razor'],
      blueprint: {
        overview:
          'A first web app. An MVC controller holds an in-memory list of rooms and passes it to a Razor view that renders a table. This cements the Model-View-Controller flow, routing, and running an ASP.NET Core app — the foundation for the real TunMani Resort site.',
        functionalRequirements: [
          '**Rooms page.** A `/Rooms` page lists all rooms in a table with number, type, and price.',
          '**Details page.** A `/Rooms/Details/{id}` page shows one room, or Not Found for a bad id.',
          '**Currency formatting.** Prices display with the `:C` currency format.',
          '**Navigation.** A link from the home page to the rooms list.',
          '**Empty state.** If the list is empty, the page shows a friendly "no rooms" message.',
        ],
        technicalImplementation: [
          '**Model.** A `Room` class with RoomNumber, RoomType, BasePrice.',
          '**Controller.** A `RoomsController` with `Index()` and `Details(int id)` actions.',
          '**View.** A strongly-typed Razor view `@model IEnumerable<Room>` rendering a table.',
          '**Routing.** The default conventional route in `Program.cs` maps `/Rooms` and `/Rooms/Details/101`.',
          '**Not Found.** `Details` returns `NotFound()` for an unknown room number.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold MVC app',
            outcome: 'A running MVC app with the default home page.',
            prompt:
              'Create a new ASP.NET Core MVC app for .NET 10 named TunMani.Web using dotnet new mvc. Confirm it runs with dotnet run and the default home page loads at the printed localhost URL. Then show me the contents of Program.cs and explain the services and middleware sections in comments.',
          },
          {
            step: 2,
            label: 'Model & controller',
            outcome: 'A RoomsController serving an in-memory list of rooms.',
            prompt:
              'Add a Room model class (RoomNumber int, RoomType string, BasePrice decimal) under Models. Create a RoomsController with an Index() action that returns View(rooms) over an in-memory List<Room> of three sample TunMani Resort rooms (Sea-View 4500, Deluxe 3000, Suite 7000), and a Details(int id) action that returns the matching room or NotFound().',
          },
          {
            step: 3,
            label: 'Razor views',
            outcome: 'A rooms table page and a details page, linked from home.',
            prompt:
              'Create a strongly-typed Razor view Views/Rooms/Index.cshtml with @model IEnumerable<Room> that renders a table of room number, type, and price using the :C format, plus a "Details" link per row. Create Views/Rooms/Details.cshtml for a single room. Add a link to /Rooms from the home page. Show a friendly message if the list is empty.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'Which command confirms the .NET SDK is installed and prints its version?',
      options: ['dotnet --info only', 'dotnet --version', 'dotnet run', 'dotnet build'],
      answer: 1,
    },
    {
      id: 'm0-q2',
      q: 'Which C# type should you use to store money like a room tariff?',
      options: ['double', 'float', 'decimal', 'int'],
      answer: 2,
    },
    {
      id: 'm0-q3',
      q: 'What is the best C# construct to model a fixed set of booking states (Pending, Confirmed, Cancelled)?',
      options: ['A list of strings', 'An enum', 'A dictionary', 'A bool'],
      answer: 1,
    },
    {
      id: 'm0-q4',
      q: 'In an ASP.NET Core app, what does an MVC controller action typically return versus a Web API action?',
      options: [
        'Both always return JSON',
        'MVC returns an HTML View; Web API returns data (JSON)',
        'Both always return HTML',
        'MVC returns JSON; Web API returns HTML',
      ],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'In Program.cs, where must service registrations (builder.Services.Add...) go?',
      options: [
        'After builder.Build()',
        'After app.Run()',
        'Before builder.Build()',
        'Anywhere, order does not matter',
      ],
      answer: 2,
    },
    {
      id: 'm0-q6',
      q: 'Why are database calls written as async/await in ASP.NET Core?',
      options: [
        'It makes the code shorter',
        'It frees the thread while waiting so the server can serve other requests',
        'It is required by C# syntax for all methods',
        'It encrypts the database connection',
      ],
      answer: 1,
    },
  ],
};
