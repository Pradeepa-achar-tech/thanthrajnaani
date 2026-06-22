// Module M7 — Catering, Decorations, Vendors & Inventory (TunMani Resort)
// Teach the add-on and operations features: the menu/catering catalogue,
// decorations with multi-image upload, vendor assignment, and inventory stock
// tracking with low-stock alerts.

export const m7 = {
  id: 'm7',
  title: 'Catering, Decorations, Vendors & Inventory',
  hours: 9,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Build the operations side of the resort: a catering menu with PostgreSQL array contents, decorations with multi-image upload, vendor assignment to bookings, and inventory stock tracking with low-stock alerts.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Menu & Catering',
      topics: [
        {
          id: 'm7-t1',
          title: 'MenuCategory & display order',
          explain:
            'A `MenuCategory` groups dishes (Breakfast, Lunch, Dinner, Snacks) and carries a `DisplayOrder` so the menu always shows in a sensible sequence.',
          analogy:
            'The catering board at a TunMani Resort wedding is laid out the way meals actually happen through the day — breakfast first, then lunch, then dinner, with snacks tucked between. `MenuCategory` with a `DisplayOrder` is that fixed left-to-right ordering on the board, so the menu never shows dinner before breakfast.',
          theory:
            'A **`MenuCategory`** is a simple lookup: a `Name` (Breakfast / Lunch / Dinner / Snacks) and a **`DisplayOrder`** integer that controls the sequence in the UI.\n\nWhy a `DisplayOrder` instead of sorting by name alphabetically? Because the natural order — Breakfast, Lunch, Dinner — is **not** alphabetical. Storing an explicit order number lets staff arrange categories however the resort wants, and `ORDER BY display_order` renders them correctly every time.\n\nWe model it as a small POCO mapped to a `menu_categories` table. Each `MenuItem` (next topic) references a category, giving us the classic **one category → many items** relationship.',
          whyItMatters:
            'A menu shown in a jumbled order looks unprofessional to a wedding client choosing their catering. An explicit `DisplayOrder` gives staff full control of the sequence and keeps the menu readable, which matters when you are selling food to a paying event host.',
          steps: [
            'Create `Models/MenuCategory.cs` with `Id`, `Name`, `DisplayOrder`.',
            'Create the `menu_categories` table with an integer `display_order`.',
            'Seed the four categories with orders 1–4.',
            'Always query categories with `ORDER BY display_order`.',
            'Reference the category id from `MenuItem`.',
            'Expose a service method `GetCategoriesAsync` returning them ordered.',
          ],
          code: `// Models/MenuCategory.cs
public class MenuCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = "";   // Breakfast | Lunch | Dinner | Snacks
    public int DisplayOrder { get; set; }     // controls UI sequence
}

/* PostgreSQL
CREATE TABLE menu_categories (
    id            serial PRIMARY KEY,
    name          text NOT NULL,
    display_order int  NOT NULL DEFAULT 0
);
INSERT INTO menu_categories (name, display_order) VALUES
    ('Breakfast', 1), ('Lunch', 2), ('Dinner', 3), ('Snacks', 4);
*/

// Always order by display_order, never by name.
// SELECT * FROM menu_categories ORDER BY display_order;`,
          pitfalls: [
            '**Sorting categories alphabetically.** Breakfast, Dinner, Lunch, Snacks is wrong; use `DisplayOrder`.',
            '**Hard-coding categories in code.** Keep them in a table so staff can rename or reorder without a deploy.',
            '**Reusing display orders.** Keep them distinct (1, 2, 3, 4) so the sort is deterministic.',
            '**Forgetting the foreign key from items.** Each `MenuItem` must point to a valid category id.',
          ],
          tryIt:
            'Create the `menu_categories` table, seed the four categories, and run `SELECT * ... ORDER BY display_order`. Confirm Breakfast comes first and Snacks last.',
          takeaway:
            '`MenuCategory` groups dishes and its `DisplayOrder` controls the menu sequence — always sort by it, never by name.',
        },
        {
          id: 'm7-t2',
          title: 'MenuItem with a text[] Contents array',
          explain:
            'A `MenuItem` has a `Name`, `BasePrice`, `Description`, an `IsActive` flag, and a **`Contents[]`** array listing what is included — stored as a PostgreSQL `text[]`.',
          analogy:
            'A TunMani Resort "Lunch Thali" is not one thing — it is a plate of many: rice, sambar, two curries, papad, pickle, payasa. The `Contents[]` array lists exactly those components on one dish, the way the catering card spells out what the guest gets for the price, without needing a separate table for each spoonful.',
          theory:
            'A **`MenuItem`** is one sellable dish: `Name`, `Category` (id), `BasePrice` (`decimal`), `Description`, and **`IsActive`** (so discontinued dishes hide without deletion).\n\nThe interesting field is **`Contents`** — a list of components (e.g. `["Rice", "Sambar", "Papad"]`). Rather than a child table, we store it as a PostgreSQL **`text[]`** array column, which maps to a C# **`string[]`** (or `List<string>`).\n\n**Dapper + arrays:** Npgsql understands `text[]` natively, so a C# `string[]` parameter inserts straight into a `text[]` column and reads back as a `string[]`. No JSON, no join table. This is the idiomatic PostgreSQL way to store a short, simple list that belongs to one row.',
          whyItMatters:
            'Catering items are naturally "a dish made of components," and forcing that into a join table is heavy for something this simple. A `text[]` column keeps the contents with the dish, reads back as a clean C# array, and showcases a PostgreSQL feature that makes the model both simpler and faster.',
          steps: [
            'Create `Models/MenuItem.cs` with `Contents` as `string[]`.',
            'Add a `contents text[]` column to the `menu_items` table.',
            'Insert with a `string[]` parameter — Npgsql maps it to `text[]`.',
            'Read it back into the `string[]` property automatically.',
            'Filter active items with `WHERE is_active = true`.',
            'Render the contents as a comma list or bullet list in the view.',
          ],
          code: `// Models/MenuItem.cs
public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int CategoryId { get; set; }
    public decimal BasePrice { get; set; }
    public string? Description { get; set; }
    public string[] Contents { get; set; } = Array.Empty<string>(); // text[]
    public bool IsActive { get; set; } = true;
}

// Dapper insert — Npgsql maps string[] straight to text[]:
await _db.ExecuteAsync(
    @"INSERT INTO menu_items (name, category_id, base_price, description, contents, is_active)
      VALUES (@Name, @CategoryId, @BasePrice, @Description, @Contents, @IsActive)",
    item);

/* PostgreSQL
CREATE TABLE menu_items (
    id          serial PRIMARY KEY,
    name        text NOT NULL,
    category_id int NOT NULL REFERENCES menu_categories(id),
    base_price  numeric(10,2) NOT NULL,
    description text,
    contents    text[] NOT NULL DEFAULT '{}',
    is_active   boolean NOT NULL DEFAULT true
);
*/`,
          pitfalls: [
            '**Storing contents as a comma-joined string.** Use a real `text[]` so you keep array semantics and can query elements.',
            '**Serializing the array to JSON unnecessarily.** Npgsql maps `string[]` ↔ `text[]` directly; no JSON needed.',
            '**Deleting discontinued items.** Set `IsActive = false` instead, so historical bookings keep their references.',
            '**Forgetting the `DEFAULT \'{}\'`.** Default the array to empty so inserts without contents do not fail on NOT NULL.',
          ],
          tryIt:
            'Insert a "Lunch Thali" `MenuItem` with `Contents = ["Rice","Sambar","Papad","Payasa"]` via Dapper, then read it back and confirm the `string[]` round-trips intact.',
          takeaway:
            'A `MenuItem` stores its components in a PostgreSQL `text[]` `Contents` array that maps cleanly to a C# `string[]` through Dapper.',
        },
        {
          id: 'm7-t3',
          title: 'MenuItemController & MenuService',
          explain:
            '`MenuItemController` exposes CRUD for dishes and `MenuService` does the data work — create, list (active or all), update, and soft-delete via `IsActive`.',
          analogy:
            'The TunMani Resort catering manager keeps the menu card up to date: adds the new prawn ghee roast, bumps the thali price for the season, and quietly retires a dish that is off. `MenuItemController` is the manager’s pen on the card; `MenuService` is the kitchen ledger that actually records each change.',
          theory:
            'Standard **thin controller, fat service**. `MenuItemController` handles routes — `GET /Menu` (list), `GET /Menu/Create`, `POST /Menu/Create`, `POST /Menu/{id}/Edit`, `POST /Menu/{id}/Toggle` — binds the form, and calls `MenuService`.\n\n`MenuService` holds the Dapper queries:\n\n- **List** — all items, or only `is_active = true` for booking screens.\n- **Create / Update** — insert or update, passing the `Contents` array straight through.\n- **Soft-delete** — flip `is_active` rather than `DELETE`, so past bookings keep working.\n\nWe validate on the server (name required, price ≥ 0) before writing. The controller returns Razor views for the list and edit forms; the service returns models. This split is the same pattern every entity in the app follows.',
          whyItMatters:
            'Menu management is everyday work for catering staff, so it must be quick and forgiving. A clean controller/service split with soft-delete means staff can edit freely without ever breaking an old invoice that referenced a now-retired dish.',
          steps: [
            'Create `MenuItemController` with list, create, edit, and toggle actions.',
            'Create `MenuService` with `GetAllAsync`, `GetActiveAsync`, `CreateAsync`, `UpdateAsync`, `ToggleActiveAsync`.',
            'Pass the `Contents` array through unchanged in create/update.',
            'Validate name and price before writing.',
            'Implement delete as `ToggleActiveAsync` (soft-delete).',
            'Return Razor views for list and edit; bind forms to `MenuItem`.',
          ],
          code: `// Controllers/MenuItemController.cs
[HttpGet("/Menu")]
public async Task<IActionResult> Index() =>
    View(await _menu.GetAllAsync());

[HttpPost("/Menu/Create")]
public async Task<IActionResult> Create(MenuItem item)
{
    if (!ModelState.IsValid) return View(item);
    await _menu.CreateAsync(item);
    return RedirectToAction(nameof(Index));
}

// Services/MenuService.cs
public Task<int> CreateAsync(MenuItem m) => _db.ExecuteAsync(
    @"INSERT INTO menu_items (name, category_id, base_price, description, contents, is_active)
      VALUES (@Name, @CategoryId, @BasePrice, @Description, @Contents, true)", m);

public Task ToggleActiveAsync(int id) => _db.ExecuteAsync(
    "UPDATE menu_items SET is_active = NOT is_active WHERE id = @id", new { id });`,
          pitfalls: [
            '**Hard-deleting menu items.** A `DELETE` breaks old bookings that reference the dish; toggle `is_active` instead.',
            '**Skipping server-side validation.** Validate name and non-negative price in the service, not just the browser.',
            '**Putting Dapper queries in the controller.** Keep data access in `MenuService` so it is testable and reusable.',
            '**Showing inactive items on the booking screen.** Use `GetActiveAsync` there so retired dishes cannot be added.',
          ],
          tryIt:
            'Build the `MenuItemController` create and toggle actions. Add a dish, retire it via toggle, and confirm it disappears from the active list but stays in the all-items list.',
          takeaway:
            '`MenuItemController` + `MenuService` give CRUD for dishes with soft-delete via `IsActive`, keeping past bookings intact.',
        },
        {
          id: 'm7-t4',
          title: 'Adding menus to bookings (BookingMenu join rows)',
          explain:
            'A booking gets catering by inserting **`BookingMenu`** rows (a join between booking and menu item) carrying `Quantity` and an optional `OverridePrice`.',
          analogy:
            'When a Kundapura family books a wedding at TunMani Resort, the catering manager pencils onto their file: "Lunch Thali × 80 plates, Snacks × 100." Each pencilled line is a `BookingMenu` row — it links the family’s booking to a menu item, records how many, and can note a special negotiated price if the family bargained.',
          theory:
            'A booking and a menu item have a **many-to-many** relationship — one booking orders many dishes, one dish appears on many bookings. The bridge is a **join table**, `booking_menus`, with extra columns:\n\n- **`BookingId`** and **`MenuItemId`** — the link.\n- **`Quantity`** — how many plates.\n- **`OverridePrice`** (nullable) — a negotiated price; when null, fall back to the item’s `BasePrice`.\n\nThe line total is `Quantity × (OverridePrice ?? BasePrice)`. Hall (event) bookings use a parallel **`HallBookingMenu`** join with the same shape.\n\nWhen we generate the invoice (M6), each `BookingMenu` row becomes an `InvoiceItem` of `ItemType = "menu"`. The join row is the editable booking-time record; the invoice item is its frozen billed form.',
          whyItMatters:
            'Catering is often the biggest add-on on a wedding bill, so it must attach cleanly to a booking with per-booking quantities and negotiated prices. A join table with `Quantity` and `OverridePrice` captures real catering deals exactly, and flows straight into invoicing.',
          steps: [
            'Create a `booking_menus` join table with `booking_id`, `menu_item_id`, `quantity`, nullable `override_price`.',
            'Add a `BookingMenu` POCO mirroring those columns.',
            'Insert a row when staff add a dish to a booking.',
            'Compute the line price as `Quantity × (OverridePrice ?? BasePrice)`.',
            'Create a parallel `hall_booking_menus` for event bookings.',
            'At checkout, turn each `BookingMenu` into a `menu` `InvoiceItem`.',
          ],
          code: `// Models/BookingMenu.cs
public class BookingMenu
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int MenuItemId { get; set; }
    public decimal Quantity { get; set; }
    public decimal? OverridePrice { get; set; }   // null = use item's BasePrice
}

// Effective unit price = OverridePrice ?? BasePrice
// Line total          = Quantity * effectiveUnitPrice

/* PostgreSQL
CREATE TABLE booking_menus (
    id             serial PRIMARY KEY,
    booking_id     int NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    menu_item_id   int NOT NULL REFERENCES menu_items(id),
    quantity       numeric(10,2) NOT NULL,
    override_price numeric(10,2)
);
-- Hall events use a parallel hall_booking_menus table.
*/`,
          pitfalls: [
            '**Copying the dish name/price into the booking row.** Reference `menu_item_id`; copying duplicates data that goes stale.',
            '**Forgetting the price fallback.** Use `OverridePrice ?? BasePrice`, or negotiated lines silently bill at zero.',
            '**No `ON DELETE CASCADE`.** Deleting a booking should remove its menu lines, not orphan them.',
            '**Mixing room and hall catering in one table.** Keep `hall_booking_menus` parallel for clean event billing.',
          ],
          tryIt:
            'Add a `BookingMenu` row for "Lunch Thali × 80" with no override, and another with an override price. Compute both line totals and confirm the fallback to `BasePrice` works.',
          takeaway:
            '`BookingMenu` join rows attach dishes to a booking with `Quantity` and optional `OverridePrice`, flowing into `menu` invoice items.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Decorations & Image Upload',
      topics: [
        {
          id: 'm7-t5',
          title: 'The Decoration entity',
          explain:
            'A `Decoration` is a sellable décor package (Name, Category, BasePrice, Description, `VendorId`, `IsActive`) that can be added to bookings.',
          analogy:
            'For a TunMani Resort wedding the family picks from a décor catalogue: "Mandap Flower Set," "Beach Entrance Arch," "Reception Stage." Each is a `Decoration` — a named, priced package, often supplied by a particular florist (the `VendorId`). It is the décor twin of a menu item.',
          theory:
            'A **`Decoration`** mirrors a menu item but for visual setups: `Name`, `Category` (e.g. Mandap, Stage, Entrance), `BasePrice` (`decimal`), `Description`, an optional **`VendorId`** (the supplier), and **`IsActive`**.\n\nLinking a **`VendorId`** matters because décor is usually outsourced to a florist or event decorator (covered in the Vendors section). It lets us trace which supplier provides a package and later assign them to the actual booking.\n\nLike menu items, decorations are **soft-deleted** with `IsActive`, attach to bookings via a join table, and become `decoration`-type invoice items at checkout. The new wrinkle here is that a decoration carries **multiple images** — the next topic.',
          whyItMatters:
            'Décor is a major, visual selling point for weddings, and clients choose largely by photos. Modelling decorations as first-class, vendor-linked, image-rich packages lets the resort present a proper catalogue and bill it correctly.',
          steps: [
            'Create `Models/Decoration.cs` with the fields above.',
            'Make `VendorId` nullable (some décor is in-house).',
            'Create the `decorations` table with a foreign key to `vendors`.',
            'Soft-delete with `IsActive` like menu items.',
            'Plan the `decoration_images` child table (next topic).',
            'Attach decorations to bookings via a join table.',
          ],
          code: `// Models/Decoration.cs
public class Decoration
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";   // Mandap | Stage | Entrance | ...
    public decimal BasePrice { get; set; }
    public string? Description { get; set; }
    public int? VendorId { get; set; }            // supplier (florist/decorator)
    public bool IsActive { get; set; } = true;
}

/* PostgreSQL
CREATE TABLE decorations (
    id          serial PRIMARY KEY,
    name        text NOT NULL,
    category    text NOT NULL,
    base_price  numeric(10,2) NOT NULL,
    description text,
    vendor_id   int REFERENCES vendors(id),   -- nullable: some décor is in-house
    is_active   boolean NOT NULL DEFAULT true
);
*/`,
          pitfalls: [
            '**Making `VendorId` mandatory.** Some décor is in-house; keep it nullable.',
            '**Hard-deleting decorations.** Soft-delete with `IsActive` so historical bookings keep their references.',
            '**Stuffing image paths onto the decoration row.** A decoration has many images; use a child table (next topic).',
            '**Free-text categories everywhere.** Keep a small known set so the catalogue groups cleanly.',
          ],
          tryIt:
            'Create the `decorations` table and insert a "Mandap Flower Set" linked to a florist vendor. Read it back and confirm the `VendorId` foreign key resolves.',
          takeaway:
            'A `Decoration` is a vendor-linked, soft-deletable décor package — the visual twin of a menu item — ready to carry multiple images.',
        },
        {
          id: 'm7-t6',
          title: 'DecorationImage: multiple images per decoration',
          explain:
            'A `DecorationImage` stores one photo of a decoration — as a file path or raw bytes — with `ContentType`, `FileName`, and a `SortOrder` for galleries.',
          analogy:
            'A wedding family wants to see the Mandap Flower Set from every angle before booking — front, close-up of the flowers, the lit-up evening shot. Each photo is a `DecorationImage`, and the `SortOrder` is the album sequence the resort wants the family to flip through, hero shot first.',
          theory:
            'One decoration has **many images**, so images live in a child table **`decoration_images`** linked by `DecorationId`. Each row holds either:\n\n- **`ImagePath`** — a relative path when the file is saved to disk (`wwwroot/uploads`), **or**\n- **`ImageBytes`** — the raw bytes (`bytea`) when stored in the database,\n\nplus **`ContentType`** (e.g. `image/jpeg`), **`FileName`**, and a **`SortOrder`** to control gallery order.\n\nThe two storage strategies are a real design choice (covered next topic): files on disk are lighter on the database but need backup of the folder; bytes in the DB are self-contained but bloat the database. We model **both** columns so either approach fits the same schema. `SortOrder` lets staff pick the hero image and arrange the rest.',
          whyItMatters:
            'A décor catalogue lives or dies by its photos, and one image per package is not enough to sell a wedding setup. A dedicated images table with ordering supports a real gallery, and modelling both path and bytes keeps your storage strategy flexible.',
          steps: [
            'Create `Models/DecorationImage.cs` with `DecorationId`, `ImagePath`, `ImageBytes`, `ContentType`, `FileName`, `SortOrder`.',
            'Create the `decoration_images` table with a `bytea` for bytes and `text` for path.',
            'Add a foreign key to `decorations` with `ON DELETE CASCADE`.',
            'Make both `ImagePath` and `ImageBytes` nullable (use one strategy per image).',
            'Order galleries by `SortOrder`.',
            'Treat the lowest `SortOrder` as the hero/cover image.',
          ],
          code: `// Models/DecorationImage.cs
public class DecorationImage
{
    public int Id { get; set; }
    public int DecorationId { get; set; }
    public string? ImagePath { get; set; }    // when saved to wwwroot/uploads
    public byte[]? ImageBytes { get; set; }   // when stored in DB (bytea)
    public string ContentType { get; set; } = "image/jpeg";
    public string FileName { get; set; } = "";
    public int SortOrder { get; set; }
}

/* PostgreSQL
CREATE TABLE decoration_images (
    id            serial PRIMARY KEY,
    decoration_id int NOT NULL REFERENCES decorations(id) ON DELETE CASCADE,
    image_path    text,            -- one of path OR bytes is set
    image_bytes   bytea,
    content_type  text NOT NULL DEFAULT 'image/jpeg',
    file_name     text NOT NULL,
    sort_order    int  NOT NULL DEFAULT 0
);
*/`,
          pitfalls: [
            '**Allowing one image per decoration.** Use a child table so a package can have a full gallery.',
            '**Setting both path and bytes.** Pick one strategy per image; keeping both filled wastes space and confuses serving.',
            '**No `ON DELETE CASCADE`.** Deleting a decoration should remove its images, not orphan files/rows.',
            '**Ignoring `SortOrder`.** Without it the gallery order is random and you cannot pick a hero image.',
          ],
          tryIt:
            'Create the `decoration_images` table and insert three image rows for one decoration with `SortOrder` 1, 2, 3. Query them ordered and confirm the hero (1) comes first.',
          takeaway:
            'A `DecorationImage` child row holds one photo (path or bytes) with content type and `SortOrder`, giving each decoration an ordered gallery.',
        },
        {
          id: 'm7-t7',
          title: 'Multi-image upload: files vs bytes',
          explain:
            '`/Decoration/{id}/UploadImage` accepts uploaded files via `IFormFile`, saving each either to `wwwroot/uploads` (path) or as bytes in the database.',
          analogy:
            'When the florist sends TunMani Resort their latest mandap photos, the office has two ways to keep them: pin the prints into a physical album on the shelf (files in `wwwroot/uploads`, the row just notes where), or paste the prints directly into the ledger book (bytes inside the database). The upload endpoint supports either filing system.',
          theory:
            'The controller action **`POST /Decoration/{id}/UploadImage`** receives one or more **`IFormFile`** uploads (the ASP.NET Core type for a posted file). For each file we choose a storage strategy:\n\n**Files on disk** — save to `wwwroot/uploads`, store only the relative **`ImagePath`**. Pros: small database, fast serving as static files. Cons: must back up the folder; paths can break if you move servers.\n\n**Bytes in DB** — read the stream into a `byte[]` and store as **`ImageBytes`** (`bytea`). Pros: self-contained, one backup. Cons: bloats the database, needs an action to stream them back.\n\nEither way we **validate** the content type (images only) and size before saving, generate a unique file name to avoid collisions, and set `SortOrder`. We accept **multiple** files in one POST by binding `List<IFormFile>`.',
          whyItMatters:
            'Image upload is a feature beginners often get wrong — saving with the original filename (collisions), trusting the content type, or blocking the request on large files. Doing it properly, with a clear files-vs-bytes decision, is a reusable skill for any app that handles user uploads.',
          steps: [
            'Add `POST /Decoration/{id}/UploadImage` binding `List<IFormFile> files`.',
            'Validate each file’s content type (image/*) and a max size.',
            'For disk storage: generate a unique name, save under `wwwroot/uploads`, store the path.',
            'For DB storage: copy the stream to a `byte[]` and store as `bytea`.',
            'Insert a `decoration_images` row per file with the next `SortOrder`.',
            'Redirect back to the decoration edit page showing the new gallery.',
          ],
          code: `// Controllers/DecorationController.cs
[HttpPost("/Decoration/{id:int}/UploadImage")]
public async Task<IActionResult> UploadImage(int id, List<IFormFile> files)
{
    foreach (var file in files)
    {
        if (file.Length == 0 || !file.ContentType.StartsWith("image/"))
            continue;                                   // skip invalid uploads

        // Strategy A: save to wwwroot/uploads, store the path.
        var name = $"{Guid.NewGuid():N}{Path.GetExtension(file.FileName)}";
        var path = Path.Combine(_env.WebRootPath, "uploads", name);
        await using (var fs = System.IO.File.Create(path))
            await file.CopyToAsync(fs);

        await _decor.AddImageAsync(new DecorationImage {
            DecorationId = id,
            ImagePath = $"/uploads/{name}",             // relative path
            ContentType = file.ContentType,
            FileName = file.FileName
        });

        // Strategy B (alternative): read bytes and store in DB.
        // using var ms = new MemoryStream();
        // await file.CopyToAsync(ms);
        // image.ImageBytes = ms.ToArray();
    }
    return RedirectToAction("Edit", new { id });
}`,
          pitfalls: [
            '**Saving with the original filename.** Two "photo.jpg" uploads overwrite each other; generate a unique name (`Guid`).',
            '**Trusting the content type blindly.** Check it and the file size; reject non-images to avoid storing junk or scripts.',
            '**Forgetting the uploads folder must exist.** Ensure `wwwroot/uploads` exists (and is writable) or `File.Create` throws.',
            '**Loading huge files into memory.** For big files prefer streaming to disk over `ToArray()` to avoid memory spikes.',
          ],
          tryIt:
            'Build the `UploadImage` action saving to `wwwroot/uploads` with a `Guid` filename. Upload two images at once and confirm both appear in the decoration’s gallery with distinct paths.',
          takeaway:
            'The upload endpoint binds `IFormFile`s and saves each image either to `wwwroot/uploads` (path) or as `bytea` (bytes), with validation and unique names.',
        },
        {
          id: 'm7-t8',
          title: 'Adding decorations to bookings',
          explain:
            'Decorations attach to a booking through **`BookingDecoration`** join rows (and `HallBookingDecoration` for events), the same join pattern as menus.',
          analogy:
            'Once the family picks "Mandap Flower Set" and "Beach Entrance Arch" for their TunMani Resort wedding, the planner notes both onto the booking file. Each note is a `BookingDecoration` row linking the booking to a décor package — exactly like the catering lines, but for the look of the event.',
          theory:
            'Decorations join to bookings the same way menus do. A **`BookingDecoration`** row links a `BookingId` to a `DecorationId`, with an optional **`OverridePrice`** (and usually a quantity of one — a mandap set is a unit, not plates).\n\nEvent (hall) bookings use the parallel **`HallBookingDecoration`** join. At checkout each row becomes a `decoration`-type **`InvoiceItem`**, priced at `OverridePrice ?? BasePrice`.\n\nThe lesson here is **consistency**: menus and decorations are both add-ons that join to bookings and flow into invoice items. Using the same join-row pattern for both keeps the codebase predictable — once you understand `BookingMenu`, `BookingDecoration` needs no new ideas.',
          whyItMatters:
            'Reusing one join-row pattern for every add-on means less code, fewer bugs, and a checkout that treats menus and decorations uniformly. A planner can build the whole event — food and décor — onto one booking that invoices correctly.',
          steps: [
            'Create a `booking_decorations` join table (`booking_id`, `decoration_id`, `override_price`).',
            'Add a `BookingDecoration` POCO mirroring it.',
            'Insert a row when a decoration is added to a booking.',
            'Price as `OverridePrice ?? BasePrice` at checkout.',
            'Create a parallel `hall_booking_decorations` for events.',
            'Turn each row into a `decoration` `InvoiceItem` at checkout.',
          ],
          code: `// Models/BookingDecoration.cs
public class BookingDecoration
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int DecorationId { get; set; }
    public decimal? OverridePrice { get; set; }   // null = use BasePrice
}

/* PostgreSQL
CREATE TABLE booking_decorations (
    id             serial PRIMARY KEY,
    booking_id     int NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    decoration_id  int NOT NULL REFERENCES decorations(id),
    override_price numeric(10,2)
);
-- Events: parallel hall_booking_decorations table.
*/

// At checkout this becomes an InvoiceItem:
// new InvoiceItem { ItemType = "decoration",
//   Description = decoration.Name, Quantity = 1,
//   UnitPrice = bd.OverridePrice ?? decoration.BasePrice };`,
          pitfalls: [
            '**Inventing a new pattern for décor.** Reuse the `BookingMenu` join shape for consistency.',
            '**Forgetting the price fallback.** Use `OverridePrice ?? BasePrice` so défault pricing works.',
            '**No cascade on booking delete.** Cascade `booking_decorations` so décor lines clean up with the booking.',
            '**Mixing room and hall décor in one table.** Keep `hall_booking_decorations` parallel.',
          ],
          tryIt:
            'Attach two decorations to a booking via `BookingDecoration` rows, one with an override price. Generate the invoice and confirm two `decoration` line items appear with the right prices.',
          takeaway:
            'Decorations attach to bookings via `BookingDecoration` join rows — the same pattern as menus — and become `decoration` invoice items.',
        },
      ],
    },
    {
      id: 'm7-s3',
      title: 'Vendors & Inventory',
      topics: [
        {
          id: 'm7-t9',
          title: 'The Vendor entity',
          explain:
            'A `Vendor` is an external supplier (Name, Category, Phone, Email, Address, `IsActive`) — caterers, florists, photographers the resort works with.',
          analogy:
            'TunMani Resort cannot do a big Udupi wedding alone — it leans on a trusted circle: the caterer from Kundapura, the florist, the photographer, the sound team. The `Vendor` table is the resort’s contact book of these partners, each with a category and phone number, so staff can call the right person for the right job.',
          theory:
            'A **`Vendor`** is an outside supplier the resort engages for a booking. Fields: `Name`, **`Category`** (`Catering`, `Flowers`, `Photography`, …), `Phone`, `Email`, `Address`, and **`IsActive`** (so you can retire a vendor without deleting their history).\n\nThe `Category` lets staff filter the contact book — "show me all photographers." Vendors connect to the app in two places:\n\n1. A **`Decoration.VendorId`** (the supplier of a décor package), seen earlier.\n2. A **`BookingVendor`** assignment (engaging a vendor for a specific booking), next topic.\n\nIt is a simple CRUD entity, managed by `VendorController` + a vendor service, soft-deleted like the others.',
          whyItMatters:
            'Resorts run on relationships with reliable suppliers, and a structured vendor list is the backbone of event operations. Categorising and keeping vendors active/inactive lets staff quickly engage the right partner and keeps a history of who did what.',
          steps: [
            'Create `Models/Vendor.cs` with the fields above.',
            'Create the `vendors` table; index `category` for filtering.',
            'Build `VendorController` CRUD and a vendor service.',
            'Soft-delete with `IsActive`.',
            'Filter the list by `Category` in the UI.',
            'Reference vendors from decorations and booking assignments.',
          ],
          code: `// Models/Vendor.cs
public class Vendor
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";  // Catering | Flowers | Photography | ...
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}

/* PostgreSQL
CREATE TABLE vendors (
    id        serial PRIMARY KEY,
    name      text NOT NULL,
    category  text NOT NULL,
    phone     text,
    email     text,
    address   text,
    is_active boolean NOT NULL DEFAULT true
);
CREATE INDEX idx_vendors_category ON vendors(category);
*/`,
          pitfalls: [
            '**Hard-deleting vendors.** Old bookings reference them; soft-delete with `IsActive`.',
            '**No category index.** Filtering the contact book by category is common; index it.',
            '**Free-text categories with typos.** Constrain to a known list so "Flowers" and "Flower" do not split.',
            '**Storing phone as a number.** Phone numbers have leading zeros and `+91`; store as text.',
          ],
          tryIt:
            'Create the `vendors` table and add a caterer, a florist, and a photographer. Query vendors filtered by `category = \'Photography\'` and confirm only the photographer returns.',
          takeaway:
            'A `Vendor` is a categorised, soft-deletable supplier contact — the resort’s partner contact book — referenced by decorations and bookings.',
        },
        {
          id: 'm7-t10',
          title: 'Assigning a vendor to a booking (BookingVendor)',
          explain:
            'A **`BookingVendor`** row engages a vendor for a booking with a `WorkDescription`, `AgreedAmount`, `AdvancePaid`, and a `Status`.',
          analogy:
            'For the Udupi wedding, TunMani Resort formally engages the caterer: "Cook lunch and dinner for 200, agreed ₹1,20,000, ₹40,000 advance paid, status: confirmed." That agreement is a `BookingVendor` row — it pins down who is doing what, for how much, and how far along the deal is.',
          theory:
            'Engaging a vendor for a booking is more than a link — it is a **mini-contract**. A **`BookingVendor`** row carries:\n\n- **`BookingId`** + **`VendorId`** — the engagement.\n- **`WorkDescription`** — what they will do ("Catering for 200 guests").\n- **`AgreedAmount`** — the negotiated price (`decimal`).\n- **`AdvancePaid`** — deposit given to the vendor so far.\n- **`Status`** — `pending` / `confirmed` / `completed` / `cancelled`.\n\nThis tracks the resort’s **outgoing** obligations (money the resort owes vendors), the mirror of the guest payments in M6. Hall events use a parallel **`HallBookingVendor`**.\n\nThe outstanding to a vendor is `AgreedAmount − AdvancePaid`, and `Status` drives the operations view — what is still pending versus confirmed for an upcoming event.',
          whyItMatters:
            'Events fall apart when nobody tracks which vendor is confirmed and what they are owed. A `BookingVendor` engagement turns loose phone-call deals into structured records, so staff know exactly who is on for an event and how much advance has gone out.',
          steps: [
            'Create a `booking_vendors` table with the fields above.',
            'Add a `BookingVendor` POCO mirroring it.',
            'Insert a row when a vendor is engaged for a booking.',
            'Track `Status` through pending → confirmed → completed.',
            'Compute vendor outstanding as `AgreedAmount − AdvancePaid`.',
            'Create a parallel `hall_booking_vendors` for events.',
          ],
          code: `// Models/BookingVendor.cs
public class BookingVendor
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int VendorId { get; set; }
    public string WorkDescription { get; set; } = "";
    public decimal AgreedAmount { get; set; }
    public decimal AdvancePaid { get; set; }
    public string Status { get; set; } = "pending"; // pending|confirmed|completed|cancelled
}

// Outstanding to the vendor = AgreedAmount - AdvancePaid

/* PostgreSQL
CREATE TABLE booking_vendors (
    id               serial PRIMARY KEY,
    booking_id       int NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    vendor_id        int NOT NULL REFERENCES vendors(id),
    work_description text NOT NULL,
    agreed_amount    numeric(12,2) NOT NULL,
    advance_paid     numeric(12,2) NOT NULL DEFAULT 0,
    status           text NOT NULL DEFAULT 'pending'
);
-- Events: parallel hall_booking_vendors table.
*/`,
          pitfalls: [
            '**Treating it as a plain link.** Capture `AgreedAmount`, `AdvancePaid`, and `Status`; the engagement is a contract.',
            '**Confusing vendor money with guest money.** This is the resort’s outgoing obligation, separate from guest payments.',
            '**Letting `AdvancePaid` exceed `AgreedAmount`.** Validate so outstanding never goes negative unexpectedly.',
            '**No status workflow.** Track pending → confirmed → completed so operations know what is locked in.',
          ],
          tryIt:
            'Engage a caterer on a booking with `AgreedAmount = 120000` and `AdvancePaid = 40000`. Compute the outstanding (₹80,000) and move the status to `confirmed`.',
          takeaway:
            '`BookingVendor` is a mini-contract — work, agreed amount, advance, status — tracking what the resort owes each engaged vendor.',
        },
        {
          id: 'm7-t11',
          title: 'InventoryItem & current stock',
          explain:
            'An `InventoryItem` tracks a consumable (Name, Category, Unit, `CurrentStock`, `MinStockLevel`, UnitPrice) the resort keeps in store.',
          analogy:
            'The TunMani Resort store room holds the everyday consumables — towels, toiletries, gas cylinders, table linen. The `InventoryItem` table is the stock register on the store-room wall: for each item, how much is on hand (`CurrentStock`) and the level below which someone must reorder (`MinStockLevel`).',
          theory:
            'An **`InventoryItem`** represents something the resort stocks and consumes:\n\n- **`Name`**, **`Category`** (Linen, Toiletries, Kitchen, …), **`Unit`** (pieces, kg, litres).\n- **`CurrentStock`** — how much is on hand right now.\n- **`MinStockLevel`** — the reorder threshold; below it, the item is "low".\n- **`UnitPrice`** — value per unit, for stock valuation.\n\n`CurrentStock` is the **derived** running balance — we do not edit it directly. Instead every change is an **`InventoryTransaction`** (next topic), and `CurrentStock` reflects the sum of those movements. The low-stock condition is simply **`CurrentStock < MinStockLevel`**.\n\nKeeping the item and its movements separate gives an auditable stock ledger rather than a single number staff overwrite.',
          whyItMatters:
            'Running out of towels mid-wedding or gas mid-service is an operational failure guests notice. Tracking current stock against a minimum level turns reordering from guesswork into a clear, data-driven alert, and a transaction ledger makes stock movements auditable.',
          steps: [
            'Create `Models/InventoryItem.cs` with the fields above.',
            'Create the `inventory_items` table.',
            'Treat `CurrentStock` as derived from transactions, not hand-edited.',
            'Define low-stock as `CurrentStock < MinStockLevel`.',
            'Add `UnitPrice` for stock valuation.',
            'Plan the `inventory_transactions` ledger (next topic).',
          ],
          code: `// Models/InventoryItem.cs
public class InventoryItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";   // Linen | Toiletries | Kitchen | ...
    public string Unit { get; set; } = "pcs";     // pcs | kg | litre
    public decimal CurrentStock { get; set; }     // derived from transactions
    public decimal MinStockLevel { get; set; }    // reorder threshold
    public decimal UnitPrice { get; set; }
    public bool IsLow => CurrentStock < MinStockLevel;  // low-stock flag
}

/* PostgreSQL
CREATE TABLE inventory_items (
    id              serial PRIMARY KEY,
    name            text NOT NULL,
    category        text NOT NULL,
    unit            text NOT NULL DEFAULT 'pcs',
    current_stock   numeric(12,2) NOT NULL DEFAULT 0,
    min_stock_level numeric(12,2) NOT NULL DEFAULT 0,
    unit_price      numeric(12,2) NOT NULL DEFAULT 0
);
*/`,
          pitfalls: [
            '**Hand-editing `CurrentStock`.** Drive it from transactions so the ledger and the balance always agree.',
            '**No unit field.** "5" is meaningless without knowing pieces vs kg vs litres; always store the unit.',
            '**Confusing min level with zero.** Low means below the minimum, not just empty; reorder before it hits zero.',
            '**Skipping `UnitPrice`.** Without it you cannot value the stock on hand for reports.',
          ],
          tryIt:
            'Create the `inventory_items` table and add "Bath Towel" with `CurrentStock = 30`, `MinStockLevel = 50`. Confirm `IsLow` evaluates to true.',
          takeaway:
            'An `InventoryItem` tracks current stock against a minimum level; `CurrentStock` is derived from a transaction ledger, and low = below the minimum.',
        },
        {
          id: 'm7-t12',
          title: 'InventoryTransaction: the stock ledger',
          explain:
            'Every stock movement is an `InventoryTransaction` (`TransactionType` in/out/adjustment, Quantity, ReferenceNote, CreatedBy); `CurrentStock` is the running sum.',
          analogy:
            'The TunMani Resort store keeper never just rubs out the old number — they write a new line in the stock register every time goods move: "+100 towels received," "−40 towels issued to laundry," "−2 damaged, adjusted." `InventoryTransaction` is each of those lines, and the current stock is simply the running total of the register.',
          theory:
            'An **`InventoryTransaction`** records one movement of one item:\n\n- **`InventoryItemId`** — which item.\n- **`TransactionType`** — `in` (received), `out` (issued/used), or `adjustment` (correction after a count).\n- **`Quantity`** — the amount moved.\n- **`ReferenceNote`** — why ("Received from supplier", "Issued to wedding #42").\n- **`CreatedBy`** and a timestamp — who and when.\n\n`CurrentStock` is the **sum** of `in` minus `out` (adjustments can be signed). We apply each transaction in a service that **inserts the ledger row and updates `current_stock` in one transaction**, so the balance never disagrees with the ledger.\n\nThis append-only ledger is the same pattern as a bank statement: you never edit a past line, you post a new correcting one. It gives full traceability of every towel and gas cylinder.',
          whyItMatters:
            'A single editable stock number invites fraud and untraceable shrinkage. An append-only transaction ledger answers "where did the stock go?" with a dated, attributed history, and keeping the balance update atomic with the ledger insert means the number is always trustworthy.',
          steps: [
            'Create `Models/InventoryTransaction.cs` with the fields above.',
            'Create the `inventory_transactions` table with a foreign key to the item.',
            'In `InventoryService.ApplyAsync`, insert the row and update `current_stock` in one transaction.',
            'Add for `in`, subtract for `out`, apply signed for `adjustment`.',
            'Record `CreatedBy` and a timestamp on every row.',
            'Never edit or delete past transactions — post a correcting one.',
          ],
          code: `// Services/InventoryService.cs
public async Task ApplyAsync(InventoryTransaction t)
{
    using var db = _factory.Create();
    using var tx = db.BeginTransaction();

    await db.ExecuteAsync(
        @"INSERT INTO inventory_transactions
            (inventory_item_id, transaction_type, quantity, reference_note, created_by, created_at)
          VALUES (@InventoryItemId, @TransactionType, @Quantity, @ReferenceNote, @CreatedBy, now())",
        t, tx);

    // 'in' adds, 'out' subtracts, 'adjustment' applies the signed quantity.
    var delta = t.TransactionType switch {
        "in"  => t.Quantity,
        "out" => -t.Quantity,
        _      => t.Quantity            // adjustment: caller signs the quantity
    };
    await db.ExecuteAsync(
        "UPDATE inventory_items SET current_stock = current_stock + @delta WHERE id = @id",
        new { delta, id = t.InventoryItemId }, tx);

    tx.Commit();   // ledger row + balance update are atomic
}`,
          pitfalls: [
            '**Updating stock without writing a ledger row.** Always post a transaction; the balance must be explainable.',
            '**Separate transactions for insert and balance update.** Keep them atomic so they cannot diverge.',
            '**Editing past transactions.** The ledger is append-only; correct with an `adjustment`, never an edit.',
            '**Forgetting `CreatedBy`.** Attribution is half the point of a ledger; record who moved stock.',
          ],
          tryIt:
            'Post an `in` of 100 towels then an `out` of 40 via `ApplyAsync`. Confirm `current_stock` reads 60 and two ledger rows exist with the right notes.',
          takeaway:
            'Stock changes are append-only `InventoryTransaction` rows (in/out/adjustment); `CurrentStock` is updated atomically with each, giving a full audit trail.',
        },
        {
          id: 'm7-t13',
          title: 'Low-stock alerts & the inventory dashboard',
          explain:
            'A low-stock query (`CurrentStock < MinStockLevel`) powers an alert list and a badge so staff reorder before items run out.',
          analogy:
            'The TunMani Resort store keeper does not wait for the towel shelf to be bare — when it drops below the chalk line on the wall, a red flag goes up to reorder. The low-stock dashboard is that red flag in software: any item below its `MinStockLevel` jumps onto an alert list with a count badge.',
          theory:
            'Low-stock detection is a single condition — **`current_stock < min_stock_level`** — surfaced two ways:\n\n- A **`GET /Inventory/LowStock`** list showing every item below its threshold, sorted by how far below (the most urgent first).\n- A **badge/count** on the inventory dashboard (and ideally the main nav) so staff see the number at a glance.\n\nThe query lives in `InventoryService.GetLowStockAsync`, run on demand. We can rank urgency by the **shortfall** (`min_stock_level − current_stock`) or the **ratio**, so the emptiest critical items rise to the top.\n\nBecause `current_stock` is kept accurate by the transaction ledger, the alert is always live — no separate "is low" flag to maintain. The condition reads straight off the current balance.',
          whyItMatters:
            'The whole point of inventory tracking is to never run out at the wrong moment, and a low-stock alert is what converts the data into action. A clear, ranked reorder list lets staff restock proactively instead of discovering a shortage during a 200-guest wedding.',
          steps: [
            'Write `GetLowStockAsync` querying `current_stock < min_stock_level`.',
            'Sort by shortfall (`min_stock_level − current_stock`) descending.',
            'Add `GET /Inventory/LowStock` rendering the alert list.',
            'Show a count badge on the inventory dashboard.',
            'Optionally surface the badge in the main navigation.',
            'Let staff jump from an alert straight to an `in` transaction (restock).',
          ],
          code: `// Services/InventoryService.cs
public Task<IEnumerable<InventoryItem>> GetLowStockAsync() => _db.QueryAsync<InventoryItem>(
    @"SELECT *,
             (min_stock_level - current_stock) AS shortfall
      FROM inventory_items
      WHERE current_stock < min_stock_level   -- the low-stock condition
      ORDER BY (min_stock_level - current_stock) DESC");  -- most urgent first

// Controllers/InventoryController.cs
[HttpGet("/Inventory/LowStock")]
public async Task<IActionResult> LowStock() =>
    View(await _inventory.GetLowStockAsync());

// Dashboard badge:
// var lowCount = (await _inventory.GetLowStockAsync()).Count();`,
          pitfalls: [
            '**Maintaining a separate "is low" flag.** Compute it from `current_stock < min_stock_level` so it cannot go stale.',
            '**Using `<=` instead of `<`.** Decide the boundary deliberately; exactly at the minimum is usually still "ok".',
            '**Not ranking by urgency.** Sort by shortfall so the most critical items surface first.',
            '**Hiding the alert.** A low-stock badge buried three screens deep helps no one; surface it on the dashboard/nav.',
          ],
          tryIt:
            'With "Bath Towel" at 30 and a min of 50, run `GetLowStockAsync` and confirm it appears with a shortfall of 20. Post an `in` of 30 and confirm it drops off the list.',
          takeaway:
            'Low-stock alerts read straight off `current_stock < min_stock_level`, ranked by shortfall, giving staff a live, actionable reorder list.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Project',
      title: 'Menu + Decorations Management (with Image Upload)',
      domain: 'Resort Management',
      duration: '3 hours',
      description:
        'Build the catalogue side: a catering menu with a PostgreSQL text[] contents array, decorations with multi-image upload to wwwroot/uploads, and join tables to attach both to bookings.',
      tools: ['ASP.NET Core MVC', 'C#', 'Dapper', 'PostgreSQL'],
      blueprint: {
        overview:
          'Recreate TunMani Resort’s add-on catalogue. Catering staff manage dishes (with array contents), the planner manages a photo-rich decoration catalogue, and both attach to bookings via join rows ready for invoicing.',
        functionalRequirements: [
          '**Menu categories.** Ordered Breakfast/Lunch/Dinner/Snacks.',
          '**Menu items.** Name, price, description, IsActive, and a text[] Contents array.',
          '**Menu CRUD.** Create/edit/soft-delete with server validation.',
          '**Decorations.** Vendor-linked packages with a multi-image gallery.',
          '**Image upload.** `/Decoration/{id}/UploadImage` saving files to wwwroot/uploads with unique names.',
          '**Attach to bookings.** BookingMenu and BookingDecoration join rows with optional override price.',
        ],
        technicalImplementation: [
          '**Arrays.** `text[]` contents mapped to C# `string[]` via Npgsql/Dapper.',
          '**Schema.** menu_categories, menu_items, decorations, decoration_images, plus join tables.',
          '**Upload.** `IFormFile` handling with content-type and size validation and Guid filenames.',
          '**Soft-delete.** IsActive on items, decorations, and vendors.',
          '**Services.** MenuService and DecorationController/service with thin controllers.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Menu schema with array contents',
            outcome: 'MenuCategory/MenuItem models and tables with a text[] column.',
            prompt:
              'In an ASP.NET Core MVC app using Dapper and PostgreSQL, create `MenuCategory` (Name, DisplayOrder) and `MenuItem` (Name, CategoryId, BasePrice decimal, Description, string[] Contents, IsActive) POCOs and their tables, with menu_items.contents as a PostgreSQL text[] column. Show how Npgsql maps a C# string[] to text[] in a Dapper insert and read. Seed the four categories with display orders.',
          },
          {
            step: 2,
            label: 'Menu CRUD with soft-delete',
            outcome: 'MenuItemController + MenuService with active filtering.',
            prompt:
              'Write `MenuService` with GetAllAsync, GetActiveAsync (is_active = true), CreateAsync, UpdateAsync, and ToggleActiveAsync (soft-delete). Then a thin `MenuItemController` with Index, Create (GET/POST), Edit, and Toggle actions, binding to MenuItem and validating name and non-negative price. Include the Razor list view.',
          },
          {
            step: 3,
            label: 'Decorations with multi-image upload',
            outcome: 'Decoration + DecorationImage and a working upload endpoint.',
            prompt:
              'Create `Decoration` (Name, Category, BasePrice, Description, nullable VendorId, IsActive) and `DecorationImage` (DecorationId, ImagePath, ImageBytes, ContentType, FileName, SortOrder) models and tables. Write `POST /Decoration/{id}/UploadImage` binding List<IFormFile>, validating image content type and size, saving each file to wwwroot/uploads with a Guid filename, and inserting a decoration_images row with the next SortOrder. Show the gallery in the edit view.',
          },
          {
            step: 4,
            label: 'Attach add-ons to bookings',
            outcome: 'BookingMenu and BookingDecoration join rows feeding invoicing.',
            prompt:
              'Create `BookingMenu` (BookingId, MenuItemId, Quantity, nullable OverridePrice) and `BookingDecoration` (BookingId, DecorationId, nullable OverridePrice) models and join tables with ON DELETE CASCADE, plus parallel hall_booking_menus and hall_booking_decorations. Add service methods to attach an item to a booking, and show how each row converts to an InvoiceItem (ItemType menu/decoration) priced at OverridePrice ?? BasePrice.',
          },
        ],
      },
    },
    {
      id: 'm7-p2',
      type: 'Project',
      title: 'Vendor Assignment + Inventory Stock Tracking',
      domain: 'Resort Management',
      duration: '3 hours',
      description:
        'Build the operations side: a vendor contact book with booking assignments (agreed amount, advance, status), and an inventory system with an append-only transaction ledger and low-stock alerts.',
      tools: ['ASP.NET Core MVC', 'C#', 'Dapper', 'PostgreSQL'],
      blueprint: {
        overview:
          'Complete TunMani Resort’s operations features. Staff keep a categorised vendor list, engage vendors on bookings with mini-contracts, and track consumable stock through a ledger that drives live low-stock alerts.',
        functionalRequirements: [
          '**Vendors.** Categorised supplier CRUD with soft-delete.',
          '**Assignment.** BookingVendor with WorkDescription, AgreedAmount, AdvancePaid, Status.',
          '**Inventory items.** Name, Category, Unit, CurrentStock, MinStockLevel, UnitPrice.',
          '**Stock ledger.** Append-only InventoryTransaction (in/out/adjustment) updating CurrentStock atomically.',
          '**Low-stock alerts.** A ranked list and a badge for items below their minimum.',
          '**Hall parallels.** HallBookingVendor for events.',
        ],
        technicalImplementation: [
          '**Schema.** vendors, booking_vendors, inventory_items, inventory_transactions.',
          '**Atomic ledger.** `ApplyAsync` inserting a transaction and updating current_stock in one DB transaction.',
          '**Low-stock query.** `current_stock < min_stock_level` ranked by shortfall.',
          '**Services.** VendorController/service and InventoryController/service, thin controllers.',
          '**Validation.** AdvancePaid ≤ AgreedAmount; positive transaction quantities.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Vendor contact book',
            outcome: 'Vendor model, table, and CRUD with category filtering.',
            prompt:
              'Create a C# `Vendor` POCO (Name, Category, Phone, Email, Address, IsActive) and a PostgreSQL vendors table with a category index. Write a `VendorController` + service with CRUD, soft-delete via IsActive, and a list filterable by category. Phone/email/address stored as text. Show the full files and the Razor list view.',
          },
          {
            step: 2,
            label: 'Assign vendors to bookings',
            outcome: 'BookingVendor mini-contracts with status and balance.',
            prompt:
              'Create `BookingVendor` (BookingId, VendorId, WorkDescription, AgreedAmount, AdvancePaid, Status pending/confirmed/completed/cancelled) and its table with ON DELETE CASCADE, plus a parallel hall_booking_vendors. Add service methods to engage a vendor, advance a payment (validating AdvancePaid ≤ AgreedAmount), and compute outstanding = AgreedAmount − AdvancePaid. Show a booking view listing engaged vendors with their status and balance.',
          },
          {
            step: 3,
            label: 'Inventory items & transaction ledger',
            outcome: 'InventoryItem/InventoryTransaction with atomic stock updates.',
            prompt:
              'Create `InventoryItem` (Name, Category, Unit, CurrentStock, MinStockLevel, UnitPrice) and `InventoryTransaction` (InventoryItemId, TransactionType in/out/adjustment, Quantity, ReferenceNote, CreatedBy, CreatedAt) models and tables. Write `InventoryService.ApplyAsync` that, in one Dapper transaction, inserts the ledger row and updates current_stock (+ for in, − for out, signed for adjustment). Never hand-edit current_stock.',
          },
          {
            step: 4,
            label: 'Low-stock alerts dashboard',
            outcome: 'A ranked low-stock list and a count badge.',
            prompt:
              'Write `InventoryService.GetLowStockAsync` returning items where current_stock < min_stock_level, ranked by shortfall (min_stock_level − current_stock) descending. Add `GET /Inventory/LowStock` rendering the alert list and a dashboard count badge. Let staff click an alert to post an `in` restock transaction that drops the item off the list.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'How are a menu item’s components (e.g. rice, sambar, papad) stored?',
      options: [
        'As a comma-joined string in one column',
        'In a separate child table with one row per component',
        'In a PostgreSQL text[] array column mapped to a C# string[]',
        'As a JSON blob the app parses manually',
      ],
      answer: 2,
    },
    {
      id: 'm7-q2',
      q: 'Why are menu items and decorations soft-deleted with IsActive instead of being removed?',
      options: [
        'To save database space',
        'So past bookings that reference them keep working',
        'Because PostgreSQL forbids DELETE on referenced rows',
        'Because Dapper cannot run DELETE statements',
      ],
      answer: 1,
    },
    {
      id: 'm7-q3',
      q: 'When uploading decoration images via IFormFile, why generate a Guid-based filename?',
      options: [
        'To make the URL shorter',
        'To avoid two uploads with the same original name overwriting each other',
        'Because IFormFile cannot read the original filename',
        'To compress the image automatically',
      ],
      answer: 1,
    },
    {
      id: 'm7-q4',
      q: 'What does a BookingVendor row capture beyond linking a vendor to a booking?',
      options: [
        'Only the vendor’s phone number',
        'WorkDescription, AgreedAmount, AdvancePaid, and Status — a mini-contract',
        'The guest’s payment details',
        'The decoration images',
      ],
      answer: 1,
    },
    {
      id: 'm7-q5',
      q: 'How is an inventory item’s CurrentStock kept accurate?',
      options: [
        'Staff edit the CurrentStock number directly',
        'It is recalculated nightly by a cron job only',
        'Every movement is an append-only InventoryTransaction, and the balance is updated atomically with each',
        'It is stored as a PostgreSQL generated column',
      ],
      answer: 2,
    },
    {
      id: 'm7-q6',
      q: 'What condition flags an inventory item as low-stock?',
      options: [
        'CurrentStock equals zero',
        'CurrentStock < MinStockLevel',
        'A manually set IsLow boolean column',
        'UnitPrice exceeds a threshold',
      ],
      answer: 1,
    },
  ],
};
