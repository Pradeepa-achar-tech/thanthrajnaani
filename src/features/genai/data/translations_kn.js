// ─────────────────────────────────────────────────────────────
// Kannada translations for the GenAI-ML Learning App
// Technical terms (code, IDs, library names) kept in English.
// Text fields match the structure of curriculum.js topics.
// Topics with no entry here fall back to English automatically.
// ─────────────────────────────────────────────────────────────

const module1TopicSeeds = [
  { id: 'm1-t1', name: 'Functions & arguments', analogy: 'ಅಂಚೆ ಕಚೇರಿಯಲ್ಲಿ parcel counter ಇರುತ್ತದೆ. ನೀವು ವಿಳಾಸ, ತೂಕ, speed option ಕೊಟ್ಟರೆ counter ಸರಿಯಾದ ಸೇವೆ ಕೊಡುತ್ತದೆ. Function ಕೂಡ input ತೆಗೆದು ಕೆಲಸ ಮಾಡಿ result ಕೊಡುತ್ತದೆ; `*args` ಹಲವು parcels, `**kwargs` named options.', focus: '`def`, parameters, `return`, positional/keyword/default arguments, `*args`, `**kwargs`, mutable default trap', practice: '`square`, `average(*nums)`, `build_user(**fields)` functions ಬರೆಯಿರಿ' },
  { id: 'm1-t2', name: 'Lambda functions & higher-order functions', analogy: 'ತರಕಾರಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ helper ಗೆ “ತೂಕದ ಪ್ರಕಾರ sort ಮಾಡಿ” ಎಂದು ಚಿಕ್ಕ note ಕೊಡುವಂತೆ. `lambda` ಅಂಥ one-line rule; `sorted`, `map`, `filter` ಆ rule ಬಳಸಿ ಕೆಲಸ ಮಾಡುತ್ತವೆ.', focus: '`lambda x: ...`, `key=`, callable functions, `sorted`, `max`, `min`, readability', practice: 'students list ಅನ್ನು `lambda` key ಬಳಸಿ score desc sort ಮಾಡಿ' },
  { id: 'm1-t3', name: 'map, filter, reduce', analogy: 'factory assembly line ಯೋಚಿಸಿ. `map` ಪ್ರತಿಯೊಂದು item ಬದಲಿಸುತ್ತದೆ, `filter` pass ಆದವು ಮಾತ್ರ ಬಿಡುತ್ತದೆ, `reduce` ಎಲ್ಲವನ್ನೂ ಒಂದು total ಗೆ ಸೇರಿಸುತ್ತದೆ.', focus: 'lazy iterators, transformation, predicate filtering, accumulation with `functools.reduce`, comprehensions comparison', practice: 'numbers list ಮೇಲೆ squares, positives, product compute ಮಾಡಿ' },
  { id: 'm1-t4', name: 'Modules & packages, virtual environments', analogy: 'ಗ್ರಂಥಾಲಯದಲ್ಲಿ ಪ್ರತಿ ವಿಷಯಕ್ಕೆ ಬೇರೆ shelf ಇರುವಂತೆ. Module ಒಂದು file, package ಒಂದು folder, environment ಪ್ರತಿ project ಗೆ ಬೇರೆ reading room.', focus: '`import`, packages, `pip`, `venv`, dependency isolation, `requirements.txt`', practice: '`python -m venv .venv`, activate ಮಾಡಿ, `requests` install ಮಾಡಿ import test ಮಾಡಿ' },
  { id: 'm1-t5', name: 'List/dict/set comprehensions', analogy: 'ಹಳ್ಳಿಯ ಸಂತೆಯಲ್ಲಿ ನೀವು “ಒಳ್ಳೆಯ ಟೊಮೇಟೊ ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳಿ, ನಂತರ kilo price note ಮಾಡಿ” ಎಂದು ಒಂದೇ ಸುತ್ತಿನಲ್ಲಿ ಕೆಲಸ ಮಾಡುವಂತೆ. Comprehension transform + filter ಅನ್ನು compact ಆಗಿ ಬರೆಯುತ್ತದೆ.', focus: 'list, dict, set comprehensions, inline `if`, nested readability, generator expressions', practice: 'names clean ಮಾಡಿ uppercase list, score dict, unique city set ಮಾಡಿ' },
  { id: 'm1-t6', name: 'Generators & iterators', analogy: 'ರೈಲು ticket counter ನಲ್ಲಿ ಎಲ್ಲ tickets ಒಂದೇ ಬಾರಿ ಕೈಗೆ ಕೊಡುವುದಿಲ್ಲ; queue ಬಂದಂತೆ ಒಂದೊಂದೇ issue ಆಗುತ್ತದೆ. Generator ಕೂಡ data ಅನ್ನು lazy ಆಗಿ ಒಂದೊಂದೇ ಕೊಡುತ್ತದೆ.', focus: '`iter`, `next`, `yield`, lazy evaluation, memory saving, one-pass streams', practice: '`def read_batches(): yield ...` ತರಹ small generator ಬರೆಯಿರಿ' },
  { id: 'm1-t7', name: 'Exception handling', analogy: 'ಬ್ಯಾಂಕ್ ATM ನಲ್ಲಿ cash ಇಲ್ಲದಿದ್ದರೆ machine crash ಆಗುವುದಿಲ್ಲ; message ತೋರಿಸಿ card ಹಿಂದಿರುಗಿಸುತ್ತದೆ. `try/except` code ಗೆ ಅದೇ safety.', focus: '`try`, `except`, `else`, `finally`, specific exceptions, fail gracefully', practice: 'user input int ಗೆ convert ಮಾಡಿ invalid input handle ಮಾಡಿ' },
  { id: 'm1-t8', name: 'File I/O', analogy: 'ಶಾಲೆಯ ದಾಖಲೆ ಪುಸ್ತಕ ತೆರೆದು ಓದಿ, update ಮಾಡಿ, ಮತ್ತೆ ಮುಚ್ಚುವಂತೆ. `with open(...)` file ಅನ್ನು ಸರಿಯಾಗಿ open/close ಮಾಡುತ್ತದೆ.', focus: 'read, write, append, context manager, paths, encoding, CSV/JSON preview', practice: 'text file ಗೆ 3 lines write ಮಾಡಿ, ಮತ್ತೆ read ಮಾಡಿ count print ಮಾಡಿ' },
  { id: 'm1-t9', name: 'Object-oriented Python', analogy: 'ದರ್ಜಿಯ ಅಂಗಡಿಯಲ್ಲಿ shirt pattern ಒಂದು class. ಅದರಿಂದ Anil shirt, Priya shirt ಎಂಬ objects ಸಿಗುತ್ತವೆ; pattern same, measurements ಬೇರೆ.', focus: '`class`, `__init__`, attributes, methods, inheritance, composition, data modeling', practice: '`Student` class with `average()` method ಮಾಡಿ' },
  { id: 'm1-t10', name: 'HTTP basics & requests', analogy: 'ನೀವು ಹೋಟೆಲ್ waiter ಗೆ order ಕೊಡುತ್ತೀರಿ; waiter kitchen ಗೆ request ಕಳುಹಿಸಿ response ತರುತ್ತಾನೆ. Browser/API ಕೂಡ HTTP request-response ಹಾಗೇ.', focus: 'GET, POST, status codes, headers, params, JSON, `requests` library', practice: '`requests.get` ಬಳಸಿ public API JSON print ಮಾಡಿ' },
  { id: 'm1-t11', name: 'BeautifulSoup parsing HTML', analogy: 'ವಾರ್ತಾಪತ್ರಿಕೆಯಿಂದ headlines ಕತ್ತರಿಸಿ scrapbook ಮಾಡುವಂತೆ. BeautifulSoup HTML page ನಿಂದ ಬೇಕಾದ tags ತೆಗೆದುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.', focus: 'HTML tree, tags, attributes, `.find`, `.find_all`, text extraction, parser choice', practice: 'sample HTML string ನಲ್ಲಿ all links extract ಮಾಡಿ' },
  { id: 'm1-t12', name: 'CSS selectors & DOM navigation', analogy: 'ಮನೆ ವಿಳಾಸದಲ್ಲಿ city, street, house number ಹೇಳಿದರೆ exact ಮನೆ ಸಿಗುತ್ತದೆ. CSS selector ಕೂಡ page tree ಯಲ್ಲಿ exact element ಹುಡುಕುತ್ತದೆ.', focus: 'DOM tree, `.select`, `.select_one`, class/id selectors, descendant selectors, robust scraping', practice: '`soup.select(".product .price")` ತರಹ nested selector try ಮಾಡಿ' },
  { id: 'm1-t13', name: 'Pagination & rate limits', analogy: 'ರೈಲು reservation counter ನಲ್ಲಿ ಎಲ್ಲ tickets ಒಂದೇ ಬಾರಿ ಕೇಳಿದರೆ staff ತಡೆಯುತ್ತಾರೆ. Page by page ಕೇಳಿ, ಸ್ವಲ್ಪ pause ಕೊಟ್ಟರೆ system ಗೆ ಗೌರವ.', focus: 'next page URLs, loops, delays, retries, 429 rate limit, polite scraping', practice: 'page numbers loop ಮಾಡಿ URL list build ಮಾಡಿ, `time.sleep` ಸೇರಿಸಿ' },
  { id: 'm1-t14', name: 'robots.txt & ethical scraping', analogy: 'ದೇವಾಲಯ ಅಥವಾ library ಯಲ್ಲಿ “ಇಲ್ಲಿ shoes ಬೇಡ”, “photos ಬೇಡ” rules ಇರುತ್ತವೆ. Website ಗೆ `robots.txt` ಅದೇ etiquette board.', focus: '`robots.txt`, terms of service, user-agent, consent, privacy, load on servers', practice: 'ಒಂದು site ನ `/robots.txt` open ಮಾಡಿ allowed/disallowed paths ಓದಿ' },
  { id: 'm1-t15', name: 'ndarray creation & dtypes', analogy: 'ಗೋದಾಮಿನಲ್ಲಿ boxes ಒಂದೇ size ಇದ್ದರೆ stacking fast. NumPy array ಕೂಡ ಒಂದೇ dtype data ಇಟ್ಟು fast math ಮಾಡುತ್ತದೆ.', focus: '`np.array`, `arange`, `linspace`, `zeros`, `ones`, shape, dtype, memory', practice: '1D, 2D arrays create ಮಾಡಿ `.shape` ಮತ್ತು `.dtype` inspect ಮಾಡಿ' },
  { id: 'm1-t16', name: 'Indexing, slicing, fancy indexing', analogy: 'ಗ್ರಂಥಾಲಯ shelf ನಲ್ಲಿ row number, range, selected book IDs ಮೂಲಕ books ತೆಗೆದುಕೊಳ್ಳುವಂತೆ. NumPy indexing data ನ exact ಭಾಗ ಕೊಡುತ್ತದೆ.', focus: 'zero-based indexing, slices, boolean masks, fancy indexing, views vs copies', practice: '2D array ನಲ್ಲಿ row, column, submatrix, mask selection ಮಾಡಿ' },
  { id: 'm1-t17', name: 'Broadcasting rules', analogy: 'ಹೋಟೆಲ್ ನಲ್ಲಿ ಪ್ರತಿಯೊಂದು plate ಗೆ ಒಂದೇ chutney spoon ಹಾಕುವಂತೆ. Small array ದೊಡ್ಡ array ಮೇಲೆ repeat ಆಗದೆ logically apply ಆಗುತ್ತದೆ.', focus: 'shape compatibility, trailing dimensions, scalar operations, row/column broadcasting', practice: 'matrix ಗೆ column means subtract ಮಾಡಿ standardize ಮಾಡಿ' },
  { id: 'm1-t18', name: 'Vectorized operations', analogy: 'ಒಬ್ಬೊಬ್ಬರಿಗೆ mark calculate ಮಾಡುವ ಬದಲು school spreadsheet ನಲ್ಲಿ full column formula ಹಾಕಿದಂತೆ. Vectorization loops ಬದಲು whole-array math.', focus: 'element-wise math, ufuncs, speed, avoiding Python loops, boolean operations', practice: 'prices array ಮೇಲೆ tax, discount, final price vectorized compute ಮಾಡಿ' },
  { id: 'm1-t19', name: 'Statistical operations', analogy: 'ತರಗತಿಯ marks register ನಲ್ಲಿ average, topper, percentile ನೋಡಿದರೆ class picture ಸಿಗುತ್ತದೆ. NumPy stats array ಯ story ಹೇಳುತ್ತವೆ.', focus: 'mean, median, std, min, max, percentile, axis, NaN-safe stats', practice: 'scores matrix ನಲ್ಲಿ per-student ಮತ್ತು per-test mean compute ಮಾಡಿ' },
  { id: 'm1-t20', name: 'Linear algebra with numpy.linalg', analogy: 'ನಕ್ಷೆಯಲ್ಲಿ direction arrow ತಿರುಗಿಸುವ, stretch ಮಾಡುವ operations matrix transformations. `np.linalg` ಆ geometry ಯ calculator.', focus: 'matrix multiply `@`, solve, inverse, determinant, eigenvectors, SVD, norms', practice: 'Ax=b system ಅನ್ನು `np.linalg.solve` ಬಳಸಿ solve ಮಾಡಿ' },
  { id: 'm1-t21', name: 'Series & DataFrames', analogy: 'Excel sheet ಯ ಒಂದು column Series; full sheet DataFrame. Row labels index, column names headers.', focus: 'Pandas Series, DataFrame, index, columns, dtypes, head/info/describe', practice: 'students DataFrame create ಮಾಡಿ `head`, `info`, `describe` ನೋಡಿ' },
  { id: 'm1-t22', name: 'Reading CSV / Excel / JSON', analogy: 'ಬೇರೆ ಬೇರೆ ಅಂಗಡಿಯ bills ಬೇರೆ format ನಲ್ಲಿ ಬರುತ್ತವೆ; Pandas ಅವನ್ನು common table ಗೆ ತರುತ್ತದೆ.', focus: '`read_csv`, `read_excel`, `read_json`, separators, encoding, dates, missing values', practice: 'small CSV file read ಮಾಡಿ columns inspect ಮಾಡಿ' },
  { id: 'm1-t23', name: 'Indexing: loc, iloc, boolean masks', analogy: 'ಶಾಲೆ register ನಲ್ಲಿ ಹೆಸರು ಮೂಲಕ ಹುಡುಕುವುದು `loc`; row number ಮೂಲಕ ಹುಡುಕುವುದು `iloc`; condition ಮೂಲಕ ಹುಡುಕುವುದು boolean mask.', focus: '`loc`, `iloc`, labels vs positions, boolean masks, column selection', practice: 'score > 80 rows select ಮಾಡಿ name/score columns ಮಾತ್ರ ತೋರಿಸಿ' },
  { id: 'm1-t24', name: 'Filtering & sorting', analogy: 'ಮಳಿಗೆಯಲ್ಲಿ “₹100 ಕ್ಕಿಂತ ಕಡಿಮೆ items ಮಾತ್ರ, price ascending” ಎಂದು shelf arrange ಮಾಡುವಂತೆ.', focus: 'conditions, `query`, `sort_values`, multiple sort keys, `isin`, string filters', practice: 'city filter ಮಾಡಿ score desc sort ಮಾಡಿ top 5 ನೋಡಿ' },
  { id: 'm1-t25', name: 'GroupBy & aggregation', analogy: 'cricket scorecard ನಲ್ಲಿ player by player runs ಸೇರಿಸುವಂತೆ. `groupby` rows ಅನ್ನು groups ಮಾಡಿ summary ಕೊಡುತ್ತದೆ.', focus: '`groupby`, aggregation, split-apply-combine, `agg`, `transform`, grouped stats', practice: 'sales data ಅನ್ನು city by total revenue group ಮಾಡಿ' },
  { id: 'm1-t26', name: 'Merging, joining, concatenating', analogy: 'ಆಧಾರ್ number ಬಳಸಿ bank record ಮತ್ತು phone record join ಮಾಡುವಂತೆ. Common key ಇದ್ದರೆ tables ಸೇರಿಸಬಹುದು.', focus: '`merge`, join keys, left/right/inner/outer joins, `concat`, duplicate keys', practice: 'students table ಮತ್ತು marks table ಅನ್ನು `student_id` ಮೇಲೆ merge ಮಾಡಿ' },
  { id: 'm1-t27', name: 'Pivot tables & crosstabs', analogy: 'shop monthly report ನಲ್ಲಿ rows = city, columns = product, cells = sales total. Pivot raw rows ಅನ್ನು summary grid ಮಾಡುತ್ತದೆ.', focus: '`pivot_table`, index, columns, values, aggfunc, margins, `crosstab`', practice: 'city x product sales pivot table ಮಾಡಿ' },
  { id: 'm1-t28', name: 'Handling missing data', analogy: 'attendance register ನಲ್ಲಿ blank cells ಇದ್ದರೆ report ತಪ್ಪಾಗಬಹುದು. Missing values ಮೊದಲು ಕಾಣಬೇಕು, ನಂತರ fill/drop decision.', focus: '`isna`, `notna`, `fillna`, `dropna`, imputation, missingness meaning', practice: 'NaN ಇರುವ DataFrame ನಲ್ಲಿ count, fill median, drop rows compare ಮಾಡಿ' },
  { id: 'm1-t29', name: 'Matplotlib pyplot basics', analogy: 'chart ಬಿಡಿಸಲು canvas, brush, labels ಬೇಕು. Matplotlib ಆ drawing kit; `fig` canvas, `ax` drawing area.', focus: '`plt.subplots`, axes, labels, title, legend, grid, figure size', practice: 'simple line chart with title/xlabel/ylabel draw ಮಾಡಿ' },
  { id: 'm1-t30', name: 'Line, bar, scatter, pie charts', analogy: 'ವಿವಿಧ data stories ಗೆ ವಿಭಿನ್ನ chart vessels. Time trend ಗೆ line, category compare ಗೆ bar, relationship ಗೆ scatter.', focus: 'chart choice, line/bar/scatter/pie, labels, legends, avoiding misleading visuals', practice: 'same sales data ಗೆ line, bar, scatter charts ಮಾಡಿ compare ಮಾಡಿ' },
  { id: 'm1-t31', name: 'Subplots, layouts, styling', analogy: 'newspaper page ನಲ್ಲಿ ಹಲವು boxes arrange ಮಾಡಿದಂತೆ. Subplots ಒಂದೇ figure ನಲ್ಲಿ ಹಲವು charts neat ಆಗಿ ಇಡುತ್ತವೆ.', focus: '`subplots`, axes grid, `tight_layout`, styles, colors, shared axes', practice: '2x2 subplot grid ನಲ್ಲಿ four small charts draw ಮಾಡಿ' },
  { id: 'm1-t32', name: 'Histograms & KDE plots', analogy: 'marks range ಪ್ರಕಾರ students ಎಷ್ಟು ಎಂದು buckets ಹಾಕುವಂತೆ histogram. KDE ಅದೇ distribution ನ smooth outline.', focus: 'bins, distribution shape, skew, outliers, density, KDE bandwidth', practice: 'normal ಮತ್ತು skewed data histograms compare ಮಾಡಿ' },
  { id: 'm1-t33', name: 'Seaborn distributions, pairplot, heatmap', analogy: 'Matplotlib raw paint ಆದರೆ Seaborn ready-made chart templates book. EDA ಗೆ pairplot, heatmap ಬೇಗ insight ಕೊಡುತ್ತವೆ.', focus: '`sns.histplot`, `pairplot`, `heatmap`, `hue`, themes, statistical plots', practice: 'sample DataFrame ಮೇಲೆ correlation heatmap ಮತ್ತು pairplot ಮಾಡಿ' },
  { id: 'm1-t34', name: 'Saving & exporting figures', analogy: 'poster print ಮಾಡಲು resolution ಮತ್ತು format ಸರಿಯಾಗಿರಬೇಕು. Chart save ಮಾಡುವಾಗ DPI, PNG/PDF/SVG ಆಯ್ಕೆ ಅದೇ quality decision.', focus: '`savefig`, dpi, bbox_inches, PNG/PDF/SVG, save before show, closing figures', practice: 'ಒಂದು chart ಅನ್ನು PNG ಮತ್ತು PDF ಎರಡರಲ್ಲೂ save ಮಾಡಿ' },
];

const module1Translations = Object.fromEntries(
  module1TopicSeeds.map((topic) => [
    topic.id,
    {
      explain:
        `**${topic.name}** Python for Data Science ನಲ್ಲಿ practical skill. ಇಲ್ಲಿ ನೀವು syntax ಮಾತ್ರ ಕಲಿಯುವುದಿಲ್ಲ; data clean, transform, analyse, visualise ಮಾಡುವಾಗ ಯಾವ tool ಯಾವಾಗ ಬಳಸಬೇಕು ಎಂದು ಕಲಿಯುತ್ತೀರಿ. ${topic.focus}.`,
      analogy:
        `**ಉದಾಹರಣೆ:**\n${topic.analogy}\n\nಈ analogy ನೆನಪಿಟ್ಟುಕೊಳ್ಳಿ: data science code ನಲ್ಲಿ tool ಗಳು ಬೇರೆ ಬೇರೆ counters ಅಥವಾ machines ತರಹ. ಸರಿಯಾದ input ಕೊಟ್ಟರೆ ಸರಿಯಾದ output ಬರುತ್ತದೆ; ತಪ್ಪಾದ shape, type, ಅಥವಾ option ಕೊಟ್ಟರೆ result ಗೊಂದಲ.`,
      theory:
        `**WHY:** ${topic.name} ಇಲ್ಲದೆ real data workflow ನಿಧಾನ, repeated, ಮತ್ತು bug-prone ಆಗುತ್ತದೆ. Data Science ನಲ್ಲಿ raw data ಯಾವಾಗಲೂ perfect ಆಗಿರುವುದಿಲ್ಲ; ಅದನ್ನು ಓದಿ, filter ಮಾಡಿ, shape ಬದಲಿಸಿ, summary ತೆಗೆದು, chart ಆಗಿ ತೋರಿಸಬೇಕು.\n\n` +
        `**HOW:** ಮೊದಲು object/data structure ಏನು ಎಂದು ನೋಡಿ: list, dict, NumPy array, Pandas DataFrame, ಅಥವಾ HTML document. ನಂತರ operation ಆಯ್ಕೆಮಾಡಿ: select, transform, combine, aggregate, ಅಥವಾ visualise. ${topic.focus} ಅನ್ನು ಚಿಕ್ಕ examples ಮೇಲೆ practice ಮಾಡಿದರೆ ದೊಡ್ಡ datasets ಮೇಲೆ confidence ಬರುತ್ತದೆ.\n\n` +
        `**Rule of thumb:** code ಓದಿದಾಗ “input ಏನು, output ಏನು, side effect ಇದೆಯೇ?” ಎಂದು ಕೇಳಿ. ಈ ಮೂರು ಪ್ರಶ್ನೆಗಳು debugging ಅನ್ನು ತುಂಬಾ easy ಮಾಡುತ್ತವೆ.`,
      whyItMatters:
        `ಪ್ರತಿ ML interview ಮತ್ತು project ನಲ್ಲಿ ${topic.name} ತರಹದ concept ಬರುತ್ತದೆ. ಇದನ್ನು ಸರಿಯಾಗಿ ತಿಳಿದಿದ್ದರೆ notebook ನಲ್ಲಿ experiment ವೇಗವಾಗುತ್ತದೆ, production script clean ಆಗುತ್ತದೆ, ಮತ್ತು teammates ನಿಮ್ಮ code trust ಮಾಡುತ್ತಾರೆ. ಇಲ್ಲದಿದ್ದರೆ small data cleaning task ಕೂಡ hours ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.`,
      steps: [
        `ಮೊದಲು ${topic.name} ನ basic syntax ಅನ್ನು REPL ಅಥವಾ notebook ನಲ್ಲಿ ಚಿಕ್ಕ example ಜೊತೆ run ಮಾಡಿ.`,
        'Input data ನ type ಮತ್ತು shape print ಮಾಡಿ: `type(x)`, `.shape`, `.head()`, ಅಥವಾ `len(x)`.',
        `Core operation practice ಮಾಡಿ: ${topic.practice}.`,
        'Output ಅನ್ನು ತಕ್ಷಣ inspect ಮಾಡಿ; expected rows/items/count ಬಂದಿದೆಯೇ ನೋಡಿ.',
        'ಒಂದು edge case try ಮಾಡಿ: empty input, missing value, wrong type, ಅಥವಾ duplicate row.',
        'Working snippet ಅನ್ನು function ಅಥವಾ reusable cell ಆಗಿ ಇಡಿ, ನಂತರ bigger data ಮೇಲೆ apply ಮಾಡಿ.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Syntax copy ಮಾಡಿದರೂ input shape/type check ಮಾಡದೆ run ಮಾಡುವುದು. ಮೊದಲು data inspect ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** English tutorial output blindly trust ಮಾಡುವುದು. ನಿಮ್ಮ dataset ನಲ್ಲಿ rows, missing values, duplicates ಬೇರೆ ಇರಬಹುದು.',
        '**ತಪ್ಪು.** One-liner ಗಾಗಿ readability sacrifice ಮಾಡುವುದು. Future ನೀವು ಓದಲು ಆಗದ code professional ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Error message ಓದದೆ random fixes ಮಾಡುವುದು. Error ಯಾವ line, ಯಾವ type, ಯಾವ shape ಹೇಳುತ್ತಿದೆ ಎಂದು ಗಮನಿಸಿ.',
        '**ತಪ್ಪು.** Small example ಮೇಲೆ verify ಮಾಡದೆ full dataset ಮೇಲೆ run ಮಾಡುವುದು. ಮೊದಲು 5 rows/sample ಮೇಲೆ test ಮಾಡಿ.',
      ],
      tryIt:
        `${topic.practice}. ನಂತರ ಅದೇ code ಅನ್ನು ಸ್ವಲ್ಪ ಬದಲಿಸಿ: input size ಹೆಚ್ಚಿಸಿ, ಒಂದು missing/wrong value ಸೇರಿಸಿ, output ಹೇಗೆ ಬದಲಾಗುತ್ತದೆ ನೋಡಿ. ಈ pattern notebook ನಲ್ಲಿ save ಮಾಡಿ. ಈಗ extend ಮಾಡಿ - result ಅನ್ನು print ಮಾತ್ರ ಮಾಡದೆ reusable function/cell ಆಗಿ ಮಾಡಿ.`,
      takeaway:
        `${topic.name} ಕಲಿಯುವ shortcut: **ಚಿಕ್ಕ input -> operation -> inspect output -> edge case**. ಈ loop follow ಮಾಡಿದರೆ data science Python ನಿಜವಾಗಿ ಕೈಗೆ ಬರುತ್ತದೆ.`,
    },
  ]),
);

const module2RemainingTopicSeeds = [
  { id: 'm2-t17', name: 'Data wrangling & cleaning', analogy: 'ದಾಖಲೆ ಕೊಠಡಿಯಲ್ಲಿ bills, forms, receipts ಎಲ್ಲವೂ ಮಿಶ್ರವಾಗಿ ಬಿದ್ದಿರುವಂತೆ raw data ಇರುತ್ತದೆ. Wrangling ಎಂದರೆ ಅವನ್ನು ಸರಿಯಾದ folders, names, dates, numbers ಆಗಿ arrange ಮಾಡುವುದು.', focus: 'messy columns, data types, duplicates, inconsistent labels, reshaping, validation', practice: 'dirty DataFrame ನಲ್ಲಿ column names clean ಮಾಡಿ, duplicate rows remove ಮಾಡಿ, dtypes fix ಮಾಡಿ' },
  { id: 'm2-t18', name: 'Detecting & imputing missing values', analogy: 'ಶಾಲಾ attendance register ನಲ್ಲಿ ಕೆಲ boxes ಖಾಲಿ ಇದ್ದರೆ absentನಾ, data entry missನಾ ಎಂದು ಮೊದಲು ತಿಳಿಯಬೇಕು. Missing values ಕೂಡ ಅರ್ಥ ತಿಳಿದು handle ಮಾಡಬೇಕು.', focus: '`isna`, missingness patterns, MCAR/MAR/MNAR intuition, mean/median/mode imputation, indicator columns', practice: 'NaN counts ತೆಗೆದು numeric column median fill, category mode fill ಮಾಡಿ' },
  { id: 'm2-t19', name: 'Outlier detection (IQR, z-score)', analogy: 'ತರಕಾರಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಒಂದು tomato price ₹20, ಮತ್ತೊಂದು ₹500 ಎಂದರೆ ಅದು special item ಅಥವಾ entry error. Outlier ಕಂಡುಬಂದರೆ remove ಮಾಡುವ ಮುಂಚೆ reason ಕೇಳಿ.', focus: 'IQR rule, z-score, robust statistics, domain limits, visual checks', practice: 'salary/score data ನಲ್ಲಿ IQR bounds compute ಮಾಡಿ outlier rows inspect ಮಾಡಿ' },
  { id: 'm2-t20', name: 'Feature engineering & encoding', analogy: 'ಕೃಷಿಯಲ್ಲಿ ಕಚ್ಚಾ ಬೆಳೆ ನೇರವಾಗಿ dish ಆಗುವುದಿಲ್ಲ; ತೊಳೆಯಬೇಕು, ಕತ್ತರಿಸಬೇಕು, ಮಸಾಲೆ ಹಾಕಬೇಕು. Raw columns ಕೂಡ model ಗೆ ಉಪಯುಕ್ತ features ಆಗಿ convert ಆಗಬೇಕು.', focus: 'creating features, categorical encoding, one-hot, ordinal encoding, date features, leakage caution', practice: 'date column ನಿಂದ month/day, category column one-hot, ratio feature create ಮಾಡಿ' },
  { id: 'm2-t21', name: 'Scaling: Min-Max, Standard, Robust', analogy: 'ಒಂದು exam 100 marks, ಇನ್ನೊಂದು 10 marks ಎಂದರೆ direct compare ತಪ್ಪು. Scaling ಎಲ್ಲ features ಅನ್ನು comparable range ಗೆ ತರುತ್ತದೆ.', focus: 'standardization, normalization, robust scaling, train-only fit, distance-based models', practice: '`StandardScaler`, `MinMaxScaler`, `RobustScaler` compare ಮಾಡಿ' },
  { id: 'm2-t22', name: 'Correlation analysis', analogy: 'ಮಳೆ ಹೆಚ್ಚಾದಾಗ umbrella sales ಹೆಚ್ಚಿದರೆ two columns ಜೊತೆಯಾಗಿ move ಆಗುತ್ತವೆ. Correlation direction ಮತ್ತು strength ಹೇಳುತ್ತದೆ, cause ಅಲ್ಲ.', focus: 'Pearson, Spearman, correlation matrix, multicollinearity, correlation vs causation', practice: 'numeric DataFrame correlation matrix ಮತ್ತು heatmap ಮಾಡಿ high pairs list ಮಾಡಿ' },
  { id: 'm2-t23', name: 'Linear Regression', analogy: 'ಮನೆ ಬೆಲೆ square feet ಜೊತೆ ಹೆಚ್ಚುತ್ತದೆ ಎಂದು straight ruler line ಹಾಕಿ predict ಮಾಡುವಂತೆ. Linear Regression best-fitting line/plane ಹುಡುಕುತ್ತದೆ.', focus: 'features, coefficients, intercept, least squares, residuals, assumptions, R2/RMSE', practice: 'synthetic `y = 3x + noise` data ಮೇಲೆ `LinearRegression` fit ಮಾಡಿ' },
  { id: 'm2-t24', name: 'Logistic Regression', analogy: 'bank loan approve ಮಾಡಬೇಕಾ ಬೇಡವಾ ಎಂಬ yes/no decision ಗೆ score ಅನ್ನು probability ಆಗಿ convert ಮಾಡುವ gate. Logistic Regression classification ಗೆ S-curve ಬಳಸುತ್ತದೆ.', focus: 'sigmoid, probabilities, decision threshold, coefficients, log-odds, binary classification', practice: 'classification dataset ಮೇಲೆ logistic model fit ಮಾಡಿ probabilities ಮತ್ತು confusion matrix ನೋಡಿ' },
  { id: 'm2-t25', name: 'K-Nearest Neighbours (KNN)', analogy: 'ಹೊಸ student ಯಾವ group ಗೆ ಸೇರಬಹುದು ಎಂದು ಅವನ ಹತ್ತಿರದ 5 friends ನೋಡಿಕೊಂಡು ತೀರ್ಮಾನಿಸುವಂತೆ. KNN neighbourhood vote ಮಾಡುತ್ತದೆ.', focus: 'distance, k choice, scaling, classification/regression, lazy learning, curse of dimensionality', practice: '`KNeighborsClassifier` ನಲ್ಲಿ k=3,5,11 compare ಮಾಡಿ' },
  { id: 'm2-t26', name: 'Decision Trees', analogy: 'doctor fever? cough? test result? ಎಂದು yes/no questions ಕೇಳುತ್ತಾ diagnosis ತಲುಪುವಂತೆ. Decision Tree split questions ಮೂಲಕ prediction ಮಾಡುತ್ತದೆ.', focus: 'splits, impurity, Gini/entropy, depth, leaves, overfitting, interpretability', practice: '`DecisionTreeClassifier(max_depth=3)` train ಮಾಡಿ tree depth/feature importance ನೋಡಿ' },
  { id: 'm2-t27', name: 'Random Forest', analogy: 'ಒಬ್ಬ doctor ಬದಲು 100 doctors opinion ಪಡೆದು majority vote ಮಾಡಿದಂತೆ. Random Forest ಹಲವು trees train ಮಾಡಿ stable prediction ಕೊಡುತ್ತದೆ.', focus: 'bagging, bootstrap samples, feature randomness, voting/averaging, variance reduction', practice: '`RandomForestClassifier` fit ಮಾಡಿ single tree ಜೊತೆ score compare ಮಾಡಿ' },
  { id: 'm2-t28', name: 'Naive Bayes', analogy: 'spam email ನಲ್ಲಿ “free”, “winner”, “urgent” words ಕಂಡರೆ post-office clerk probability ಲೆಕ್ಕ ಹಾಕುವಂತೆ. Naive Bayes evidence pieces independent ಎಂದು simple assume ಮಾಡುತ್ತದೆ.', focus: 'Bayes theorem, conditional probabilities, naive independence, text classification, Gaussian/Multinomial/Bernoulli variants', practice: 'small text dataset ಮೇಲೆ `MultinomialNB` with `CountVectorizer` run ಮಾಡಿ' },
  { id: 'm2-t29', name: 'Support Vector Machines (SVM)', analogy: 'ಎರಡು ಗುಂಪಿನ ನಡುವೆ ಸಾಧ್ಯವಾದಷ್ಟು wide ರಸ್ತೆ ಬಿಡಿಸಿ boundary ಹಾಕುವಂತೆ. SVM maximum margin decision boundary ಹುಡುಕುತ್ತದೆ.', focus: 'margin, support vectors, kernels, C, gamma, linear vs RBF, scaling need', practice: '`SVC(kernel="linear")` ಮತ್ತು `SVC(kernel="rbf")` compare ಮಾಡಿ' },
  { id: 'm2-t30', name: 'XGBoost & gradient boosting', analogy: 'ಮೊದಲ tutor ತಪ್ಪು ಮಾಡಿದ questions ಮೇಲೆ ಎರಡನೇ tutor focus, ನಂತರ ಮೂರನೇ tutor ಇನ್ನೂ ಉಳಿದ mistakes fix ಮಾಡುವಂತೆ. Boosting sequential learners build ಮಾಡುತ್ತದೆ.', focus: 'boosting, weak learners, residuals/errors, learning_rate, n_estimators, regularization, tabular power', practice: '`GradientBoostingClassifier` ಅಥವಾ `XGBClassifier` train ಮಾಡಿ learning_rate effect ನೋಡಿ' },
  { id: 'm2-t31', name: 'K-Means Clustering', analogy: 'ಸಂತೆಯಲ್ಲಿ customers ಅನ್ನು shopping pattern ಆಧಾರವಾಗಿ groups ಮಾಡುವುದು. K-Means k centres ಇಟ್ಟು nearest points assign ಮಾಡಿ centres update ಮಾಡುತ್ತದೆ.', focus: 'unsupervised clustering, centroids, inertia, elbow method, scaling, random initialization', practice: '2D blobs data ಮೇಲೆ k=2..6 inertia plot ಮಾಡಿ' },
  { id: 'm2-t32', name: 'Hierarchical Clustering', analogy: 'ಕುಟುಂಬ tree ತರಹ individual people ನಿಧಾನವಾಗಿ families, clans, communities ಆಗಿ merge ಆಗುವಂತೆ. Hierarchical clustering dendrogram ಕಟ್ಟುತ್ತದೆ.', focus: 'agglomerative clustering, linkage methods, dendrogram, distance thresholds, no need pre-fixed k sometimes', practice: '`AgglomerativeClustering` run ಮಾಡಿ linkage ward/complete compare ಮಾಡಿ' },
  { id: 'm2-t33', name: 'DBSCAN', analogy: 'ಜಾತ್ರೆಯಲ್ಲಿ crowd dense ಆಗಿರುವ ಗುಂಪುಗಳು naturally ಕಾಣುತ್ತವೆ; ದೂರದ ಒಬ್ಬೊಬ್ಬರನ್ನು noise ಎಂದು ಬಿಡಬಹುದು. DBSCAN density ಆಧಾರವಾಗಿ clusters ಕಂಡುಹಿಡಿಯುತ್ತದೆ.', focus: 'density clustering, eps, min_samples, noise points, arbitrary shapes, scaling sensitivity', practice: 'moons dataset ಮೇಲೆ DBSCAN run ಮಾಡಿ noise labels count ಮಾಡಿ' },
  { id: 'm2-t34', name: 'Dimensionality Reduction with PCA', analogy: '3D ಮೂರ್ತಿಯ shadow ಅನ್ನು 2D wall ಮೇಲೆ ಹಾಕಿದರೂ ಮುಖ್ಯ shape ಕಾಣಬಹುದು. PCA high-dimensional data ಅನ್ನು maximum information ಉಳಿಸಿ ಕಡಿಮೆ dimensions ಗೆ project ಮಾಡುತ್ತದೆ.', focus: 'variance directions, components, explained variance ratio, compression, visualization, scaling before PCA', practice: '`PCA(n_components=2)` fit ಮಾಡಿ explained variance ratio print ಮಾಡಿ scatter plot ಮಾಡಿ' },
  { id: 'm2-t35', name: 'Train / validation / test split', analogy: 'exam ಮುಂಚೆ practice questions, mock test, final unseen exam ಬೇರೆ ಇಡುವಂತೆ. Train ಕಲಿಯಲು, validation tune ಮಾಡಲು, test honest final score ಗೆ.', focus: 'data splitting, holdout, validation, test leakage, stratification, random_state', practice: '`train_test_split(..., stratify=y)` ಬಳಸಿ class ratios compare ಮಾಡಿ' },
  { id: 'm2-t36', name: 'Confusion matrix, precision, recall, F1', analogy: 'security guard ಯಾರನ್ನು ಒಳಗೆ ಬಿಡಬೇಕು ಎಂದು ತೀರ್ಮಾನಿಸುತ್ತಾನೆ. ಸರಿಯಾದ pass, ತಪ್ಪಾದ pass, ತಪ್ಪಾಗಿ ತಡೆದವರು, ಸರಿಯಾಗಿ ತಡೆದವರು — confusion matrix ಅದೇ ledger.', focus: 'TP, FP, FN, TN, accuracy, precision, recall, F1, class imbalance', practice: '`classification_report` ಮತ್ತು `ConfusionMatrixDisplay` generate ಮಾಡಿ' },
  { id: 'm2-t37', name: 'ROC curve & AUC', analogy: 'hospital test threshold strict ಮಾಡಿದರೆ false alarms ಕಡಿಮೆ ಆದರೆ real patients miss ಆಗಬಹುದು. ROC threshold ಬದಲಿಸಿದಾಗ TPR/FPR tradeoff ತೋರಿಸುತ್ತದೆ.', focus: 'threshold sweep, TPR, FPR, AUC, ranking quality, ROC vs PR curve', practice: 'model probabilities ಬಳಸಿ `roc_auc_score` ಮತ್ತು ROC curve plot ಮಾಡಿ' },
  { id: 'm2-t38', name: 'k-fold cross-validation', analogy: 'restaurant rating ಒಂದೇ customer ನಿಂದ ಕೇಳದೆ 5 ಬೇರೆ days customers ನ average ತೆಗೆದುಕೊಳ್ಳುವಂತೆ. CV ಹಲವು splits ಮೂಲಕ stable estimate ಕೊಡುತ್ತದೆ.', focus: 'folds, mean/std score, StratifiedKFold, GroupKFold, TimeSeriesSplit, pipeline safety', practice: '`cross_val_score` with 5-fold CV run ಮಾಡಿ mean ± std print ಮಾಡಿ' },
  { id: 'm2-t39', name: 'GridSearchCV & RandomizedSearchCV', analogy: 'mango orchard ನಲ್ಲಿ best mango ಹುಡುಕಲು grid search ಎಲ್ಲ ಸಾಲು tasting; random search ಕಡಿಮೆ tasting ನಲ್ಲಿ promising trees ಹಿಡಿಯಬಹುದು.', focus: 'hyperparameters, exhaustive grid, random sampling, CV tuning, `best_params_`, pipelines', practice: '`GridSearchCV` for `C`/`gamma` ಅಥವಾ `RandomizedSearchCV` with n_iter run ಮಾಡಿ' },
  { id: 'm2-t40', name: 'Bias-variance tradeoff & regularization (L1/L2)', analogy: 'archer arrows centre ನಿಂದ ದೂರ ಒಂದೇ ಕಡೆ ಬಿದ್ದರೆ bias; ಎಲ್ಲೆಡೆ ಚದರಿದರೆ variance. Regularization aim ಅನ್ನು stable ಮಾಡುತ್ತದೆ.', focus: 'underfitting, overfitting, train/test gap, L1 Lasso, L2 Ridge, ElasticNet, scaling before regularization', practice: 'Ridge/Lasso alphas compare ಮಾಡಿ coefficients shrink ಆಗುವುದನ್ನು ನೋಡಿ' },
];

const module2RemainingTranslations = Object.fromEntries(
  module2RemainingTopicSeeds.map((topic) => [
    topic.id,
    {
      explain:
        `**${topic.name}** Module 2 ನಲ್ಲಿ statistics ಮತ್ತು ML workflow ಗೆ ಮುಖ್ಯ ಕೊಂಡಿ. ಇಲ್ಲಿ goal formula memorize ಮಾಡುವುದು ಮಾತ್ರ ಅಲ್ಲ; data ನೋಡಿದಾಗ ಯಾವ assumption ಸರಿಯಿದೆ, ಯಾವ model/metric ಬಳಸಬೇಕು, ಮತ್ತು result ನಿಜವಾಗಿಯೂ trust ಮಾಡಬಹುದೇ ಎಂದು ತಿಳಿದುಕೊಳ್ಳುವುದು. ${topic.focus}.`,
      analogy:
        `**ಉದಾಹರಣೆ:**\n${topic.analogy}\n\nML ನಲ್ಲಿ ಇದೇ pattern ಮತ್ತೆ ಮತ್ತೆ ಬರುತ್ತದೆ: raw observation → structured data → model decision → evidence-based evaluation. Analogy ನೆನಪಿದ್ದರೆ formula dry ಆಗಿ ಕಾಣುವುದಿಲ್ಲ.`,
      theory:
        `**WHY:** ${topic.name} ಇಲ್ಲದೆ model output ಒಂದು black box ಆಗುತ್ತದೆ. Statistics uncertainty ತೋರಿಸುತ್ತದೆ; ML algorithms pattern ಕಲಿಯುತ್ತವೆ; evaluation ಆ pattern real world ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆಯೇ ಎಂದು ಪರೀಕ್ಷಿಸುತ್ತದೆ.\n\n` +
        `**HOW:** ಮೊದಲು data split ಮತ್ತು leakage ಬಗ್ಗೆ ಯೋಚಿಸಿ. ನಂತರ preprocessing ಅನ್ನು train data ಮೇಲೆ ಮಾತ್ರ fit ಮಾಡಿ. Model/metric ಆಯ್ಕೆ ಮಾಡುವಾಗ problem type ನೋಡಿ: regression, classification, clustering, ಅಥವಾ dimensionality reduction. ${topic.focus} ಅನ್ನು ಚಿಕ್ಕ dataset ಮೇಲೆ practice ಮಾಡಿದರೆ ದೊಡ್ಡ project ನಲ್ಲಿ mistakes ಕಡಿಮೆ.\n\n` +
        `**Interview lens:** "ಈ method ಯಾವ assumption ಮಾಡುತ್ತದೆ? ಯಾವಾಗ fail ಆಗುತ್ತದೆ? ಯಾವ metric ನೋಡಬೇಕು?" — ಈ ಮೂರು questions ಗೆ ಉತ್ತರ ಬಂದರೆ topic ನಿಜವಾಗಿ ಅರ್ಥವಾಗಿದೆ.`,
      whyItMatters:
        `ಪ್ರತಿ ML interview ನಲ್ಲಿ ${topic.name} ತರಹದ question ಬರುವ chance ಹೆಚ್ಚು. Portfolio project ಗಳಲ್ಲೂ ಇದೇ skills recruiter ಗೆ visible ಆಗುತ್ತವೆ: clean data, sensible model, correct validation, clear metric. ಇದನ್ನು skip ಮಾಡಿದರೆ high accuracy ಕಂಡರೂ leakage ಅಥವಾ overfitting ಕಾರಣದಿಂದ production ನಲ್ಲಿ model break ಆಗಬಹುದು.`,
      steps: [
        `ಮೊದಲು ${topic.name} ನ purpose ಬರೆಯಿರಿ: prediction, cleaning, grouping, ಅಥವಾ evaluation?`,
        'Dataset ಅನ್ನು inspect ಮಾಡಿ: shape, dtypes, missing values, target distribution.',
        'Train/validation/test boundary ಸ್ಪಷ್ಟವಾಗಿರಲಿ; preprocessing leakage ಆಗದಂತೆ `Pipeline` ಬಳಸಿ.',
        `Core practice ಮಾಡಿ: ${topic.practice}.`,
        'ಒಂದು baseline ಜೊತೆ compare ಮಾಡಿ; baseline ಇಲ್ಲದೆ score ಗೆ ಅರ್ಥ ಕಡಿಮೆ.',
        'Result ಅನ್ನು metric + visual + plain-English interpretation ಆಗಿ note ಮಾಡಿ.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Train/test split ಮುಂಚೆ scaler/imputer fit ಮಾಡುವುದು. ಇದು leakage; preprocessing ಅನ್ನು train fold ಒಳಗೆ fit ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** Accuracy ಒಂದೇ metric ಎಂದು ನಂಬುವುದು. Imbalanced data ನಲ್ಲಿ precision, recall, F1, ROC/PR-AUC ನೋಡಿ.',
        '**ತಪ್ಪು.** Model score high ಬಂದಿದೆ ಎಂದು assumptions check ಮಾಡದೆ deploy ಮಾಡುವುದು. Data leakage, duplicates, target leakage ಹುಡುಕಿ.',
        '**ಸಮಸ್ಯೆ.** Random seed ಇಲ್ಲದೆ results compare ಮಾಡುವುದು. `random_state` set ಮಾಡಿ reproducible ಮಾಡಿ.',
        '**ತಪ್ಪು.** Visualization ಇಲ್ಲದೆ conclusions ಹೇಳುವುದು. Distribution, residuals, confusion matrix, ಅಥವಾ clusters plot ಮಾಡಿ.',
      ],
      tryIt:
        `${topic.practice}. ನಂತರ ಅದೇ experiment ನಲ್ಲಿ ಒಂದು parameter ಬದಲಿಸಿ ಮತ್ತು score/plot ಹೇಗೆ ಬದಲಾಗುತ್ತದೆ observe ಮಾಡಿ. Results notebook ನಲ್ಲಿ table ಆಗಿ ಬರೆಯಿರಿ: setting, metric, observation. ಈಗ extend ಮಾಡಿ - same workflow ಅನ್ನು \`Pipeline\` ಒಳಗೆ ಹಾಕಿ leakage-safe ಮಾಡಿ.`,
      takeaway:
        `${topic.name} ಗೆ golden rule: **assumption ತಿಳಿ, leakage ತಪ್ಪಿಸು, baseline compare ಮಾಡು, metric ಸರಿಯಾಗಿ ಓದು**.`,
    },
  ]),
);

const module3RemainingTopicSeeds = [
  { id: 'm3-t6', name: 'Attention is all you need', analogy: 'ತರಗತಿಯಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ ವಿದ್ಯಾರ್ಥಿ ಸಂಪೂರ್ಣ passage ನೋಡಿಕೊಂಡು ಯಾರ ಮಾತು ಮುಖ್ಯ ಎಂದು weight ಹಾಕುವಂತೆ. Transformer ನಲ್ಲಿ token ಗಳು one-by-one whisper ಮಾಡದೇ direct ಆಗಿ ಎಲ್ಲ tokens ಕಡೆ ನೋಡುತ್ತವೆ.', focus: 'Transformer intuition, attention, parallel training, long-range dependencies, RNN/CNN limitations', practice: 'ಒಂದು sentence ತೆಗೆದು pronoun ಯಾವ previous word ಗೆ attend ಆಗಬೇಕು ಎಂದು ಕೈಯಿಂದ mark ಮಾಡಿ' },
  { id: 'm3-t7', name: 'Self-attention & multi-head attention', analogy: 'ಒಂದೇ ಕಥೆ ಓದುವಾಗ grammar lens, time lens, character lens ಬೇರೆ ಬೇರೆ ಬೇಕು. Multi-head attention ಒಂದೇ text ಮೇಲೆ ಹಲವು lenses ಒಂದೇ ಸಮಯದಲ್ಲಿ ಹಾಕುತ್ತದೆ.', focus: 'Q/K/V, attention weights, heads, concatenation, specialised relationship learning', practice: 'Q, K, V words ಬಳಸಿ tiny attention score table sketch ಮಾಡಿ' },
  { id: 'm3-t8', name: 'Encoder vs decoder architectures', analogy: 'BERT exam paper ಸಂಪೂರ್ಣ ಓದಿ answer understand ಮಾಡುತ್ತಾನೆ; GPT left-to-right essay ಬರೆಯುತ್ತಾನೆ; T5 translator ಮೊದಲು source ಓದಿ ನಂತರ target ಬರೆಯುತ್ತಾನೆ.', focus: 'encoder-only, decoder-only, encoder-decoder, bidirectional context, causal mask, generation vs understanding', practice: 'classification, chat, translation tasks ಗೆ ಯಾವ architecture ಎಂದು map ಮಾಡಿ' },
  { id: 'm3-t9', name: 'BERT (encoder-only)', analogy: 'ಗ್ರಂಥಾಲಯ ಓದಿರುವ language scholar ಗೆ blank ತುಂಬಲು ಹೇಳಿದಂತೆ. BERT ಎರಡೂ ಬದಿಯ context ನೋಡಿ sentence ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳುತ್ತದೆ.', focus: 'masked language modelling, bidirectional encoder, fine-tuning, embeddings, classification/NER/QA', practice: 'masked sentence ಬರೆದು missing word guess ಮಾಡಲು left+right context ಬಳಸಿ' },
  { id: 'm3-t10', name: 'GPT family & ChatGPT', analogy: 'ಎಲ್ಲ ಪುಸ್ತಕ ಓದಿದ autocomplete machine ಗೆ ನಂತರ manners training ಕೊಟ್ಟರೆ chat assistant ಆಗುತ್ತದೆ. Base GPT text continue ಮಾಡುತ್ತದೆ; ChatGPT instruction follow ಮಾಡುತ್ತದೆ.', focus: 'decoder-only GPT, next-token prediction, SFT, reward modelling, RLHF, chat alignment', practice: 'base completion style prompt ಮತ್ತು assistant instruction prompt compare ಮಾಡಿ' },
  { id: 'm3-t11', name: 'LLaMA & open-source LLMs', analogy: 'ಒಂದು ದೊಡ್ಡ ಕಂಪನಿಯ private kitchen ಬದಲು community kitchen recipes share ಮಾಡುವಂತೆ. Open-source LLMs local, private, customizable models ಕೊಡುತ್ತವೆ.', focus: 'open weights, local inference, fine-tuning, quantization, ecosystem, tradeoffs vs closed models', practice: 'ಒಂದು open model card ಓದಿ license, context length, size note ಮಾಡಿ' },
  { id: 'm3-t12', name: 'Fine-tuning vs prompt-tuning vs LoRA', analogy: 'teacher ಗೆ full retraining ಕೊಡುವುದು fine-tuning; front-desk instruction sheet prompt-tuning; small adapter notebook LoRA. Goal ಒಂದೇ, cost/control ಬೇರೆ.', focus: 'full fine-tuning, PEFT, LoRA adapters, prompt tuning, data quality, when to use each', practice: 'task examples 20/2000/20000 ಇದ್ದರೆ ಯಾವ adaptation method ಎಂದು decide ಮಾಡಿ' },
  { id: 'm3-t13', name: 'Authentication & API keys', analogy: 'ಬ್ಯಾಂಕ್ locker key ಯಾರಿಗೆ ಕೊಟ್ಟರೆ ಅವರು locker ತೆರೆಯಬಹುದು. API key ಕೂಡ ನಿಮ್ಮ account billing ಮತ್ತು access ಗೆ key.', focus: 'API keys, environment variables, secrets, rotation, server-side use, never commit keys', practice: '`.env` ನಲ್ಲಿ dummy key ಇಟ್ಟು code ನಲ್ಲಿ env var read ಮಾಡಿ' },
  { id: 'm3-t14', name: 'Chat Completions endpoint', analogy: 'conversation notebook ನಲ್ಲಿ system, user, assistant messages ಕ್ರಮವಾಗಿ ಬರೆಯುವಂತೆ. API full message history ನೋಡಿ next assistant reply ಕೊಡುತ್ತದೆ.', focus: 'messages array, model, temperature, max tokens, response object, conversation state', practice: 'small chat request ಬರೆಯಿರಿ ಮತ್ತು response content print ಮಾಡಿ' },
  { id: 'm3-t15', name: 'System / user / assistant roles', analogy: 'ನಾಟಕದಲ್ಲಿ director instruction system, actor dialogue user, previous performance assistant. Model reply ಈ roles context ಮೇಲೆ ನಿಂತಿದೆ.', focus: 'role hierarchy, system instructions, user requests, assistant history, prompt injection awareness', practice: 'same user prompt ಗೆ ಬೇರೆ system role ನೀಡಿ output compare ಮಾಡಿ' },
  { id: 'm3-t16', name: 'Rate limits & retries', analogy: 'railway ticket counter ನಲ್ಲಿ minute ಗೆ ಎಷ್ಟು ಜನ ಮಾತ್ರ. ಹೆಚ್ಚು request ಮಾಡಿದರೆ queue/wait ಬೇಕು. Retry discipline ಇಲ್ಲದರೆ app fail ಆಗುತ್ತದೆ.', focus: 'RPM/TPM limits, 429 errors, exponential backoff, jitter, idempotency, batching', practice: 'fake 429 exception ಗೆ retry-with-backoff helper ಬರೆಯಿರಿ' },
  { id: 'm3-t17', name: 'Error handling & cost monitoring', analogy: 'ಹೋಟೆಲ್ kitchen ನಲ್ಲಿ order fail ಆದರೆ reason note ಮಾಡಬೇಕು ಮತ್ತು ingredients cost track ಮಾಡಬೇಕು. LLM apps ಕೂಡ errors ಮತ್ತು tokens count ಮಾಡಬೇಕು.', focus: 'API exceptions, timeouts, validation, token accounting, logging, budget caps', practice: 'API wrapper ನಲ್ಲಿ try/except, elapsed time, token/cost log add ಮಾಡಿ' },
  { id: 'm3-t18', name: 'LangChain core concepts', analogy: 'factory workflow ನಲ್ಲಿ prompt template, model machine, parser quality check, chain conveyor belt. LangChain ಇವುಗಳನ್ನು reusable blocks ಆಗಿ ಕೊಡುತ್ತದೆ.', focus: 'prompts, models, output parsers, chains, runnables, callbacks, integrations', practice: 'prompt template + model + parser mental pipeline draw ಮಾಡಿ' },
  { id: 'm3-t19', name: 'Sequential chains', analogy: 'ಅಡುಗೆಯಲ್ಲಿ chop -> cook -> garnish. ಒಂದು step output ಮುಂದಿನ step input ಆಗುತ್ತದೆ. Sequential chain complex task ಅನ್ನು small stations ಮಾಡುತ್ತದೆ.', focus: 'step-by-step chains, intermediate outputs, validation between steps, debuggability', practice: 'extract -> summarize -> format 3-step chain design ಮಾಡಿ' },
  { id: 'm3-t20', name: 'Memory: buffer, summary, vector memory', analogy: 'assistant ಗೆ diary, short summary notebook, searchable library ಮೂರು memory types. Chat history ಎಲ್ಲವನ್ನೂ raw ಆಗಿ ಇಡುವುದು ಯಾವಾಗಲೂ best ಅಲ್ಲ.', focus: 'conversation buffer, summary memory, vector retrieval memory, context window limits, privacy', practice: '10-turn chat ಅನ್ನು raw buffer vs 3-line summary ಆಗಿ compress ಮಾಡಿ' },
  { id: 'm3-t21', name: 'Conditional & router chains', analogy: 'hospital reception symptom ನೋಡಿ cardiology, ortho, pediatrics counter ಗೆ ಕಳುಹಿಸುವಂತೆ. Router chain input ಆಧಾರವಾಗಿ ಸರಿಯಾದ chain ಆಯ್ಕೆಮಾಡುತ್ತದೆ.', focus: 'classification router, branching logic, specialised prompts, fallback path, confidence thresholds', practice: 'support ticket ಅನ್ನು billing/tech/refund route ಮಾಡುವ rules ಬರೆಯಿರಿ' },
  { id: 'm3-t22', name: 'Custom prompt templates', analogy: 'tailor shop measurement form fixed ಆಗಿದ್ದರೆ ಪ್ರತಿಯೊಬ್ಬ customer ಗೆ shirt consistent. Prompt template variables ತುಂಬಿ consistent request ಕೊಡುತ್ತದೆ.', focus: 'template variables, reusable prompts, format instructions, examples, versioning', practice: '`{audience}`, `{tone}`, `{topic}` variables ಇರುವ template ಮಾಡಿ' },
  { id: 'm3-t23', name: 'Multi-step workflows & tools', analogy: 'project manager plan ಮಾಡಿ, spreadsheet query, email draft, review, send. LLM workflow tools ಜೊತೆ real actions ಮಾಡುತ್ತದೆ.', focus: 'workflow orchestration, tool calls, state, checkpoints, human approval, observability', practice: 'research -> calculate -> write report workflow boxes draw ಮಾಡಿ' },
  { id: 'm3-t24', name: 'Model Hub overview', analogy: 'ಪುಸ್ತಕ ಮೇಳದಲ್ಲಿ ಸಾವಿರ models shelves ಮೇಲೆ: text, image, speech, embeddings. Hugging Face Hub model marketplace ತರಹ.', focus: 'models, datasets, spaces, model cards, licenses, tasks, downloads', practice: 'Hugging Face model card ನೋಡಿ task, license, params, usage note ಮಾಡಿ' },
  { id: 'm3-t25', name: 'Transformers pipelines', analogy: 'ready-made mixer grinder jar ಹಾಕಿದರೆ chutney ready. Pipeline sentiment, summarization, translation tasks ಗೆ quick wrapper.', focus: '`pipeline`, task names, tokenizer/model loading, quick inference, limitations', practice: 'sentiment-analysis pipeline example ಓದಿ input/output schema note ಮಾಡಿ' },
  { id: 'm3-t26', name: 'Loading pre-trained models locally', analogy: 'cloud kitchen ಬದಲು ನಿಮ್ಮ ಮನೆಯ stove ಮೇಲೆ recipe cook ಮಾಡುವಂತೆ. Local model privacy ಕೊಡುತ್ತದೆ ಆದರೆ RAM/GPU ಬೇಕು.', focus: 'tokenizer, model weights, device, quantization, inference memory, offline use', practice: 'model size ನೋಡಿ local machine RAM/GPU ಸಾಕೇ ಎಂದು estimate ಮಾಡಿ' },
  { id: 'm3-t27', name: 'Datasets library', analogy: 'ಶಾಲಾ records clean format ನಲ್ಲಿ ready ಸಿಗುವ archive. Datasets library split, stream, map, filter ಸುಲಭ ಮಾಡುತ್ತದೆ.', focus: 'loading datasets, train/test splits, streaming, map/filter, dataset cards, preprocessing', practice: 'ಒಂದು dataset card ನಲ್ಲಿ columns ಮತ್ತು splits note ಮಾಡಿ' },
  { id: 'm3-t28', name: 'Generator vs discriminator', analogy: 'ನಕಲಿ ನೋಟು ಮಾಡುತ್ತಿರುವ artist generator; bank cashier fake ಹಿಡಿಯುವ discriminator. ಇಬ್ಬರೂ train ಆದಂತೆ quality ಜಾಸ್ತಿ.', focus: 'GAN game, generator, discriminator, adversarial training, equilibrium, instability', practice: 'real/fake image judging loop ಅನ್ನು 5 steps ನಲ್ಲಿ ಬರೆಯಿರಿ' },
  { id: 'm3-t29', name: 'DCGAN architecture', analogy: 'ಚಿತ್ರ ಬಿಡಿಸುವ studio ನಲ್ಲಿ upsampling layers canvas ದೊಡ್ಡದಾಗಿಸುತ್ತವೆ; discriminator reverse ಆಗಿ image judge ಮಾಡುತ್ತದೆ.', focus: 'convolutions, transposed convolutions, batch norm, latent vector, image generation', practice: 'latent z -> 64x64 image generator block diagram draw ಮಾಡಿ' },
  { id: 'm3-t30', name: 'StyleGAN intuition', analogy: 'portrait studio ನಲ್ಲಿ pose, hairstyle, lighting, age sliders ಬೇರೆ ಬೇರೆ control ಮಾಡಿದಂತೆ. StyleGAN latent style controls ಕೊಡುತ್ತದೆ.', focus: 'style vectors, mapping network, progressive quality, disentanglement, image synthesis', practice: 'face generation controls list ಮಾಡಿ: age, hair, lighting, pose' },
  { id: 'm3-t31', name: 'CycleGAN for unpaired translation', analogy: 'ಕುದುರೆ photo ಅನ್ನು zebra style ಗೆ, ಮತ್ತೆ horse ಗೆ ಮರಳಿಸಿದಾಗ original ಉಳಿಯಬೇಕು. Paired examples ಇಲ್ಲದೇ style transfer ಕಲಿಯುವುದು CycleGAN.', focus: 'unpaired image translation, cycle consistency, two generators, two discriminators', practice: 'summer<->winter ಅಥವಾ horse<->zebra cycle sketch ಮಾಡಿ' },
  { id: 'm3-t32', name: 'Encoder-decoder & latent space', analogy: 'ದೊಡ್ಡ article ಅನ್ನು short secret code ಮಾಡಿ, ಮತ್ತೆ article rebuild ಮಾಡುವಂತೆ. VAE encoder data ಅನ್ನು latent space ಗೆ compress ಮಾಡುತ್ತದೆ.', focus: 'encoder, decoder, latent variables, reconstruction, sampling, continuous representation', practice: '2D latent map ನಲ್ಲಿ similar images ಹತ್ತಿರ ಇರಬೇಕು ಎಂದು explain ಮಾಡಿ' },
  { id: 'm3-t33', name: 'KL divergence & ELBO', analogy: 'student notes real textbook distribution ಗೆ ಎಷ್ಟು ಹತ್ತಿರವೆಂದು measure ಮಾಡುವಂತೆ KL divergence. ELBO reconstruction ಮತ್ತು regularization balance ಮಾಡುತ್ತದೆ.', focus: 'KL divergence, prior matching, reconstruction loss, ELBO objective, VAE training', practice: 'ELBO = reconstruction - KL mnemonic ಬರೆಯಿರಿ' },
  { id: 'm3-t34', name: 'VAEs for anomaly detection', analogy: 'trained tailor normal shirt patterns ಚೆನ್ನಾಗಿ reconstruct ಮಾಡುತ್ತಾನೆ; strange shirt ಬಂದರೆ fitting ಕೆಡುತ್ತದೆ. High reconstruction error anomaly ಸೂಚಿಸುತ್ತದೆ.', focus: 'normal-data training, reconstruction error, thresholding, anomaly score, false positives', practice: 'normal transactions train, high-error rows flag ಮಾಡುವ workflow outline ಮಾಡಿ' },
  { id: 'm3-t35', name: 'Data compression with VAEs', analogy: 'ಹಳೆಯ photo album ಅನ್ನು small index cards ಆಗಿ compress ಮಾಡಿ ನಂತರ approximate photo rebuild ಮಾಡುವಂತೆ. VAE meaningful compressed representation ಕಲಿಯುತ್ತದೆ.', focus: 'lossy compression, latent dimensions, reconstruction quality, sampling, denoising', practice: 'latent dimension 2 vs 32 tradeoff table ಮಾಡಿ' },
  { id: 'm3-t36', name: 'Why RAG: grounding LLM responses', analogy: 'exam answer ಬರೆಯುವ student ಗೆ textbook open-book access ಕೊಟ್ಟರೆ hallucination ಕಡಿಮೆ. RAG model ಗೆ external documents grounding ಕೊಡುತ್ತದೆ.', focus: 'retrieval augmented generation, grounding, citations, freshness, hallucination reduction', practice: 'question -> retrieve docs -> answer with citations flow draw ಮಾಡಿ' },
  { id: 'm3-t37', name: 'Embeddings & vector databases', analogy: 'library books topic coordinates ನಲ್ಲಿ map ಆಗಿದ್ದರೆ similar books ಹತ್ತಿರ ಇರುತ್ತವೆ. Embeddings meaning ಅನ್ನು vectors ಮಾಡುತ್ತವೆ.', focus: 'semantic vectors, cosine similarity, FAISS/Pinecone/Chroma, indexing, nearest neighbours', practice: '5 sentences ಗೆ similarity groups manually guess ಮಾಡಿ' },
  { id: 'm3-t38', name: 'Chunking strategies', analogy: 'ದೊಡ್ಡ textbook ಅನ್ನು chapters/paragraphs ಆಗಿ ಕತ್ತರಿಸಿದರೆ search easy. ತುಂಬಾ ಸಣ್ಣ chunks context ಕಳೆದುಕೊಳ್ಳುತ್ತವೆ; ತುಂಬಾ ದೊಡ್ಡ chunks noisy.', focus: 'chunk size, overlap, semantic chunking, metadata, retrieval quality', practice: 'ಒಂದು article ಅನ್ನು 300-word chunks with overlap ಆಗಿ plan ಮಾಡಿ' },
  { id: 'm3-t39', name: 'Building a FAQ assistant', analogy: 'customer support desk ಬಳಿ company FAQ binder ಇದ್ದರೆ answers consistent. RAG FAQ bot user question ಗೆ relevant page ತೆರೆದು answer ಕೊಡುತ್ತದೆ.', focus: 'ingestion, chunking, embeddings, retrieval, answer prompt, evaluation, citations', practice: 'FAQ bot pipeline: load -> split -> embed -> retrieve -> answer ಬರೆಯಿರಿ' },
  { id: 'm3-t40', name: 'Agent loop: plan-act-observe-reflect', analogy: 'junior consultant brief ಓದಿ plan ಮಾಡುತ್ತಾಳೆ, tool ಬಳಸಿ data ತರುತ್ತಾಳೆ, result ನೋಡಿ next step decide ಮಾಡುತ್ತಾಳೆ. ಇದೇ agent loop.', focus: 'planning, tool execution, observations, reflection, iteration caps, budget limits', practice: 'weather report agent ಗೆ 4-loop example ಬರೆಯಿರಿ' },
  { id: 'm3-t41', name: 'AutoGPT', analogy: 'enthusiastic intern ಗೆ goal ಮತ್ತು credit card ಕೊಟ್ಟಂತೆ. AutoGPT autonomous tasks ಮಾಡಿತು ಆದರೆ loops, cost, reliability lessons ಕಲಿಸಿತು.', focus: 'autonomous agents, self-prompting, web/tools/files, vector memory, cost explosion, guardrails', practice: 'AutoGPT failure modes list ಮಾಡಿ: loop, hallucinated tool, budget, weak memory' },
  { id: 'm3-t42', name: 'BabyAGI', analogy: 'kanban board ನಲ್ಲಿ top task ತೆಗೆದು ಮಾಡಿ, result ಆಧಾರವಾಗಿ new tasks add ಮಾಡಿ, queue reprioritize ಮಾಡುವ one-person office.', focus: 'task queue, execution loop, vector memory, task creation, prioritization, minimal agent architecture', practice: 'goal ಗೆ initial 5 tasks ಮತ್ತು reprioritize rule ಬರೆಯಿರಿ' },
  { id: 'm3-t43', name: 'CrewAI multi-agent workflows', analogy: 'blog publish ಮಾಡಲು researcher, writer, editor, fact-checker ಬೇರೆ specialists ಇದ್ದರೆ quality ಹೆಚ್ಚುತ್ತದೆ. CrewAI role-based agents orchestrate ಮಾಡುತ್ತದೆ.', focus: 'agents, roles, tasks, tools, sequential/hierarchical process, multi-agent coordination', practice: 'Researcher/Writer/Editor crew ಗೆ task dependencies design ಮಾಡಿ' },
  { id: 'm3-t44', name: 'Tool use & function calling', analogy: 'assistant free-text ಹೇಳುವುದಕ್ಕೆ ಬದಲು `weigh(rice)` ಎಂಬ structured action menu ಬಳಕೆ. Function calling model intent ಅನ್ನು JSON schema ಗೆ ಕಟ್ಟುತ್ತದೆ.', focus: 'tool schemas, arguments, validation, dispatch, tool results, agent reliability', practice: 'calculator tool schema with `operation`, `a`, `b` fields design ಮಾಡಿ' },
  { id: 'm3-t45', name: 'GitHub Copilot', analogy: 'fast junior pair programmer gray text ನಲ್ಲಿ next code suggest ಮಾಡುತ್ತಾನೆ. Accept ಮಾಡುವ ಮುಂಚೆ senior ನೀವು review ಮಾಡಬೇಕು.', focus: 'IDE autocomplete, Copilot Chat, productivity, hallucinated APIs, security/licensing review', practice: 'Copilot suggestion review checklist ಬರೆಯಿರಿ' },
  { id: 'm3-t46', name: 'Tabnine & Amazon CodeWhisperer', analogy: 'Copilot SaaS tool ಆದರೆ Tabnine private/on-prem assistant, Amazon Q AWS-native assistant. Enterprise constraints ಬೇರೆ tools ಆಯ್ಕೆ ಮಾಡಿಸುತ್ತವೆ.', focus: 'privacy, on-prem deployment, AWS integration, license scanning, enterprise coding assistants', practice: 'startup vs bank vs AWS-heavy team ಗೆ assistant choice justify ಮಾಡಿ' },
  { id: 'm3-t47', name: 'Bias in generative models', analogy: 'ಒಂದು ಮಗುವಿಗೆ skewed magazines ಮಾತ್ರ ತೋರಿಸಿದರೆ jobs ಬಗ್ಗೆ biased picture ಕಲಿಯುತ್ತದೆ. Model internet data patterns ಕಲಿಯುತ್ತದೆ.', focus: 'training data bias, stereotypes, fairness evals, red-teaming, mitigation layers', practice: 'ಒಂದು prompt ಗೆ gender/geography bias test cases ಬರೆಯಿರಿ' },
  { id: 'm3-t48', name: 'Privacy, IP, hallucination risks', analogy: 'brilliant freelancer ಗೆ secrets ಕೊಟ್ಟರೆ privacy risk; copyrighted lines ಬರೆಯಿದರೆ IP risk; confidence ಜೊತೆ ಸುಳ್ಳು ಹೇಳಿದರೆ hallucination risk.', focus: 'data minimization, no-train endpoints, copyright/licensing, verification, citations, audit logs', practice: 'LLM feature launch checklist ನಲ್ಲಿ privacy/IP/hallucination controls ಸೇರಿಸಿ' },
  { id: 'm3-t49', name: 'Responsible AI development', analogy: 'AI feature ಹೊಸ car ತರಹ: manual, crash test, black box, recall mechanism ಇಲ್ಲದೆ ship ಮಾಡಬಾರದು. Responsible AI lifecycle discipline.', focus: 'model cards, audit logs, opt-outs, impact assessments, safety evals, compliance, accountability', practice: 'ಒಂದು chatbot ಗೆ model card sections outline ಮಾಡಿ' },
];

const module3RemainingTranslations = Object.fromEntries(
  module3RemainingTopicSeeds.map((topic) => [
    topic.id,
    {
      explain:
        `**${topic.name}** GenAI ಮತ್ತು agentic systems ನಲ್ಲಿ core concept. ಇಲ್ಲಿ main idea: model text/image/code generate ಮಾಡುತ್ತದೆ ಮಾತ್ರವಲ್ಲ; context, tools, memory, retrieval, and safety boundaries ಜೊತೆ system ಆಗಿ ಕೆಲಸ ಮಾಡಬೇಕು. ${topic.focus}.`,
      analogy:
        `**ಉದಾಹರಣೆ:**\n${topic.analogy}\n\nಈ analogy ಹಿಡಿದುಕೊಳ್ಳಿ: GenAI ಒಂದು magic box ಅಲ್ಲ. ಅದು pattern learner + context reader + probability sampler. System design ಚೆನ್ನಾಗಿದ್ದರೆ output useful; design sloppy ಆಗಿದ್ದರೆ hallucination, cost, privacy issues ಬರುತ್ತವೆ.`,
      theory:
        `**WHY:** ${topic.name} ಅರ್ಥವಾದರೆ GenAI hype ಮತ್ತು real engineering ನಡುವಿನ ವ್ಯತ್ಯಾಸ ಗೊತ್ತಾಗುತ್ತದೆ. Models ಹೇಗೆ context ಬಳಸುತ್ತವೆ, ಯಾವಾಗ tools ಬೇಕು, ಯಾವಾಗ retrieval ಬೇಕು, ಯಾವಾಗ fine-tuning ಬೇಕು ಎಂಬ decision clear ಆಗುತ್ತದೆ.\n\n` +
        `**HOW:** ಮೊದಲು task type ಗುರುತಿಸಿ: generate, classify, retrieve, translate, reason, ಅಥವಾ act. ನಂತರ architecture ಆಯ್ಕೆಮಾಡಿ: prompt-only, RAG, fine-tune, tool-calling agent, ಅಥವಾ multi-agent workflow. ${topic.focus} ಅನ್ನು small demo ಮೇಲೆ test ಮಾಡಿ ನಂತರ production guardrails ಸೇರಿಸಿ.\n\n` +
        `**Production lens:** evals, logging, cost limits, privacy boundaries, and human review ಇಲ್ಲದ GenAI feature demo ಮಾತ್ರ. Reliable app ಗೆ measurement ಮತ್ತು rollback plan ಬೇಕು.`,
      whyItMatters:
        `ಪ್ರತಿ modern AI interview ಮತ್ತು project ನಲ್ಲಿ ${topic.name} ಸಂಬಂಧಿತ question ಬರುತ್ತದೆ. "LLM ಏಕೆ ತಪ್ಪು ಹೇಳಿತು?", "RAG ಯಾವಾಗ ಬೇಕು?", "agent loop ಹೇಗೆ stop ಮಾಡುತ್ತೀರಿ?", "privacy ಹೇಗೆ handle?" — ಈ answers ಗೊತ್ತಿದ್ದರೆ ನೀವು prompt user ಅಲ್ಲ, GenAI engineer ಆಗುತ್ತೀರಿ.`,
      steps: [
        `ಮೊದಲು ${topic.name} ನ one-line purpose ಬರೆಯಿರಿ.`,
        'Input, model, external context/tools, output, evaluation metric ಇವುಗಳನ್ನು boxes ಆಗಿ draw ಮಾಡಿ.',
        `Core practice ಮಾಡಿ: ${topic.practice}.`,
        'ಒಂದು failure case ಯೋಚಿಸಿ: hallucination, privacy leak, wrong tool call, high cost, ಅಥವಾ bias.',
        'Guardrail ಸೇರಿಸಿ: validation, citation, budget cap, retry, human approval, ಅಥವಾ eval set.',
        'Small demo result ಅನ್ನು logs/metrics ಜೊತೆ compare ಮಾಡಿ; feeling ಅಲ್ಲ, measurement ನೋಡಿ.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Model ದೊಡ್ಡದು ಎಂದರೆ system reliable ಎಂದು assume ಮಾಡುವುದು. Prompt, context, evals, guardrails ಎಲ್ಲವೂ ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** Hallucination ಅನ್ನು UI wording ಮೂಲಕ ಮರೆಮಾಡುವುದು. Source/citation/verification workflow ಸೇರಿಸಿ.',
        '**ತಪ್ಪು.** Secrets ಅಥವಾ customer PII ಅನ್ನು public endpoint ಗೆ ಕಳುಹಿಸುವುದು. Data minimization ಮತ್ತು approved endpoint ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** Agent ಗೆ iteration/cost cap ಇಲ್ಲ. Loop forever ಆಗಬಹುದು; max steps, timeout, budget mandatory.',
        '**ತಪ್ಪು.** Demo examples ಮಾತ್ರ test ಮಾಡುವುದು. Adversarial, edge, multilingual, bias cases ಕೂಡ eval ಮಾಡಿ.',
      ],
      tryIt:
        `${topic.practice}. ನಂತರ ಅದೇ concept ಗೆ ಒಂದು mini eval ಬರೆಯಿರಿ: 5 normal cases, 2 edge cases, 1 adversarial case. Output ಅನ್ನು pass/fail criteria ಜೊತೆ judge ಮಾಡಿ. ಈಗ extend ಮಾಡಿ - result ಗೆ cost estimate ಮತ್ತು safety note ಸೇರಿಸಿ.`,
      takeaway:
        `${topic.name} ಗೆ ನೆನಪಿನ rule: **model capability + context + guardrails + evals = usable GenAI system**.`,
    },
  ]),
);

const module4TopicSeeds = [
  { id: 'm4-t1', name: 'SELECT, WHERE, ORDER BY, LIMIT', analogy: 'ತೆರಿಗೆ ಕಚೇರಿಯ ದೊಡ್ಡ records book ನಿಂದ ನಿಮಗೆ ಬೇಕಾದ columns ಮಾತ್ರ, ಬೇಕಾದ rows ಮಾತ್ರ, sorted ಆಗಿ top 10 ಮಾತ್ರ ಕೇಳುವಂತೆ SQL query ಕೆಲಸ ಮಾಡುತ್ತದೆ.', focus: 'SELECT columns, WHERE filters, ORDER BY sorting, LIMIT row cap, query reading order', practice: '`employees` table ನಿಂದ engineering dept top 10 salaries query ಬರೆಯಿರಿ' },
  { id: 'm4-t2', name: 'JOINs: inner, left, right, full', analogy: 'ಮದುವೆಯ ಎರಡು guest lists match ಮಾಡುವಂತೆ. INNER common names, LEFT left list ಎಲ್ಲರೂ, FULL ಎರಡೂ list ಎಲ್ಲರೂ ಉಳಿಸುತ್ತದೆ.', focus: 'join keys, INNER/LEFT/RIGHT/FULL joins, NULL matches, row loss bugs, duplicate keys', practice: 'customers ಮತ್ತು orders tables ಅನ್ನು LEFT JOIN ಮಾಡಿ no-order customers ಕಂಡುಹಿಡಿಯಿರಿ' },
  { id: 'm4-t3', name: 'GROUP BY & aggregate functions', analogy: 'cricket scorecards ಅನ್ನು team ಪ್ರಕಾರ stacks ಮಾಡಿ ಪ್ರತಿ stack average runs ಲೆಕ್ಕ ಹಾಕುವಂತೆ `GROUP BY` rows collapse ಮಾಡುತ್ತದೆ.', focus: 'COUNT, SUM, AVG, MIN, MAX, grouping keys, aggregate rule, per-group summaries', practice: 'sales table ನಲ್ಲಿ city ಪ್ರಕಾರ total revenue query ಬರೆಯಿರಿ' },
  { id: 'm4-t4', name: 'HAVING clause', analogy: 'WHERE door security guard; HAVING formed queues ನೋಡೋ manager. Groups ಆದ ಮೇಲೆ aggregate condition apply ಮಾಡುವುದು HAVING.', focus: 'WHERE vs HAVING, filtering groups, aggregate conditions, query order', practice: '5 ಕ್ಕಿಂತ ಹೆಚ್ಚು orders ಇರುವ customers ಮಾತ್ರ return ಮಾಡುವ query ಬರೆಯಿರಿ' },
  { id: 'm4-t5', name: 'Subqueries & CTEs', analogy: 'ಅಡುಗೆಯಲ್ಲಿ sauce recipe inline ಬರೆಯುವುದಕ್ಕಿಂತ ಮೊದಲು labelled bowl ನಲ್ಲಿ sauce ತಯಾರಿಸುವಂತೆ. CTE named temporary result ಕೊಡುತ್ತದೆ.', focus: 'subqueries, `WITH` CTEs, readability, reuse, nested logic, recursion preview', practice: 'monthly revenue CTE ಮಾಡಿ ಅದರ ಮೇಲೆ top months select ಮಾಡಿ' },
  { id: 'm4-t6', name: 'Window functions', analogy: 'sports day ನಲ್ಲಿ ಪ್ರತಿ student row ಉಳಿಸಿಕೊಂಡು grade ಒಳಗಿನ rank stamp ಮಾಡುವಂತೆ window function rows collapse ಮಾಡದೇ context value ಸೇರಿಸುತ್ತದೆ.', focus: 'OVER, PARTITION BY, ORDER BY, ROW_NUMBER, RANK, running totals, LAG/LEAD', practice: 'ಪ್ರತಿ department ಒಳಗೆ salary rank query ಬರೆಯಿರಿ' },
  { id: 'm4-t7', name: 'Partitioning & indexing basics', analogy: 'phone book alphabetical index ಇದ್ದರೆ Priya Iyer ಬೇಗ ಸಿಗುತ್ತಾಳೆ; state-wise books partition ಮಾಡಿದರೆ Pune search ಗೆ Maharashtra book ಮಾತ್ರ ತೆರೆದು ನೋಡುತ್ತೀರಿ.', focus: 'B-tree indexes, read/write tradeoff, partition pruning, date/region partitions, query performance', practice: 'orders table ಗೆ date partition ಮತ್ತು customer_id index ಯಾವಾಗ ಬೇಕು ಎಂದು note ಮಾಡಿ' },
  { id: 'm4-t8', name: 'Ranking & analytic functions', analogy: 'prize distribution ನಲ್ಲಿ ROW_NUMBER unique place, RANK tie ಜೊತೆ gap, DENSE_RANK tie without gap. LAG/LEAD ಹಿಂದಿನ/ಮುಂದಿನ runner ತೋರಿಸುತ್ತದೆ.', focus: 'ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, FIRST_VALUE, LAST_VALUE', practice: 'ಪ್ರತಿ user ನ latest order ಅನ್ನು ROW_NUMBER ಬಳಸಿ select ಮಾಡಿ' },
  { id: 'm4-t9', name: 'Stored procedures', analogy: 'ಬ್ಯಾಂಕ್ vault ಒಳಗಿನ robot ಗೆ `daily_debit` ಹೇಳಿದರೆ verify, debit, ledger ಎಲ್ಲವೂ ಒಂದೇ transaction ನಲ್ಲಿ ಆಗುತ್ತದೆ.', focus: 'stored procedures, parameters, server-side logic, transactions, security, maintainability tradeoff', practice: 'daily summary refresh procedure ಯಾವ steps ಮಾಡಬೇಕು ಎಂದು pseudo-SQL ಬರೆಯಿರಿ' },
  { id: 'm4-t10', name: 'Triggers', analogy: 'office motion sensor lights automatic ಆಗಿ on ಆಗುವಂತೆ database trigger INSERT/UPDATE/DELETE event ಗೆ automatic code run ಮಾಡುತ್ತದೆ.', focus: 'BEFORE/AFTER triggers, NEW/OLD rows, audit logs, updated_at, invisible side effects', practice: 'orders update ಆದಾಗ audit_log row insert trigger design ಮಾಡಿ' },
  { id: 'm4-t11', name: 'CASE / IF conditional logic', analogy: 'ಲೈಬ್ರರಿಯನ್ book age ನೋಡಿ New/Old/Rare shelf decide ಮಾಡುವಂತೆ `CASE` row-by-row condition label ಕೊಡುತ್ತದೆ.', focus: 'searched CASE, simple CASE, IF/IIF shortcuts, conditional aggregation, COALESCE/NULLIF', practice: 'salary ಆಧಾರವಾಗಿ Low/Medium/High band CASE expression ಬರೆಯಿರಿ' },
  { id: 'm4-t12', name: 'Recursive CTEs', analogy: 'ಕುಟುಂಬ ವೃಕ್ಷದಲ್ಲಿ parent ರಿಂದ child, child ರಿಂದ grandchild ಹೀಗೆ ಕೆಳಗೆ ಇಳಿಯುವಂತೆ recursive CTE hierarchy traverse ಮಾಡುತ್ತದೆ.', focus: 'anchor query, recursive member, UNION ALL, hierarchy/tree traversal, termination condition', practice: 'employee-manager tree ನಲ್ಲಿ all reports query outline ಮಾಡಿ' },
  { id: 'm4-t13', name: 'Documents, collections, BSON', analogy: 'MongoDB filing cabinet ನಲ್ಲಿ collection drawer, document file. ಪ್ರತಿ file JSON-like ಆಗಿರಬಹುದು, fields flexible.', focus: 'documents, collections, BSON types, flexible schema, embedded data, ObjectId', practice: 'student document JSON ಬರೆಯಿರಿ with nested address and scores' },
  { id: 'm4-t14', name: 'CRUD operations', analogy: 'ದಾಖಲೆ ಕೊಠಡಿಯಲ್ಲಿ ಹೊಸ file ಸೇರಿಸುವುದು Create, ಹುಡುಕುವುದು Read, edit Update, ತೆಗೆಯುವುದು Delete.', focus: 'insertOne, find, updateOne/updateMany, deleteOne/deleteMany, filters, operators', practice: 'Mongo shell style insert/find/update/delete commands ಬರೆಯಿರಿ' },
  { id: 'm4-t15', name: 'Aggregation framework', analogy: 'factory pipeline ನಲ್ಲಿ first filter, then group, then reshape. Mongo aggregation stages data documents ಅನ್ನು step-by-step transform ಮಾಡುತ್ತವೆ.', focus: '$match, $group, $project, $sort, $lookup, pipeline order, accumulators', practice: 'orders collection ನಲ್ಲಿ status match ಮಾಡಿ customer by total group pipeline ಬರೆಯಿರಿ' },
  { id: 'm4-t16', name: 'Schema design patterns', analogy: 'family details ಒಂದೇ file ಒಳಗೆ ಹಾಕಬೇಕಾ ಅಥವಾ ಬೇರೆ file reference ಮಾಡಬೇಕಾ? Embed fast reads; reference flexible updates.', focus: 'embed vs reference, one-to-few/many/squillions, duplication, query patterns, document size limit', practice: 'blog post + comments schemaಗೆ embed/reference decision ತೆಗೆದುಕೊಳ್ಳಿ' },
  { id: 'm4-t17', name: 'Indexes & performance', analogy: 'Mongo collection ಗೆ index ಅಂದರೆ shop catalogue. ಇಲ್ಲದಿದ್ದರೆ ಪ್ರತಿಯೊಂದು shelf scan; index ಇದ್ದರೆ direct item.', focus: 'single/compound indexes, explain plans, selectivity, write overhead, TTL/text/geospatial indexes', practice: 'users collection ಗೆ email unique index ಮತ್ತು created_at index ಯಾವಾಗ ಬೇಕು note ಮಾಡಿ' },
  { id: 'm4-t18', name: 'Working with JSON data', analogy: 'courier package ಒಳಗೆ nested boxes ಇರುವಂತೆ JSON objects/lists ಒಳಗೆ data nested. Dot notation ಬಳಸಿ ಒಳಗಿನ field ತಲುಪಬಹುದು.', focus: 'JSON objects/arrays, nested fields, dot notation, flattening, normalizing, API responses', practice: 'nested API JSON ಅನ್ನು Pandas `json_normalize` ಗೆ map ಮಾಡಿ' },
  { id: 'm4-t19', name: 'Power BI Desktop tour', analogy: 'Power BI ಒಂದು reporting workshop: data import room, model room, report canvas, publish door. ಪ್ರತಿ pane ಗೆ ತನ್ನ ಕೆಲಸ.', focus: 'Power Query, model view, report view, visualizations pane, relationships, publish workflow', practice: 'Power BI screen areas list ಮಾಡಿ each purpose ಬರೆಯಿರಿ' },
  { id: 'm4-t20', name: 'Data modeling & relationships', analogy: 'retail shop ನಲ್ಲಿ sales fact table ಮಧ್ಯದಲ್ಲಿ, customers/products/date dimension tables ಸುತ್ತಲೂ star schema ಆಗಿರುತ್ತವೆ.', focus: 'fact/dimension tables, star schema, relationships, cardinality, filter direction, date table', practice: 'sales model ಗೆ fact_sales, dim_customer, dim_product, dim_date design ಮಾಡಿ' },
  { id: 'm4-t21', name: 'DAX functions', analogy: 'Excel formula ತರಹ ಆದರೆ filter context ಅರಿತ formula language DAX. `CALCULATE` context ಬದಲಿಸುವ master switch.', focus: 'measures, calculated columns, CALCULATE, FILTER, RELATED, context, row vs filter context', practice: '`Total Sales`, `Sales LY`, `Profit Margin` measures outline ಮಾಡಿ' },
  { id: 'm4-t22', name: 'Building dashboards', analogy: 'control room wall ಮೇಲೆ KPI cards, trend charts, filters ಸರಿಯಾಗಿ ಇಟ್ಟರೆ manager decision ಬೇಗ ತೆಗೆದುಕೊಳ್ಳುತ್ತಾನೆ.', focus: 'visual selection, slicers, layout, KPI cards, interactions, drilldowns, publishing', practice: 'sales dashboard layout sketch ಮಾಡಿ: top KPIs, trend, region, product' },
  { id: 'm4-t23', name: 'Slicers & drill-through', analogy: 'restaurant menu filter ನಲ್ಲಿ veg/non-veg ಆಯ್ಕೆ slicer; dish click ಮಾಡಿ details page ಗೆ ಹೋಗುವುದು drill-through.', focus: 'slicers, filters, cross-filtering, drill-through pages, bookmarks, user interaction', practice: 'region slicer ಮತ್ತು customer detail drill-through flow design ಮಾಡಿ' },
  { id: 'm4-t24', name: 'Time intelligence in DAX', analogy: 'ಈ ತಿಂಗಳ sales ಅನ್ನು last month, last year, YTD ಜೊತೆ compare ಮಾಡುವುದು shop owner ನ daily habit. DAX time intelligence ಅದನ್ನು formal ಮಾಡುತ್ತದೆ.', focus: 'date table, YTD/MTD/QTD, SAMEPERIODLASTYEAR, DATEADD, rolling periods', practice: 'YTD sales ಮತ್ತು YoY growth measures pseudo-DAX ಬರೆಯಿರಿ' },
  { id: 'm4-t25', name: 'Hadoop ecosystem overview', analogy: 'ಒಂದು ದೊಡ್ಡ godown ಕೆಲಸವನ್ನು ಹಲವಾರು workers ಮತ್ತು shelves ಗೆ ಹಂಚಿದಂತೆ Hadoop big data ಅನ್ನು distributed machines ಮೇಲೆ ಇಡುತ್ತದೆ/ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತದೆ.', focus: 'HDFS, MapReduce, YARN, Hive, Pig, HBase, distributed storage/compute', practice: 'Hadoop ecosystem components table ಮಾಡಿ purpose ಬರೆಯಿರಿ' },
  { id: 'm4-t26', name: 'HDFS architecture', analogy: 'ದೊಡ್ಡ movie file ಅನ್ನು blocks ಆಗಿ ಕತ್ತರಿಸಿ ಹಲವಾರು warehouses ನಲ್ಲಿ duplicate copies ಇಡುವಂತೆ HDFS fault-tolerant storage.', focus: 'NameNode, DataNodes, blocks, replication, rack awareness, fault tolerance', practice: '1GB file 128MB blocks and replication=3 ಆಗಿ ಎಷ್ಟು block copies ಎಂದು ಲೆಕ್ಕ ಹಾಕಿ' },
  { id: 'm4-t27', name: 'MapReduce paradigm', analogy: 'ದೇಶದ ಎಲ್ಲಾ schools marks count ಮಾಡಲು ಪ್ರತಿ district locally count ಮಾಡಿ ನಂತರ state office totals ಸೇರಿಸುವಂತೆ MapReduce ಕೆಲಸ ಹಂಚುತ್ತದೆ.', focus: 'map, shuffle, reduce, key-value pairs, distributed batch processing, word count', practice: 'word count MapReduce steps ಕೈಯಿಂದ trace ಮಾಡಿ' },
  { id: 'm4-t28', name: 'Apache Spark fundamentals', analogy: 'MapReduce ಪ್ರತಿಸಾರಿ disk ಗೆ ಹೋಗುವ slow courier; Spark memory ನಲ್ಲಿ worktable ಇಟ್ಟು repeated analysis fast ಮಾಡುತ್ತದೆ.', focus: 'Spark driver/executors, lazy evaluation, transformations/actions, DataFrames, in-memory compute', practice: 'Spark job flow: read -> filter -> groupBy -> action sketch ಮಾಡಿ' },
  { id: 'm4-t29', name: 'Spark RDD operations', analogy: 'ದೊಡ್ಡ list ಅನ್ನು cluster ಮೇಲೆ ಹಂಚಿ map/filter/reduce operations ಮಾಡುವಂತೆ RDD low-level distributed collection.', focus: 'RDDs, map/filter/flatMap/reduceByKey, partitions, lineage, caching', practice: 'RDD word count pseudo-code ಬರೆಯಿರಿ' },
  { id: 'm4-t30', name: 'Spark SQL & DataFrames', analogy: 'distributed Excel table ಮೇಲೆ SQL queries run ಮಾಡುವಂತೆ Spark DataFrames structured big data analysis ಕೊಡುತ್ತವೆ.', focus: 'SparkSession, DataFrames, Spark SQL, Catalyst optimizer, schema, joins/aggregations', practice: 'CSV read ಮಾಡಿ groupBy aggregation pseudo-PySpark ಬರೆಯಿರಿ' },
  { id: 'm4-t31', name: 'Stationarity & differencing', analogy: 'river water level constantly rising ಇದ್ದರೆ average stable ಅಲ್ಲ. Differencing rise remove ಮಾಡಿ changes series ನೋಡುತ್ತದೆ.', focus: 'stationarity, trend, unit root intuition, differencing, ADF test, train/test time order', practice: 'sales series ಗೆ first difference compute ಮಾಡಿ trend ಕಡಿಮೆಯಾಯಿತೇ ನೋಡಿ' },
  { id: 'm4-t32', name: 'Moving averages & smoothing', analogy: 'daily noisy temperature ನೋಡಲು 7-day average ತೆಗೆದರೆ pattern smooth ಆಗುತ್ತದೆ. Smoothing noise ಕಡಿಮೆ ಮಾಡಿ signal ತೋರಿಸುತ್ತದೆ.', focus: 'simple moving average, exponential smoothing, window size, lag, trend/seasonality smoothing', practice: '7-day ಮತ್ತು 30-day moving averages compare ಮಾಡಿ' },
  { id: 'm4-t33', name: 'ARIMA models', analogy: 'ನಾಳೆಯ sales ಇಂದು ಮತ್ತು ಹಿಂದಿನ errors ಆಧಾರವಾಗಿ predict ಮಾಡುವ disciplined accountant. ARIMA past values + differencing + error correction ಬಳಸುತ್ತದೆ.', focus: 'AR, I, MA terms, p/d/q, ACF/PACF intuition, residual diagnostics, SARIMA', practice: 'ARIMA(p,d,q) ನಲ್ಲಿ p,d,q meaning mnemonic ಬರೆಯಿರಿ' },
  { id: 'm4-t34', name: 'Seasonal decomposition', analogy: 'ಒಂದು song ಅನ್ನು bass trend, drums seasonality, crowd noise residual tracks ಆಗಿ ಬೇರ್ಪಡಿಸುವಂತೆ decomposition time series split ಮಾಡುತ್ತದೆ.', focus: 'trend, seasonal, residual, additive vs multiplicative, STL, diagnostic plots', practice: 'monthly sales series ಗೆ trend/seasonal/residual interpretation ಬರೆಯಿರಿ' },
  { id: 'm4-t35', name: 'Multivariate time series', analogy: 'GDP, inflation, unemployment, interest rate ಒಂದಕ್ಕೊಂದು feedback ಕೊಡುತ್ತವೆ. ಒಂದೊಂದಾಗಿ model ಮಾಡಿದರೆ ಸಂಬಂಧ miss ಆಗುತ್ತದೆ.', focus: 'multiple series, VAR, VECM, cointegration, lookahead leakage, deep sequence models', practice: '3 related metrics ಗೆ lag features and no-random-split rule note ಮಾಡಿ' },
  { id: 'm4-t36', name: 'Connecting & shaping data', analogy: 'photo studio ನಲ್ಲಿ raw negatives ಮೊದಲು clean, crop, rotate ಆಗಬೇಕು; Tableau dashboard ಮುಂಚೆ data source pane ನಲ್ಲಿ data shape ಆಗಬೇಕು.', focus: 'Tableau connectors, data source pane, rename/type/split/pivot/union/join, live vs extract', practice: 'CSV + customer table connect/shape steps list ಮಾಡಿ' },
  { id: 'm4-t37', name: 'Building dashboards', analogy: 'art gallery curator 50 paintings ನಿಂದ 6 ಮಾತ್ರ ಆರಿಸಿ coherent wall layout ಮಾಡುತ್ತಾನೆ. Dashboard ಕೂಡ fewer focused worksheets ಬೇಕು.', focus: 'worksheets, dashboards, tiled containers, actions, filters, device layouts, responsive design', practice: '4-chart Tableau dashboard layout and interactions sketch ಮಾಡಿ' },
  { id: 'm4-t38', name: 'Calculated fields & parameters', analogy: 'photographer darkroom ನಲ್ಲಿ raw photo ಮೇಲೆ derived effects; parameters adjustable lens. LoD expressions chart grain ಮೀರಿದ calculation ಕೊಡುತ್ತವೆ.', focus: 'calculated fields, parameters, IF/CASE, aggregate calcs, LoD FIXED/INCLUDE/EXCLUDE', practice: 'Profit Ratio calc ಮತ್ತು threshold parameter design ಮಾಡಿ' },
  { id: 'm4-t39', name: 'Polygon & symbol maps', analogy: 'city-level incidents ಗೆ circle points symbol map; state-level totals ಗೆ filled state polygon map. Story ಅನುಸಾರ map type ಆಯ್ಕೆ.', focus: 'geographic roles, symbol maps, choropleth/polygon maps, shapefiles, dual-axis maps, density maps', practice: 'sales by city vs sales by state ಗೆ map type choose ಮಾಡಿ' },
  { id: 'm4-t40', name: 'Storytelling with dashboards', analogy: 'journalist headline ಮೊದಲು ಹೇಳುತ್ತಾನೆ, ನಂತರ evidence, cause, action. Dashboard ಕೂಡ wall of charts ಅಲ್ಲ; decision story.', focus: 'headline insight, narrative arc, context, comparison, action, Tableau story points', practice: 'dashboard story outline: headline -> where -> why -> trend -> action ಬರೆಯಿರಿ' },
];

const module4Translations = Object.fromEntries(
  module4TopicSeeds.map((topic) => [
    topic.id,
    {
      explain:
        `**${topic.name}** Data Visualization & Analysis module ನಲ್ಲಿ practical analytics skill. ಇಲ್ಲಿ ನೀವು data ಅನ್ನು ಕೇಳುವುದು, shape ಮಾಡುವುದು, summarize ಮಾಡುವುದು, ಮತ್ತು decision-maker ಗೆ ಸರಿಯಾದ visual story ಆಗಿ ತೋರಿಸುವುದು ಕಲಿಯುತ್ತೀರಿ. ${topic.focus}.`,
      analogy:
        `**ಉದಾಹರಣೆ:**\n${topic.analogy}\n\nಈ concept ನ heart: data ದೊಡ್ಡದಾಗಿರಬಹುದು, messy ಆಗಿರಬಹುದು, ಬೇರೆ systems ನಲ್ಲಿ ಇರಬಹುದು. Analyst ಕೆಲಸ ಎಂದರೆ ಅದನ್ನು ಸರಿಯಾದ ಪ್ರಶ್ನೆಗೆ ಸರಿಯಾದ ರೂಪದಲ್ಲಿ ತರಬೇಕು.`,
      theory:
        `**WHY:** ${topic.name} ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ data ಇದ್ದರೂ insight ಸಿಗುವುದಿಲ್ಲ. SQL raw tables ನಿಂದ answer ಎಳೆಯುತ್ತದೆ; Mongo/JSON semi-structured data handle ಮಾಡುತ್ತದೆ; BI tools dashboards ಮಾಡುತ್ತವೆ; big-data/time-series tools scale ಮತ್ತು time-order respect ಮಾಡುತ್ತವೆ.\n\n` +
        `**HOW:** ಮೊದಲು grain ಕೇಳಿ: row ಏನನ್ನು represent ಮಾಡುತ್ತದೆ? ನಂತರ keys, filters, time range, and aggregation decide ಮಾಡಿ. ${topic.focus} ಅನ್ನು small sample ಮೇಲೆ verify ಮಾಡಿ, ನಂತರ full dataset/dashboard ಗೆ apply ಮಾಡಿ.\n\n` +
        `**Professional lens:** correct result + explainable query + readable dashboard. Fast chart ಮಾತ್ರ ಸಾಕಾಗುವುದಿಲ್ಲ; stakeholder ಏನು action ತೆಗೆದುಕೊಳ್ಳಬೇಕು ಎಂದು clear ಆಗಬೇಕು.`,
      whyItMatters:
        `ಪ್ರತಿ data analyst, BI developer, ML engineer role ನಲ್ಲಿ ${topic.name} ಬಳಕೆ ಬರುತ್ತದೆ. Interview ನಲ್ಲಿ SQL joins/window functions, dashboard design, data modeling, ಅಥವಾ time-series hygiene ಕೇಳುತ್ತಾರೆ. ತಪ್ಪಾದ aggregation ಅಥವಾ join ಒಂದು business decision ತಪ್ಪಾಗಿಸುವಷ್ಟು serious.`,
      steps: [
        `ಮೊದಲು ${topic.name} ಯಾವ problem solve ಮಾಡುತ್ತದೆ ಎಂದು one-line note ಮಾಡಿ.`,
        'Sample data/table/schema ನೋಡಿ grain, keys, date column, and metric identify ಮಾಡಿ.',
        `Core practice ಮಾಡಿ: ${topic.practice}.`,
        'Output row count ಮತ್ತು totals sanity-check ಮಾಡಿ; source total ಜೊತೆ compare ಮಾಡಿ.',
        'Edge case ನೋಡಿ: NULLs, duplicates, unmatched keys, empty groups, or future dates.',
        'Final result ಅನ್ನು clear label/title ಜೊತೆ communicate ಮಾಡಿ.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Join/aggregation ನಂತರ row count check ಮಾಡದೆ result trust ಮಾಡುವುದು. Row explosion ಅಥವಾ row loss common.',
        '**ಸಮಸ್ಯೆ.** NULL values ಅನ್ನು zero ಅಂತ assume ಮಾಡುವುದು. Missing, not applicable, and zero ಬೇರೆ ಬೇರೆ.',
        '**ತಪ್ಪು.** Dashboard ನಲ್ಲಿ too many charts ಹಾಕುವುದು. One page one story; extra charts decision slow ಮಾಡುತ್ತವೆ.',
        '**ಸಮಸ್ಯೆ.** Time-series data ಗೆ random split/sort ಮಾಡುವುದು. Time order preserve ಮಾಡಿ.',
        '**ತಪ್ಪು.** Query readable ಇರದಂತೆ nested monsters ಬರೆಯುವುದು. CTEs, aliases, comments ಬಳಸಿ.',
      ],
      tryIt:
        `${topic.practice}. ನಂತರ result ಗೆ 3 sanity checks ಬರೆಯಿರಿ: row count, total metric, and one manual example. ಈಗ extend ಮಾಡಿ - same answer ಅನ್ನು stakeholder-friendly sentence ಆಗಿ ಬರೆಯಿರಿ: "We found X because Y, so action Z."`,
      takeaway:
        `${topic.name} ಗೆ rule: **grain ತಿಳಿ, keys verify ಮಾಡಿ, totals check ಮಾಡಿ, story ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ**.`,
    },
  ]),
);

const module5TopicSeeds = [
  { id: 'm5-t1', name: 'Neural network basics', analogy: 'ದೋಸೆ quality judge ಮಾಡುವ panel ಯೋಚಿಸಿ. ಪ್ರತಿ judge crispiness, masala, browning ಗೆ weights ಕೊಡುತ್ತಾನೆ; layers stacked ಆದಾಗ final decision ಬರುತ್ತದೆ.', focus: 'neurons, weights, bias, activations, layers, function approximation', practice: 'ಒಂದು neuron formula `activation(w*x + b)` ಅನ್ನು two inputs ಜೊತೆ ಕೈಯಿಂದ calculate ಮಾಡಿ' },
  { id: 'm5-t2', name: 'Forward & backward propagation', analogy: 'archery coach arrow miss ಆದ ನಂತರ shoulder, bow angle, release timing ಎಲ್ಲಿಗೆ ಎಷ್ಟು blame ಎಂದು trace ಮಾಡುವಂತೆ backprop gradients trace ಮಾಡುತ್ತದೆ.', focus: 'forward pass, loss, chain rule, gradients, backward pass, optimizer step', practice: 'prediction -> loss -> gradient -> weight update flow diagram ಬರೆಯಿರಿ' },
  { id: 'm5-t3', name: 'Optimizers: SGD, Adam, RMSProp', analogy: 'ಮಂಜಿನ ಬೆಟ್ಟದಲ್ಲಿ lowest point ಹುಡುಕುವ hiker. SGD fixed step, momentum rolling speed, RMSProp per-direction caution, Adam ಎರಡನ್ನೂ combine.', focus: 'gradient descent, learning rate, momentum, adaptive learning rates, Adam defaults', practice: 'learning rate too high/low symptoms table ಮಾಡಿ' },
  { id: 'm5-t4', name: 'Convolutional Neural Networks (CNN)', analogy: 'transparent stencil ಅನ್ನು image ಮೇಲೆ slide ಮಾಡಿ edge/corner match ಕಂಡು feature map ಮಾಡುವಂತೆ CNN filters image patterns ಕಲಿಯುತ್ತವೆ.', focus: 'convolution filters, kernels, feature maps, pooling, hierarchy, parameter sharing', practice: '3x3 filter image ಮೇಲೆ slide ಆಗುವ sketch ಮಾಡಿ' },
  { id: 'm5-t5', name: 'Recurrent Neural Networks (RNN)', analogy: 'mystery novel page-by-page ಓದುವಾಗ hidden summary carry ಮಾಡುವ reader. RNN sequence steps ಗೆ memory ಇಟ್ಟು update ಮಾಡುತ್ತದೆ.', focus: 'sequences, hidden state, recurrent weights, vanishing gradients, text/time-series use', practice: 'sentence tokens process ಆಗುವ hidden-state chain draw ಮಾಡಿ' },
  { id: 'm5-t6', name: 'LSTM & GRU', analogy: 'meeting assistant filing cabinet ಜೊತೆ forget/input/output gates ಬಳಸಿ important facts ಉಳಿಸುವಂತೆ LSTM long memory handle ಮಾಡುತ್ತದೆ.', focus: 'gates, cell state, forget/input/output gates, GRU update/reset gates, long dependencies', practice: 'LSTM gates ಅನ್ನು remember/forget/share columns ಆಗಿ note ಮಾಡಿ' },
  { id: 'm5-t7', name: 'Regularization: dropout, batch norm', analogy: 'cricket practice ನಲ್ಲಿ star players random bench ಮಾಡಿದರೆ team robust; BatchNorm coach ಎಲ್ಲರ warm-up baseline normalize ಮಾಡುತ್ತಾನೆ.', focus: 'dropout, batch normalization, overfitting reduction, weight decay, augmentation', practice: 'dropout train vs inference behavior explain ಮಾಡಿ' },
  { id: 'm5-t8', name: 'Tensors & autograd', analogy: 'notepad ಇರುವ smart calculator ಪ್ರತಿಯೊಂದು operation ಬರೆಯುತ್ತದೆ; `.backward()` ಹೇಳಿದರೆ reverse ಆಗಿ gradients ಕೊಡುತ್ತದೆ.', focus: 'torch.Tensor, GPU tensors, requires_grad, computational graph, backward, gradients', practice: 'small tensor expression ಗೆ manual gradient compare ಮಾಡಿ' },
  { id: 'm5-t9', name: 'Building Linear / Logistic Regression', analogy: 'chai vendor tomorrow sales amount predict ಮಾಡಿದರೆ linear; rainy yes/no probability predict ಮಾಡಿದರೆ logistic. PyTorch ನಲ್ಲಿ skeleton same.', focus: 'nn.Module, forward method, MSE, cross-entropy, training loop, zero_grad', practice: 'PyTorch training loop steps list ಮಾಡಿ' },
  { id: 'm5-t10', name: 'CNNs in PyTorch', analogy: 'layered cake recipe ನಿಮ್ಮ kitchen ನಲ್ಲಿ assemble ಮಾಡುವಂತೆ PyTorch CNN ನಲ್ಲಿ layers `__init__`, wiring `forward` ನಲ್ಲಿ.', focus: 'Conv2d, MaxPool2d, channels-first NCHW, torchvision transforms, pretrained models', practice: 'NCHW shape for batch of 32 RGB 224x224 images ಬರೆಯಿರಿ' },
  { id: 'm5-t11', name: 'RNN & LSTM in PyTorch', analogy: 'different length trains ಗೆ dummy wagons padding; packing tag ಹಾಕಿದರೆ inspector real wagons ಮಾತ್ರ ನೋಡುತ್ತಾನೆ.', focus: 'nn.RNN/GRU/LSTM, batch_first, padding, packing, hidden states', practice: 'three sentence lengths pad/pack flow sketch ಮಾಡಿ' },
  { id: 'm5-t12', name: 'Training on GPU (CUDA)', analogy: 'ಒಬ್ಬ chef CPU; 50 helpers GPU. Matrix multiplications parallel kitchen ನಲ್ಲಿ fast.', focus: 'cuda availability, moving model/data to device, mixed precision, memory errors, torch.compile', practice: '`device = cuda if available else cpu` pattern ಬರೆಯಿರಿ' },
  { id: 'm5-t13', name: 'Saving & loading models', analogy: 'trained cook recipe notebook save ಮಾಡದಿದ್ದರೆ ನಾಳೆ ಮತ್ತೆ training. Model weights checkpoint future reuse ಕೊಡುತ್ತದೆ.', focus: 'state_dict, checkpoints, optimizer state, inference loading, versioning', practice: 'save/load checkpoint steps ಬರೆಯಿರಿ' },
  { id: 'm5-t14', name: 'Sequential API', analogy: 'idli batter -> steamer -> plate ತರಹ layers straight line ಆಗಿ ಹೋಗುವ network ಗೆ Sequential API clean.', focus: 'Keras Sequential, layer stack, compile, fit, simple feed-forward models', practice: 'Dense-ReLU-Dense Sequential model outline ಮಾಡಿ' },
  { id: 'm5-t15', name: 'Functional API', analogy: 'hotel kitchen ನಲ್ಲಿ two inputs, shared sauce, multiple outputs ಇದ್ದರೆ simple line ಸಾಲದು. Functional API graph design ಮಾಡುತ್ತದೆ.', focus: 'multi-input/multi-output models, branching, shared layers, model graph', practice: 'text input + numeric input model graph draw ಮಾಡಿ' },
  { id: 'm5-t16', name: 'Custom callbacks', analogy: 'training coach every epoch score ನೋಡಿ early stop, save best, learning rate adjust ಮಾಡುತ್ತಾನೆ. Callback training ಮಧ್ಯೆ intervene ಮಾಡುತ್ತದೆ.', focus: 'callbacks, EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, custom hooks', practice: 'validation loss improve ಆಗದಿದ್ದರೆ stop callback behavior note ಮಾಡಿ' },
  { id: 'm5-t17', name: 'Batch normalization', analogy: 'ಪ್ರತಿ class ಮುಂಚೆ students energy level normalize ಮಾಡಿದರೆ teacher next lesson stable ಆಗಿ teach ಮಾಡಬಹುದು.', focus: 'activation normalization, batch statistics, running mean/var, training vs inference, faster training', practice: 'BatchNorm train/inference difference table ಮಾಡಿ' },
  { id: 'm5-t18', name: 'Transfer learning', analogy: 'experienced chef ಗೆ ಹೊಸ restaurant menu ಕಲಿಸುವುದು fresh trainee ಗಿಂತ ವೇಗ. Pretrained model ಅನ್ನು new task ಗೆ fine-tune ಮಾಡುವುದು transfer learning.', focus: 'pretrained backbones, freezing layers, fine-tuning heads, small data, image/NLP reuse', practice: 'ResNet backbone freeze + classifier head workflow ಬರೆಯಿರಿ' },
  { id: 'm5-t19', name: 'Tokenization & lemmatization', analogy: 'sentence ಅನ್ನು words/tokens ಆಗಿ ಕತ್ತರಿಸಿ dictionary root form ಗೆ ತರುವುದು library catalog clean ಮಾಡುವಂತೆ.', focus: 'tokens, word/subword tokenization, lemmatization, vocabulary, OOV handling', practice: 'one sentence tokenize ಮಾಡಿ verbs lemma ರೂಪಕ್ಕೆ convert ಮಾಡಿ' },
  { id: 'm5-t20', name: 'Stemming & stopwords', analogy: 'ಮರದ ಕೊಂಬೆ ಕತ್ತರಿಸಿ stem ಉಳಿಸುವಂತೆ stemming; “the/is/and” ತರಹ filler words remove ಮಾಡುವುದು stopwords.', focus: 'stemming, stopword removal, aggressive normalization, search/text classification tradeoffs', practice: 'small paragraph ನಲ್ಲಿ stopwords remove ಮಾಡಿ stemmed tokens list ಮಾಡಿ' },
  { id: 'm5-t21', name: 'Bag-of-words & TF-IDF', analogy: 'document ಒಂದು grocery bag: ಯಾವ words ಎಷ್ಟು ಬಾರಿ ಬಂದಿವೆ. TF-IDF common words ಕಡಿಮೆ weight, distinctive words ಹೆಚ್ಚು weight ಕೊಡುತ್ತದೆ.', focus: 'count vectors, vocabulary, term frequency, inverse document frequency, sparse matrices', practice: '3 documents ಮೇಲೆ word counts and TF-IDF intuition compute ಮಾಡಿ' },
  { id: 'm5-t22', name: 'KNN & K-Means for document retrieval', analogy: 'similar documents library shelf ನಲ್ಲಿ ಹತ್ತಿರ; KNN nearest docs ತರುತ್ತದೆ, K-Means similar docs clusters ಮಾಡುತ್ತದೆ.', focus: 'document vectors, nearest neighbours, clustering, cosine similarity, retrieval use cases', practice: '5 document titles ಅನ್ನು topic clusters ಆಗಿ group ಮಾಡಿ' },
  { id: 'm5-t23', name: 'Cosine similarity', analogy: 'ಎರಡು arrows ಒಂದೇ direction ನೋಡಿದರೆ similar, length ಬೇರೆ ಇದ್ದರೂ. Cosine similarity direction compare ಮಾಡುತ್ತದೆ.', focus: 'vector angle, normalized dot product, embeddings similarity, text retrieval', practice: 'two simple vectors ಗೆ cosine manually calculate ಮಾಡಿ' },
  { id: 'm5-t24', name: 'Sentiment analysis', analogy: 'customer review ಓದಿ positive/negative/neutral mood score ಕೊಡುವ shop manager ತರಹ sentiment model.', focus: 'text classification, polarity, labels, datasets, evaluation, sarcasm/domain issues', practice: '10 reviews manually label ಮಾಡಿ model errors ಯಾವಾಗ ಆಗಬಹುದು note ಮಾಡಿ' },
  { id: 'm5-t25', name: 'BERT for classification', analogy: 'language scholar full sentence context ಓದಿ intent/sentiment label ಕೊಡುತ್ತಾನೆ. BERT [CLS] representation ಮೇಲೆ classifier head.', focus: 'BERT encoder, [CLS] token, fine-tuning, attention masks, tokenization, classification head', practice: 'BERT classification pipeline inputs: ids, mask, labels list ಮಾಡಿ' },
  { id: 'm5-t26', name: 'GPT-3 text generation', analogy: 'ಅತ್ಯುತ್ತಮ autocomplete writer previous words ನೋಡಿ next word sample ಮಾಡುತ್ತಾ paragraph ಕಟ್ಟುತ್ತಾನೆ.', focus: 'next-token generation, prompts, temperature, top_p, max tokens, completions vs chat', practice: 'same prompt ಗೆ temperature low/high expected output compare ಮಾಡಿ' },
  { id: 'm5-t27', name: 'OpenCV basics', analogy: 'photo editing toolbox: read image, resize, crop, grayscale, draw boxes. OpenCV computer vision ಗೆ basic toolkit.', focus: 'cv2 read/write, BGR vs RGB, resizing, drawing, image arrays, video capture', practice: 'image load -> grayscale -> resize -> save steps ಬರೆಯಿರಿ' },
  { id: 'm5-t28', name: 'Image processing: filtering, thresholding', analogy: 'photo ಮೇಲೆ sieve ಹಾಕಿ noise smooth ಮಾಡುವುದು filter; light/dark cutoff ಹಾಕಿ object separate ಮಾಡುವುದು threshold.', focus: 'blur filters, kernels, thresholding, morphological ops, preprocessing', practice: 'grayscale image threshold ಮಾಡಿದರೆ binary mask ಹೇಗೆ ಸಿಗುತ್ತದೆ explain ಮಾಡಿ' },
  { id: 'm5-t29', name: 'Edge detection (Canny)', analogy: 'drawing ನಲ್ಲಿ object border pencil outline ಹಿಡಿಯುವಂತೆ Canny strong gradients ಅನ್ನು edges ಆಗಿ detect ಮಾಡುತ್ತದೆ.', focus: 'gradients, non-max suppression, hysteresis thresholds, edges, preprocessing blur', practice: 'Canny low/high threshold effect note ಮಾಡಿ' },
  { id: 'm5-t30', name: 'CNN for image classification', analogy: 'image inspector edges -> textures -> parts -> object label hierarchy ಕಲಿಯುತ್ತಾನೆ. CNN final class probability ಕೊಡುತ್ತದೆ.', focus: 'image datasets, conv blocks, augmentation, train/val split, softmax, evaluation', practice: 'cats/dogs classifier pipeline outline ಮಾಡಿ' },
  { id: 'm5-t31', name: 'YOLO object detection', analogy: 'traffic camera ಒಂದೇ glance ನಲ್ಲಿ cars, bikes, people boxes draw ಮಾಡುವಂತೆ YOLO single pass detection.', focus: 'bounding boxes, classes, confidence, IoU, NMS, real-time detection', practice: 'detection output fields: x,y,w,h,class,confidence list ಮಾಡಿ' },
  { id: 'm5-t32', name: 'Image segmentation (U-Net)', analogy: 'doctor scan ನಲ್ಲಿ ಪ್ರತಿಯೊಂದು pixel organ/tumor ಎಂದು color ಮಾಡುವಂತೆ segmentation pixel-level prediction.', focus: 'semantic segmentation, masks, encoder-decoder, skip connections, U-Net, Dice/IoU metrics', practice: 'input image -> mask output example draw ಮಾಡಿ' },
  { id: 'm5-t33', name: 'OpenAI Gym environments', analogy: 'game practice arena ನಲ್ಲಿ agent actions ತೆಗೆದು reward ಪಡೆಯುತ್ತಾನೆ. Gym standard reset/step interface ಕೊಡುತ್ತದೆ.', focus: 'environment, observation, action, reward, done, reset/step loop', practice: 'Gym loop pseudo-code: reset, action, step, reward accumulate ಮಾಡಿ' },
  { id: 'm5-t34', name: 'Markov Decision Processes', analogy: 'board game state ಈಗಿರುವ position; action move; reward score; next state probability. MDP RL problem formal language.', focus: 'states, actions, transition probabilities, rewards, policy, discount factor, Markov property', practice: 'tiny gridworld ಗೆ states/actions/rewards define ಮಾಡಿ' },
  { id: 'm5-t35', name: 'Monte Carlo methods', analogy: 'Ludo strategy value ತಿಳಿಯಲು game ಪೂರ್ಣವಾಗಿ ಹಲವಾರು ಬಾರಿ ಆಡಿಕೊಂಡು average reward ನೋಡುವಂತೆ Monte Carlo episodes average ಮಾಡುತ್ತದೆ.', focus: 'episodes, returns, sampling, first/every visit MC, high variance, no model needed', practice: 'three episode returns average ಮಾಡಿ state value estimate ಮಾಡಿ' },
  { id: 'm5-t36', name: 'Q-Learning', analogy: 'Ludo notebook ನಲ್ಲಿ state-action score table update ಮಾಡುತ್ತಾ best move ಕಲಿಯುವುದು Q-learning.', focus: 'Q-table, TD target, alpha, gamma, epsilon-greedy, off-policy learning', practice: 'Q update formula parts: old, reward, max next, learning rate label ಮಾಡಿ' },
  { id: 'm5-t37', name: 'Deep Q-Networks (DQN)', analogy: 'giant Q-table ಬದಲು neural network playground photo ನೋಡಿ action values predict ಮಾಡುತ್ತದೆ. Replay buffer old memories mix ಮಾಡುತ್ತದೆ.', focus: 'Q-network, experience replay, target network, TD loss, Atari breakthrough', practice: 'DQN training loop components list ಮಾಡಿ' },
  { id: 'm5-t38', name: 'Policy Gradient methods', analogy: 'cricket batsman shot probabilities adjust ಮಾಡುತ್ತಾನೆ: successful shots ಹೆಚ್ಚು likely, bad shots ಕಡಿಮೆ likely.', focus: 'policy optimization, REINFORCE, actor-critic, advantage, PPO clipped updates', practice: 'policy gradient intuition: log prob times advantage explain ಮಾಡಿ' },
  { id: 'm5-t39', name: 'Flask REST API for model serving', analogy: 'railway ticket clerk customer JSON slip ತೆಗೆದು backend reservation model query ಮಾಡಿ ticket JSON ಕೊಡುತ್ತಾನೆ.', focus: 'Flask routes, /predict endpoint, JSON validation, health checks, gunicorn, model loading', practice: '`/health` and `/predict` API contract ಬರೆಯಿರಿ' },
  { id: 'm5-t40', name: 'Dockerizing ML applications', analogy: 'Mumbai dabbawala tiffin ಒಳಗೆ full meal sealed; Docker image ಒಳಗೆ OS, Python, libraries, model, app sealed.', focus: 'Dockerfile, images, containers, pinned dependencies, layers, registry, reproducibility', practice: 'Dockerfile steps: base image, copy requirements, install, copy code, CMD list ಮಾಡಿ' },
  { id: 'm5-t41', name: 'AWS SageMaker', analogy: 'cloud kitchen ಗೆ recipe, ingredients, stove type ಕೊಟ್ಟರೆ SageMaker training job run ಮಾಡಿ model artifact save ಮಾಡುತ್ತದೆ.', focus: 'managed training, endpoints, model registry, S3, autoscaling, cost control', practice: 'SageMaker training + endpoint deployment steps outline ಮಾಡಿ' },
  { id: 'm5-t42', name: 'Azure ML', analogy: 'Microsoft cloud kitchen workspace ration card ತರಹ; compute, datasets, models, endpoints ಒಂದೇ workspace ಒಳಗೆ manage.', focus: 'Azure ML workspace, compute clusters, datasets, models, managed endpoints, AutoML, Designer', practice: 'Azure ML workspace assets list ಮಾಡಿ' },
  { id: 'm5-t43', name: 'CI/CD pipelines for ML', analogy: 'Parle-G biscuit factory QC belt: every commit lint, tests, data validation, quick train, eval gate pass ಆದರೆ deploy.', focus: 'GitHub Actions, CI tests, data schema checks, model evaluation gates, Docker build, canary deploy', practice: 'ML GitHub Actions workflow stages ಬರೆಯಿರಿ' },
  { id: 'm5-t44', name: 'Monitoring & drift detection', analogy: 'operation ನಂತರ patient vitals monitor ಮಾಡುವಂತೆ deployed model latency, input drift, accuracy decay monitor ಮಾಡಬೇಕು.', focus: 'latency/error monitoring, input drift, PSI, KS-test, accuracy decay, retraining alerts', practice: 'model monitoring dashboard metrics list ಮಾಡಿ' },
];

const module5Translations = Object.fromEntries(
  module5TopicSeeds.map((topic) => [
    topic.id,
    {
      explain:
        `**${topic.name}** AI Tools & Deployment module ನಲ್ಲಿ hands-on production skill. ಇಲ್ಲಿ neural networks, NLP/CV/RL tools, model serving, cloud deployment, CI/CD, monitoring ಎಲ್ಲವೂ ಒಂದೇ pipeline ಆಗಿ ಬರುತ್ತವೆ. ${topic.focus}.`,
      analogy:
        `**ಉದಾಹರಣೆ:**\n${topic.analogy}\n\nಈ module ನ core idea: model train ಮಾಡುವುದು ಮಾತ್ರ finish line ಅಲ್ಲ. Training, evaluation, serving, deployment, monitoring - ಎಲ್ಲವೂ ಒಟ್ಟಿಗೆ ML product ಆಗುತ್ತದೆ.`,
      theory:
        `**WHY:** ${topic.name} ತಿಳಿದರೆ notebook experiment ನಿಂದ real application ಗೆ ಹೋಗುವ bridge ಸಿಗುತ್ತದೆ. Deep learning concepts model ಹೇಗೆ ಕಲಿಯುತ್ತದೆ ಎಂದು ಹೇಳುತ್ತವೆ; frameworks implementation ಕೊಡುತ್ತವೆ; deployment topics users ಗೆ model ತಲುಪಿಸುತ್ತವೆ.\n\n` +
        `**HOW:** ಮೊದಲು problem type ಗುರುತಿಸಿ: tabular, image, text, sequence, reinforcement learning, ಅಥವಾ serving. ನಂತರ data pipeline, model architecture, loss/metric, training loop, and deployment boundary ಆಯ್ಕೆಮಾಡಿ. ${topic.focus} ಅನ್ನು small working example ಮೇಲೆ practice ಮಾಡಿ.\n\n` +
        `**Production lens:** reproducibility, versioning, latency, cost, security, and drift monitoring ಇಲ್ಲದ model demo ಮಾತ್ರ. Real ML system ಗೆ rollback ಮತ್ತು observability ಬೇಕು.`,
      whyItMatters:
        `ಪ್ರತಿ AI/ML role ನಲ್ಲಿ ${topic.name} ಸಂಬಂಧಿತ practical question ಬರುತ್ತದೆ. "Model train ಆಯ್ತು, users ಗೆ ಹೇಗೆ serve ಮಾಡ್ತೀರಿ?", "GPU memory error ಹೇಗೆ debug?", "drift ಕಂಡರೆ ಏನು?" - ಇವುಗಳಿಗೆ answer ಬಂದರೆ ನೀವು project complete ಮಾಡುವ engineer ಆಗುತ್ತೀರಿ.`,
      steps: [
        `ಮೊದಲು ${topic.name} ನ input-output contract ಬರೆಯಿರಿ.`,
        'Small toy data ಅಥವಾ sample image/text/environment ಆಯ್ಕೆಮಾಡಿ.',
        `Core practice ಮಾಡಿ: ${topic.practice}.`,
        'Metric/validation check ಸೇರಿಸಿ; loss ಮಾತ್ರ ನೋಡಬೇಡಿ.',
        'Save/version/log ಮಾಡಿ: model params, data version, config, and result.',
        'Deployment ಅಥವಾ monitoring angle ಯೋಚಿಸಿ: API, Docker, cloud, CI, alert, or drift check.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Training loss ಕಡಿಮೆಯಾಗಿದೆ ಎಂದರೆ model good ಎಂದು assume ಮಾಡುವುದು. Validation/test metrics ನೋಡಿ.',
        '**ಸಮಸ್ಯೆ.** Device mismatch: model GPU ಮೇಲೆ, data CPU ಮೇಲೆ. Model ಮತ್ತು tensors same device ಗೆ move ಮಾಡಿ.',
        '**ತಪ್ಪು.** Random seeds, dependency versions, model checkpoint save ಮಾಡದೆ experiment repeat ಆಗದಂತೆ ಮಾಡುವುದು.',
        '**ಸಮಸ್ಯೆ.** Notebook-only model. API contract, input validation, Docker image, and monitoring ಇಲ್ಲದೆ production impossible.',
        '**ತಪ್ಪು.** Drift/latency/cost monitor ಮಾಡದೆ deploy ಮಾಡುವುದು. Model live ಆದಮೇಲೆ world ಬದಲಾಗುತ್ತಲೇ ಇರುತ್ತದೆ.',
      ],
      tryIt:
        `${topic.practice}. ನಂತರ same mini-project ಗೆ ಒಂದು production note ಸೇರಿಸಿ: data assumptions, metric, expected latency, failure mode, and monitoring signal. ಈಗ extend ಮಾಡಿ - result ಅನ್ನು reusable script ಅಥವಾ API step ಆಗಿ convert ಮಾಡುವ plan ಬರೆಯಿರಿ.`,
      takeaway:
        `${topic.name} ಗೆ rule: **train -> validate -> save -> serve -> monitor**. ಈ loop ಇಲ್ಲದೆ ML project ಪೂರ್ಣವಾಗುವುದಿಲ್ಲ.`,
    },
  ]),
);

const module6RemainingTopicSeeds = [
  { id: 'm6-t8', name: 'Binary trees', analogy: 'ಕುಟುಂಬ ವೃಕ್ಷದಲ್ಲಿ root ಹಿರಿಯರು, left/right ಮಕ್ಕಳು, leaves ಮಕ್ಕಳು ಇಲ್ಲದ nodes. ಪ್ರತಿ subtree ಕೂಡ ಮತ್ತೊಂದು tree.', focus: 'root, left/right child, leaves, height, recursion, traversal foundation', practice: 'ಒಂದು small tree draw ಮಾಡಿ height, leaves, root identify ಮಾಡಿ' },
  { id: 'm6-t9', name: 'Binary Search Trees (BST)', analogy: 'library catalogue middle card ನೋಡಿ left/right narrow ಮಾಡುವಂತೆ BST values compare ಮಾಡಿ search path ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.', focus: 'BST invariant, search/insert/delete, average O(log n), skewed tree O(n), in-order sorted output', practice: 'values insert ಮಾಡಿ in-order traversal sorted ಬರುತ್ತದೆಯೇ ನೋಡಿ' },
  { id: 'm6-t10', name: 'AVL self-balancing trees', analogy: 'ತಲೆಯ ಮೇಲೆ pot balancing ಮಾಡುವ dancer ಪ್ರತೀ step ನಂತರ tiny correction ಮಾಡುತ್ತಾಳೆ. AVL rotations tree balance ಇಡುತ್ತವೆ.', focus: 'balance factor, rotations LL/RR/LR/RL, worst-case O(log n), height maintenance', practice: 'LL/RR/LR/RL cases ಗೆ rotation direction table ಮಾಡಿ' },
  { id: 'm6-t11', name: 'B-Trees', analogy: 'ದೊಡ್ಡ telephone directory ನಲ್ಲಿ one key per page ಅಲ್ಲ; page ranges ಮತ್ತು sub-indexes. B-tree nodes many keys ಇಟ್ಟು disk seeks ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.', focus: 'multi-way search trees, database indexes, disk pages, B+ tree leaves, shallow height', practice: 'database index ಗೆ B-tree ಏಕೆ binary tree ಗಿಂತ better ಎಂದು 3 reasons ಬರೆಯಿರಿ' },
  { id: 'm6-t12', name: 'Tree traversals', analogy: 'ಮನೆಯ rooms visit order ಬದಲಾಗಿದರೆ story ಬದಲಾಗುತ್ತದೆ. Pre-order ಮೊದಲು parent, in-order ಮಧ್ಯದಲ್ಲಿ parent, post-order ಕೊನೆಯಲ್ಲಿ parent.', focus: 'in-order, pre-order, post-order, recursion, iterative traversal with stack', practice: 'ಒಂದು tree ಗೆ ಮೂರು traversal outputs ಕೈಯಿಂದ ಬರೆಯಿರಿ' },
  { id: 'm6-t13', name: 'BFS / DFS on trees', analogy: 'BFS school assembly rows level-by-level ನೋಡುತ್ತದೆ; DFS ಒಂದು branch ಮುಗಿಸಿ ನಂತರ ಹಿಂದಿರುಗುತ್ತದೆ.', focus: 'queue BFS, stack/recursion DFS, level order, depth search, time O(n)', practice: 'same tree ಮೇಲೆ BFS order ಮತ್ತು DFS order compare ಮಾಡಿ' },
  { id: 'm6-t14', name: 'Adjacency matrix vs adjacency list', analogy: 'ನಗರ roads map ಅನ್ನು full city grid table ಆಗಿ ಇಡಬಹುದು ಅಥವಾ ಪ್ರತಿ junction ಗೆ connected roads list ಆಗಿ ಇಡಬಹುದು.', focus: 'graph representation, matrix O(V^2), list O(V+E), sparse vs dense graphs', practice: '5-node graph ಅನ್ನು matrix ಮತ್ತು adjacency list ಎರಡರಲ್ಲೂ ಬರೆಯಿರಿ' },
  { id: 'm6-t15', name: 'BFS', analogy: 'ಒಂದು ನಗರದಿಂದ nearest places ಹುಡುಕಲು ಮೊದಲು 1-step neighbours, ನಂತರ 2-step, ನಂತರ 3-step ನೋಡಿದಂತೆ BFS.', focus: 'queue, visited set, shortest path in unweighted graphs, levels, O(V+E)', practice: 'unweighted graph ನಲ್ಲಿ shortest hops BFS trace ಮಾಡಿ' },
  { id: 'm6-t16', name: 'DFS', analogy: 'maze ನಲ್ಲಿ ಒಂದು ದಾರಿ ಹಿಡಿದು dead-end ಬರುವವರೆಗೆ ಹೋಗಿ ನಂತರ backtrack ಮಾಡುವ explorer DFS.', focus: 'recursion/stack, visited set, connected components, cycle detection, topological foundations', practice: 'graph connected components DFS ಮೂಲಕ count ಮಾಡಿ' },
  { id: 'm6-t17', name: "Dijkstra's shortest path", analogy: 'Google Maps positive road distances ಇದ್ದಾಗ nearest unvisited city lock ಮಾಡುತ್ತಾ shortest routes build ಮಾಡುವಂತೆ Dijkstra.', focus: 'weighted non-negative graphs, priority queue, relaxation, distances, no negative edges', practice: 'small weighted graph ಮೇಲೆ Dijkstra distance table trace ಮಾಡಿ' },
  { id: 'm6-t18', name: 'Bellman-Ford algorithm', analogy: 'ಪ್ರತಿ road ಅನ್ನು ಮತ್ತೆ ಮತ್ತೆ relax ಮಾಡಿ bad news slowly ಹರಡುವಂತೆ Bellman-Ford negative edges ಕೂಡ handle ಮಾಡುತ್ತದೆ.', focus: 'negative weights, V-1 relax rounds, negative cycle detection, slower than Dijkstra', practice: 'negative edge ಇರುವ graph ನಲ್ಲಿ Bellman-Ford rounds explain ಮಾಡಿ' },
  { id: 'm6-t19', name: 'Topological sort', analogy: 'course prerequisites ಇದ್ದರೆ ಮೊದಲು Python, ನಂತರ ML, ನಂತರ Deep Learning. Topological sort dependency order ಕೊಡುತ್ತದೆ.', focus: 'DAGs, indegree, Kahn algorithm, DFS ordering, cycle means impossible order', practice: 'tasks with prerequisites ಗೆ topo order list ಮಾಡಿ' },
  { id: 'm6-t20', name: 'Bubble sort & insertion sort', analogy: 'cards ಕೈಯಲ್ಲಿ arrange ಮಾಡುವ insertion sort; adjacent wrong pairs swap ಮಾಡುತ್ತಾ bubbles ಮೇಲಕ್ಕೆ ಹೋಗುವುದು bubble sort.', focus: 'simple O(n^2) sorts, stable behavior, nearly sorted data, educational value', practice: '5 numbers ಮೇಲೆ insertion sort passes ಕೈಯಿಂದ trace ಮಾಡಿ' },
  { id: 'm6-t21', name: 'Merge sort', analogy: 'books piles split ಮಾಡಿ small sorted piles, ನಂತರ ಎರಡು sorted piles merge ಮಾಡುವ library assistant.', focus: 'divide and conquer, stable O(n log n), merge step, O(n) extra space', practice: 'array split tree ಮತ್ತು merge passes draw ಮಾಡಿ' },
  { id: 'm6-t22', name: 'Quick sort', analogy: 'ಒಂದು pivot book ಆಯ್ಕೆ ಮಾಡಿ ಚಿಕ್ಕವು ಎಡ, ದೊಡ್ಡವು ಬಲ; ನಂತರ sub-piles ಮೇಲೆ repeat. Good pivot fast, bad pivot slow.', focus: 'partitioning, pivot choice, average O(n log n), worst O(n^2), in-place variants', practice: 'pivot first element ಆಯ್ಕೆ ಮಾಡಿದರೆ sorted input ಏಕೆ bad ಎಂದು explain ಮಾಡಿ' },
  { id: 'm6-t23', name: 'Heap sort', analogy: 'priority heap ಮಾಡಿ biggest/smallest item ತೆಗೆದು final sorted list ಕಟ್ಟುವುದು hospital triage priority sheet ತರಹ.', focus: 'heapify, repeated extract max/min, O(n log n), in-place, not stable', practice: 'array ಅನ್ನು max-heap ಆಗಿ heapify ಮಾಡಿ first extract trace ಮಾಡಿ' },
  { id: 'm6-t24', name: 'Time / space complexity (Big-O)', analogy: 'ಹಳ್ಳಿಯಿಂದ ನಗರಕ್ಕೆ ಹೋಗಲು ಜನರ ಸಂಖ್ಯೆ ಹೆಚ್ಚಾದಂತೆ time ಹೇಗೆ ಬೆಳೆಯುತ್ತದೆ? Big-O growth rate ಹೇಳುತ್ತದೆ, exact seconds ಅಲ್ಲ.', focus: 'O(1), O(log n), O(n), O(n log n), O(n^2), space complexity, worst/average/amortized', practice: 'common operations ಗೆ Big-O table ಮಾಡಿ' },
  { id: 'm6-t25', name: 'Linear search', analogy: 'ಒಂದು shelf ನಲ್ಲಿ book ಹುಡುಕಲು ಮೊದಲಿನಿಂದ ಕೊನೆಯವರೆಗೆ ಒಂದೊಂದೇ ನೋಡುವುದು linear search.', focus: 'sequential scan, O(n), works unsorted, early exit, simple baseline', practice: 'unsorted list ನಲ್ಲಿ target found/not found comparisons count ಮಾಡಿ' },
  { id: 'm6-t26', name: 'Binary search', analogy: 'dictionary middle page ತೆರೆದು word ಮುಂಚೆಯಾ ನಂತರವಾ ಎಂದು half discard ಮಾಡುವಂತೆ binary search.', focus: 'sorted data requirement, low/high/mid, O(log n), off-by-one bugs', practice: 'sorted array ಮೇಲೆ target ಹುಡುಕಲು low/high/mid trace ಮಾಡಿ' },
  { id: 'm6-t27', name: 'Hashing & hash tables', analogy: 'post office pin code letter ಅನ್ನು direct sorting bin ಗೆ ಹಾಕುತ್ತದೆ. Hash function key ಅನ್ನು bucket ಗೆ map ಮಾಡುತ್ತದೆ.', focus: 'hash functions, buckets, collisions, average O(1), dict/set implementation', practice: 'keys bucket modulo 10 ಗೆ map ಮಾಡಿ collisions note ಮಾಡಿ' },
  { id: 'm6-t28', name: 'Memoization (top-down)', analogy: 'math tuition ನಲ್ಲಿ solved problems notebook ಇಟ್ಟು ಮತ್ತೆ ಬಂದರೆ answer copy ಮಾಡುವುದು memoization.', focus: 'recursive DP, cache, overlapping subproblems, top-down, `lru_cache`', practice: 'Fibonacci recursion ಗೆ memo cache hits explain ಮಾಡಿ' },
  { id: 'm6-t29', name: 'Tabulation (bottom-up)', analogy: 'multiplication table ಚಿಕ್ಕ answers ಮೊದಲು ತುಂಬಿ ದೊಡ್ಡ answers build ಮಾಡುವಂತೆ tabulation.', focus: 'iterative DP table, base cases, order of filling, space optimization', practice: 'climbing stairs DP table fill ಮಾಡಿ' },
  { id: 'm6-t30', name: '0/1 Knapsack', analogy: 'Diwali sweets sealed boxes: ಪ್ರತಿಯೊಂದು box ತೆಗೆದುಕೊಳ್ಳಬೇಕು ಅಥವಾ ಬಿಡಬೇಕು; half box ಬೇಡ. Budget ಒಳಗೆ happiness maximize.', focus: 'items with weight/value, capacity, choose/skip recurrence, O(nW), pseudo-polynomial', practice: '3 items capacity 5 DP table ಕೈಯಿಂದ ತುಂಬಿ' },
  { id: 'm6-t31', name: 'Longest Common Subsequence (LCS)', analogy: 'ನೀವು ಮತ್ತು friend watched movies lists ನಲ್ಲಿ same order preserved movies ಹುಡುಕುವುದು LCS; ಮಧ್ಯೆ gaps ಇರಬಹುದು.', focus: 'subsequence vs substring, 2D DP, match/skip recurrence, diff/git/bioinformatics use', practice: 'ABCBDAB ಮತ್ತು BDCAB LCS table idea explain ಮಾಡಿ' },
  { id: 'm6-t32', name: 'Coin change & DP on grids', analogy: '₹37 pay ಮಾಡಲು minimum coins; grid ನಲ್ಲಿ top-left ರಿಂದ bottom-right cheapest path. ಎರಡೂ neighbour answers combine ಮಾಡುವ DP.', focus: '1D coin DP, min coins/count ways, grid DP, paths, table filling', practice: 'coins [1,3,4], amount 6 ಗೆ greedy fail ಮತ್ತು DP answer ತೋರಿಸಿ' },
  { id: 'm6-t33', name: 'Fractional Knapsack', analogy: 'sweets shop ನಲ್ಲಿ by weight ಖರೀದಿಸಬಹುದು; highest value/kg sweets ಮೊದಲು ತೆಗೆದುಕೊಂಡರೆ optimal.', focus: 'divisible items, value/weight ratio, greedy optimal, sort O(n log n), contrast with 0/1', practice: 'items ratio sort ಮಾಡಿ fractional last item value calculate ಮಾಡಿ' },
  { id: 'm6-t34', name: 'Activity Selection', analogy: 'event planner ಹೆಚ್ಚು gigs fit ಮಾಡಲು earliest finish time ಇರುವ event ಮೊದಲು ತೆಗೆದುಕೊಳ್ಳುತ್ತಾನೆ.', focus: 'interval scheduling, sort by end time, non-overlap, greedy proof, O(n log n)', practice: 'activities start/end list ಗೆ selected intervals trace ಮಾಡಿ' },
  { id: 'm6-t35', name: 'Huffman coding', analogy: 'telegram/Morse ನಲ್ಲಿ common letters short codes, rare letters long codes. Huffman frequencies ನೋಡಿ optimal prefix-free tree ಕಟ್ಟುತ್ತದೆ.', focus: 'prefix-free codes, min-heap, merge two least frequent, compression, O(n log n)', practice: 'A/B/C frequencies ಗೆ Huffman merge steps ಬರೆಯಿರಿ' },
  { id: 'm6-t36', name: 'When greedy works (vs DP)', analogy: 'greedy hiker steepest step ಹಿಡಿದು local hill ನಲ್ಲಿ ಸಿಲುಕಬಹುದು; DP full terrain map ನೋಡುತ್ತದೆ. Greedy proof ಬೇಕು.', focus: 'greedy choice property, optimal substructure, exchange argument, DP counterexamples', practice: 'fractional knapsack greedy works, 0/1 knapsack greedy fails counterexample ಬರೆಯಿರಿ' },
];

const module6RemainingTranslations = Object.fromEntries(
  module6RemainingTopicSeeds.map((topic) => [
    topic.id,
    {
      explain:
        `**${topic.name}** Data Structures & Algorithms module ನಲ್ಲಿ interview ಮತ್ತು production coding ಗೆ ಮುಖ್ಯ building block. ಇಲ್ಲಿ goal code memorise ಮಾಡುವುದು ಅಲ್ಲ; data ಹೇಗೆ arrange ಆಗಿದೆ, operation cost ಎಷ್ಟು, ಮತ್ತು ಯಾವ pattern ಯಾವ problem ಗೆ fit ಆಗುತ್ತದೆ ಎಂಬ judgment ಬೆಳೆಸುವುದು. ${topic.focus}.`,
      analogy:
        `**ಉದಾಹರಣೆ:**\n${topic.analogy}\n\nDSA ಯಲ್ಲಿ analogy ತುಂಬಾ useful: structure ಒಂದು physical arrangement, algorithm ಅದರಲ್ಲಿ ನಡೆಯುವ procedure. Arrangement ಸರಿಯಾದರೆ operation fast; ತಪ್ಪಾದರೆ same task slow.`,
      theory:
        `**WHY:** ${topic.name} ಅರ್ಥವಾದರೆ code performance ಬಗ್ಗೆ guess ಮಾಡುವುದಿಲ್ಲ; reason ಮಾಡುತ್ತೀರಿ. Small input ನಲ್ಲಿ ಎಲ್ಲ solution ಕೆಲಸ ಮಾಡುತ್ತದೆ, ಆದರೆ large input ನಲ್ಲಿ complexity ಮತ್ತು memory layout decide ಮಾಡುತ್ತದೆ.\n\n` +
        `**HOW:** ಮೊದಲು invariant ಗುರುತಿಸಿ: sorted order, heap property, tree balance, visited set, DP state, ಅಥವಾ greedy choice. ನಂತರ operation sequence trace ಮಾಡಿ. ${topic.focus} ಅನ್ನು 5-7 item toy example ಮೇಲೆ ಕೈಯಿಂದ run ಮಾಡಿದರೆ real code easy ಆಗುತ್ತದೆ.\n\n` +
        `**Interview lens:** "state ಏನು?", "transition ಏನು?", "base case ಏನು?", "complexity ಏನು?", "ಯಾವ edge case break ಮಾಡುತ್ತದೆ?" — ಈ ಪ್ರಶ್ನೆಗಳು DSA answer complete ಮಾಡುತ್ತವೆ.`,
      whyItMatters:
        `ಪ್ರತಿ coding interview ನಲ್ಲಿ ${topic.name} ತರಹದ concept ಬರುತ್ತದೆ. Real systems ನಲ್ಲೂ queues, heaps, indexes, graphs, caches, compression, scheduling, DP optimization ಬಳಸಲಾಗುತ್ತದೆ. ಇದನ್ನು skip ಮಾಡಿದರೆ working code ಬರಬಹುದು, ಆದರೆ scalable code ಬರಲು ಕಷ್ಟ.`,
      steps: [
        `ಮೊದಲು ${topic.name} ಯಾವ operation optimize ಮಾಡುತ್ತದೆ ಎಂದು ಬರೆಯಿರಿ.`,
        'Toy input ಆಯ್ಕೆಮಾಡಿ: 5 nodes/items/numbers ಸಾಕು.',
        `Core practice ಮಾಡಿ: ${topic.practice}.`,
        'Invariant ಪ್ರತೀ step ನಂತರ still true ಇದೆಯೇ check ಮಾಡಿ.',
        'Time complexity ಮತ್ತು space complexity ಬರೆಯಿರಿ.',
        'Edge cases test ಮಾಡಿ: empty input, one item, duplicates, sorted/reverse input, disconnected graph.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Algorithm steps memorise ಮಾಡಿ invariant ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳದಿರುವುದು. Invariant ಇಲ್ಲದೆ debugging hard.',
        '**ಸಮಸ್ಯೆ.** Big-O ಹೇಳಿ constants/space ignore ಮಾಡುವುದು. Production ನಲ್ಲಿ memory ಕೂಡ bottleneck ಆಗಬಹುದು.',
        '**ತಪ್ಪು.** Edge cases skip ಮಾಡುವುದು. Empty tree, one node, duplicate values, cycle, unreachable node ಸಾಮಾನ್ಯ traps.',
        '**ಸಮಸ್ಯೆ.** Recursive solution ನಲ್ಲಿ base case unclear. Base case ಮೊದಲು ಬರೆಯಿರಿ.',
        '**ತಪ್ಪು.** Greedy solution proof ಇಲ್ಲದೆ trust ಮಾಡುವುದು. Counterexample ಹುಡುಕಿ; proof ಸಿಗದಿದ್ದರೆ DP ಯೋಚಿಸಿ.',
      ],
      tryIt:
        `${topic.practice}. ನಂತರ same problem ಗೆ brute-force idea ಬರೆಯಿರಿ ಮತ್ತು optimized idea ಹೇಗೆ improve ಮಾಡುತ್ತದೆ compare ಮಾಡಿ. ಈಗ extend ಮಾಡಿ - 3 test cases ಮತ್ತು expected outputs ಬರೆಯಿರಿ.`,
      takeaway:
        `${topic.name} ಗೆ rule: **invariant ತಿಳಿ, toy trace ಮಾಡು, complexity ಹೇಳು, edge cases ಪರೀಕ್ಷಿಸು**.`,
    },
  ]),
);

export const kn = {
  // ── UI labels ──────────────────────────────────────────────
  ui: {
    thinkOfItLike:  'Think ಮಾಡಿ ಹೀಗೆ...',
    theFullStory:   'Full explanation',
    whyThisMatters: 'ಇದು ಏಕೆ matter ಆಗುತ್ತದೆ',
    stepByStep:     'Step-by-step',
    example:        'ಉದಾಹರಣೆ',
    watchOutFor:    'Watch out',
    tryItYourself:  'ನೀವೇ try ಮಾಡಿ',
    keyTakeaway:    'Key takeaway',
    tutorial:       'ಪಾಠ',
    hide:           'ಮುಚ್ಚಿ',
    markComplete:   'Complete ಎಂದು mark ಮಾಡಿ',
    markIncomplete: 'Incomplete ಎಂದು mark ಮಾಡಿ',
    searchPlaceholder: 'Topic ಹುಡುಕಿ...',
    dashboard:      'Dashboard',
    progress:       'Progress',
    reset:          'Reset',
    export:         'Export',
    import:         'Import',
    signOut:        'Sign out',
    loading:        'ತೆರೆಯಲಾಗುತ್ತಿದೆ…',
    syncingProgress:'ಪ್ರಗತಿ sync ಆಗುತ್ತಿದೆ…',
  },

  // ── Topic translations ─────────────────────────────────────
  // Key = topic id from curriculum.js
  topics: {
    ...module1Translations,
    ...module2RemainingTranslations,
    ...module3RemainingTranslations,
    ...module4Translations,
    ...module5Translations,
    ...module6RemainingTranslations,

    // ══════════════════════════════════════════════════════════
    // MODULE 0 — Python Bootcamp
    // ══════════════════════════════════════════════════════════

    // ── m0-t1: Install Python ──────────────────────────────
    'm0-t1': {
      explain:
        'Python ಒಂದು programming language — ಅಂದರೆ computer ಗೆ ಸೂಚನೆ ಕೊಡಲು ಬಳಸುವ ಭಾಷೆ. "Installer" ಅನ್ನು run ಮಾಡಿದಾಗ, Python interpreter (`.py` files ಅನ್ನು ಓದಿ execute ಮಾಡುವ program) ನಿಮ್ಮ computer ನಲ್ಲಿ install ಆಗುತ್ತದೆ. PATH ಎಂಬ ಪಟ್ಟಿಗೆ Python ಅನ್ನು add ಮಾಡಿದರೆ, ಯಾವ terminal ನಿಂದಲೂ `python` ಎಂದು call ಮಾಡಬಹುದಾಗುತ್ತದೆ.',

      analogy:
        '**Chef ಮತ್ತು Recipe ಉದಾಹರಣೆ:**\n' +
        'Python ಒಂದು chef ಇದ್ದಂತೆ. ನಿಮ್ಮ code (`.py` file) ಒಂದು recipe ಇದ್ದಂತೆ. ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಒಳ್ಳೆ recipe ಇದ್ದರೂ, ಅಡುಗೆ ಮಾಡಲು chef ಇಲ್ಲದಿದ್ದರೆ ಏನೂ ಉಪಯೋಗ ಇಲ್ಲ ತಾನೇ?\n\n' +
        'Python install ಮಾಡುವುದು ಎಂದರೆ ನಿಮ್ಮ computer ಎಂಬ kitchen ಗೆ ಒಬ್ಬ chef ಅನ್ನು ಕರೆದುಕೊಂಡು ಬರುವುದು. PATH ಗೆ add ಮಾಡುವುದು ಎಂದರೆ ಆ chef ಗೆ ಎಲ್ಲ kitchen ಗಳ (ಎಲ್ಲ terminal windows) ಬೀಗದ ಕೈ ಕೊಡುವುದು — ಯಾವ kitchen ನಿಂದಲೂ ಅವರನ್ನು ಹೆಸರಿಟ್ಟು ಕರೆಯಬಹುದು!',

      theory:
        'Python ಒಂದು **interpreted language** — ಅಂದರೆ ನಿಮ್ಮ code ಒಂದೊಂದು line ಆಗಿ ಓದಿ execute ಆಗುತ್ತದೆ. ಈ ಕೆಲಸ ಮಾಡುವ program ಗೆ **Python interpreter** ಎನ್ನುತ್ತಾರೆ (Windows ನಲ್ಲಿ `python.exe`, Linux ನಲ್ಲಿ `/usr/bin/python3`).\n\n' +
        '"Python install ಮಾಡು" ಎಂದರೆ ಈ interpreter + standard library (ready-made tools ಸಮೂಹ) ಅನ್ನು download ಮಾಡಿ computer ನಲ್ಲಿ ಹಾಕುವುದು.\n\n' +
        '**PATH ಎಂದರೇನು?** ನೀವು terminal ನಲ್ಲಿ ಒಂದು command type ಮಾಡಿದಾಗ, computer PATH ಎಂಬ folder ಪಟ್ಟಿಯಲ್ಲಿ ಆ program ಅನ್ನು ಹುಡುಕುತ್ತದೆ. Python PATH ನಲ್ಲಿ ಇಲ್ಲದಿದ್ದರೆ, `python` ಎಂದು type ಮಾಡಿದರೆ "command not found" error ಬರುತ್ತದೆ — Python install ಆಗಿದ್ದರೂ! ಅದಕ್ಕೆ Windows installer ನಲ್ಲಿ "Add Python to PATH" checkbox ಅನ್ನು tick ಮಾಡುವುದು ಅತ್ಯಂತ ಮುಖ್ಯ.\n\n' +
        '**ಯಾವ version ಬೇಕು?** Python 3.11 ಅಥವಾ 3.12 ಬೆಸ್ಟ್. Python 2 ಬೇಡ — 2020 ರಿಂದ discontinued. ತೀರಾ ಹೊಸ version (3.13, 3.14) ಕೆಲ libraries ಇನ್ನೂ support ಮಾಡಿಲ್ಲ, ಅದಕ್ಕೆ ಬೇಡ.',

      whyItMatters:
        'ಈ course ನ ಪ್ರತಿ topic, ಪ್ರತಿ project, ಪ್ರತಿ library ಗೂ Python ಸರಿಯಾಗಿ install ಆಗಿ terminal ನಿಂದ work ಆಗಬೇಕು. `python --version` ಕೆಲಸ ಮಾಡದಿದ್ದರೆ **ಮುಂದೆ ಏನೂ ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ**. ಇಲ್ಲಿ 10 ನಿಮಿಷ ಸರಿಯಾಗಿ ಕಳೆದರೆ, ಮುಂದೆ "ಏಕೆ import ಆಗುತ್ತಿಲ್ಲ?" ಎಂಬ ಗೊಂದಲಕ್ಕೆ ಗಂಟೆಗಟ್ಟಲೆ time waste ಆಗುವುದಿಲ್ಲ.',

      steps: [
        'Browser ನಲ್ಲಿ **https://python.org/downloads** ತೆರೆಯಿರಿ. ದೊಡ್ಡ yellow button ನಿಮ್ಮ OS ಅನ್ನು detect ಮಾಡಿ ಸರಿಯಾದ Python 3 installer ನೀಡುತ್ತದೆ.',
        '**Windows ನಲ್ಲಿ**: download ಆದ `.exe` ಅನ್ನು double-click ಮಾಡಿ. **ಅತ್ಯಂತ ಮುಖ್ಯ** — ಮೊದಲ screen ನ ಕೆಳಗಡೆ "Add Python to PATH" checkbox ಇದೆ, ಅದನ್ನು **tick ಮಾಡಲೇಬೇಕು**. ನಂತರ "Install Now" click ಮಾಡಿ.',
        '**macOS ನಲ್ಲಿ**: download ಆದ `.pkg` ಅನ್ನು ತೆರೆಯಿರಿ. ಅಥವಾ Homebrew ಇದ್ದರೆ Terminal ನಲ್ಲಿ `brew install python` ಮಾಡಿ — Homebrew PATH ತನ್ನಿಂದ ತಾನೇ handle ಮಾಡುತ್ತದೆ.',
        '**Linux ನಲ್ಲಿ**: `python3 --version` check ಮಾಡಿ. ಇಲ್ಲದಿದ್ದರೆ — Ubuntu/Debian: `sudo apt install python3 python3-pip`, Fedora: `sudo dnf install python3 python3-pip`.',
        '**ಎಲ್ಲ terminal windows close ಮಾಡಿ**, ಹೊಸ terminal ತೆರೆಯಿರಿ. PATH ಹೊಸ terminal ಗೆ ಮಾತ್ರ refresh ಆಗುತ್ತದೆ. `python --version` (Mac/Linux ನಲ್ಲಿ `python3 --version`) type ಮಾಡಿ — `Python 3.12.0` ತರಹ ಕಂಡರೆ ✓ ಮುಗಿಯಿತು!',
      ],

      pitfalls: [
        '**"Add Python to PATH" miss ಮಾಡಿದರೆ** — `python` type ಮಾಡಿ "not recognized" error ಬಂದರೆ ಇದೇ problem. Installer ಮತ್ತೆ run ಮಾಡಿ → "Modify" ಆಯ್ಕೆ → PATH checkbox tick ಮಾಡಿ.',
        '**Install ನಂತರ old terminal ಬಳಸಿದರೆ** — Old window ಗೆ ಹೊಸ PATH ಗೊತ್ತಿರುವುದಿಲ್ಲ. Install ಆದ ಮೇಲೆ **ಯಾವಾಗಲೂ ಹೊಸ terminal** ತೆರೆಯಿರಿ.',
        '**Mac ನ built-in `python`** — Mac ನಲ್ಲಿ `python` ಎಂದರೆ outdated Python 2.7 ಆಗಬಹುದು. Mac ನಲ್ಲಿ ಯಾವಾಗಲೂ `python3` ಬಳಸಿ.',
        '**ಹಲವು Python versions ಗೊಂದಲ** — Windows ನಲ್ಲಿ `py -3.12 file.py` ಎಂದು specify ಮಾಡಬಹುದು. Mac/Linux: `which python3` ಮಾಡಿ ಯಾವ Python ಬಳಕೆಯಾಗುತ್ತಿದೆ ಎಂದು ಖಚಿತ ಮಾಡಿ.',
      ],

      tryIt:
        'ಈಗಲೇ ಹೊಸ terminal ತೆರೆಯಿರಿ. ಈ ಮೂರು commands ಒಂದೊಂದಾಗಿ ಮಾಡಿ:\n' +
        '1. `python --version` (ಅಥವಾ `python3 --version`) → Python version number ಕಂಡರೆ ✓\n' +
        '2. `pip --version` → pip version ಕಂಡರೆ ✓\n' +
        '3. `python -c "print(2 + 2)"` → `4` print ಆದರೆ ✓\n\n' +
        'ಮೂರೂ ಕೆಲಸ ಮಾಡಿದರೆ — ನಿಮ್ಮ Python installation ಸಂಪೂರ್ಣ ready! ಇದು ನಿಮ್ಮ AI/ML journey ನ ಮೊದಲ ಹೆಜ್ಜೆ!',

      takeaway:
        'Successful install ಎಂದರೆ "installer click ಮಾಡಿದೆ" ಎಂದಲ್ಲ — ಎಂದರೆ "ಯಾವ terminal ನಿಂದಲೂ `python --version` ಕೆಲಸ ಮಾಡುತ್ತದೆ". ಆ ಒಂದು command ಕೆಲಸ ಮಾಡಿದರೆ, ಈ course ನಲ್ಲಿ ಎಲ್ಲಕ್ಕೂ ready!',
    },

    // ── m0-t2: Anaconda distribution & environments ───────────
    'm0-t2': {
      explain:
        'Anaconda ಎಂದರೆ "Python + 250 data science libraries + conda ಎಂಬ package manager" — ಇವು ಎಲ್ಲ ಒಟ್ಟಿಗೆ bundle ಆಗಿ ಬರುತ್ತವೆ. NumPy, Pandas, Jupyter ಇತ್ಯಾದಿ ಒಂದೊಂದಾಗಿ install ಮಾಡುವ ತೊಂದರೆ ಇಲ್ಲ. **Environment** ಎಂದರೆ ಒಂದು isolated box — ಪ್ರತಿ project ಗೆ ತನ್ನದೇ library set ಇರುತ್ತದೆ, ಇದರಿಂದ ಒಂದು project update ಮಾಡಿದರೆ ಇನ್ನೊಂದು break ಆಗದು.',

      analogy:
        'ಒಂದು chef ಅನೇಕ ಕುಟುಂಬಗಳಿಗೆ ಅಡುಗೆ ಮಾಡಬೇಕು ಎಂದು ಕಲ್ಪಿಸಿ. ಒಂದು ಕುಟುಂಬ vegetarian, ಇನ್ನೊಂದು gluten-free, ಮತ್ತೊಂದು vegan. ಎಲ್ಲರಿಗೂ ಒಂದೇ kitchen ಮತ್ತು ಒಂದೇ ingredients ಬಳಸಿದರೆ — cross-contamination guarantee!\n\n' +
        '**conda environment** ಪ್ರತಿ ಕುಟುಂಬಕ್ಕೆ ಬೇರೆ kitchen ಮತ್ತು ಬೇರೆ pantry ಇದ್ದಂತೆ. Project A ನ kitchen ನಲ್ಲಿ Pandas 1.5 ಇದ್ದರೆ, Project B ನ kitchen ನಲ್ಲಿ Pandas 2.1 ಇರಬಹುದು — ಅವು ಎಂದಿಗೂ ಒಂದಕ್ಕೊಂದು ತಾಗುವುದಿಲ್ಲ!',

      theory:
        'Environment ಇಲ್ಲದಿದ್ದರೆ ಎಲ್ಲ libraries ಒಂದೇ global Python installation ನಲ್ಲಿ ಹೋಗುತ್ತವೆ. Project A ಗೆ `tensorflow==2.10` ಬೇಕು, Project B ಗೆ `tensorflow==2.15` ಬೇಕು ಎಂದರೆ — ಒಂದು install ಮಾಡಿದರೆ ಇನ್ನೊಂದು break ಆಗುತ್ತದೆ. ಇದನ್ನು **dependency hell** ಎನ್ನುತ್ತಾರೆ.\n\n' +
        '**conda** ಪ್ರತಿ project ಗೆ isolated Python copy ಮತ್ತು library set create ಮಾಡುತ್ತದೆ. `conda activate ml` ಮಾಡಿದರೆ ಆ environment ಒಳಗೆ "ಪ್ರವೇಶ" ಮಾಡಿದಂತೆ. ಅಲ್ಲಿ install ಮಾಡಿದ libraries ಬೇರೆ environments ಗೆ affect ಮಾಡುವುದಿಲ್ಲ.\n\n' +
        '**Anaconda vs Miniconda**: Anaconda full (~3 GB, ನೂರಾರು pre-installed libraries). Miniconda ಹಗುರ (~400 MB, ಬೇಕಾದ್ದು ಮಾತ್ರ install ಮಾಡಿ). Miniconda recommended.',

      whyItMatters:
        'ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು projects ಮೇಲೆ ಕೆಲಸ ಮಾಡುವಾಗ — ಬೇರೆ environments ಇದ್ದರೆ "ಎಲ್ಲ ಕೆಲಸ ಮಾಡುತ್ತಿದೆ", ಇಲ್ಲದಿದ್ದರೆ "ನಿನ್ನೆ ಕೆಲಸ ಮಾಡಿದ್ದ code ಇಂದು ಏಕೆ break ಆಯಿತು?". Companies ಮತ್ತು recruiters environments ಬಳಸಬಲ್ಲ developers ಅನ್ನು expect ಮಾಡುತ್ತಾರೆ — ಇದು basic professional skill.',

      steps: [
        'anaconda.com/download (full Anaconda) ಅಥವಾ docs.conda.io/miniconda (Miniconda — recommended) ನಿಂದ download ಮಾಡಿ. Default options ನಲ್ಲಿ install ಮಾಡಿ.',
        '**ಹೊಸ terminal** ತೆರೆಯಿರಿ. `conda --version` ಮಾಡಿ — `conda 24.x.x` ತರಹ ಕಂಡರೆ ✓',
        'ಈ course ಗೆ environment create ಮಾಡಿ: `conda create -n ml python=3.11 -y` — `-n ml` ಎಂದರೆ ಹೆಸರು "ml"; `-y` ಎಂದರೆ "ಹೌದು ಮಾಡು" ಎಂದು automatically confirm ಮಾಡು.',
        'Activate ಮಾಡಿ: `conda activate ml` — ನಿಮ್ಮ terminal prompt ನ ಮೊದಲಿಗೆ `(ml)` ಕಾಣಿಸುತ್ತದೆ. ಇದು ನೀವು ml environment ಒಳಗಿದ್ದೀರಿ ಎಂಬ proof.',
        'Libraries install ಮಾಡಿ: `conda install numpy pandas matplotlib jupyter -y`',
        'ಕೆಲಸ ಮುಗಿದ ಮೇಲೆ: `conda deactivate`. Environment delete ಮಾಡಲು: `conda env remove -n ml`.',
      ],

      pitfalls: [
        '**Activate ಮಾಡದೆ install ಮಾಡಿದರೆ** — Libraries global Python ಗೆ ಹೋಗುತ್ತವೆ, project environment ಗೆ ಅಲ್ಲ. Install ಮಾಡುವ ಮೊದಲು prompt ನಲ್ಲಿ `(ml)` ಕಂಡಿದೆ ಎಂದು ಖಚಿತ ಮಾಡಿ.',
        '**conda ಮತ್ತು pip ಮಿಶ್ರಮಾಡುವುದು** — ಮೊದಲು `conda install` ಪ್ರಯತ್ನಿಸಿ. ಸಿಗದಿದ್ದರೆ ಮಾತ್ರ `pip install` ಬಳಸಿ.',
        '**ಒಂದೇ environment ಗೆ ಎಲ್ಲ ಹಾಕುವುದು** — 6 ತಿಂಗಳ ನಂತರ manage ಮಾಡಲು ಕಷ್ಟ. ಪ್ರತಿ major project ಗೆ ಹೊಸ environment ಮಾಡಿ.',
        '**Windows ನಲ್ಲಿ `conda` ಕಾಣದಿದ್ದರೆ** — `conda init powershell` ಒಮ್ಮೆ run ಮಾಡಿ, terminal restart ಮಾಡಿ.',
      ],

      tryIt:
        'ಈಗಲೇ ಈ steps ಮಾಡಿ:\n' +
        '1. `conda create -n test-env python=3.11 -y`\n' +
        '2. `conda activate test-env` — `(test-env)` prompt ನಲ್ಲಿ ಕಂಡಿದೆ ತಾನೇ? ✓\n' +
        '3. `pip install requests`\n' +
        '4. `python -c "import requests; print(requests.__version__)"` — version number ✓\n' +
        '5. `conda deactivate`\n' +
        '6. `python -c "import requests"` — ಈಗ **ModuleNotFoundError** ಬರಬೇಕು!\n\n' +
        'ಆ error ಕಂಡಿದ್ದೀರಾ? ಅದೇ environment isolation ನ proof! `requests` ಕೇವಲ `test-env` ಒಳಗೆ ಇದೆ, global Python ನಲ್ಲಿ ಅಲ್ಲ.',

      takeaway:
        '**ಒಂದು project ಗೆ ಒಂದು environment — ಯಾವಾಗಲೂ.** Install ಮಾಡುವ ಮೊದಲು activate ಮಾಡಿ, ಮುಗಿದ ಮೇಲೆ deactivate ಮಾಡಿ. ಈ ಒಂದು habit 80% "ನಿನ್ನೆ ಕೆಲಸ ಮಾಡಿತ್ತು" ಎಂಬ ತೊಂದರೆಗಳನ್ನು ತಡೆಯುತ್ತದೆ.',
    },

    // ── m0-t3: Jupyter Notebook ───────────────────────────────
    'm0-t3': {
      explain:
        'Jupyter Notebook ಒಂದು document — ಇದರಲ್ಲಿ **executable code**, **ರಿಚ್ ಟೆಕ್ಸ್ಟ್** (headings, images), ಮತ್ತು **output** (numbers, tables, charts) ಎಲ್ಲ ಒಟ್ಟಿಗೆ ಇರುತ್ತವೆ. Code ಅನ್ನು "cells" ನಲ್ಲಿ ಬರೆದು ಒಂದೊಂದಾಗಿ run ಮಾಡಬಹುದು — ಫಲಿತಾಂಶ ತಕ್ಷಣ ಕೆಳಗೆ ಕಾಣಿಸುತ್ತದೆ.',

      analogy:
        'ಒಂದು chemistry student ನ **lab notebook** ಹೇಗಿರುತ್ತದೆ ಎಂದು ಯೋಚಿಸಿ — ಪ್ರಯೋಗದ ಗುರಿ ಬರೆದು, experiment ಮಾಡಿ, ಫಲಿತಾಂಶ note ಮಾಡಿ, conclusion ಬರೆದು, ಮುಂದಿನ experiment ಶುರು ಮಾಡುತ್ತಾರೆ. ಎಲ್ಲ ಒಂದೇ ಪುಸ್ತಕದಲ್ಲಿ!\n\n' +
        'Jupyter notebook ಅದೇ, ಆದರೆ data ಗೆ: ಒಂದು hypothesis ಬರೆಯಿರಿ, code run ಮಾಡಿ test ಮಾಡಿ, chart ನೋಡಿ, observation ಬರೆಯಿರಿ, ಮುಂದಿನ code ಮಾಡಿ. **Explore ಮಾಡಲು** ಅತ್ಯುತ್ತಮ tool!',

      theory:
        'Jupyter ನಲ್ಲಿ ಎರಡು ಭಾಗಗಳಿವೆ:\n\n' +
        '**1. Browser interface** — ನೀವು ನೋಡುವ ಮತ್ತು click ಮಾಡುವ part. Cells, menus, outputs.\n\n' +
        '**2. Kernel** — Background ನಲ್ಲಿ ಓಡುವ actual Python process. ನೀವು cell run ಮಾಡಿದಾಗ, kernel ಅದನ್ನು execute ಮಾಡಿ result browser ಗೆ ಕಳಿಸುತ್ತದೆ.\n\n' +
        '**ಮುಖ್ಯ**: Kernel **ಎಲ್ಲವನ್ನೂ ನೆನಪಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ**. Cell 1 ನಲ್ಲಿ `x = 5` ಮಾಡಿದರೆ, Cell 7 ನಲ್ಲಿ `x` ಬಳಸಬಹುದು! ಆದರೆ kernel **visual order ಅಲ್ಲ, run ಮಾಡಿದ order** ನ್ನು follow ಮಾಡುತ್ತದೆ — ಇದರಿಂದ out-of-order problems ಆಗಬಹುದು.\n\n' +
        '**ಎರಡು cell types**: Code cells (Python ಓಡಿಸುತ್ತದೆ), Markdown cells (text render ಮಾಡುತ್ತದೆ).\n\n' +
        '**JupyterLab** (`jupyter lab`) ಆಧುನಿಕ interface — ಇದನ್ನೇ ಬಳಸಿ.',

      whyItMatters:
        'Notebooks data scientists ಎಲ್ಲ ಕಡೆ ಬಳಸುತ್ತಾರೆ — Kaggle, Google Colab, ಎಲ್ಲ ML tutorials. Jupyter ನಲ್ಲಿ comfortable ಆಗಿರುವುದು mandatory. ಒಳ್ಳೆ ಸುದ್ದಿ: feedback instant ಆಗಿ ಸಿಗುವುದರಿಂದ ಇದು ಕಲಿಯಲು ಅತ್ಯಂತ ಮೋಜಿನ ರೀತಿ!',

      steps: [
        'Install ಮಾಡಿ (Anaconda ಇದ್ದರೆ already ಇದೆ): `pip install jupyterlab`',
        'Terminal ನಲ್ಲಿ project folder ಗೆ ಹೋಗಿ: `cd path/to/project`. ನಂತರ `jupyter lab` ಮಾಡಿ — browser tab automatically ತೆರೆಯುತ್ತದೆ.',
        '"+" button click ಮಾಡಿ → "Python 3" notebook. ಹೊಸ `Untitled.ipynb` ಒಂದು empty cell ಜೊತೆ ತೆರೆಯುತ್ತದೆ.',
        '`print("Hello Jupyter")` type ಮಾಡಿ, **Shift+Enter** press ಮಾಡಿ — output ಕೆಳಗೆ ಕಾಣಿಸುತ್ತದೆ, ಹೊಸ cell create ಆಗುತ್ತದೆ. (ಬರೀ **Enter** ಎಂದರೆ new line; **Shift+Enter** ಎಂದರೆ run!)',
        'Variables across cells: Cell 1 ನಲ್ಲಿ `x = 10` run ಮಾಡಿ. Cell 2 ನಲ್ಲಿ `print(x * 2)` — `20` ಕಾಣಿಸುತ್ತದೆ. Kernel `x` ನೆನಪಿಟ್ಟಿದೆ!',
        'ಏನಾದರೂ ಗೊಂದಲ ಆದರೆ: **Kernel → Restart Kernel and Run All Cells** — ಇದು "fresh start" button, ಎಲ್ಲ clear ಮಾಡಿ top ನಿಂದ ಮತ್ತೆ run ಮಾಡುತ್ತದೆ.',
      ],

      pitfalls: [
        '**Out-of-order execution** — Cell 2 edit ಮಾಡಿ run, ನಂತರ Cell 5 run, ನಂತರ Cell 2 ಮತ್ತೆ edit. Kernel state ಗೊಂದಲ ಆಗುತ್ತದೆ. Fix: **Restart Kernel and Run All Cells** ಮಾಡಿ result trust ಮಾಡಿ.',
        '**"ಎಲ್ಲಿಂದ ಬಂತು ಈ variable?"** — Delete ಮಾಡಿದ cell ಬರೆದ variable kernel memory ನಲ್ಲಿ ಇನ್ನೂ ಇರುತ್ತದೆ. Share ಮಾಡುವ ಮೊದಲು fresh restart ನಿಂದ test ಮಾಡಿ.',
        '**ಒಂದೇ cell ನಲ್ಲಿ ತುಂಬ ಕೋಡ್** — Debug ಮಾಡಲು ಕಷ್ಟ. ಪ್ರತಿ cell ಒಂದು ಕೆಲಸ ಮಾತ್ರ ಮಾಡಲಿ.',
        '**Save ಮಾಡಲು ಮರೆತರೆ** — **Ctrl+S** ಮಾಡಿ. Files `.ipynb` format ನಲ್ಲಿ (JSON) save ಆಗುತ್ತವೆ.',
      ],

      tryIt:
        'ಈಗ ಒಂದು simple "EDA notebook" ಮಾಡಿ:\n' +
        '1. **Cell 1 (Markdown):** `# ನನ್ನ ಮೊದಲ Analysis` — Shift+Enter ಮಾಡಿ\n' +
        '2. **Cell 2:** `import pandas as pd`\n' +
        '3. **Cell 3:** `df = pd.DataFrame({"name":["A","B","C"],"score":[80,92,75]})`\n' +
        '4. **Cell 4:** `df` — ಸುಂದರ table ಕಾಣಿಸುತ್ತದೆ\n' +
        '5. **Cell 5:** `df.score.mean()` — average score ಕಾಣಿಸುತ್ತದೆ\n\n' +
        'ಈಗ **Kernel → Restart and Run All** ಮಾಡಿ. ಎಲ್ಲ cells ಒಂದೊಂದಾಗಿ run ಆಗುವುದನ್ನು ನೋಡಿ. ಇದೇ reproducibility!',

      takeaway:
        'Jupyter ನಿಮ್ಮ **lab bench** — explore ಮಾಡಲು, learn ಮಾಡಲು, prototype ಮಾಡಲು. Share ಮಾಡುವ ಮೊದಲು ಯಾವಾಗಲೂ "Restart & Run All" verify ಮಾಡಿ.',
    },

    // ── m0-t4: VS Code setup ───────────────────────────────────
    'm0-t4': {
      explain:
        'VS Code ಒಂದು free, fast code editor. Python extension install ಮಾಡಿದರೆ ಇದು ಒಂದು full IDE ಆಗುತ್ತದೆ: autocomplete, error highlighting, debugger, integrated terminal, Jupyter notebook support — ಎಲ್ಲ ಒಂದೇ ಕಡೆ.',

      analogy:
        'Jupyter ನಿಮ್ಮ **lab notebook** (explore ಮಾಡಲು great), VS Code ನಿಮ್ಮ **engineer workbench** (real software build ಮಾಡಲು great). ಎರಡೂ ಬಳಸುತ್ತೀರಿ: experiment ಮಾಡಲು notebook, organize ಮತ್ತು debug ಮಾಡಲು VS Code.\n\n' +
        '**Python extension** ಎಂದರೆ VS Code ಗೆ ಹಾಕುವ "Python tooling kit" — ಇಲ್ಲದಿದ್ದರೆ VS Code `.py` files ಅನ್ನು Notepad ನಂತೆ ತೆರೆಯುತ್ತದೆ. Extension ಹಾಕಿದರೆ syntax highlighting, debug, run — ಎಲ್ಲ ಸಿಗುತ್ತದೆ.',

      theory:
        'VS Code language-agnostic — JavaScript, Go, Python, ಏನಾದರೂ ಮಾಡಬಹುದು. **Extensions** ಮೂಲಕ specialized ಆಗುತ್ತದೆ. Python ಗೆ:\n\n' +
        '• **Python** (Microsoft) — language support, run/debug, environment management.\n' +
        '• **Pylance** — fast type checker ಮತ್ತು autocomplete (Python extension ಜೊತೆ automatically ಬರುತ್ತದೆ).\n' +
        '• **Jupyter** — `.ipynb` notebooks VS Code ಒಳಗೇ run ಮಾಡಬಹುದು.\n\n' +
        '**ಮುಖ್ಯ concept**: VS Code ಒಂದೇ ಸಮಯದಲ್ಲಿ ಹಲವು Python interpreters ಕಾಣಬಹುದು — global Python, conda envs, venvs. ಒಂದನ್ನು "select" ಮಾಡಬೇಕು. Bottom-right interpreter picker ಅಥವಾ `Ctrl+Shift+P → "Python: Select Interpreter"` ಮೂಲಕ ಬದಲಾಯಿಸಬಹುದು.\n\n' +
        'Wrong interpreter select ಆಗಿದ್ದರೆ — pandas install ಆಗಿದ್ದರೂ "ModuleNotFoundError" ಬರುತ್ತದೆ! ಇದು beginners ನ #1 confusion.',

      whyItMatters:
        'Industry VS Code (ಅಥವಾ PyCharm) ಬಳಸಿ production code ಬರೆಯುತ್ತದೆ. Notebooks ಮಾತ್ರ ಸಾಲದು — notebook ಅನ್ನು server ಗೆ deploy ಮಾಡಲು ಆಗದು. VS Code ಕಲಿತರೆ "cells run ಮಾಡುವವ" ರಿಂದ "real software ಬರೆಯುವವ" ಆಗಿ graduate ಆಗುತ್ತೀರಿ.',

      steps: [
        'code.visualstudio.com ನಿಂದ VS Code download ಮಾಡಿ, default options ನಲ್ಲಿ install ಮಾಡಿ.',
        'VS Code ತೆರೆಯಿರಿ. Left sidebar ನಲ್ಲಿ **Extensions** icon (4 squares) click ಮಾಡಿ ಅಥವಾ `Ctrl+Shift+X` press ಮಾಡಿ.',
        '"Python" search ಮಾಡಿ — **Microsoft** ರ extension install ಮಾಡಿ (millions of downloads, blue verified badge). Pylance automatically ಬರುತ್ತದೆ.',
        'Optional ಆದರೆ ಒಳ್ಳೆಯದು: **"Jupyter"** (Microsoft) ಮತ್ತು **"Black Formatter"** ಕೂಡ install ಮಾಡಿ.',
        'Project folder ತೆರೆಯಿರಿ: **File → Open Folder**. VS Code ಇಡೀ folder read ಮಾಡುತ್ತದೆ.',
        'Interpreter pick ಮಾಡಿ: `Ctrl+Shift+P` → "Python: Select Interpreter" → ನಿಮ್ಮ conda env (e.g., `Python 3.11.7 (\'ml\')`). Bottom-right ನಲ್ಲಿ env name ಕಾಣಬೇಕು.',
        '`hello.py` ಮಾಡಿ `print("hi")` ಬರೆಯಿರಿ, top-right **▶ Play** button click ಮಾಡಿ. Terminal ನಲ್ಲಿ "hi" ಕಾಣಿಸಬೇಕು.',
      ],

      pitfalls: [
        '**Wrong interpreter** — 90% "import not found" errors ಇದರಿಂದ ಬರುತ್ತವೆ. VS Code bottom-right ನಲ್ಲಿ active Python ಏನಿದೆ ಎಂದು ಯಾವಾಗಲೂ ಗಮನಿಸಿ.',
        '**Folder ಅಲ್ಲ, single file ತೆರೆದರೆ** — VS Code Python features folder level ನಲ್ಲಿ best ಕೆಲಸ ಮಾಡುತ್ತವೆ. ಯಾವಾಗಲೂ **File → Open Folder** ಮಾಡಿ.',
        '**Code Runner extension** — ಇದು selected interpreter ignore ಮಾಡುತ್ತದೆ. Python extension ರ play button ಮಾತ್ರ ಬಳಸಿ.',
      ],

      tryIt:
        'VS Code ನಲ್ಲಿ ಈ test ಮಾಡಿ:\n' +
        '1. `hello-vscode` folder create ಮಾಡಿ, VS Code ನಲ್ಲಿ open ಮಾಡಿ.\n' +
        '2. `hello.py` create ಮಾಡಿ:\n' +
        '   `import sys`\n' +
        '   `print("Python:", sys.version)`\n' +
        '   `print("From:", sys.executable)`\n' +
        '3. `ml` conda env select ಮಾಡಿ.\n' +
        '4. ▶ Run click ಮಾಡಿ. `sys.executable` ನಲ್ಲಿ conda env ರ full path ಕಾಣಿಸಬೇಕು.\n\n' +
        'ಆ path ಸರಿಯಾದ env ಅನ್ನು point ಮಾಡಿದ್ದರೆ — VS Code correctly configured!',

      takeaway:
        'VS Code = ನಿಮ್ಮ daily IDE. ಒಂದೇ habit: **code run ಮಾಡುವ ಮೊದಲು bottom-right interpreter ಗಮನಿಸಿ**. 9 out of 10 mysterious import errors wrong interpreter ನಿಂದ ಬರುತ್ತವೆ.',
    },

    // ── m0-t5: pip & package management ───────────────────────
    'm0-t5': {
      explain:
        '**pip** Python ರ package installer. ಇದು PyPI (Python Package Index) ಎಂಬ online repository ನಿಂದ libraries download ಮಾಡಿ install ಮಾಡುತ್ತದೆ. `pip install pandas` ಎಂದರೆ Pandas library download ಮಾಡಿ active Python ಗೆ install ಮಾಡು.',

      analogy:
        'ಮನೆ ಕಟ್ಟಲು ಬೇಕಾದ ಪ್ರತಿ ಮೊಳೆ, ಇಟ್ಟಿಗೆ, pipe ನೀವೇ ಮಾಡಿದರೆ ಜೀವನ ಪೂರ್ತಿ ಸಾಲದು. Hardware store ನಿಂದ ಖರೀದಿಸಿದರೆ ಸಾಕು!\n\n' +
        'PyPI ಎಂದರೆ Python ಗೆ world\'s biggest open-source hardware store — 500,000+ packages. **pip** ನಿಮ್ಮ delivery service. **requirements.txt** ನಿಮ್ಮ shopping list — ಇದನ್ನು ಯಾರಿಗಾದರೂ ಕೊಟ್ಟರೆ ಅವರು `pip install -r requirements.txt` ಮಾಡಿ ಅಡಿಪಾಯದಿಂದ ನಿಮ್ಮ project ಎತ್ತಿಕೊಳ್ಳಬಹುದು.',

      theory:
        '**Package** ಎಂದರೆ ಬೇರೆಯವರು ಬರೆದ Python code (ಸಾವಿರಾರು lines). `numpy` fast math ಮಾಡುತ್ತದೆ, `pandas` tabular data handle ಮಾಡುತ್ತದೆ, `requests` web calls ಮಾಡುತ್ತದೆ.\n\n' +
        '**Versions ಏಕೆ ಮುಖ್ಯ?** `pandas` version 1.0 (2020), 2.0 (2023) — 1.x ಗಾಗಿ ಬರೆದ code 2.x ನಲ್ಲಿ break ಆಗಬಹುದು. Code share ಮಾಡುವಾಗ **version ಕೂಡ** specify ಮಾಡಿ.\n\n' +
        '**Version specifiers:**\n' +
        '• `pandas==2.1.0` → ಈ exact version ಮಾತ್ರ\n' +
        '• `pandas>=2.1` → 2.1 ಅಥವಾ ಮೇಲ್ಪಟ್ಟ\n' +
        '• `pandas~=2.1.0` → ≥2.1.0 ಆದರೆ <2.2\n' +
        '• `pandas` → ಯಾವ version ಆದರೂ (serious work ಗೆ ಬೇಡ!)',

      whyItMatters:
        'ಎಲ್ಲ real Python projects ಗೆ `requirements.txt` ಅಥವಾ `pyproject.toml` ಇರುತ್ತದೆ. Package management ಸರಿಯಾಗಿ ಮಾಡಿದರೆ ಯಾರ computer ನಲ್ಲಿ install ಮಾಡಿದರೂ ಒಂದೇ ರೀತಿ run ಆಗುತ್ತದೆ.',

      steps: [
        '**ಮೊದಲು environment activate ಮಾಡಿ** (`conda activate ml`). Prompt ನಲ್ಲಿ env name ಕಾಣಬೇಕು.',
        'ಒಂದು package install: `pip install requests`. Test: `python -c "import requests; print(requests.__version__)"`',
        'ಹಲವು ಒಟ್ಟಿಗೆ: `pip install numpy pandas matplotlib`',
        'Specific version: `pip install "pandas==2.1.0"` (quotes ಇರಲಿ — shell `==` ಅನ್ನು misinterpret ಮಾಡದಿರಲಿ)',
        'List ಮಾಡಿ: `pip list` (ಎಲ್ಲ packages) ಅಥವಾ `pip show pandas` (ಒಂದರ details)',
        'Save ಮಾಡಿ: `pip freeze > requirements.txt` — ಪ್ರತಿ package ಮತ್ತು exact version ಪಟ್ಟಿ.',
        'ಹೊಸ machine ನಲ್ಲಿ: `pip install -r requirements.txt` — ಎಲ್ಲ reinstall ಆಗುತ್ತದೆ.',
      ],

      pitfalls: [
        '**Activate ಮಾಡದೆ install ಮಾಡಿದರೆ** — Global Python ಗೆ ಹೋಗುತ್ತದೆ. ಯಾವಾಗಲೂ prompt ನಲ್ಲಿ `(envname)` ಕಂಡ ಮೇಲೆ install ಮಾಡಿ.',
        '**Version pin ಇಲ್ಲದ `requirements.txt`** — `pandas` (no version) ಎಂದರೆ ಒಂದು ವರ್ಷ ಮುಂದೆ Pandas 3.0 (breaking changes ಸಹಿತ) install ಆಗಬಹುದು. ಯಾವಾಗಲೂ pin ಮಾಡಿ.',
        '**`sudo pip install` Mac/Linux ನಲ್ಲಿ** — ಎಂದೂ ಮಾಡಬೇಡಿ! OS level ಗೆ install ಆಗಿ system break ಮಾಡಬಹುದು. ಯಾವಾಗಲೂ environments ಬಳಸಿ.',
      ],

      tryIt:
        'ಒಂದು proper project ಮಾಡಿ:\n' +
        '1. `conda create -n test-pkgs python=3.11 -y && conda activate test-pkgs`\n' +
        '2. `pip install requests beautifulsoup4`\n' +
        '3. `fetch.py` create ಮಾಡಿ, ಒಳಗೆ ಬರೆಯಿರಿ:\n' +
        '   `import requests; from bs4 import BeautifulSoup`\n' +
        '   `r = requests.get("https://example.com")`\n' +
        '   `soup = BeautifulSoup(r.text, "html.parser")`\n' +
        '   `print(soup.title.string)`\n' +
        '4. `python fetch.py` — "Example Domain" print ಆಗಬೇಕು\n' +
        '5. `pip freeze > requirements.txt` — file ತೆರೆದು packages ನೋಡಿ\n' +
        '6. Environment delete ಮಾಡಿ recreate ಮಾಡಿ `requirements.txt` ಬಳಸಿ — same output ✓',

      takeaway:
        '**ಒಂದು env per project, pinned versions ಸಹಿತ requirements.txt, git ಗೆ commit ಮಾಡಿ.** ಈ habit ಇದ್ದರೆ ನಿಮ್ಮ code ಯಾರ computer ನಲ್ಲಿ, ಯಾವ ಸಮಯದಲ್ಲಿ, ಒಂದೇ ರೀತಿ work ಮಾಡುತ್ತದೆ.',
    },

    // ── m0-t6: print() and input() ────────────────────────────
    'm0-t6': {
      explain:
        '`print()` ಎಂದರೆ screen ಮೇಲೆ ತೋರಿಸು — text, numbers, ಏನಾದರೂ ಸರಿ. `input()` ಎಂದರೆ user ಏನಾದರೂ type ಮಾಡಿ Enter press ಮಾಡಲು wait ಮಾಡು, ನಂತರ ಆ text ಅನ್ನು program ಗೆ ಕೊಡು. ಈ ಎರಡು functions ಮಾತ್ರ ಇದ್ದರೆ program user ಜೊತೆ "ಮಾತನಾಡಬಹುದು"!',

      analogy:
        'Hotel reception ಯೋಚಿಸಿ. Receptionist "ನಿಮ್ಮ ಹೆಸರೇನು?" ಎಂದು ಕೇಳುತ್ತಾರೆ — ಅದು `input()`. ನೀವು "ಅನಿಲ್" ಎಂದು ಉತ್ತರಿಸುತ್ತೀರಿ — ಅದು return value. Receptionist "ಸ್ವಾಗತ ಅನಿಲ್!" ಎನ್ನುತ್ತಾರೆ — ಅದು `print()`.\n\n' +
        'print ಮತ್ತು input ಇಲ್ಲದ program ಮಾತನಾಡದ receptionist ತರಹ — ಸಂಪೂರ್ಣ ನಿರುಪಯೋಗಿ!',

      theory:
        '**`print()`** standard output (screen) ಗೆ text ಕಳಿಸುತ್ತದೆ. ತುಂಬ flexible:\n' +
        '• ಹಲವು arguments: `print(a, b, c)` — space ಜೊತೆ join ಮಾಡುತ್ತದೆ\n' +
        '• `sep=` separator: `print(1, 2, 3, sep="-")` → `1-2-3`\n' +
        '• `end=` ending character (default `\\n`): `print("hi", end="")` — next line ಗೆ ಹೋಗುವುದಿಲ್ಲ\n\n' +
        '**`input()`** optional prompt ತೋರಿಸಿ wait ಮಾಡುತ್ತದೆ. User Enter press ಮಾಡಿದ್ದನ್ನು **string** ಆಗಿ return ಮಾಡುತ್ತದೆ — "42" type ಮಾಡಿದರೂ `"42"` (text) ಬರುತ್ತದೆ, `42` (number) ಅಲ್ಲ! Math ಮಾಡಲು convert ಮಾಡಬೇಕು: `int(input(...))`.\n\n' +
        '**f-strings** (modern way): `f"ನಮಸ್ಕಾರ {name}"` — `{}` ನಲ್ಲಿ ಯಾವ expression ಆದರೂ ಹಾಕಬಹುದು. `f"{price:.2f}"` → 2 decimals. `f"{x=}"` → debug ಗೆ perfect.',

      whyItMatters:
        'ಪ್ರತಿ CLI tool, ಪ್ರತಿ script, ಪ್ರತಿ educational example ಈ ಎರಡನ್ನೂ ಬಳಸುತ್ತದೆ. Debug ಮಾಡಲು ಕೂಡ `print()` ಅತ್ಯುತ್ತಮ — senior engineers ಕೂಡ print-debugging ಮಾಡುತ್ತಾರೆ!',

      steps: [
        'Python interactive mode (`python`) ಅಥವಾ notebook cell ತೆರೆಯಿರಿ.',
        '`print("ನಮಸ್ಕಾರ!")` ಮಾಡಿ. Output ಕಂಡಿತಾ?',
        'ಹಲವು values: `print("x =", 5, "y =", 10)` — values space ಜೊತೆ join ಆಗುತ್ತವೆ.',
        'Customize: `print("a", "b", "c", sep="|", end="!\\n")` → `a|b|c!`',
        '`name = input("ನಿಮ್ಮ ಹೆಸರು: ")` — ಏನಾದರೂ type ಮಾಡಿ Enter press ಮಾಡಿ.',
        '`print(name)` — ನೀವು type ಮಾಡಿದ್ದು ಕಾಣಿಸುತ್ತದೆ. `print(type(name))` → `<class \'str\'>`',
        '`age = int(input("ವಯಸ್ಸು: "))` — ಈಗ `age * 2` ಕೆಲಸ ಮಾಡುತ್ತದೆ ಏಕೆಂದರೆ `age` int ಆಗಿದೆ.',
        '`print(f"10 ವರ್ಷಗಳಲ್ಲಿ ನೀವು {age + 10} ವರ್ಷ ಆಗಿರುತ್ತೀರಿ!")`',
      ],

      pitfalls: [
        '**`input()` string return ಮಾಡುತ್ತದೆ** — `age = input("ವಯಸ್ಸು: ")` ನಂತರ `age + 1` TypeError! ಯಾವಾಗಲೂ convert ಮಾಡಿ: `int(input(...))`.',
        '**Bad input crash** — `int("ಇಪ್ಪತ್ತು")` ValueError ಬರುತ್ತದೆ. Real programs ನಲ್ಲಿ try/except ಬಳಸಿ.',
        '**`print("Score: " + 95)`** — TypeError (str + int). Use f-string: `print(f"Score: {95}")` ✓',
      ],

      tryIt:
        '"Personality quiz" 5 lines ನಲ್ಲಿ ಮಾಡಿ:\n' +
        '```\nname = input("ನಿಮ್ಮ ಹೆಸರು: ")\ncolor = input("ನೆಚ್ಚಿನ ಬಣ್ಣ: ")\nfood = input("ನೆಚ್ಚಿನ ಆಹಾರ: ")\nprint(f"\\n{name}, ನಿಮ್ಮ soul {color} {food} ಇದ್ದಂತೆ!")\nprint(f"Lucky number: {len(name) + len(color) + len(food)}")\n```\nRun ಮಾಡಿ! ಈಗ age ಕೂಡ ಕೇಳಿ, math ಮಾಡಿ, f-string ನಲ್ಲಿ 2 decimals ತೋರಿಸಿ.',

      takeaway:
        '`print()` ತೋರಿಸುತ್ತದೆ, `input()` ಕೇಳುತ್ತದೆ, **f-strings** ಅವನ್ನು ಒಳ್ಳೆ ರೀತಿ ಒಟ್ಟಿಗೆ ಸೇರಿಸುತ್ತದೆ. ಈ ಮೂರು tools ಎಲ್ಲ interactive programs ನ ಆಧಾರ.',
    },

    // ── m0-t7: Variables & naming conventions ─────────────────
    'm0-t7': {
      explain:
        '**Variable** ಎಂದರೆ ಒಂದು ಹೆಸರು — ಅದು memory ನಲ್ಲಿ ಒಂದು value ಅನ್ನು point ಮಾಡುತ್ತದೆ. `age = 30` ಬರೆದರೆ, `age` ಎಂದಾಗ Python memory ನಲ್ಲಿ 30 ಅನ್ನು ತರುತ್ತದೆ. Type declare ಮಾಡಬೇಕಿಲ್ಲ — Python ತಾನೇ figure out ಮಾಡುತ್ತದೆ.',

      analogy:
        'Variable ಒಂದು **label ಹಾಕಿದ box** ಇದ್ದಂತೆ. `age` label ಹಾಕಿ, ಒಳಗೆ 30 ಇಟ್ಟಿದ್ದೀರಿ. `age` ಎಂದಾಗ Python box ತೆರೆದು 30 ತರುತ್ತದೆ. `age = 31` ಮಾಡಿದರೆ ಹಳೆ value ಹೋಗಿ ಹೊಸ value ಬರುತ್ತದೆ.\n\n' +
        'C ಅಥವಾ Java ನಲ್ಲಿ box ನ size ಮತ್ತು type declare ಮಾಡಬೇಕು. Python ನಲ್ಲಿ ಅಗತ್ಯ ಇಲ್ಲ — ಯಾವ value, ಯಾವ size, ಯಾವಾಗಲಾದರೂ. ಇದನ್ನು **dynamic typing** ಎನ್ನುತ್ತಾರೆ.\n\n' +
        '**Naming conventions** label ಅನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಬರೆಯಿರಿ — ಇತರರು (ಮತ್ತು ಭವಿಷ್ಯದ ನೀವು) ಓದಬಹುದಾಗಲಿ.',

      theory:
        'Python ನಲ್ಲಿ `=` **assignment operator** (equals ಅಲ್ಲ — that is `==`). Value type ಯಾವಾಗ ಬೇಕಿದ್ದರೂ ಬದಲಾಗಬಹುದು.\n\n' +
        '**PEP 8** (official Python style guide) naming rules:\n' +
        '• **snake_case** — variables ಮತ್ತು functions ಗೆ: `user_name`, `total_amount`\n' +
        '• **PascalCase** — classes ಗೆ: `UserAccount`, `OrderManager`\n' +
        '• **UPPER_CASE** — constants ಗೆ: `MAX_RETRIES = 3`, `PI = 3.14159`\n' +
        '• **_leading_underscore** — private/internal names ಗೆ: `_helper_fn`\n\n' +
        'Python **keywords** (variable name ಆಗಿ ಬಳಸಲು ಆಗದ words): `if`, `else`, `for`, `while`, `def`, `class`, `import`, `return`, `True`, `False`, `None`, etc.\n\n' +
        '`list`, `dict`, `str`, `int` ಇತ್ಯಾದಿ builtins ಅನ್ನು variable name ಆಗಿ ಬಳಸಬಾರದು — `list = [1,2,3]` ಮಾಡಿದರೆ `list()` constructor ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ!',

      whyItMatters:
        'Code 10 ಪಟ್ಟು ಹೆಚ್ಚು ಓದಲಾಗುತ್ತದೆ, ಬರೆಯುವುದಕ್ಕಿಂತ. `x` ಎಂದರೆ ಏನೂ ಹೇಳುವುದಿಲ್ಲ; `monthly_revenue` ಎಲ್ಲ ಹೇಳುತ್ತದೆ. 6 ತಿಂಗಳ ನಂತರ ನಿಮ್ಮ code ನೋಡಿದಾಗ ಒಳ್ಳೆ names "ಆಹ, ಇದೇ ಮಾಡಿದ್ದೆ!" ಎನ್ನಿಸುತ್ತದೆ.',

      steps: [
        '`score = 95` assign ಮಾಡಿ. `print(score)` → 95.',
        'Reassign: `score = 100`. ಹಳೆ value ಹೋಗಿ ಹೊಸ value ಬಂತು.',
        'snake_case ಬಳಸಿ: `first_name`, `total_cost`, `is_active`.',
        'Booleans ಗೆ prefix: `is_admin`, `has_paid`, `can_edit`.',
        'Constants UPPER_CASE ನಲ್ಲಿ module top ನಲ್ಲಿ: `MAX_USERS = 100`.',
        'Multiple assignment: `a, b, c = 1, 2, 3`. Swap: `a, b = b, a` — ಎಷ್ಟು elegant!',
        'Type check: `type(score)` → `<class \'int\'>`.',
      ],

      pitfalls: [
        '**Builtins shadow ಮಾಡಿದರೆ** — `list = [1,2,3]` ಮಾಡಿದರೆ `list()` constructor ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ. `items`, `numbers` ತರಹ ಬೇರೆ name ಬಳಸಿ.',
        '**Single-letter names** — Loop indices ಗೆ OK (`i`, `j`), ಆದರೆ `x = customer.total_purchases` ತರಹ variables ಗೆ ಬೇಡ. `total_purchases` ಬಳಸಿ.',
        '**`=` vs `==`** — `=` assigns, `==` compares. `if x = 5:` syntax error (ಒಳ್ಳೆಯದೇ!). Condition ನಲ್ಲಿ `==` ಮಾತ್ರ.',
      ],

      tryIt:
        'ಒಂದು profile printer ಮಾಡಿ:\n' +
        '```\nFIRST_NAME = "ಪ್ರಿಯಾ"\nLAST_NAME = "ಶರ್ಮಾ"\nyear_of_birth = 1998\nCURRENT_YEAR = 2026\n\nfull_name = FIRST_NAME + " " + LAST_NAME\nage = CURRENT_YEAR - year_of_birth\n\nprint(f"{full_name} ಈಗ {age} ವರ್ಷ ಆಗಿದ್ದಾರೆ.")\nprint(f"50 ವರ್ಷ ತುಂಬಲು {50 - age} ವರ್ಷ ಬಾಕಿ.")\n```\nValues change ಮಾಡಿ re-run ಮಾಡಿ. Variable names ಎಷ್ಟು readable ಎಂದು ಗಮನಿಸಿ!',

      takeaway:
        '**Names ಎಂದರೆ documentation.** `monthly_revenue` ಹೇಳುತ್ತದೆ ಏನು; `mr` ಹೇಳುವುದಿಲ್ಲ. PEP 8 follow ಮಾಡಿ. Builtins shadow ಮಾಡಬೇಡಿ. ಒಳ್ಳೆ name ಆಯ್ಕೆ ಮಾಡಲು 5 ಸೆಕೆಂಡ್ ಕಳೆದರೆ, ಮುಂದೆ ಗಂಟೆಗಟ್ಟಲೆ ಉಳಿಯುತ್ತದೆ.',
    },

    // ── m0-t8: Comments and code style (PEP 8) ────────────────
    'm0-t8': {
      explain:
        '**Comments** ಮನುಷ್ಯರಿಗೆ ಬರೆದ notes, Python ignore ಮಾಡುತ್ತದೆ. `#` ನಿಂದ ಶುರು ಮಾಡಿ — ಆ line ಕೊನೆ ತನಕ comment. **PEP 8** Python ರ official style guide — indentation, spacing, naming rules. ಎಲ್ಲ Python developers ಅನುಸರಿಸುತ್ತಾರೆ, ಇದರಿಂದ ಯಾರ code ಕೂಡ same feel ನಲ್ಲಿ ಓದಬಹುದು.',

      analogy:
        'Doctor ರ prescription ಯೋಚಿಸಿ. ಬರೆದ medicines actual instruction (ನಿಮ್ಮ code). Margin ನಲ್ಲಿ note: "ಊಟದ ನಂತರ ತಕ್ಕೊಳ್ಳಿ" — ಅದು **comment**. Medicine ಇಲ್ಲದೆ ಕೆಲಸ ಮಾಡುವುದಿಲ್ಲ, note ಇಲ್ಲದೆ patient ತಪ್ಪಾಗಿ ತಕ್ಕೊಳ್ಳಬಹುದು.\n\n' +
        '**PEP 8** medical writing standard ತರಹ — neat, consistent. ಯಾವ doctor ರ prescription ಕೂಡ ಒಂದೇ format ನಲ್ಲಿ ಇರುತ್ತದೆ. ಹಾಗೇ Python code ಕೂಡ.',

      theory:
        '**3 ರೀತಿಯ explanatory text:**\n\n' +
        '1. **Single-line comment**: `# anything` — short notes ಗೆ\n' +
        '2. **Multi-line**: `#` ನಿಂದ ಶುರು ಮಾಡಿ ಹಲವು lines\n' +
        '3. **Docstring**: `"""..."""` — function/class ರ ಮೊದಲ statement ಆಗಿ. `help(funcname)` ತೋರಿಸುತ್ತದೆ.\n\n' +
        '**PEP 8 essentials:**\n' +
        '• **4 spaces** indent — tabs ಅಲ್ಲ\n' +
        '• Line length **88 chars** ಒಳಗೆ (Black formatter ರ default)\n' +
        '• Top-level functions/classes ನಡುವೆ **2 blank lines**\n' +
        '• Operators ಸುತ್ತ spaces: `x = 5` (ಒಳ್ಳೆಯದು), `x=5` (ಕೆಟ್ಟದ್ದು)\n\n' +
        '**Comments ಬರೆಯಲು golden rule**: WHY ಬರೆಯಿರಿ, WHAT ಅಲ್ಲ. `# add 1 to x` (bad) vs `# 0-indexed API ಅನ್ನು 1-indexed display ಗೆ convert` (good).',

      whyItMatters:
        'ಜೀವನದ 90% time code ಓದಲಾಗುತ್ತದೆ, 10% ಬರೆಯಲಾಗುತ್ತದೆ. PEP 8 code ಓದಲು ವೇಗ ಆಗುತ್ತದೆ. Code review ಮತ್ತು interviews ನಲ್ಲಿ ಕೊಳಕು formatting ಮತ್ತು missing comments ಕೆಟ್ಟ impression ಕೊಡುತ್ತದೆ.',

      steps: [
        'ಕಷ್ಟದ line ಮೇಲೆ comment ಹಾಕಿ: `# Hash + space + uppercase sentence`',
        'ಪ್ರತಿ function ಗೆ docstring ಬರೆಯಿರಿ — ಮೊದಲ line one-sentence summary.',
        '4-space indent ಬಳಸಿ. VS Code: Settings → Tab Size = 4, Insert Spaces = true.',
        '88 chars ಒಳಗೆ ಇರಲಿ. VS Code ಗೆ `"editor.rulers": [88]` ಹಾಕಿ.',
        'Black install ಮಾಡಿ: `pip install black`. Run: `black myfile.py` — auto-format!',
        'VS Code ನಲ್ಲಿ "Format on Save" enable ಮಾಡಿ — save ಮಾಡಿದಾಗ auto-format ಆಗುತ್ತದೆ.',
      ],

      pitfalls: [
        '**Code ಅನ್ನೇ ಹೇಳುವ comments** — `x = x + 1  # add 1 to x` ನಿರರ್ಥಕ. Comment ಇಲ್ಲದಿದ್ದರೂ code ಹೇಳುತ್ತದೆ.',
        '**Stale comments** — Code ಬದಲಾದರೆ comment ಬದಲಾಗದಿದ್ದರೆ comment LIE ಆಗುತ್ತದೆ. ಕೋಡ್ ಬದಲಾದಾಗ comment ಕೂಡ update ಮಾಡಿ.',
        '**Tabs ಮತ್ತು spaces mix** — Python 3 ಇದನ್ನು forbid ಮಾಡುತ್ತದೆ, `IndentationError` ಬರುತ್ತದೆ. ಯಾವಾಗಲೂ 4 spaces.',
      ],

      tryIt:
        'ಈ poorly-formatted code ಅನ್ನು clean up ಮಾಡಿ:\n' +
        '```\ndef calc(x,y,op):\n  if op=="add":\n    return x+y\n  elif op=="sub":\n    return x-y\n  else:return None\n```\n' +
        'Fix: 4-space indent, spaces around operators, docstring ಹಾಕಿ, ಒಳ್ಳೆ names.\n' +
        'ನಂತರ `black yourfile.py` run ಮಾಡಿ — ನಿಮ್ಮ cleanup ಮತ್ತು Black output compare ಮಾಡಿ!',

      takeaway:
        '**Black + format-on-save** ಹಾಕಿ — style ನ ಬಗ್ಗೆ ಯೋಚಿಸಲು ಬೇಡ. WHY ಮಾತ್ರ comment ಮಾಡಿ — WHAT code ಸ್ವಯಂ ಹೇಳುತ್ತದೆ.',
    },

    // ── m0-t9: Type casting ────────────────────────────────────
    'm0-t9': {
      explain:
        '**Type casting** ಎಂದರೆ ಒಂದು type ರ value ಅನ್ನು ಇನ್ನೊಂದು type ಗೆ convert ಮಾಡುವುದು. `int(x)` integer ಮಾಡುತ್ತದೆ, `float(x)` decimal ಮಾಡುತ್ತದೆ, `str(x)` string ಮಾಡುತ್ತದೆ, `bool(x)` True/False ಮಾಡುತ್ತದೆ.',

      analogy:
        'Currency exchange counter ಯೋಚಿಸಿ. **100 ಡಾಲರ್** (ಒಂದು type) ಕೊಟ್ಟಿರಿ, **ರೂಪಾಯಿ** (ಬೇರೆ type) ಪಡೆದಿರಿ — same value, different format.\n\n' +
        'Type casting ಅಂತೆಯೇ: `"42"` (string) → `int("42")` → `42` (actual integer, math ಮಾಡಬಹುದು). Exchange counter valid note ಮಾತ್ರ accept ಮಾಡುತ್ತದೆ — `int("hello")` → "ValueError" ಬರುತ್ತದೆ, hand-drawn note ತರಹ!',

      theory:
        'Python **strongly typed** — ತನ್ನಿಂದ ತಾನೇ types mix ಮಾಡುವುದಿಲ್ಲ. `"5" + 3` crash! Explicitly convert ಮಾಡಬೇಕು.\n\n' +
        '**4 main casts:**\n' +
        '• **`int(x)`** — integer ಗೆ. Float truncate ಮಾಡುತ್ತದೆ: `int(3.7)` → `3` (round ಅಲ್ಲ!)\n' +
        '• **`float(x)`** — decimal ಗೆ. `float("3.14")` → `3.14`\n' +
        '• **`str(x)`** — string ಗೆ. ಯಾವುದಾದರೂ ಸರಿ: `str([1,2])` → `"[1, 2]"`\n' +
        '• **`bool(x)`** — True/False ಗೆ\n\n' +
        '**Truthiness rule:**\n' +
        '**Falsy** (False ಆಗುತ್ತದೆ): `False`, `0`, `0.0`, `""`, `[]`, `{}`, `None`\n' +
        '**Truthy** (True ಆಗುತ್ತದೆ): ಬಾಕಿ ಎಲ್ಲ — surprise: `"False"` (non-empty string!) → True!\n\n' +
        '**ಎಚ್ಚರ**: `int("hello")` → `ValueError` raise ಮಾಡುತ್ತದೆ, None ಅಥವಾ 0 return ಅಲ್ಲ. try/except wrap ಮಾಡಿ.',

      whyItMatters:
        'Data ಯಾವಾಗ ಬಂದರೂ — user input, file read, API response — text ಆಗಿ ಬರುತ್ತದೆ. Math ಮಾಡಲು cast ಮಾಡಲೇಬೇಕು. ಇದು miss ಮಾಡಿದರೆ TypeError — ಅತ್ಯಂತ ಸಾಮಾನ್ಯ Python beginner bug.',

      steps: [
        'String to int: `n = int("42")`. String to float: `f = float("3.14")`.',
        'Number to string: `s = str(42)` → `"42"`. Concatenate ಮಾಡಲು ಉಪಯೋಗಿ.',
        '`int(3.7)` → `3` (truncates toward zero). Round ಮಾಡಲು: `round(3.7)` → `4`.',
        '`bool(...)` test: REPL ನಲ್ಲಿ `bool("")`, `bool(0)`, `bool([])`, `bool("False")` try ಮಾಡಿ.',
        'Safe input ಓದಿ:\n```\ntry:\n    age = int(input("ವಯಸ್ಸು: "))\nexcept ValueError:\n    print("Number type ಮಾಡಿ")\n```',
        'Type check: `isinstance(x, int)` → True/False.',
      ],

      pitfalls: [
        '**`int("3.5")` crash ಆಗುತ್ತದೆ** — `int()` float string parse ಮಾಡುವುದಿಲ್ಲ. ಮಾಡಬೇಕಿದ್ದರೆ: `int(float("3.5"))` → `3`.',
        '**`bool("False")` → True!** — Non-empty string ಆದ್ದರಿಂದ. text "true"/"false" convert ಮಾಡಲು: `s.lower() == "true"`.',
        '**`int(3.99)` → 3, not 4** — Truncate ಮಾಡುತ್ತದೆ, round ಅಲ್ಲ. 4 ಬೇಕಿದ್ದರೆ `round(3.99)`.',
        '**`input()` string return ಮಾಡುತ್ತದೆ** — `age = input("...")` ನಂತರ `if age > 18:` → TypeError. ಯಾವಾಗಲೂ `int(input(...))`.',
      ],

      tryIt:
        'Safe divide function ಮಾಡಿ:\n' +
        '```\ndef safe_divide(a_str, b_str):\n    try:\n        a = float(a_str)\n        b = float(b_str)\n        if b == 0:\n            return "ಶೂನ್ಯದಿಂದ ಭಾಗ ಮಾಡಲು ಆಗದು"\n        return round(a / b, 2)\n    except ValueError:\n        return "Numbers type ಮಾಡಿ"\n\nprint(safe_divide("10", "3"))    # 3.33\nprint(safe_divide("10", "0"))    # ಶೂನ್ಯದಿಂದ...\nprint(safe_divide("ಹತ್ತು", "3")) # Numbers type...\n```',

      takeaway:
        'Boundaries ನಲ್ಲಿ (input, files, APIs) ಯಾವಾಗಲೂ cast ಮಾಡಿ. User data ಗೆ try/except wrap ಮಾಡಿ. `int()` truncate ಮಾಡುತ್ತದೆ, `round()` round ಮಾಡುತ್ತದೆ. `bool("False")` → True ಎಂದು ನೆನಪಿಡಿ!',
    },

    // ── m0-t10: Numeric types ──────────────────────────────────
    'm0-t10': {
      explain:
        'Python ನಲ್ಲಿ ಮೂರು built-in number types ಇವೆ. **`int`** — ಪೂರ್ಣ ಸಂಖ್ಯೆಗಳು (1, -42, 1000000). **`float`** — ದಶಮಾಂಶ (3.14, -0.001). **`complex`** — imaginary numbers (2+3j) — physics ಮತ್ತು signal processing ನಲ್ಲಿ ಬಳಕೆ. ಹೆಚ್ಚಿನ ಬಾರಿ int ಮತ್ತು float ಮಾತ್ರ ಸಾಕು.',

      analogy:
        'ಸಿಹಿ ಅಂಗಡಿಯ weighing scale ಯೋಚಿಸಿ:\n' +
        '• **`int`** — ಲಡ್ಡು count: 1, 2, 3 — ಯಾವಾಗಲೂ ಪೂರ್ಣ ಸಂಖ್ಯೆ\n' +
        '• **`float`** — kg ನಲ್ಲಿ ತೂಕ: 1.25, 0.500 — decimals ಸೇರಿ\n' +
        '• **`complex`** — ಕಡಿಮೆ ಬಾರಿ ಬೇಕಾಗುತ್ತದೆ — engineering math ಗೆ\n\n' +
        '`float` 15 digits precision ತನಕ accurate. ಆದರೆ `0.1 + 0.2` = `0.30000000000000004`! ಏಕೆ? Float binary ಲ್ಲಿ store ಆಗುತ್ತದೆ, ಕೆಲ decimals binary ನಲ್ಲಿ exactly represent ಆಗುವುದಿಲ್ಲ.',

      theory:
        '**`int`** Python 3 ರಲ್ಲಿ **arbitrary precision** — `2 ** 1000` ಇಡೀ 302-digit number instant! Other languages ಗೆ limit ಇದೆ.\n\n' +
        '**`float`** IEEE 754 standard — 64-bit. 15-17 significant decimal digits precision.\n\n' +
        '**Float trap**: `0.1 + 0.2` → `0.30000000000000004`. `float` ಗಳನ್ನು `==` ನಿಂದ compare ಮಾಡಬೇಡಿ. `math.isclose(a, b)` ಬಳಸಿ.\n\n' +
        '**Money ಮತ್ತು exact math ಗೆ**: `decimal.Decimal` ಬಳಸಿ. Slower ಆದರೆ exact: `Decimal("0.1") + Decimal("0.2") == Decimal("0.3")` → True!',

      whyItMatters:
        'Data science ನಲ್ಲಿ totals, ratios, probabilities ಲೆಕ್ಕ ಹಾಕುತ್ತೀರಿ. Float equality trap ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ experiment results corrupt ಆಗಬಹುದು. Currency calculations ಗೆ Decimal — ಈ mistake ಮಾಡಿ banks real money ಕಳೆದಿವೆ!',

      steps: [
        'Type check: `type(5)` → int, `type(5.0)` → float, `type(2+3j)` → complex.',
        '`print(2 ** 200)` — 60+ digit number. No overflow!',
        '`print(0.1 + 0.2)` → `0.30000000000000004`. Float trap confirm!',
        '`import math; math.isclose(0.1 + 0.2, 0.3)` → True. Correct way!',
        '`from decimal import Decimal; Decimal("0.1") + Decimal("0.2")` → exact `Decimal("0.3")`.',
      ],

      pitfalls: [
        '**Float ಅನ್ನು `==` ನಿಂದ compare ಮಾಡಿದರೆ** — `0.1 + 0.2 == 0.3` → False. ಯಾವಾಗಲೂ `math.isclose(a, b)` ಬಳಸಿ.',
        '**Money float ನಲ್ಲಿ store ಮಾಡಿದರೆ** — Rounding errors ನಿಂದ pennies ಕಳೆದುಹೋಗುತ್ತವೆ. Currency ಗೆ ಯಾವಾಗಲೂ `Decimal`.',
        '**`nan == nan` → False** — `math.isnan(x)` ಬಳಸಿ detect ಮಾಡಿ.',
      ],

      tryIt:
        'Float trap investigate ಮಾಡಿ:\n' +
        '```\nx = 0.0\nfor _ in range(10):\n    x += 0.1\nprint(x)        # 1.0 ಅಲ್ಲ!\nprint(x == 1.0) # False!\n```\nDecimal ನಿಂದ ಮಾಡಿ:\n' +
        '```\nfrom decimal import Decimal\nx = Decimal("0.0")\nfor _ in range(10):\n    x += Decimal("0.1")\nprint(x)  # ಸರಿಯಾಗಿ 1.0!\n```',

      takeaway:
        'Int for counts, float for regular math (`isclose` for comparison), **Decimal for money**. **Float ಅನ್ನು `==` ನಿಂದ compare ಮಾಡಬೇಡಿ.**',
    },

    // ── m0-t11: Strings & string methods ──────────────────────
    'm0-t11': {
      explain:
        '**String** ಎಂದರೆ characters ರ sequence — text. `"ನಮಸ್ಕಾರ"`, `\'hello\'`, `"""multi\\nline"""`. Strings ಗೆ `.upper()`, `.split()`, `.strip()` ತರಹ dozens of built-in methods ಇವೆ — loops ಬರೆಯದೆ text slice, reshape, search, clean ಮಾಡಬಹುದು.',

      analogy:
        'String ಒಂದು **ಮಣಿಗಳ ಸರ** ಇದ್ದಂತೆ, ಪ್ರತಿ ಮಣಿ ಒಂದು character. `"hello"` → h-e-l-l-o ಐದು ಮಣಿ.\n\n' +
        'ನೀವು:\n' +
        '• Position ನಿಂದ ಒಂದು ಮಣಿ ತೆಗೆಯಬಹುದು: `s[0]` → "h"\n' +
        '• ಒಂದು section cut ಮಾಡಬಹುದು: `s[1:4]` → "ell"\n' +
        '• ಒಂದು machine ಮೂಲಕ ಕಳಿಸಿ NEW ಸರ ಪಡೆಯಬಹುದು: `s.upper()` → "HELLO"\n\n' +
        '**ಮುಖ್ಯ**: Python strings **immutable** — ಒಂದು ಮಣಿ ಬದಲಾಯಿಸಲು ಆಗದು. Methods ಯಾವಾಗಲೂ **ಹೊಸ string** return ಮಾಡುತ್ತವೆ.',

      theory:
        'Quote styles:\n' +
        '• `\'single\'` ಮತ್ತು `"double"` — ಒಂದೇ. Text ನಲ್ಲಿ ಒಂದು ಇದ್ದರೆ ಇನ್ನೊಂದು ಬಳಸಿ: `"Anil\'s book"`\n' +
        '• `"""triple"""` — multi-line ಗೆ, docstrings ಗೆ\n\n' +
        '**Most-used methods** (ಎಲ್ಲ NEW string return ಮಾಡುತ್ತವೆ):\n' +
        '• `.upper()`, `.lower()`, `.title()` — case\n' +
        '• `.strip()` — edges ರಿಂದ whitespace remove\n' +
        '• `.replace(old, new)` — substitute\n' +
        '• `.split(sep)` — list ಗೆ ಒಡೆ: `"a,b,c".split(",")` → `["a","b","c"]`\n' +
        '• `",".join(["a","b","c"])` → `"a,b,c"` — split ರ opposite\n' +
        '• `.startswith()`, `.endswith()` — boolean check\n' +
        '• `len(s)` — length\n\n' +
        '**Slicing**: `s[start:stop:step]`. `s[:3]` first 3, `s[3:]` from 3 onwards, `s[::-1]` reversed!\n\n' +
        '**f-strings**: `f"ನಮಸ್ಕಾರ {name}"`. Format: `{price:.2f}` → 2 decimals, `{x=}` → debug.',

      whyItMatters:
        'ಎಲ್ಲ programs text manipulate ಮಾಡುತ್ತವೆ — file paths, user input, API responses, CSV columns. String methods loops ಬರೆಯದೆ ಈ ಕೆಲಸ ಮಾಡುತ್ತವೆ. f-strings output formatting ಸುಲಭ ಮಾಡುತ್ತವೆ.',

      steps: [
        'Single, double, ಅಥವಾ triple quotes ಬಳಸಿ create ಮಾಡಿ.',
        'Length: `len(s)`. Index: `s[0]` (first), `s[-1]` (last).',
        'Slice: `s[1:4]`, `s[:3]`, `s[3:]`, `s[::-1]` (reverse).',
        'Methods: `"  hello  ".strip()` → `"hello"`. `"hello".upper()` → `"HELLO"`.',
        'Split: `"ಅಕ್ಕಿ,ತೊಗರಿ,ಉದ್ದು".split(",")` → list.',
        'Join: `", ".join(["ಅಕ್ಕಿ","ತೊಗರಿ","ಉದ್ದು"])` → single string.',
        'f-string: `name = "ರಾಮ"; f"ನಮಸ್ಕಾರ {name}!"`',
      ],

      pitfalls: [
        '**Strings immutable** — `s[0] = "H"` TypeError. ಹೊಸ string ಮಾಡಬೇಕು: `"H" + s[1:]`.',
        '**`"5" + 3` TypeError** — String ಮತ್ತು int add ಮಾಡಲು ಆಗದು. Convert ಮಾಡಿ: `"5" + str(3)` ಅಥವಾ `int("5") + 3`.',
        '**Case-sensitive comparison** — `"Hello" == "hello"` → False. Compare ಮಾಡಲು: `s.lower() == "hello"`.',
      ],

      tryIt:
        'ಒಂದು name formatter ಮಾಡಿ:\n' +
        '```\nname = input("ಹೆಸರು ಟೈಪ್ ಮಾಡಿ: ")\nclean = name.strip().title()\nprint(f"Formatted: {clean}")\nprint(f"Length: {len(clean)} letters")\nprint(f"Reversed: {clean[::-1]}")\nprint(f"Uppercase: {clean.upper()}")\n```\n' +
        '"  ANIRUDH SHARMA  " ಹಾಕಿ run ಮಾಡಿ. `.strip()` ಮತ್ತು `.title()` magic ನೋಡಿ!',

      takeaway:
        'Strings immutable — methods ಯಾವಾಗಲೂ new string return ಮಾಡುತ್ತವೆ. `len()`, slice, f-strings, `.split()`, `.join()` — ಇವು daily bread. `==` compare ಮಾಡುವ ಮೊದಲು `.lower()` ಮಾಡಿ.',
    },

    'm0-t12': {
      explain: '**Boolean** ಎಂದರೆ ಕೇವಲ ಎರಡೇ values: `True` ಅಥವಾ `False`. ಎರಡು ವಸ್ತುಗಳನ್ನು compare ಮಾಡಿದಾಗ (`5 > 3` → True) result ಒಂದು boolean ಆಗುತ್ತದೆ. **Comparison operators** (`==`, `!=`, `<`, `>`, `<=`, `>=`) booleans return ಮಾಡುತ್ತವೆ. **Logical operators** (`and`, `or`, `not`) ಅವನ್ನು combine ಮಾಡುತ್ತವೆ.',
      analogy: '**ಉದಾಹರಣೆ:**\nBooleans ಒಂದು **ವಿದ್ಯುತ್ ಸ್ವಿಚ್ ಇದ್ದ ಹಾಗೆ** — ಕೇವಲ ON ಅಥವಾ OFF. ನಿಮ್ಮ code ನಲ್ಲಿ ಪ್ರತಿ `if` statement "ಈ switch ON ಇದೆಯಾ?" ಎಂದು ಕೇಳುತ್ತದೆ.\n\nComparison operators ಎಂದರೆ ನೀವು ಕೇಳುವ **ಪ್ರಶ್ನೆಗಳು**: "age 18 ಗಿಂತ ಹೆಚ್ಚಿದೆಯಾ?", "ಈ ಎರಡು strings equal ಇದೆಯಾ?" — ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ yes/no ಉತ್ತರ ಸಿಗುತ್ತದೆ.\n\n**ಬ್ಯಾಂಕ್ ಉದಾಹರಣೆ**: ಲೋನ್ ಕೊಡಬೇಕಾ? "salary ₹30,000 ಗಿಂತ ಹೆಚ್ಚಿದೆ **AND** CIBIL score 700 ಗಿಂತ ಹೆಚ್ಚಿದೆ" — ಎರಡೂ True ಇದ್ದರೆ ಮಾತ್ರ ಅನುಮತಿ.',
      theory: 'Python ನಲ್ಲಿ `True` ಮತ್ತು `False` (capital T ಮತ್ತು F — ಮಹತ್ವದ್ದು!) ಮಾತ್ರ booleans. ಒಳಗಡೆ `True` = 1, `False` = 0.\n\n**Comparison operators**:\n• `==` value equality: `5 == 5.0` → True (type ಬೇರೆ, value ಒಂದೇ).\n• `!=` not equal.\n• `<`, `>`, `<=`, `>=` — numbers, strings (alphabetically), tuples ಮೇಲೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ.\n• `is` / `is not` — memory ನಲ್ಲಿ ಒಂದೇ object ಇದೆಯಾ ಎಂದು test ಮಾಡುತ್ತದೆ. **`None`, `True`, `False` ಗೆ ಮಾತ್ರ `is` ಉಪಯೋಗಿಸಿ**: `if x is None:`.\n• `in` / `not in` membership: `"a" in "apple"` → True.\n\n**Logical operators**:\n• `and` — ಎರಡೂ True ಇರಬೇಕು. **Short-circuit**: ಮೊದಲನೆಯದು False ಆದರೆ ಎರಡನೆಯದನ್ನು ಸಹ check ಮಾಡುವುದಿಲ್ಲ.\n• `or` — ಒಂದಾದರೂ True ಇದ್ದರೆ ಸಾಕು.\n• `not` — True ↔ False ಬದಲಿಸುತ್ತದೆ.\n\n**Chained comparisons** (Python ಸೌಂದರ್ಯ): `0 < x < 10` ಎಂದರೆ `0 < x and x < 10` — algebra ಯ ಹಾಗೆ ಓದಬಹುದು.\n\n**Truthiness**: `if x:` ಎಂದು ಬರೆದರೆ x boolean ಆಗಿರಬೇಕಿಲ್ಲ. ಖಾಲಿ list `[]`, `0`, `""`, `None` — "falsy". ಉಳಿದೆಲ್ಲ "truthy". ಅದಕ್ಕೇ `if items:` ಬರೆಯಬಹುದು.',
      whyItMatters: 'ಪ್ರತಿ `if`, `while`, `filter` — ಎಲ್ಲವೂ booleans ಮೇಲೆ ನಿಲ್ಲುತ್ತದೆ. `==` vs `is` ಗೊಂದಲ, `and` vs `&` ತಪ್ಪು — ಇವು ತಡೆಯಲು ಕಷ್ಟವಾದ bugs ಮಾಡುತ್ತದೆ. Interview ನಲ್ಲಿ "Python truthiness ಎಂದರೇನು?" ಎಂಬ ಪ್ರಶ್ನೆ ಖಂಡಿತ ಬರುತ್ತದೆ.',
      steps: [
        'REPL ನಲ್ಲಿ basic comparisons try ಮಾಡಿ: `5 > 3`, `"a" == "A"`, `"abc" < "abd"`.',
        '`and`/`or` ಜೊತೆ combine ಮಾಡಿ: `(age >= 18) and has_license`.',
        'Chain comparisons: `0 <= score <= 100` — ಇದು math ಯ ಹಾಗೆ ಓದುತ್ತದೆ.',
        '`None` check ಗೆ `is None` ಉಪಯೋಗಿಸಿ, `== None` ಅಲ್ಲ.',
        'Truthiness ಬಳಸಿ: `if items:` (list non-empty ಇದ್ದರೆ True), `if name:`.',
        'Membership ಗೆ `in` ಬಳಸಿ: `if user in admins:`, `if "@" in email:`.',
        'Boolean assign ಮಾಡಬಹುದು: `is_adult = age >= 18`.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** `is` ಅನ್ನು value compare ಗೆ ಬಳಸಿದರೆ — `x is 1000` ಸಣ್ಣ numbers ಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಆದರೆ ದೊಡ್ಡ numbers ಗೆ False ಬರಬಹುದು. `is` ಕೇವಲ `None`, `True`, `False` ಗೆ ಮಾತ್ರ.',
        '**ಸಮಸ್ಯೆ.** `True`/`False` ಬದಲು `true`/`false` ಬರೆದರೆ NameError. Python ಕಡ್ಡಾಯವಾಗಿ Capital T/F ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** `and`/`or` (logical) ಮತ್ತು `&`/`|` (bitwise) ಬೆರೆಸಿದರೆ — arrays/numpy ನಲ್ಲಿ ಬಹಳ ವ್ಯತ್ಯಾಸ ಆಗುತ್ತದೆ. Conditions ನಲ್ಲಿ ಯಾವಾಗಲೂ `and`/`or` ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** `not` precedence: `not x or y` ಎಂದರೆ `(not x) or y`. Doubt ಇದ್ದರೆ parentheses ಹಾಕಿ.',
        '**ಸಮಸ್ಯೆ.** Short-circuit trap: `count = count or 10` — `count` 0 ಆಗಿದ್ದರೆ 10 ಆಗುತ್ತದೆ! 0 valid value ಆಗಿದ್ದರೆ `count if count is not None else 10` ಬಳಸಿ.',
      ],
      tryIt: 'ಒಂದು user validator ಬರೆಯಿರಿ:\n```\ndef validate_user(name, age, email):\n    if not name:\n        return False, "Name required"\n    if not (0 < age < 150):\n        return False, f"Invalid age: {age}"\n    if "@" not in email or "." not in email:\n        return False, "Invalid email"\n    return True, "OK"\n\nprint(validate_user("Anil", 30, "anil@x.com"))   # (True, "OK")\nprint(validate_user("", 30, "anil@x.com"))       # (False, "Name required")\n```\nExtend ಮಾಡಿ: name minimum 2 characters ಇರಬೇಕು, age integer ಆಗಿರಬೇಕು.',
      takeaway: '`==` values compare ಗೆ, `is` ಕೇವಲ None ಗೆ. `and`/`or`/`not` logical operators. Chained comparisons `0 <= x < 10` ಬರೆಯಿರಿ. `if items:` truthiness ಬಳಸಿ — clean Pythonic code.',
    },

    'm0-t13': {
      explain: 'Python arithmetic: `+`, `-`, `*`, `/` normal. ಮೂರು special: `//` (floor division — ಭಾಗಿಸಿ remainder discard), `%` (modulo — remainder ಮಾತ್ರ ಇಡು), `**` (exponent — ಘಾತ). `x += 5` ಎಂದರೆ `x = x + 5` — assignment shortcut.',
      analogy: '**ಉದಾಹರಣೆ:**\n**17 ಮಾವಿನಕಾಯಿ ಮತ್ತು 5 ಮಕ್ಕಳು** — ಹಂಚಬೇಕು:\n• `17 / 5` → `3.4` — ನಿಖರ ಭಾಗ (ಭಿನ್ನ ಸಂಖ್ಯೆ).\n• `17 // 5` → `3` — ಪ್ರತಿ ಮಗುವಿಗೆ ಇಡೀ ಮಾವಿನಕಾಯಿ.\n• `17 % 5` → `2` — ಉಳಿದ ಮಾವಿನಕಾಯಿ.\n• `17 ** 2` → `289` — 17 ವರ್ಗ.\n\n**Modulo ಶಕ್ತಿ**: "ಈ number even ಇದೆಯಾ?" → `n % 2 == 0`. "100 iterations ಗೊಮ್ಮೆ run ಮಾಡು" → `if i % 100 == 0`. Seconds ನಿಂದ hours:min:sec convert ಮಾಡಲು `%` ಮತ್ತು `//` ಉಪಯೋಗ.',
      theory: '**Arithmetic operators** (ಹೆಚ್ಚಿನ precedence ಮೊದಲು):\n1. `**` — ಘಾತ. **Right-associative**: `2 ** 3 ** 2` = `2 ** (3**2)` = 512.\n2. Unary `+x`, `-x`.\n3. `*` `/` `//` `%`.\n4. `+` `-`.\n\n**ಎರಡು divisions, ಒಂದು ದೊಡ್ಡ ವ್ಯತ್ಯಾಸ**:\n• `/` — ಯಾವಾಗಲೂ float return: `6 / 2` → `3.0` (int ಅಲ್ಲ!).\n• `//` — floor (ಕೆಳಕ್ಕೆ round): `7 // 2` → `3`. Negative ಜೊತೆ: `-7 // 2` → `-4` (−∞ ಕಡೆ round).\n\n**Modulo** `%` remainder. Sign divisor ಅನ್ನು follow ಮಾಡುತ್ತದೆ: `-7 % 2` → `1`.\n\n**Augmented assignment** (`+=`, `-=`, `*=`, `/=`, `//=`, `**=`, `%=`):\n`x += 5` ಎಂದರೆ `x = x + 5`. Lists ಗೆ `+=` in-place modify ಮಾಡುತ್ತದೆ. ints/strings ಗೆ rebind ಮಾಡುತ್ತದೆ.',
      whyItMatters: '99% programs arithmetic ಮಾಡುತ್ತದೆ. `/` vs `//` ತಪ್ಪು ಬಳಕೆ float-where-int bugs ಮಾಡುತ್ತದೆ. Modulo cycling, parity, digit extraction ಗೆ elegant solution. `+=` counters/accumulators ಗೆ standard pattern.',
      steps: [
        'REPL ನಲ್ಲಿ try: `7 + 3`, `7 - 3`, `7 * 3`, `7 / 3` (=2.333), `7 // 3` (=2), `7 % 3` (=1), `7 ** 3` (=343).',
        '`/` ಯಾವಾಗಲೂ float ಕೊಡುತ್ತದೆ ಎಂದು note ಮಾಡಿ: `6 / 2` → `3.0`.',
        '`//` "ಎಷ್ಟು full groups?" ಗೆ: `students // per_class`.',
        '`%` parity ಗೆ: `if n % 2 == 0` — even number.',
        '`**` power ಗೆ: `2 ** 8` (256), `9 ** 0.5` (square root = 3.0).',
        'Augmented assignment: `count += 1`, `total += price`.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** `/` vs `//` ಗೊಂದಲ. `total / count` float ಕೊಡುತ್ತದೆ, `total // count` truncate ಮಾಡುತ್ತದೆ. Rounding ಬೇಕಾದರೆ `round(total / count)` ಉಪಯೋಗಿಸಿ.',
        '**ಸಮಸ್ಯೆ.** Negative floor division: `-7 // 2` → `-4`, `-3` ಅಲ್ಲ. Python −∞ ಕಡೆ floor ಮಾಡುತ್ತದೆ.',
        '**ಸಮಸ್ಯೆ.** Float precision: `0.1 + 0.2 != 0.3`. Float equality ಗೆ `math.isclose()` ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** Operator precedence: `2 + 3 * 4` = 14, 20 ಅಲ್ಲ. `2 ** 3 ** 2` = 512 (right-associative). Doubt ಇದ್ದರೆ parentheses.',
        '**ಸಮಸ್ಯೆ.** Shared list ಜೊತೆ `+=`: `b = a; a += [99]` ಎರಡೂ b, a modify ಮಾಡುತ್ತದೆ. Strings/ints ಗೆ safe, lists ಗೆ careful.',
      ],
      tryIt: 'ಮೂರು functions ಬರೆಯಿರಿ:\n```\ndef seconds_to_hms(s):\n    return (s // 3600, (s % 3600) // 60, s % 60)\n\ndef is_leap_year(y):\n    return (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0)\n\ndef digit_count(n):\n    count = 0\n    while n > 0:\n        n //= 10\n        count += 1\n    return count or 1\n\nprint(seconds_to_hms(3725))   # (1, 2, 5)\nprint(is_leap_year(2024))     # True\nprint(digit_count(12345))     # 5\n```\n`//` ಮತ್ತು `%` ಜೊತೆ numbers decompose ಮಾಡುವ ಶಕ್ತಿ ನೋಡಿ!',
      takeaway: '`/` float ಕೊಡುತ್ತದೆ, `//` floor ಕೊಡುತ್ತದೆ. `%` parity/cycling/digit math ಗೆ. `+=` counters ಗೆ standard. Doubt ಇದ್ದರೆ parentheses ಹಾಕಿ.',
    },

    'm0-t14': {
      explain: '**Precedence** ಎಂದರೆ ಯಾವ operator ಮೊದಲು ಕೆಲಸ ಮಾಡಬೇಕು ಎಂಬ ನಿಯಮ. `2 + 3 * 4` = 14, 20 ಅಲ್ಲ — ಏಕೆಂದರೆ `*` ಮೊದಲು ಓಡುತ್ತದೆ. School algebra (BODMAS) ಯಂತೆಯೇ, ಕೆಲವು Python-specific twist ಸಹ ಇದೆ.',
      analogy: '**ಉದಾಹರಣೆ:**\nನೀವು hotel ನಲ್ಲಿ order ಕೊಟ್ಟಿರಿ: "**ಮೊದಲು ಕಾಫಿ ಮಾಡಿ, ನಂತರ sandwich toast ಮಾಡಿ, ಎರಡನ್ನೂ tray ಮೇಲೆ ಇಟ್ಟು table ಗೆ ತಂದುಕೊಡಿ**". Waiter sandwich toast ಮಾಡುವ ಮುಂಚೆ ಖಾಲಿ tray table ಗೆ ತಂದರೆ order ತಪ್ಪಾಗುತ್ತದೆ. Code ಕೂಡಾ ಹಾಗೇ — Python ಗೆ fixed ಕ್ರಮ ಇರಬೇಕು.\n\nPrecedence = ಪ್ರತಿ operator ನ **rank**. High rank ಮೊದಲು. Same rank ಇದ್ದಾಗ **associativity** ತೀರ್ಮಾನ ಮಾಡುತ್ತದೆ.\n\n**Practical rule**: ಪೂರಾ table ನೆನಪಿಡಬೇಕಿಲ್ಲ. **Doubt ಬಂದಾಗ parentheses ಹಾಕಿ** — code human ಗೂ machine ಗೂ clear ಆಗುತ್ತದೆ.',
      theory: 'Python precedence table (top = ಹೆಚ್ಚಿನ rank, ಮೊದಲು run):\n\n1. `()` — explicit grouping.\n2. `**` — ಘಾತ (**right-associative**: `2**3**2` = `2**(3**2)` = 512).\n3. Unary `+x`, `-x`.\n4. `*`, `/`, `//`, `%`.\n5. `+`, `-`.\n6. `<<`, `>>`.\n7. `&` bitwise AND.\n8. `^` bitwise XOR.\n9. `|` bitwise OR.\n10. Comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=`, `is`, `in`.\n11. `not`.\n12. `and`.\n13. `or`.\n14. `=`, `+=` — assignments.\n\n**Associativity**: ಹೆಚ್ಚಿನ operators **left-to-right**: `a - b - c` = `(a-b)-c`. `**` ಮಾತ್ರ **right-to-left**.\n\n**Comparison chaining**: `0 < x < 10` = `(0 < x) and (x < 10)` — Python unique feature.\n\n**ನೆನಪಿಡಿ** ಈ 3 rules:\n• `*`/`/` ಮೊದಲು `+`/`-`.\n• `**` right-associative.\n• Comparisons `and`/`or` ಮೊದಲು.',
      whyItMatters: 'Precedence ತಪ್ಪಾದರೆ error ಬರುವುದಿಲ್ಲ — ತಪ್ಪು answer ಬರುತ್ತದೆ! ಅದಕ್ಕೇ ಇಂಥ bugs ಕಂಡುಹಿಡಿಯಲು ಕಷ್ಟ. `not a == b` ಎಂದು ಬರೆದರೆ Python `not (a == b)` ಅಂದರ್ಥ ಮಾಡಿಕೊಳ್ಳುತ್ತದೆ — ಅದೇ ನೀವು ಬಯಸಿದ್ದಾ? Parentheses ಇಡುವ ಅಭ್ಯಾಸ ಇಂಥ subtle bugs ತಡೆಯುತ್ತದೆ.',
      steps: [
        'Basic test: `2 + 3 * 4` → 14, `(2 + 3) * 4` → 20.',
        'Exponentiation right-associativity: `2 ** 3 ** 2` → 512.',
        'Mixed logical: `True or False and False` → True (and ಮೊದಲು).',
        'Explicitly group: `(True or False) and False` → False.',
        'Chaining: `1 < 5 < 10` → True.',
        'Real code ನಲ್ಲಿ ಯಾವಾಗಲೂ parentheses ಹಾಕಿ — extra parens ತೊಂದರೆ ಇಲ್ಲ.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** `-2 ** 2` = -4, 4 ಅಲ್ಲ. Unary minus `**` ಗಿಂತ loose. `(-2) ** 2` = 4 ಬೇಕಾದರೆ parentheses ಹಾಕಿ.',
        '**ಸಮಸ್ಯೆ.** `2 ** 3 ** 2` = 512 (right-associative). `(2**3)**2 = 64` ಬೇಕಿದ್ದರೆ parentheses.',
        '**ಸಮಸ್ಯೆ.** `not x == 5` = `not (x == 5)` = `x != 5`. `(not x) == 5` ಬೇರೆ! Mixed `not` expressions ಗೆ parentheses.',
        '**ಸಮಸ್ಯೆ.** `a or b and c` = `a or (b and c)`. `(a or b) and c` ಬೇಕಿದ್ದರೆ parentheses.',
        '**ಸಮಸ್ಯೆ.** `&` (bitwise) vs `and` (logical) — different precedence, different meaning. Conditions ನಲ್ಲಿ `and`/`or` ಮಾತ್ರ.',
      ],
      tryIt: 'ಪ್ರತಿ expression ನ value predict ಮಾಡಿ, ನಂತರ run ಮಾಡಿ verify ಮಾಡಿ:\n```\nprint(1 + 2 * 3)                 # ?\nprint((1 + 2) * 3)               # ?\nprint(2 ** 3 ** 2)               # ?\nprint(10 / 2 / 5)                # ?\nprint(True and False or True)    # ?\nprint(not True or False)         # ?\nprint(5 < 10 < 20)               # ?\nprint(-3 ** 2)                   # ?\nprint((-3) ** 2)                 # ?\n```\n7+ ಸರಿ ಮಾಡಿದರೆ good intuition. Real code ನಲ್ಲಿ ಮಾತ್ರ parentheses ಹಾಕುವುದನ್ನು ಮರೆಯಬೇಡಿ!',
      takeaway: 'Table ನೆನಪಿಡಬೇಕಿಲ್ಲ. **`*` before `+`**, **`**` right-associative**, **comparisons before `and`/`or`** — ಈ 3 rules ಸಾಕು. ಉಳಿದೆಲ್ಲ: **parentheses ಹಾಕಿ**. Code human ಮೊದಲು ಓದುತ್ತಾನೆ, machine ನಂತರ.',
    },

    'm0-t15': {
      explain: '`if`/`elif`/`else` program ಗೆ **decision ಮಾಡುವ ಶಕ್ತಿ** ಕೊಡುತ್ತದೆ. "ಈ condition true ಆದರೆ ಇದನ್ನು ಮಾಡು; ಇಲ್ಲದಿದ್ದರೆ ಅದನ್ನು ಮಾಡು." Python ಮೇಲಿನಿಂದ ಕೆಳಗೆ check ಮಾಡಿ ಮೊದಲ match ಆದ branch ಮಾತ್ರ run ಮಾಡುತ್ತದೆ.',
      analogy: '**ಉದಾಹರಣೆ:**\n**ರೈಲು signal** ಯೋಚಿಸಿ:\n• **Green ಇದ್ದರೆ** → ಮುಂದೆ ಹೋಗು.\n• **Yellow ಇದ್ದರೆ** → ನಿಧಾನ ಮಾಡು.\n• **Red ಇದ್ದರೆ** → ನಿಲ್ಲು.\n\nಒಂದೇ branch run ಆಗುತ್ತದೆ. ಒಮ್ಮೆ match ಸಿಕ್ಕಿದ ಮೇಲೆ Python ಉಳಿದದ್ದನ್ನು skip ಮಾಡುತ್ತದೆ. **ಕ್ರಮ ಮಹತ್ವದ್ದು**: yellow ಮೊದಲು check ಮಾಡಿದರೆ green ಗೆ chance ಸಿಗುವುದಿಲ್ಲ.\n\n**Indentation** = Python ಗಡಿ. `{  }` braces ಬದಲಿಗೆ **4 spaces** — ಇದು structure.',
      theory: 'Syntax:\n```\nif condition_1:\n    # condition_1 truthy ಆದರೆ run\nelif condition_2:\n    # condition_1 False ಆದರೆ ಮಾತ್ರ check\nelse:\n    # ಎಲ್ಲ False ಆದರೆ run (optional)\n```\n\n**Key rules**:\n• Top-to-bottom check; **ಮೊದಲ match** ಮಾತ್ರ run.\n• `elif` = "else if" — Python ನ special keyword.\n• `else` optional — default action ಬೇಡದಿದ್ದರೆ drop ಮಾಡಿ.\n• `elif` ಎಷ್ಟು ಬೇಕಾದರೂ ಹಾಕಬಹುದು.\n• Block ಒಳಗೆ **4 spaces indent** mandatory.\n• `if items:`, `if user:` — truthiness ಕೆಲಸ ಮಾಡುತ್ತದೆ.\n\n**Ternary** (one-line): `value_if_true if condition else value_if_false`.\nSimple decisions ಗೆ: `parity = "even" if n % 2 == 0 else "odd"`. Complex logic ಗೆ regular if-else ಬಳಸಿ.',
      whyItMatters: 'Decision-making programming ನ ಎರಡನೇ fundamental. ಪ್ರತಿ form validation, role-based feature, A/B test, error handler, business rule — ಎಲ್ಲ if/elif chains. ಇದು ತಿಳಿಯದೇ ಯಾವ real program ಬರೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.',
      steps: [
        'Simple start: `if x > 0:` ಬರೆದು next line indent ಮಾಡಿ. Run ಮಾಡಿ — condition true ಆಗಿದ್ದರೆ ಮಾತ್ರ block run ಆಗುತ್ತದೆ.',
        '`else:` add ಮಾಡಿ alternative ಗೆ. if ಜೊತೆ same indent level.',
        '`elif` ಹಾಕಿ multiple conditions ಗೆ. ಬೇಕಾದಷ್ಟು ಹಾಕಬಹುದು.',
        'Specific conditions ಮೊದಲು, general conditions ನಂತರ. ಇಲ್ಲದಿದ್ದರೆ general ಎಲ್ಲವನ್ನು swallow ಮಾಡುತ್ತದೆ.',
        'Truthiness: `if items:` (non-empty list), `if name:` (non-empty string).',
        'Simple picks ಗೆ ternary: `status = "pass" if score >= 60 else "fail"`.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Wrong indentation — tabs ಮತ್ತು spaces mix ಮಾಡಿದರೆ `IndentationError`. Editor 4 spaces ಉಪಯೋಗಿಸಲು configure ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** Conditions ನ ಕ್ರಮ ತಪ್ಪಾದರೆ — `if x < 100: ... elif x < 50:` ಎಂದರೆ second branch ಎಂದೂ trigger ಆಗುವುದಿಲ್ಲ. Specific cases ಮೊದಲು ಹಾಕಿ.',
        '**ಸಮಸ್ಯೆ.** `elif` ಬದಲು nested `if` ಬಳಸಿದರೆ — multiple `if`s ಪ್ರತ್ಯೇಕವಾಗಿ check ಆಗುತ್ತದೆ, only-one-branch guarantee ಇಲ್ಲ. Flatten ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** `else` ನಲ್ಲಿ too much trust — validation exhaustive ಆಗಿಲ್ಲದಿದ್ದರೆ else invalid data process ಮಾಡುತ್ತದೆ.',
        '**ಸಮಸ್ಯೆ.** Complex ternary: `x = a if b else (c if d else (e if f else g))` — ಓದಲು impossible. Regular if/elif ಬಳಸಿ.',
      ],
      tryIt: 'Grade calculator ಬರೆಯಿರಿ:\n```\ndef grade(score):\n    if not (0 <= score <= 100):\n        return "Invalid score"\n    if score >= 90:\n        return "A"\n    elif score >= 80:\n        return "B"\n    elif score >= 70:\n        return "C"\n    elif score >= 60:\n        return "D"\n    else:\n        return "F"\n\nfor s in [95, 82, 71, 65, 45, -5, 105]:\n    print(s, "→", grade(s))\n```\nExtend ಮಾಡಿ: "B+" (88-89), "B" (83-87), "B-" (80-82) suffix ಹಾಕಿ.',
      takeaway: '**`if`/`elif`/`else` decisions ಮಾಡುತ್ತದೆ.** Specific-to-general order. Truthiness `if items:`. 4 spaces indent. Complex ternary ಬೇಡ — regular if block clarity ಕೊಡುತ್ತದೆ.',
    },

    'm0-t16': {
      explain: '`for` ಒಂದು collection ನ **ಪ್ರತಿ item ಗೆ ಒಮ್ಮೆ** block ಓಡಿಸುತ್ತದೆ (list, string, dictionary, range — ಏನಾದರೂ). `range(5)` 0,1,2,3,4 ಕೊಡುತ್ತದೆ — "N ಬಾರಿ ಮಾಡು" ಗೆ perfect.',
      analogy: '**ಉದಾಹರಣೆ:**\n**ಅಂಚೆ ಕಚೇರಿ ಮಾದರಿ** ಯೋಚಿಸಿ: ಒಂದು stack letters ಇದೆ. ಒಂದೊಂದನ್ನು ತಕ್ಕೊಂಡು ಓದಿ, ಪಕ್ಕ ಇಟ್ಟು, ಮುಂದಿನದು ತೆಗೆದುಕೊಳ್ಳಿ — stack ಖಾಲಿ ಆಗುವ ತನಕ. ಅದು `for` loop. ಪ್ರತಿ "letter" collection ನ ಒಂದು value; loop body "ಓದುವ ಕೆಲಸ".\n\n**5 ಬಾರಿ** ಮಾಡಬೇಕಾದರೆ `range(5)` → 0,1,2,3,4 ಕೊಡುತ್ತದೆ. `i` variable ಪ್ರತಿ value ತಕ್ಕೊಳ್ಳುತ್ತದೆ.\n\n**`enumerate`** = index ಮತ್ತು item ಎರಡೂ ಬೇಕಾದಾಗ. `for i, name in enumerate(names):` — "1. Anil, 2. Priya..." ಥರ.',
      theory: 'Python `for` = **for-each** loop. Syntax: `for variable in iterable: body`.\n\n**Iterables**: lists, tuples, strings (ಒಂದೊಂದು char), sets, dicts (keys), files (lines), generators, `range` objects.\n\n**`range()`**:\n• `range(stop)` → 0 to stop−1.\n• `range(start, stop)` → start to stop−1.\n• `range(start, stop, step)` → step ಜಿಗಿಯುತ್ತದೆ.\n• End-exclusive (slicing ಹಾಗೆ).\n• **Lazy** — memory ನಲ್ಲಿ full list ಇಡುವುದಿಲ್ಲ. `range(10**9)` fine.\n\n**`enumerate(iterable, start=0)`** → index ಕೂಡ ಕೊಡುತ್ತದೆ.\n\n**`zip(a, b)`** → ಎರಡು iterables parallel ಆಗಿ walk. Shortest ಮುಗಿದಾಗ ನಿಲ್ಲುತ್ತದೆ.\n\n**Dict iterate**: `for key in d:` keys. Values: `d.values()`. Pairs: `d.items()`.',
      whyItMatters: 'Loops programming ನ workhorse. 1000 rows process ಮಾಡಲು `for` ಇಲ್ಲದಿದ್ದರೆ 1000 ಬಾರಿ copy-paste ಮಾಡಬೇಕು. `enumerate` ಮತ್ತು `zip` ತಿಳಿದವರೆ intermediate programmer ಎನಿಸಿಕೊಳ್ಳುತ್ತಾರೆ.',
      steps: [
        'List walk: `for name in ["Anil", "Priya"]: print(name)`.',
        'N ಬಾರಿ: `for i in range(5): print(i)` → 0,1,2,3,4.',
        'Custom range: `for n in range(2, 11, 2): print(n)` → 2,4,6,8,10.',
        'Index ಮತ್ತು value: `for i, x in enumerate(items): ...`.',
        'ಎರಡು lists parallel: `for name, age in zip(names, ages): ...`.',
        'Dict: `for k, v in d.items(): print(k, v)`.',
        'String: `for ch in "hello": print(ch)` — ಒಂದೊಂದು char.',
        '`continue` skip ಗೆ, `break` early exit ಗೆ.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Iterate ಮಾಡುತ್ತಿರುವ list ನ್ನೇ modify ಮಾಡಿದರೆ items skip ಆಗುತ್ತದೆ. Copy ಮೇಲೆ iterate: `for x in lst[:]:`.',
        '**ಸಮಸ್ಯೆ.** `range(len(items))` antipattern — `for i in range(len(items)): print(items[i])` ಬದಲು `enumerate(items)` ಉಪಯೋಗಿಸಿ.',
        '**ಸಮಸ್ಯೆ.** `range(5)` → 0..4, 1..5 ಅಲ್ಲ. End exclusive. `range(1, 6)` → 1..5.',
        '**ಸಮಸ್ಯೆ.** `for x in mydict:` ಕೇವಲ keys ಕೊಡುತ್ತದೆ. Pairs ಗೆ `mydict.items()` ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** 3 levels nested loops — O(n³) — ಸಾಮಾನ್ಯವಾಗಿ algorithm ಬದಲಿಸಬೇಕು ಅಥವಾ pandas ಬಳಸಬೇಕು.',
      ],
      tryIt: 'ಮೂರು classic exercises:\n\n**1. FizzBuzz:**\n```\nfor n in range(1, 31):\n    if n % 15 == 0: print("FizzBuzz")\n    elif n % 3 == 0: print("Fizz")\n    elif n % 5 == 0: print("Buzz")\n    else: print(n)\n```\n\n**2. Manual max (without `max()`):**\n```\nnums = [3, 7, 2, 9, 4, 1]\nbest = nums[0]\nfor n in nums[1:]:\n    if n > best:\n        best = n\nprint(best)\n```\n\n**3. Star pyramid:**\n```\nfor i in range(1, 6):\n    print(" " * (5-i) + "*" * (2*i-1))\n```\nExtend ಮಾಡಿ: pyramid ಅನ್ನು upside-down ತೋರಿಸಿ.',
      takeaway: '`for` + `range()` "N ಬಾರಿ" ನಿಂದ "ಪ್ರತಿ row process" ತನಕ ಎಲ್ಲ ಮಾಡುತ್ತದೆ. Manual counters ಬದಲು **`enumerate`**, parallel loops ಬದಲು **`zip`**. Iterables everywhere — ಒಮ್ಮೆ ಕಲಿತರೆ code ಚಿಕ್ಕದಾಗುತ್ತದೆ.',
    },

    'm0-t17': {
      explain: '`while condition: body` — condition `True` ಇರುವ ತನಕ body ಓಡಿಸುತ್ತಲೇ ಇರುತ್ತದೆ. **ಮೊದಲೇ ಎಷ್ಟು iterations ಎಂದು ತಿಳಿಯದಿದ್ದಾಗ** ಉಪಯೋಗಿಸಿ — "quit ಟೈಪ್ ಮಾಡುವ ತನಕ ಕೇಳು", "server respond ಮಾಡುವ ತನಕ retry ಮಾಡು".',
      analogy: '**ಉದಾಹರಣೆ:**\n**`for` loop** = "jar ನಲ್ಲಿರುವ ಪ್ರತಿ laddu ತಿನ್ನು" (ಮೊದಲೇ ಗೊತ್ತು).\n**`while` loop** = "ಹೊಟ್ಟೆ ತುಂಬುವ ತನಕ laddu ತಿನ್ನು" (ಎಷ್ಟು ತಿನ್ನಬೇಕು ಮೊದಲೇ ಗೊತ್ತಿಲ್ಲ).\n\n**ಬ್ಯಾಂಕ್ ಉದಾಹರಣೆ**: ಅರ್ಜಿ form ತುಂಬುವಾಗ "ಎಲ್ಲ fields correct ಆಗಿ ತುಂಬಿಸುವ ತನಕ ಮತ್ತೆ ಮತ್ತೆ ಕೇಳು" — ಎಷ್ಟು ಬಾರಿ ತಪ್ಪು ಮಾಡ್ತಾರೆ ಮೊದಲೇ ಗೊತ್ತಿಲ್ಲ.\n\n`while True:` + `break` pattern: loop ಯಾವಾಗಲೂ run ಆಗುತ್ತದೆ, `break` ಇರುವ ಕಡೆ exit ಆಗುತ್ತದೆ.',
      theory: 'Syntax:\n```\nwhile condition:\n    body\n    # ಏನಾದರೂ condition ಬದಲಿಸಬೇಕು\n    # ಇಲ್ಲದಿದ್ದರೆ infinite loop!\n```\n\n**ಎರಡು ರೀತಿ**:\n\n**1. Condition-driven**:\n```\ncount = 5\nwhile count > 0:\n    print(count)\n    count -= 1   # condition eventually False ಮಾಡುತ್ತದೆ\n```\n\n**2. `while True` + break**:\n```\nwhile True:\n    line = input("> ")\n    if line == "quit":\n        break\n    process(line)\n```\nBody ನ ಒಳಗೆ exit condition ಇದ್ದಾಗ ಈ style prefer.\n\n**`continue`** = current iteration skip, ಮುಂದಿನದಕ್ಕೆ ಹೋಗು.\n**`break`** = loop ಬಿಟ್ಟು ಹೊರಗೆ ಹೋಗು.\n\n**for vs while ಆಯ್ಕೆ**:\n• Collection walk ಅಥವಾ known count → `for`.\n• Unknown count, condition-based → `while`.',
      whyItMatters: 'Retry logic, API polling, game loops, "user done ಆಗುವ ತನಕ" flows — ಇವೆಲ್ಲ `for` loop ಮಾಡಲಾಗದ್ದು. Real-world programs ಗೆ `while` essential. Infinite loop ತಡೆಯಲು ಕಲಿಯುವುದು production engineer skill.',
      steps: [
        '`while condition:` ಬರೆದು body indent ಮಾಡಿ. Body ಒಳಗೆ condition ಬದಲಿಸುವ ಏನಾದರೂ ಇದೆಯಾ ಎಂದು check ಮಾಡಿ.',
        'Simple counter test: `i = 0; while i < 5: print(i); i += 1`.',
        'Interactive patterns ಗೆ `while True:` + `break` ಬಳಸಿ.',
        'Exit path ಯಾವಾಗಲೂ ಇರಬೇಕು. Trace ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲದಿದ್ದರೆ loop suspect.',
        'Input validation ಒಳಗೆ `continue` ಬಳಸಿ retry ಮಾಡಿ.',
        'Runaway loop ನಿಲ್ಲಿಸಲು **Ctrl+C** terminal ನಲ್ಲಿ.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Infinite loop — condition variable update ಮರೆತರೆ. `while count > 0: print(count)` — decrement ಇಲ್ಲ! Ctrl+C ನಂತರ `count -= 1` add ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** `while i <= len(arr)` → out of bounds. `< len(arr)` ಬಳಸಿ. ಇಲ್ಲವೆ `for` ಉಪಯೋಗಿಸಿ.',
        '**ಸಮಸ್ಯೆ.** `continue` ಮಾಡಿದ ನಂತರ `while` condition update ಮರೆತರೆ — infinite loop. Increment BEFORE continue ಹಾಕಿ.',
        '**ಸಮಸ್ಯೆ.** Known list ಗೆ `while` ಉಪಯೋಗಿಸಿದರೆ — `while i < len(lst): ... i += 1` verbose. `for x in lst:` ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** Retry loop ನಲ್ಲಿ `try/except` ಇಲ್ಲದಿದ್ದರೆ — ಮೊದಲ failure ಕ್ರಾಶ್ ಮಾಡುತ್ತದೆ, retry ಆಗುವುದಿಲ್ಲ.',
      ],
      tryIt: 'Number guessing game ಮಾಡಿ:\n```\nimport random\ntarget = random.randint(1, 100)\nattempts = 0\nmax_attempts = 7\nprint("1-100 ನಡುವೆ ಒಂದು number pick ಮಾಡಿದ್ದೇನೆ!")\n\nwhile attempts < max_attempts:\n    raw = input(f"Guess #{attempts+1}: ")\n    try:\n        guess = int(raw)\n    except ValueError:\n        print("Number ಟೈಪ್ ಮಾಡಿ")\n        continue\n    attempts += 1\n    if guess == target:\n        print(f"{attempts} tries ನಲ್ಲಿ ಸರಿ ಹೇಳಿದಿರಿ!")\n        break\n    elif guess < target:\n        print("ಹೆಚ್ಚಿದೆ")\n    else:\n        print("ಕಡಿಮೆ")\nelse:\n    print(f"Chances ಮುಗಿದವು. Answer {target}")\n```\n`else` block `break` ಆಗದೇ loop ಮುಗಿದಾಗ ಮಾತ್ರ run ಆಗುತ್ತದೆ!',
      takeaway: '**`while` unknown-count ಅಥವಾ event-driven loops ಗೆ.** Condition False ಆಗುವ path ಯಾವಾಗಲೂ ಖಚಿತಪಡಿಸಿ. **`while True:` + `break`** exit body ನಲ್ಲಿ ಇದ್ದಾಗ clean pattern. Doubt ಇದ್ದರೆ `for` ಆಯ್ಕೆ ಮಾಡಿ — fewer footguns.',
    },

    'm0-t18': {
      explain: 'Loops control ಮಾಡಲು ಮೂರು ಸಣ್ಣ ಆದರೆ ಮುಖ್ಯ keywords:\n• **`break`** — ಈ loop ನಿಂದ ಈಗಲೇ ಹೊರಗೆ ಬರು.\n• **`continue`** — ಈ iteration skip ಮಾಡಿ ಮುಂದಿನದಕ್ಕೆ ಜಿಗಿ.\n• **`pass`** — ಏನೂ ಮಾಡಬೇಡ (placeholder, syntax ಗೆ ಮಾತ್ರ).',
      analogy: '**ಉದಾಹರಣೆ:**\nನೀವು **resumes ಗುಂಪು** review ಮಾಡುತ್ತಿದ್ದೀರಿ:\n• Perfect candidate ಸಿಕ್ಕರೆ → **`break`**: review ನಿಲ್ಲಿಸಿ, finish.\n• Email ಇಲ್ಲದ resume ಸಿಕ್ಕರೆ → **`continue`**: ಇದನ್ನು skip, ಮುಂದಿನದಕ್ಕೆ.\n• Manager "review function ಬರೆ" ಎಂದರು ಆದರೆ ಏನು ಮಾಡಬೇಕೆಂದು decide ಮಾಡಿಲ್ಲ → `pass` ಬರೆದು error ಇಲ್ಲದೆ run ಮಾಡಿ.\n\n`break` ಮತ್ತು `continue` loop **CONTROL** ಗೆ. `pass` ಕೇವಲ **SYNTAX** ಗೆ — Python ಖಾಲಿ block ಸಹಿಸಲಾರದು, `pass` ಆ ಜಾಗ ತುಂಬಿಸುತ್ತದೆ.',
      theory: '**`break`**: ಒಳಗಿನ (innermost) `for` ಅಥವಾ `while` loop ನಿಂದ ತಕ್ಷಣ ಹೊರಗೆ. Body ನಲ್ಲಿ break ನಂತರ ಬರುವ code skip ಆಗುತ್ತದೆ.\n\n**`continue`**: ಈಗಿನ iteration ಬಿಟ್ಟು ಮುಂದಿನದಕ್ಕೆ. `for` ನಲ್ಲಿ next item; `while` ನಲ್ಲಿ condition re-check.\n\n**`pass`**: no-op. ಏನೂ ಮಾಡುವುದಿಲ್ಲ. Python syntax ಗೆ ಪ್ರತಿ block ನಲ್ಲಿ ಏನಾದರೂ ಬೇಕು — `pass` "ಇಲ್ಲಿ ನಂತರ ಬರೆಯುತ್ತೇನೆ" ಎಂಬ scaffolding.\n\n**Nesting trap**: `break`/`continue` ಕೇವಲ **innermost** loop ಗೆ ಮಾತ್ರ. Nested loops ನಲ್ಲಿ inner ನಿಂದ break ಮಾಡಿದರೆ outer ಮುಂದುವರೆಯುತ್ತದೆ. ಎರಡೂ ಬಿಟ್ಟು ಹೊರಗೆ ಬರಲು:\n1. Flag: `done = False; ... if X: done = True; break` ಮತ್ತು inner ನಂತರ check.\n2. Function ಒಳಗೆ wrap ಮಾಡಿ `return` ಬಳಸಿ — ಸ್ವಚ್ಛವಾದ ರೀತಿ.\n3. Exception raise — ಬಹಳ heavy.\n\n**`return`** function ನಿಂದ ಹೊರಗೆ ಬರುತ್ತದೆ — ಒಳಗಿನ ಎಲ್ಲ loops ಸಹ exit ಆಗುತ್ತವೆ.',
      whyItMatters: 'Real algorithms ಗೆ early exit ("found, stop"), bad input skip ("malformed row, skip"), scaffolding placeholder ಬೇಕಾಗುತ್ತದೆ. Production code ನಲ್ಲಿ `pass` ಉಳಿಸಿದರೆ silent bugs — interview ನಲ್ಲಿ "break vs continue ವ್ಯತ್ಯಾಸ ಏನು?" ಎಂಬ ಪ್ರಶ್ನೆ regular.',
      steps: [
        '`break` early exit ಗೆ — search/found/done patterns.',
        '`continue` bad iterations skip ಗೆ — None values skip ಮಾಡುವಂತೆ.',
        '`pass` skeleton code ಗೆ placeholder: `def f(): pass`.',
        'Nested loop semantics ನೆನಪಿಡಿ: `break` ಕೇವಲ inner loop exit ಮಾಡುತ್ತದೆ.',
        'Multi-level break ಬೇಕಾದರೆ function + `return` ಬಳಸಿ.',
        'Production code ನಲ್ಲಿ `pass` ಎಂದೂ ಬಿಡಬೇಡಿ — ಅದು hidden TODO.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** `break` multiple levels exit ಮಾಡುತ್ತದೆ ಎಂದು ಭಾವಿಸುವುದು. ಕೇವಲ innermost ಬಿಡುತ್ತದೆ. Function + `return` refactor ಮಾಡಿ ಅಥವಾ flag ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** `while` ನಲ್ಲಿ `continue` ನಂತರ condition update ಮರೆಯುವುದು. `while i < 10: if x: continue; i += 1` — increment skip ಆಗಿ infinite loop. Increment BEFORE continue ಹಾಕಿ.',
        '**ಸಮಸ್ಯೆ.** Production ನಲ್ಲಿ `pass` ಉಳಿಸಿದರೆ — function ಏನೂ ಮಾಡುವುದಿಲ್ಲ, silent bug. Real logic ಬರೆಯಿರಿ.',
        '**ಸಮಸ್ಯೆ.** `pass` ಬದಲು `...` (Ellipsis) ಹೆಚ್ಚು communicative — `def f(): ...` "ನಂತರ implement ಮಾಡುತ್ತೇನೆ" ಎಂದು ತೋರಿಸುತ್ತದೆ.',
        '**ಸಮಸ್ಯೆ.** Loop ಹೊರಗೆ `break`/`continue` — SyntaxError. ಕೇವಲ `for`/`while` ಒಳಗೆ ಮಾತ್ರ.',
      ],
      tryIt: 'Numbers list process ಮಾಡಿ:\n• Negative ಸಿಕ್ಕರೆ stop.\n• Zero ಸಿಕ್ಕರೆ skip.\n• ಉಳಿದದ್ದನ್ನು sum ಮಾಡಿ.\n```\ndef safe_sum(nums):\n    total = 0\n    for n in nums:\n        if n < 0:\n            print(f"Negative {n}, stopping")\n            break\n        if n == 0:\n            continue\n        total += n\n    return total\n\nprint(safe_sum([5, 0, 3, 7, 0, 2]))     # 17\nprint(safe_sum([5, 3, -1, 7]))          # 8 (stopped at -1)\nprint(safe_sum([0, 0, 0]))              # 0\n```\nExtend ಮಾಡಿ: 100 ಗಿಂತ ಹೆಚ್ಚಾದ values outliers — `continue` ಮಾಡಿ warning print ಮಾಡಿ.',
      takeaway: '**`break` exit, `continue` skip, `pass` placeholder.** ಕೇವಲ **innermost** loop ಗೆ effect. Nested loops ನಿಂದ ಹೊರಗೆ ಬರಲು function + `return` ಬಳಸಿ. ಪ್ರತಿಯೊಂದರ intent ಬೇರೆ — ಎಚ್ಚರಿಕೆಯಿಂದ ಬಳಸಿ.',
    },

    'm0-t19': {
      explain: '**Nested loop** ಎಂದರೆ loop ಒಳಗೆ loop. Outer loop ಪ್ರತಿ iteration ಗೆ inner loop **ಪೂರ್ಣ** run ಆಗುತ್ತದೆ. Grids, tables, pairs, combinations — 2D ಅಥವಾ "A ಮತ್ತು B ಎಲ್ಲ combinations" ಗೆ ಬಳಸಿ.',
      analogy: '**ಉದಾಹರಣೆ:**\n**ಶಾಲೆ timetable** ಯೋಚಿಸಿ — 5 ದಿನಗಳು, ಪ್ರತಿ ದಿನ 6 periods. ಎಲ್ಲ classes print ಮಾಡಲು outer loop ದಿನಗಳು, inner loop periods:\n```\nfor day in days:           # 5 outer\n    for period in periods:  # 6 inner ಪ್ರತಿ outer ಗೆ\n        print(day, period)\n```\nಒಟ್ಟು 30 print calls. **Multiplication** ಮುಖ್ಯ insight — outer 1000, inner 1000 ಆದರೆ **ONE MILLION** inner iterations. **O(n²)** complexity — ಸ್ವಲ್ಪ ತಪ್ಪಾದರೆ code slow.\n\n**ಕೃಷಿ ಉದಾಹರಣೆ**: 10 farmers, ಪ್ರತಿ farmer ಗೆ 50 plots — ಎಲ್ಲ plots survey ಮಾಡಲು 500 visits.',
      theory: '**Structure**:\n```\nfor outer_var in outer_iter:\n    for inner_var in inner_iter:\n        body  # m × n times run\n```\n\n**Time complexity**: outer m, inner n → m × n executions. ಎರಡೂ 10,000 ಆದರೆ 100 million — ಬಹಳ slow.\n\n**Common patterns**:\n1. **2D grid walk**: `for row in matrix: for cell in row: ...`\n2. **All pairs**: `for i in items: for j in items: ...`\n3. **Unique pairs**: `for i in range(n): for j in range(i+1, n): ...`\n4. **Cross product**: `for color in colors: for size in sizes: ...`\n\n**Smart shortcuts**:\n• `itertools.product(A, B)` — cross product flat loop ನಲ್ಲಿ.\n• `itertools.combinations(items, 2)` — unique pairs.\n• Pandas `merge` / NumPy broadcasting — vectorise.\n\n**Nested conditions**: 3+ levels nesting (loop > if > loop > if > loop) code smell. Helper function ಗೆ extract ಮಾಡಿ.',
      whyItMatters: '2D data — matrices, tables, image pixels, dependency graphs — nested loops ಇಲ್ಲದೆ process ಮಾಡಲಾಗದು. ಆದರೆ naive code O(n²) ಆಗಿ "10 minutes ಯಾಕೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದೆ?" ಎಂಬ ಸಮಸ್ಯೆ. Senior engineers complexity recognize ಮಾಡಿ smarter patterns ಬಳಸುತ್ತಾರೆ.',
      steps: [
        'Outer/inner choose: outer = ದೊಡ್ಡದು, inner = ಚಿಕ್ಕದು.',
        'List of lists walk: outer rows, inner row items.',
        'Unique pairs ಗೆ inner loop `range(i+1, n)` ಬಳಸಿ.',
        'Complexity estimate: m × n. ಬಹಳ ದೊಡ್ಡದಾದರೆ vectorised/hash alternative.',
        'Two collections combinations ಗೆ `itertools.product(A, B)` — flat loop, Pythonic.',
        'Unique combinations ಗೆ `itertools.combinations(items, k)`.',
        '3+ levels nesting ಆದರೆ helper function ಗೆ extract.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Big data ಮೇಲೆ accidental O(n²) — 100,000 items ಎಲ್ಲ pairs = 10 ಬಿಲಿಯನ್ ops. Hash set/dict ಬಳಸಿ O(n) ಗೆ ಇಳಿಸಿ.',
        '**ಸಮಸ್ಯೆ.** Variable shadowing: `for i in ...: for i in ...:` — outer i overwrite ಆಗುತ್ತದೆ. Distinct names ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** Nested loop ಒಳಗೆ collection modify ಮಾಡಿದರೆ — items skip/repeat ಆಗುತ್ತದೆ. Copy ಮೇಲೆ iterate ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** `break` ಎರಡು levels exit ಮಾಡುತ್ತದೆ ಎಂಬ ಭ್ರಮೆ. Function + `return` ಅಥವಾ flag ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** 3+ levels nesting almost always code smell. Helper functions ಗೆ extract ಮಾಡಿ — `process_row()`, `find_in_section()`.',
      ],
      tryIt: 'ಮೂರು exercises:\n\n**1. 5×5 multiplication table** nested for loops ಮೂಲಕ.\n\n**2. Duplicate pairs find** — naive O(n²):\n```\nnums = [3, 1, 4, 1, 5, 9, 2, 6, 5]\nfor i in range(len(nums)):\n    for j in range(i+1, len(nums)):\n        if nums[i] == nums[j]:\n            print(f"Duplicate {nums[i]} at {i},{j}")\n```\nಈಗ `set` ಬಳಸಿ O(n) ಗೆ rewrite ಮಾಡಿ — big lists ನಲ್ಲಿ much faster.\n\n**3. Pascal\'s triangle** — first 5 rows. ಪ್ರತಿ row 1 ರಿಂದ ಆರಂಭ, 1 ಗೆ ಮುಗಿಯುತ್ತದೆ; ಮಧ್ಯ values ಮೇಲಿನ ಎರಡರ sum.',
      takeaway: 'Nested loops powerful ಆದರೆ **complexity multiply** (m × n). 2D walks ಗೆ natural; "all pairs" ಗೆ **`itertools.combinations`**; cross products ಗೆ **`itertools.product`**; multi-level early exit ಗೆ **function + return**.',
    },

    'm0-t20': {
      explain: '**List** ಎಂದರೆ ordered, mutable sequence. `[3, 1, 4, "hello", True]` — ಒಂದೇ list, ಬೇರೆ types, ಎಲ್ಲ OK. Lists Python ನ workhorse: ದಿನಾ build ಮಾಡುತ್ತೀರಿ, sort ಮಾಡುತ್ತೀರಿ, slice ಮಾಡುತ್ತೀರಿ.',
      analogy: '**ಉದಾಹರಣೆ:**\n**ರೈಲು carriages numbered ಆಗಿ** ಯೋಚಿಸಿ — Carriage 0, 1, 2, 3… ಪ್ರತಿಯೊಂದು carriage ಒಂದು value ಅನ್ನು ಹಿಡಿಯುತ್ತದೆ. ರೈಲು **ordered** (carriage 0 ಮೊದಲು), **mutable** (carriage 2 ಒಳಗಿನ value ಬದಲಾಯಿಸಬಹುದು), **resizable** (ಹೊಸ carriages ಸೇರಿಸಬಹುದು).\n\n**Indexing** = "carriage 2 ನಲ್ಲಿ ಏನು ಇದೆ?" → `train[2]`.\n**Slicing** = "carriages 1 ರಿಂದ 4" → `train[1:5]` (end-exclusive!).\n**Append** = ಕೊನೆಗೆ ಹೊಸ carriage attach.\n**Pop** = ಕೊನೆಯ carriage ಬಿಡಿಸಿ ತೆಗೆದುಕೊಡಿ.\n\nNegative indexing: `train[-1]` = ಕೊನೆಯ carriage.',
      theory: 'Lists Python ನ **dynamic array**. Memory ನಲ್ಲಿ items contiguous; full ಆದಾಗ capacity double — `.append()` **amortised O(1)**.\n\n**Creation**:\n• Literal: `[1, 2, 3]` ಅಥವಾ `[]`.\n• Constructor: `list("abc")` → `["a","b","c"]`.\n• Repetition: `[0] * 5` → `[0,0,0,0,0]`.\n• Comprehension: `[x*x for x in range(5)]`.\n\n**Indexing**: `lst[0]`, `lst[-1]`. Out-of-range → IndexError.\n\n**Slicing**: `lst[start:stop:step]` — END EXCLUSIVE. `lst[::-1]` reverses (new copy).\n\n**Adding**:\n• `.append(x)` — end (most common).\n• `.insert(i, x)` — index i ಗೆ insert (O(n)).\n• `.extend([x, y])` ಅಥವಾ `lst += [x, y]`.\n\n**Removing**:\n• `.pop()` — last item remove + return.\n• `.pop(i)` — index i.\n• `.remove(x)` — first occurrence by value (raises if missing).\n• `del lst[i]` — by index.\n• `.clear()` — empty.\n\n**Searching**: `x in lst`, `lst.index(x)`, `lst.count(x)`.\n\n**Sorting**:\n• `lst.sort()` — IN PLACE, returns **None**!\n• `sorted(lst)` — NEW list.\n• Both: `key=fn`, `reverse=True`.\n• `sorted(words, key=len)`, `sorted(rows, key=lambda r: r[1])`.',
      whyItMatters: 'Lists ನೀವು care ಮಾಡುವ data ಹಿಡಿಯುತ್ತದೆ — sensor readings, CSV rows, search results. "Add", "remove", "sort", "slice" ಗೆ correct method ತಿಳಿದರೆ 10-line manual loop 1-line ಆಗುತ್ತದೆ. Interview ನಲ್ಲಿ list manipulation ಪ್ರತಿ round ನಲ್ಲಿ ಇರುತ್ತದೆ.',
      steps: [
        'Create: `nums = [3, 1, 4, 1, 5, 9]`. Length: `len(nums)`.',
        'Index: `nums[0]`, `nums[-1]`. Slice: `nums[1:4]`.',
        'Add: `.append(2)`, `.insert(0, 99)`, `+= [7, 6]`.',
        'Remove: `.pop()`, `.pop(0)`, `.remove(5)`, `del nums[2]`.',
        'Sort in place: `nums.sort()`. New copy: `sorted(nums, reverse=True)`.',
        'Membership: `if 5 in nums:`. Position: `nums.index(5)`.',
        'Reverse: `nums[::-1]` (new) ಅಥವಾ `nums.reverse()` (in place).',
        'Comprehension: `squares = [x*x for x in range(10)]`.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** `.sort()` vs `sorted()` confusion. `result = nums.sort()` — result is **None**! `.sort()` mutate ಮಾಡುತ್ತದೆ, return ಏನೂ ಇಲ್ಲ. New sorted list ಬೇಕಾದರೆ `sorted(nums)`.',
        '**ಸಮಸ್ಯೆ.** Slicing end EXCLUSIVE. `lst[1:3]` items 1, 2 — 3 ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Iteration ಸಮಯದಲ್ಲಿ list mutate. `for x in lst: lst.remove(x)` — items skip. Copy ಮೇಲೆ iterate: `for x in lst[:]:`.',
        '**ಸಮಸ್ಯೆ.** Nested list trap: `grid = [[0]*3] * 3` — same inner list ನ 3 references! `grid[0][0] = 1` ಎಲ್ಲ rows ಬದಲಿಸುತ್ತದೆ. `[[0]*3 for _ in range(3)]` ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** `.remove(x)` x ಇಲ್ಲದಿದ್ದರೆ ValueError. `if x in lst:` check ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** Lists dict keys ಆಗಲಾಗದು — mutable, unhashable. Tuples ಬಳಸಿ.',
      ],
      tryIt: 'ನಾಲ್ಕು classic list problems:\n\n**1. Manual reverse:**\n```\ndef my_reverse(lst):\n    out = []\n    for x in lst:\n        out.insert(0, x)\n    return out\n```\n\n**2. Second-largest unique:**\n```\ndef second_largest(nums):\n    uniq = sorted(set(nums), reverse=True)\n    return uniq[1] if len(uniq) >= 2 else None\nprint(second_largest([5, 2, 8, 8, 1]))    # 5\n```\n\n**3. Palindrome check:**\n```\ndef is_palindrome(lst):\n    return lst == lst[::-1]\n```\n\n**4. Flatten:**\n```\nnested = [[1,2], [3,4,5], [6]]\nflat = [x for row in nested for x in row]\nprint(flat)   # [1, 2, 3, 4, 5, 6]\n```',
      takeaway: 'Lists everyday container — ordered, mutable, fast. Master `.append`, `[a:b]` slice, `sorted(...)` vs `.sort()`, list comprehensions. ಇವು ಜೊತೆ daily tasks 1-2 lines ಆಗುತ್ತದೆ.',
    },

    'm0-t21': {
      explain: '**Tuple** list ಹಾಗೆ — ordered sequence — ಆದರೆ **immutable**: ಒಮ್ಮೆ create ಆದ ಮೇಲೆ contents ಬದಲಿಸಲಾಗದು. `(1, 2, 3)`. **Fixed records** ಗೆ ಬಳಸಿ — coordinate `(x, y)`, RGB `(255, 128, 0)` — ಮತ್ತು function ನಿಂದ multiple values return ಮಾಡಲು.',
      analogy: '**ಉದಾಹರಣೆ:**\n**List** = ಬರೆಯುವ notebook. ಯಾವುದೇ ಪುಟ ಅಳಿಸಿ ಮತ್ತೆ ಬರೆಯಬಹುದು.\n**Tuple** = ಪ್ರಿಂಟ್ ಆದ ಪ್ರಮಾಣ ಪತ್ರ (certificate). ಮಾಹಿತಿ ಶಾಶ್ವತ.\n\nಯಾಕೆ immutable ಬೇಕು? ಮೂರು ಕಾರಣಗಳು:\n1. **Safety**: function tuple ತೆಗೆದುಕೊಂಡರೆ data ಬದಲಿಸಲಾಗದು.\n2. **Hashability**: tuples **dict keys** ಆಗಬಹುದು (lists ಆಗಲಾಗದು).\n3. **Performance**: tuples ಸ್ವಲ್ಪ faster, ಕಡಿಮೆ memory.\n\n**Packing & unpacking** = tuple ನ superpower. `point = (3, 5)` packs; `x, y = point` unpacks. Python functions naturally multiple values return ಮಾಡಬಹುದು.',
      theory: '**Creation**:\n• Parens: `(1, 2, 3)` ಅಥವಾ commas only: `t = 1, 2, 3`.\n• Single-element: `(5,)` — **trailing comma mandatory**! `(5)` just int.\n• Empty: `()` ಅಥವಾ `tuple()`.\n• From iterable: `tuple([1, 2, 3])`.\n\n**Indexing/slicing** lists ಹಾಗೆ. ಆದರೆ **assignment forbidden**: `t[0] = 99` → TypeError.\n\n**Methods**: ಕೇವಲ ಎರಡು — `.count(x)`, `.index(x)`.\n\n**Packing**: `point = 3, 5` → `(3, 5)`. Parens implicit.\n\n**Unpacking** (magic):\n• `x, y = point` — assign 3 to x, 5 to y.\n• Length match ಆಗಬೇಕು, ಇಲ್ಲವೆ `*` ಬಳಸಿ:\n  - `first, *rest = [1, 2, 3, 4]` → `first=1, rest=[2,3,4]`.\n  - `*head, last = [1, 2, 3, 4]` → `head=[1,2,3], last=4`.\n  - `a, *mid, z = [1, 2, 3, 4, 5]` → `a=1, mid=[2,3,4], z=5`.\n\n**Multiple return**: `def stats(): return mean, std, n` returns tuple. `m, s, n = stats()`.\n\n**Tuples as dict keys**: `prices = {("AAPL", "2024-01-15"): 185.42}` — compound key.\n\n**Named tuples**: `from collections import namedtuple`. `Point = namedtuple("Point", ["x", "y"])` → `p.x` access.',
      whyItMatters: 'Tuples fixed-structure records ಗೆ natural — coordinates, RGB, DB rows, function returns. Unpacking Python code clean ಮಾಡುತ್ತದೆ. Tuple keys caching ಗೆ essential. "Tuple vs list ಯಾವಾಗ?" ಎಂಬ ಪ್ರಶ್ನೆ interview ಪ್ರತಿಯೊಂದರಲ್ಲೂ.',
      steps: [
        'Commas ಜೊತೆ create: `point = 3, 5`. Empty: `()`. Single: `(5,)`.',
        'Index/slice list ಹಾಗೆ. Modify try ಮಾಡಿ — TypeError ಬರುತ್ತದೆ.',
        'Unpack: `x, y = point`. Names length match ಆಗಬೇಕು.',
        '`*` extras capture: `head, *tail = [1,2,3,4]`.',
        'Multiple returns: `return x, y, z`. Caller: `a, b, c = func()`.',
        'Compound dict keys: `cache[(user_id, date)] = result`.',
        'Named fields ಬೇಕಾದರೆ `collections.namedtuple` — `.x` access + tuple benefits.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Single-element trailing comma. `(5)` just int! `(5,)` tuple. Beginners regular trap.',
        '**ಸಮಸ್ಯೆ.** Modify try ಮಾಡಿದರೆ TypeError. "Change" ಮಾಡಬೇಕಾದರೆ new tuple ಮಾಡಿ: `t = (99,) + t[1:]`.',
        '**ಸಮಸ್ಯೆ.** Mismatched arity: `a, b = (1, 2, 3)` → ValueError. `a, b, *rest` ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** Mutable items inside tuple: `t = ([1, 2], 3)` — t[0] ನ object change ಮಾಡಲಾಗದು ಆದರೆ `t[0].append(99)` ಕೆಲಸ ಮಾಡುತ್ತದೆ! "Shallow immutable".',
        '**ಸಮಸ್ಯೆ.** "Tuples lists ಗಿಂತ faster" myth — most operations comparable. **Intent** ನಿಂದ choose ಮಾಡಿ (immutable vs mutable), speed ಮೇಲೆ ಅಲ್ಲ.',
      ],
      tryIt: 'ಮೂರು exercises:\n\n**1. Multiple stats return:**\n```\ndef stats(nums):\n    return min(nums), max(nums), sum(nums)/len(nums)\n\nlow, high, avg = stats([3, 1, 4, 1, 5, 9, 2, 6])\nprint(f"min={low}, max={high}, avg={avg:.2f}")\n```\n\n**2. Dict items iterate:**\n```\nuser = {"name": "Anil", "age": 30, "city": "Pune"}\nfor key, value in user.items():\n    print(f"{key}: {value}")\n```\n\n**3. Tuple key cache:**\n```\ncache = {}\ndef expensive_lookup(user_id, date):\n    key = (user_id, date)\n    if key in cache:\n        return cache[key]\n    result = f"data for {user_id} on {date}"\n    cache[key] = result\n    return result\n\nprint(expensive_lookup(42, "2024-01-15"))  # computed\nprint(expensive_lookup(42, "2024-01-15"))  # cached!\n```',
      takeaway: 'Tuples = **immutable, hashable lists**. Fixed records (coords, RGB), multiple returns, compound dict keys ಗೆ. `x, y = point` unpacking effortless ಆಗಿ feel ಮಾಡಿಸುತ್ತದೆ.',
    },

    'm0-t22': {
      explain: '**Dictionary** **key → value** pairs store ಮಾಡುತ್ತದೆ. `{"name": "Anil", "age": 30}`. Key ಮೂಲಕ value lookup **constant time** (O(1)) — millions ಎಷ್ಟೇ ಇದ್ದರೂ super fast. Dicts records, configuration, lookup tables, counters, JSON data ಗೆ Python representation.',
      analogy: '**ಉದಾಹರಣೆ:**\n**ಫೋನ್ book** ಯೋಚಿಸಿ:\n• ಪ್ರತಿ **ಹೆಸರು** (key) ಒಂದು **number** (value) ಗೆ map.\n• ಹೆಸರು ಮೂಲಕ O(1) ನಲ್ಲಿ lookup — search ಮಾಡಬೇಕಾಗಿಲ್ಲ.\n• ಹೆಸರು unique ಆಗಿರಬೇಕು. ಅದೇ ಹೆಸರು ಮತ್ತೆ add ಮಾಡಿದರೆ old number **OVERWRITE**.\n• ಬದಲಾಗುವ object (list ಹಾಗೆ) key ಆಗಿ ಬಳಸಲಾಗದು — **hashable = immutable** ಬೇಕು.\n\nDictionaries everywhere: HTTP headers, JSON responses, function kwargs, environment variables, caches.',
      theory: 'Dict = **hash map**: key hash → memory bucket. Lookup, insert, delete ಎಲ್ಲ **O(1) average**.\n\n**Creation**:\n• Literal: `{"a": 1, "b": 2}`.\n• Constructor: `dict(a=1, b=2)`.\n• Pairs: `dict([("a", 1), ("b", 2)])`.\n• Empty: `{}` (dict; **NOT set** — empty set is `set()`).\n\n**Access**:\n• `d["key"]` — **KeyError** if missing.\n• `d.get("key", default)` — default ಕೊಡುತ್ತದೆ. **`.get()` ಯಾವಾಗಲೂ safer**.\n• `d.setdefault("key", default)` — get + insert default if missing.\n\n**Update**: `d["new"] = 42`. `d.update({"k": v})` merge.\n\n**Deletion**:\n• `del d["key"]` — raises if missing.\n• `d.pop("key", default)` — safe.\n\n**Iteration**:\n• `for k in d:` — keys.\n• `d.keys()`, `d.values()`, `d.items()`.\n• Pairs: `for k, v in d.items():`.\n\n**Membership**: `"key" in d` — O(1).\n\n**Insertion order** (Python 3.7+): keys remember insertion order.\n\n**Hashable keys**: strings, numbers, tuples (of immutables), frozensets. Lists/dicts ಆಗಲಾಗದು.\n\n**Useful**:\n• `collections.Counter(items)` — tally.\n• `collections.defaultdict(list)` — auto-create empty list.\n• Dict comprehensions: `{k: v for k, v in pairs if cond}`.',
      whyItMatters: 'Dicts ಅತಿ ಹೆಚ್ಚು ಬಳಸುವ built-in. JSON parsing dicts return ಮಾಡುತ್ತದೆ. Web frameworks dicts everywhere. ML feature names → values dicts. Config files dicts. List of dicts = dataset rows. Lists ಮತ್ತು dicts ತಿಳಿದರೆ Python data work 80% ಬರುತ್ತದೆ.',
      steps: [
        'Create: `user = {"name": "Anil", "age": 30}`.',
        'Safe access: `user.get("name", "Unknown")` — `user["name"]` ಬದಲಿಗೆ.',
        'Update/add: `user["email"] = "anil@x.com"`. Both same syntax.',
        'Remove: `user.pop("age", None)`. `del` avoid ಮಾಡಿ key ಖಚಿತವಿಲ್ಲದಿದ್ದರೆ.',
        'Iterate: `for key, value in user.items(): ...`. NOT `for x in user`.',
        'Membership: `if "email" in user:` — O(1).',
        'Comprehension: `{x: x*x for x in range(5)}` → `{0:0, 1:1, 2:4, 3:9, 4:16}`.',
        'Frequency counting: `Counter`. Grouping: `defaultdict(list)`.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** KeyError on missing keys. `d["x"]` raises if missing. `d.get("x", default)` ಬಳಸಿ — #1 dict bug.',
        '**ಸಮಸ್ಯೆ.** `for x in d` keys ಮಾತ್ರ ಕೊಡುತ್ತದೆ. Pairs ಗೆ `.items()`.',
        '**ಸಮಸ್ಯೆ.** Iteration ಸಮಯ dict mutate. `for k in d: del d[k]` — keys skip ಆಗಬಹುದು. `list(d.keys())` snapshot ಮೇಲೆ iterate ಮಾಡಿ.',
        '**ಸಮಸ್ಯೆ.** Lists keys ಆಗಿ. `{[1,2]: "value"}` → TypeError ("unhashable type: list"). Tuples ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** `update` vs `pop` confusion. `update` MERGE (None return, mutate). `pop` REMOVE (value return).',
        '**ಸಮಸ್ಯೆ.** `{}` empty dict, NOT empty set. Empty set = `set()`. `bool({})` is False.',
      ],
      tryIt: 'ಮೂರು real-world patterns:\n\n**1. Word count:**\n```\nfrom collections import Counter\ntext = "to be or not to be that is the question"\nprint(Counter(text.split()))\n# Counter({"to": 2, "be": 2, "or": 1, ...})\n```\n\n**2. Group students by grade — manual, then defaultdict:**\n```\nstudents = [("Anil", "A"), ("Priya", "B"), ("Ravi", "A"), ("Maya", "C")]\n\n# Manual:\nby_grade = {}\nfor name, grade in students:\n    if grade not in by_grade:\n        by_grade[grade] = []\n    by_grade[grade].append(name)\n\n# Or setdefault:\n# by_grade.setdefault(grade, []).append(name)\n\n# Or defaultdict:\nfrom collections import defaultdict\nbg = defaultdict(list)\nfor name, grade in students:\n    bg[grade].append(name)\n```\n\n**3. Dict invert:**\n```\nphone = {"Anil": "111", "Priya": "222"}\nby_number = {num: name for name, num in phone.items()}\nprint(by_number)\n```',
      takeaway: 'Dicts = Python ನ swiss-army knife. **`.get(key, default)`** safety ಗೆ. **`.items()`** iterate ಗೆ. **`Counter`** ಮತ್ತು **`defaultdict`** patterns ಗೆ. Dicts master ಮಾಡಿದರೆ ಉಳಿದ language ಸುಲಭ.',
    },

    'm0-t23': {
      explain: '**Set** unordered collection of **unique** items: `{1, 2, 3}`. Duplicates ಇಲ್ಲ (existing item add ಮಾಡಿದರೆ no-op). Order ಇಲ್ಲ. Two killer features: **O(1) membership tests** ಮತ್ತು math operations (union, intersection, difference) elegant.',
      analogy: '**ಉದಾಹರಣೆ:**\n**ಮದುವೆ guest list** ಯೋಚಿಸಿ. List ಯಾರು invited ಎಂದು ಮಾತ್ರ care, order ಅಲ್ಲ, ಒಬ್ಬ ವ್ಯಕ್ತಿ ಎರಡು ಬಾರಿ invite ಆಗಲಾಗದು. ಅದು set.\n\nಎರಡು guest lists ಊಹಿಸಿ — ವಧುವಿನ ಕಡೆ ಮತ್ತು ವರನ ಕಡೆ:\n• **Union** (`|`) = "ಎರಡೂ ಕಡೆಯಿಂದ invited" — combine, dedup.\n• **Intersection** (`&`) = "ಎರಡೂ list ನಲ್ಲಿರುವವರು" — common friends.\n• **Difference** (`-`) = "ವಧುವಿನ ಕಡೆ MINUS ವರನ ಕಡೆ".\n• **Symmetric difference** (`^`) = "ಒಂದು ಅಥವಾ ಇನ್ನೊಂದು ಆದರೆ both ಅಲ್ಲ".\n\nSets **dedup** ಮತ್ತು **membership** ("X collection ನಲ್ಲಿ ಇದೆಯಾ?") O(1) ನಲ್ಲಿ — size ಎಷ್ಟೇ ಇರಲಿ.',
      theory: 'Sets dicts ಹಾಗೆ — keys only, no values. Same hash-table → same O(1) lookup, insert, delete.\n\n**Creation**:\n• Literal: `{1, 2, 3}`. Empty set `{}` ಆಗಲಾಗದು — ಅದು dict! `set()` ಬಳಸಿ.\n• Iterable: `set([1, 1, 2, 3])` → `{1, 2, 3}` (dedup).\n• Comprehension: `{x for x in range(10) if x % 2 == 0}`.\n\n**Add/remove**:\n• `.add(x)` — already present ಆದರೆ no-op.\n• `.remove(x)` — **KeyError** if missing.\n• `.discard(x)` — silent if missing (often safer).\n• `.pop()` — arbitrary element.\n\n**Math operations**:\n• Union: `a | b` ಅಥವಾ `a.union(b)`.\n• Intersection: `a & b` ಅಥವಾ `a.intersection(b)`.\n• Difference: `a - b` ಅಥವಾ `a.difference(b)`.\n• Symmetric: `a ^ b` ಅಥವಾ `a.symmetric_difference(b)`.\n• Subset: `a <= b` ಅಥವಾ `a.issubset(b)`.\n• Superset: `a >= b`.\n\n**Membership**: `x in s` — O(1). Big haystack ನಲ್ಲಿ "X ಇದೆಯಾ" ಎಂಬ loop ಗೆ haystack ಮೊದಲು set ಗೆ convert ಮಾಡಿ.\n\n**Hashable members**: strings, numbers, tuples — yes. Lists, dicts, sets — no.\n\n**`frozenset`**: immutable variant. Dict key ಆಗಬಹುದು.',
      whyItMatters: 'Sets **dedup** ("ಎಷ್ಟು unique users?"), **membership filtering** ("blocklist ನಲ್ಲಿ ಯಾವ IPs?"), **set algebra** ("ಎರಡು posts ಯಾವ tags share ಮಾಡುತ್ತವೆ?") ಗೆ shine ಆಗುತ್ತದೆ. Lists ಜೊತೆ O(n²); sets ಜೊತೆ O(n). Big data ನಲ್ಲಿ ಬಹಳ ವ್ಯತ್ಯಾಸ.',
      steps: [
        'Dedup ಗೆ list → set: `unique = set([1, 1, 2, 3])` → `{1, 2, 3}`.',
        'Add: `s.add(x)`. Safe remove: `s.discard(x)`.',
        'Membership: `if x in s:` — millions ಮೇಲೆ ಬೆಳಗ್ಗಿನ ವೇಗ.',
        'Union `|`, intersection `&`, difference `-`, symmetric diff `^`.',
        'Order ಬೇಕಾದರೆ list ಗೆ convert: `sorted(my_set)`.',
        'Big list ನಲ್ಲಿ membership speedup: `if x in big_list:` (O(n)) → `if x in big_set:` (O(1)).',
        'Unchangeable sets ಗೆ (dict key ಆಗಿ) `frozenset(...)`.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Empty set trap: `{}` empty DICT, NOT set. `set()` ಬಳಸಿ. ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಒಮ್ಮೆ ಆಗುತ್ತದೆ.',
        '**ಸಮಸ್ಯೆ.** Sets unordered — iteration order rely ಮಾಡಬೇಡಿ. Order ಬೇಕಾದರೆ list (ಅಥವಾ ordered dedup ಗೆ `dict.fromkeys()`).',
        '**ಸಮಸ್ಯೆ.** `.remove()` missing key ಗೆ KeyError. Silent ಆಗಿ ತೆಗೆಯಲು `.discard()`.',
        '**ಸಮಸ್ಯೆ.** Set indexing ಆಗಲಾಗದು. `s[0]` → TypeError. Sets unordered — "first item" ಇಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Lists sets ಒಳಗೆ ಆಗಲಾಗದು. `{[1,2], [3,4]}` → TypeError. Tuples ಬಳಸಿ: `{(1,2), (3,4)}`.',
        '**ಸಮಸ್ಯೆ.** `&`, `|` ಗೆ ಎರಡೂ sides set ಬೇಕು. `{1,2} & [2,3]` → TypeError. Method form `.intersection([2,3])` any iterable accept ಮಾಡುತ್ತದೆ.',
      ],
      tryIt: 'ನಾಲ್ಕು real problems:\n\n**1. Duplicates check:**\n```\ndef has_duplicates(lst):\n    return len(lst) != len(set(lst))\n\nprint(has_duplicates([1, 2, 3]))      # False\nprint(has_duplicates([1, 2, 2, 3]))   # True\n```\n\n**2. Unique words count:**\n```\ntext = "to be or not to be that is the question"\nprint(len(set(text.split())))         # 8\n```\n\n**3. Common interests:**\n```\nuser_a = {"music", "travel", "food", "tech"}\nuser_b = {"food", "tech", "sports"}\nprint(user_a & user_b)                # {"food", "tech"}\n```\n\n**4. Items in one only:**\n```\norders_today = {"A", "B", "C", "D"}\norders_yesterday = {"B", "D", "E"}\nnew_today = orders_today - orders_yesterday\nprint(new_today)                       # {"A", "C"}\n```',
      takeaway: 'Sets = **unordered, unique, hashable**. Dedup, fast membership, set algebra ಗೆ. "Big collection ನಲ್ಲಿ X ಇದೆಯಾ?" ಎಂಬ check ಗೆ **ಮೊದಲು set ಗೆ convert ಮಾಡಿ** — O(n) → O(1).',
    },

    'm0-t24': {
      explain: '**Indexing** ಒಂದು item by position: `lst[2]`. **Slicing** RANGE ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ: `lst[2:6]`. Python **0-based** (first item index 0) ಮತ್ತು **end-exclusive** slicing (`[2:6]` ಒಳಗೊಳ್ಳುತ್ತದೆ 2,3,4,5 — 6 ಅಲ್ಲ).',
      analogy: '**ಉದಾಹರಣೆ:**\nItems **shelves 0 ರಿಂದ numbered** ಎಂದು ಊಹಿಸಿ. Shelf 0, 1, 2, 3, 4, 5… ಹಿಂದಿನಿಂದಲೂ ಎಣಿಸಬಹುದು: shelf -1 (ಕೊನೆಯ), -2 (ಎರಡನೇ ಕೊನೆಯ).\n\n"Shelves 2 ರಿಂದ 5" (`lst[2:5]`) ಎಂದು ಕೇಳಿದಾಗ Python **scissors** shelf 2 ಮುಂದೆ ಮತ್ತು shelf 5 ಮುಂದೆ cut ಮಾಡುತ್ತದೆ — between cuts ಇರುವದನ್ನು ಮಾತ್ರ: shelves 2, 3, 4 ಕೊಡುತ್ತದೆ.\n\nಯಾಕೆ end-exclusive? ಏಕೆಂದರೆ **`len(lst[a:b]) = b - a`** ಯಾವಾಗಲೂ true ಆಗುತ್ತದೆ, ಮತ್ತು list cleanly split: `lst[:k]` + `lst[k:]` = full list, no overlap, no gap.',
      theory: '**Indexing**: `seq[i]` ONE item. Negative back ನಿಂದ:\n• `seq[0]` first, `seq[-1]` last.\n• Out of range → **IndexError**.\n\n**Slicing**: `seq[start:stop:step]` — NEW slice (copy). ಎಲ್ಲ optional.\n\n**Defaults**:\n• `seq[:n]` — first n.\n• `seq[n:]` — index n ರಿಂದ end.\n• `seq[:]` — full shallow copy.\n• `seq[::2]` — every other.\n• `seq[::-1]` — reversed copy.\n\n**Negative bounds**:\n• `seq[-3:]` — last 3.\n• `seq[:-3]` — last 3 ಬಿಟ್ಟು ಎಲ್ಲ.\n• `seq[-5:-2]` — items at -5, -4, -3.\n\n**Forgiving bounds**: slicing IndexError raise ಮಾಡುವುದಿಲ್ಲ. Out-of-range silently clamp. `lst[:1000]` 5-item list ಮೇಲೆ all 5 return. Indexing `lst[1000]` raise ಮಾಡುತ್ತದೆ — ವ್ಯತ್ಯಾಸ.\n\n**Slice assignment** (lists only — strings/tuples immutable):\n• `lst[2:5] = [10, 20]` — replace (length change ಆಗಬಹುದು!).\n• `lst[:] = []` — clear in place.\n\n**Where slicing works**: lists, tuples, strings, bytes, range, NumPy arrays, Pandas Series — same syntax. Beautiful consistency.',
      whyItMatters: 'Slicing Python ಗೆ "easy" feel ಕೊಡುವ feature. Reverse string? `s[::-1]`. Last 5 lines? `lines[-5:]`. Header drop? `rows[1:]`. ಇಲ್ಲದಿದ್ದರೆ ಎಲ್ಲ off-by-one bugs ಜೊತೆ loops. Master ಮಾಡಿದರೆ less code, fewer bugs.',
      steps: [
        'Index normal: `lst[0]`, `lst[2]`. Negative: `lst[-1]` last.',
        'Slice ranges: `lst[2:6]` items 2,3,4,5. End exclusive.',
        'Common shortcuts: `lst[:3]` first 3. `lst[3:]` from 3. `lst[-3:]` last 3. `lst[:-3]` except last 3.',
        'Step: `lst[::2]` every other. `lst[1::2]` every other from 1.',
        'Reverse: `lst[::-1]` (NEW list).',
        'Full copy: `new = old[:]` shallow copy.',
        'Out-of-range slicing forgiving (returns empty/partial), indexing not.',
        'Lists ಮೇಲೆ slice assignment: `lst[1:3] = [99]` replaces items 1,2 with one item.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** End-exclusive trap. `lst[1:3]` items 1, 2 — 1, 2, 3 ಅಲ್ಲ. `lst[0:5]` first 5 — first 6 ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** `-0` just 0. `lst[-0]` = `lst[0]`. Last item ಗೆ `lst[-1]`.',
        '**ಸಮಸ್ಯೆ.** Bad bounds slice ಗೆ raise ಆಗುವುದಿಲ್ಲ. `lst[100:]` quietly returns `[]`. "List too short" detect ಮಾಡಬೇಕಾದರೆ `len()` explicit check.',
        '**ಸಮಸ್ಯೆ.** Slicing copies — big sequences ಗೆ slow/memory-heavy. `lst[100_000:]` new list allocate ಮಾಡುತ್ತದೆ. Copy ಬೇಡದಿದ್ದರೆ indexing/iterators.',
        '**ಸಮಸ್ಯೆ.** Slice assignment list length change ಮಾಡಬಹುದು. `lst[1:3] = [10, 20, 30, 40]` extends. LHS length dictate ಮಾಡುವುದಿಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** `lst[::-1]` vs `.reverse()` confusion. `[::-1]` NEW reversed list (original untouched); `.reverse()` IN-PLACE mutate.',
      ],
      tryIt: 'Slicing drill — predict ಮಾಡಿ ನಂತರ verify ಮಾಡಿ:\n```\nlst = [10, 20, 30, 40, 50, 60, 70]\n\nprint(lst[0])       # ?\nprint(lst[-1])      # ?\nprint(lst[2:5])     # ?\nprint(lst[:3])      # ?\nprint(lst[3:])      # ?\nprint(lst[-2:])     # ?\nprint(lst[:-2])     # ?\nprint(lst[::2])     # ?\nprint(lst[::-1])    # ?\nprint(lst[1:6:2])   # ?\nprint(lst[100:])    # ?\n```\nReal challenge — string `"abcdefghij"` ಗೆ ONE expression `"jhfdb"` (reversed, every other from end) return ಮಾಡಲು. Hint: `s[::-2]`.',
      takeaway: '**Slicing = `[start:stop:step]`, end-exclusive, forgiving bounds, copy ಮಾಡುತ್ತದೆ.** ಈ patterns memorize: `[:n]` first n, `[n:]` from n, `[-n:]` last n, `[:-n]` except last n, `[::-1]` reverse, `[:]` full copy. Most extract-chunk loops one-liner ಆಗುತ್ತದೆ.',
    },

    // ══════════════════════════════════════════════════════════
    // MODULE 2 — Stats & Machine Learning
    // ══════════════════════════════════════════════════════════

    // ── m2-t1: Probability fundamentals ──────────────────────
    'm2-t1': {
      explain:
        'Probability ಎಂದರೆ 0 ಮತ್ತು 1 ರ ನಡುವಿನ ಒಂದು ಸಂಖ್ಯೆ — ಒಂದು ಘಟನೆ **ಎಷ್ಟು ಸಾಧ್ಯ** ಎಂದು ಹೇಳುತ್ತದೆ. 0 ಎಂದರೆ ಅಸಾಧ್ಯ, 1 ಎಂದರೆ ಖಚಿತ, 0.5 ಎಂದರೆ coin flip. ಪ್ರತಿ ML model — spam filter, recommendation engine, weather forecast — ಇವೆಲ್ಲವೂ ಒಳಗೆ probability ಲೆಕ್ಕ ಹಾಕುವ ಕೆಲಸವನ್ನೇ ಮಾಡುತ್ತಿವೆ.',
      analogy:
        '**ಬೆಂಗಳೂರು ರೈಲು ನಿಲ್ದಾಣದ ಚಹಾ ಅಂಗಡಿ ಉದಾಹರಣೆ:**\nನೀವು ಒಬ್ಬ ಚಹಾ ಮಾರಾಟಗಾರರು. ಪ್ರತಿ 100 ಜನ ದಾಟಿ ಹೋಗುವವರಲ್ಲಿ 30 ಜನ ನಿಂತು ಚಹಾ ಕುಡಿಯುತ್ತಾರೆ. "P(ನಿಲ್ಲುತ್ತಾರೆ) = 0.30". ಇದೇ probability — long-run fraction.\n\nಈಗ ಮಳೆ ಬಿತ್ತು. ಮಳೆಯಲ್ಲಿ ದಾಟಿ ಹೋಗುವ 100 ಜನರಲ್ಲಿ 50 ಜನ ನಿಲ್ಲುತ್ತಾರೆ — `P(ನಿಲ್ಲುತ್ತಾರೆ | ಮಳೆ) = 0.50`. **Conditional probability** — condition (ಮಳೆ) odds ಅನ್ನು ಬದಲಾಯಿಸಿತು.\n\nಈಗ ಎರಡೂ ಒಟ್ಟಿಗೆ: ಯಾರೋ ನಿಂತು ಚಹಾ + biscuit ಎರಡನ್ನೂ order ಮಾಡುತ್ತಾರೆ — **joint probability** `P(ನಿಲ್ಲುತ್ತಾರೆ ∩ biscuit)`. ಇಷ್ಟೇ — probability ಎಂದರೆ combinations long-run ನಲ್ಲಿ ಎಷ್ಟು ಸಾರಿ ಆಗುತ್ತವೆ ಎಂದು ಲೆಕ್ಕ.',
      theory:
        '**ಮುಖ್ಯ vocabulary** (ಮನನ ಮಾಡಿ — ಪ್ರತಿ stats book ಇದನ್ನೇ use ಮಾಡುತ್ತದೆ):\n\n• **Sample space (Ω)** — ಸಾಧ್ಯ outcomes ಎಲ್ಲ. Ω = {1,2,3,4,5,6} dice ಗೆ.\n• **Event (A)** — Ω ನ subset. "Even ಸಂಖ್ಯೆ" → A = {2,4,6}.\n• **Probability P(A)** — A ನಲ್ಲಿ outcomes fraction.\n\n**Probability ಲೆಕ್ಕ ಹಾಕುವ 3 ವಿಧಾನಗಳು**:\n1. **Classical** — favourable / total. P(even fair die) = 3/6 = 0.5.\n2. **Empirical** — observed frequency. 1000 emails ನಲ್ಲಿ 87 spam → P(spam) ≈ 0.087.\n3. **Subjective** — ನಂಬಿಕೆ. Bayesian methods ನಲ್ಲಿ.\n\n**4 ಮುಖ್ಯ operations**:\n\n• **Joint** `P(A ∩ B)` — A AND B ಎರಡೂ.\n• **Union** `P(A ∪ B)` — A OR B (ಅಥವಾ ಎರಡೂ). `P(A) + P(B) − P(A ∩ B)`. Overlap subtract — ಎರಡು ಸಾರಿ count ಆಗದಂತೆ.\n• **Conditional** `P(A | B)` — B given. `P(A ∩ B) / P(B)`.\n• **Complement** `P(not A) = 1 − P(A)`.\n\n**Independence**: A, B independent ಆದರೆ `P(A ∩ B) = P(A) · P(B)`. ಎರಡು coin flips independent. ಇಂದು ಮಳೆ + ನಾಳೆ ಮಳೆ independent **ಅಲ್ಲ** (weather pattern share).\n\n**"ಕನಿಷ್ಠ ಒಂದು" trick**: `P(ಕನಿಷ್ಠ ಒಂದು) = 1 − P(zero)` — complement use ಮಾಡಿ. ಯಾವಾಗಲೂ fast.',
      whyItMatters:
        'Probability = ಎಲ್ಲ statistical / ML model ಗಳ **ಭಾಷೆ**. Logistic regression `P(class | features)`, spam filter `P(spam | words)`, recommendation system `P(click | user, item)`. Probability ಬಾರದಿದ್ದರೆ ML formula magic. **ಪ್ರತಿ data science interview ನಲ್ಲಿ** Monty Hall, two-children, false-positive medical test ಪ್ರಶ್ನೆ ಬರುತ್ತದೆ.',
      steps: [
        'Bounds ನೆನಪಿಡಿ: `P(A) ∈ [0, 1]`. 1.3 ಅಥವಾ −0.2 ಬಂದರೆ bug.',
        'Independent events ಗೆ multiply: `P(A and B) = P(A) · P(B)`. ಎರಡು coin both heads = 0.25.',
        'Mutually exclusive ಗೆ add. ಇಲ್ಲದಿದ್ದರೆ **inclusion-exclusion**: `P(A) + P(B) − P(A ∩ B)`.',
        '"ಕನಿಷ್ಠ ಒಂದು" ಗೆ **complement trick**: `1 − P(none)`.',
        'Conditional ಗೆ 2×2 table ಬರೆಯಿರಿ. Denominator = condition.',
        'ಕಷ್ಟ ಲೆಕ್ಕಕ್ಕೆ **10,000 ಜನರ counts ನಲ್ಲಿ ಯೋಚಿಸಿ**.',
        'NumPy ನಿಂದ 100,000 samples simulate ಮಾಡಿ verify.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** P(A and B) ಮತ್ತು P(A or B) confuse. "And" multiply (independent), "or" add ನಂತರ overlap subtract.',
        '**ಸಮಸ್ಯೆ.** Independence ಇಲ್ಲದಿದ್ದರೂ assume. Two stocks crash same day — independent ಅಲ್ಲ. Joint risk underestimate.',
        '**ತಪ್ಪು.** Inclusion-exclusion ನಲ್ಲಿ overlap subtract ಮರೆಯುವುದು. Both ಆಗುವ cases double-count.',
        '**ಸಮಸ್ಯೆ.** Conditional direction confuse: `P(spam | "free")` ≠ `P("free" | spam)`. Bayes flip — ಬೇರೆ ಸಂಖ್ಯೆಗಳು.',
        '**ತಪ್ಪು.** "ಕನಿಷ್ಠ ಒಂದು" ಗೆ enumeration. `1 − (5/6)⁵` ಬಳಸಿ — done.',
        '**ಸಮಸ್ಯೆ.** [0,1] range ಬಿಟ್ಟು probability. Sign error ಅಥವಾ double-counting bug.',
      ],
      tryIt:
        '**Monty Hall paradox** simulate ಮಾಡಿ:\n```python\nimport numpy as np\nrng = np.random.default_rng(0)\n\ndef play(switch):\n    car = rng.integers(0, 3)\n    pick = rng.integers(0, 3)\n    options = [d for d in range(3) if d != pick and d != car]\n    monty = rng.choice(options)\n    if switch:\n        pick = next(d for d in range(3) if d != pick and d != monty)\n    return pick == car\n\nn = 100_000\nstay = sum(play(False) for _ in range(n)) / n\nswitch = sum(play(True) for _ in range(n)) / n\nprint(f"Stay: {stay:.3f}    Switch: {switch:.3f}")\n```\nStay ~0.333, Switch ~0.667. **ಈಗ extend ಮಾಡಿ** 10 doors ಗೆ — switch ~90%!',
      takeaway:
        'Probability = **long-run fraction**. 4 operations: **joint** (and, multiply), **union** (or, add−overlap), **conditional** (given), **complement** (not — "ಕನಿಷ್ಠ ಒಂದು" trick).',
    },

    // ── m2-t2: Conditional probability & Bayes theorem ──────
    'm2-t2': {
      explain:
        '**Conditional probability** ಕೇಳುತ್ತದೆ: "B ಆಗಿದೆ — ಈಗ A ಆಗುವ chance?" `P(A | B)`. **Bayes theorem** = direction flip ಮಾಡುವ formula — `P(B | A)` ಅನ್ನು `P(A | B)` ಗೆ convert. Spam filter, medical diagnosis, fraud detection — ಎಲ್ಲ probabilistic ML ನ ತಳಪಾಯ.',
      analogy:
        '**ಮುಂಬೈ ಹೋಟೆಲ್ reception ಉದಾಹರಣೆ:**\n1000 ಅತಿಥಿಗಳಲ್ಲಿ 200 ಜನ vegetarian — `P(veg) = 0.20`.\n\nಗುಜರಾತಿನಿಂದ ಬಂದ 300 ಜನರಲ್ಲಿ 240 vegetarian — `P(veg | Gujarat) = 0.80`. Condition probability ಅನ್ನು ಬಹಳ ಬದಲಾಯಿಸಿತು.\n\nBayes flip: ಒಬ್ಬ ಅತಿಥಿ ಈಗ veg thali order ಮಾಡಿದರು. **ಅವರು ಗುಜರಾತಿಯವರಾಗಿರುವ chance?** `P(veg | Gujarat) = 0.80` ಗೊತ್ತಿದೆ — `P(Gujarat | veg)` ಬೇಕು. Bayes likelihood + **base rate** ಸೇರಿಸಿ ಉತ್ತರ.\n\nSpam filter ಸಹ ಇದೇ: training ನಿಂದ `P("free" | spam)`, runtime ನಲ್ಲಿ ಬೇಕು `P(spam | "free")`. Bayes conversion.',
      theory:
        '**Conditional probability**:\n\n`P(A | B) = P(A ∩ B) / P(B)`\n\n"B given ಆಗಿದೆ ಎಂದು A ಆಗುವ probability". B true ಆಗಿರುವ subset ಮಾತ್ರ ನೋಡಿ A fraction ಕೇಳುವುದು.\n\n**Multiplication rule**: `P(A ∩ B) = P(A | B) · P(B)`.\n\n**Bayes theorem**:\n\n`P(A | B) = [P(B | A) · P(A)] / P(B)`\n\n• `P(A | B)` = **posterior** — evidence ಆದ ಮೇಲೆ ತಿಳಿಯಬೇಕಾದ್ದು.\n• `P(B | A)` = **likelihood** — A true ಆದರೆ evidence likely ಎಷ್ಟು.\n• `P(A)` = **prior** — base rate.\n• `P(B)` = **evidence** — total probability.\n\n**ಸ್ಲೋಗನ್**: **posterior ∝ likelihood × prior**.\n\n**Classic medical-test trap**: prevalence 1%. Test 99% accurate. Test positive — `P(sick | positive)` ಎಷ್ಟು?\n\nಊಹೆ: 99%. **Real: 50%**. 10,000 ಜನರಲ್ಲಿ:\n• 100 sick → 99 true positives.\n• 9,900 healthy → 99 false positives (1% of 9,900).\n• Total positives = 198, sick = 99 → `P(sick | positive) = 99/198 = 0.50`.\n\n**Base rates dominate** — accurate test ಆದರೂ rare disease ಗೆ false alarms ಹೆಚ್ಚು.',
      whyItMatters:
        'Bayes theorem **modern AI ನ most important formula**. Naive Bayes, Bayesian networks, HMM, Kalman filter, Thompson sampling, Bayesian optimization — ಎಲ್ಲ ಇದೇ identity. Medical diagnosis, legal reasoning, forecasting — ಎಲ್ಲೆಡೆ. **ಪ್ರತಿ quantitative interview ನಲ್ಲಿ** medical-test puzzle.',
      steps: [
        '**Conditional form ನಲ್ಲಿ ಬರೆಯಿರಿ**: "X ರಲ್ಲಿ Y fraction" → `P(Y | X)`.',
        'ಬೇಕಾದ್ದು identify: OPPOSITE direction → `P(X | Y)`.',
        '4 pieces: prior `P(X)`, likelihood `P(Y | X)`, false-positive `P(Y | not X)`, total `P(Y)`.',
        '`P(Y) = P(Y | X) · P(X) + P(Y | not X) · P(not X)` — **law of total probability**.',
        'Bayes apply: `P(X | Y) = P(Y | X) · P(X) / P(Y)`.',
        'Sanity check: **10,000 counts**. 1% prevalence → 100 sick, 9,900 healthy.',
        'Multiple evidences ಗೆ **Naive Bayes**: conditional independence assume.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** P(A|B), P(B|A) confuse. "Pregnant given female" ≠ "female given pregnant". Bayes flip ಬೇರೆ ಸಂಖ್ಯೆ.',
        '**ಸಮಸ್ಯೆ.** Base rate ignore. "99% accurate" rare disease ಗೆ false positives ಹೆಚ್ಚು. Base rate ಯಾವಾಗಲೂ matters.',
        '**ತಪ್ಪು.** Denominator law of total probability ಮರೆ. False-positive contribution skip = common bug.',
        '**ಸಮಸ್ಯೆ.** `P(A and B) = P(A) · P(B)` ಯಾವಾಗಲೂ ಎಂದು assume. Independent ಆದಾಗ ಮಾತ್ರ.',
        '**ತಪ್ಪು.** Multiple updates ನಲ್ಲಿ tests share flaw → double-count.',
        '**ಸಮಸ್ಯೆ.** Counts ಬಿಟ್ಟು percentages. "99 vs 495 of 10,000" obvious; "P = 0.0099 vs 0.0495" ಕಷ್ಟ.',
      ],
      tryIt:
        '**Drug test simulation**:\n```python\nP_user = 0.05\nP_pos_given_user = 0.95\nP_pos_given_clean = 0.10\nP_clean = 1 - P_user\n\nP_pos = P_pos_given_user * P_user + P_pos_given_clean * P_clean\nP_user_given_pos = P_pos_given_user * P_user / P_pos\nprint(f"P(user | positive) = {P_user_given_pos:.3f}")\n# ~0.333 — ಕೇವಲ 33%!\n```\n**ಈಗ extend ಮಾಡಿ**: ಎರಡು ಸಾರಿ positive — posterior ಅನ್ನು prior ಆಗಿ use. Confidence 80% ಮೇಲೆ jump. Prior 0.001 ಗೆ ಇಳಿಸಿ — ಎಷ್ಟು ಕಷ್ಟ ನೋಡಿ.',
      takeaway:
        'Bayes flip: `P(A | B) = P(B | A) · P(A) / P(B)`. **Posterior ∝ Likelihood × Prior.** **Base rates dominate** — rare event ಗೆ accurate test ಸಹ false alarms ಕೊಡುತ್ತದೆ. **10,000 counts ನಲ್ಲಿ ಯೋಚಿಸಿ**.',
    },

    // ── m2-t3: Sampling methods ─────────────────────────────
    'm2-t3': {
      explain:
        'Sampling = **ದೊಡ್ಡ population ನಿಂದ ಸಣ್ಣ subset ಆಯ್ಕೆ**. Method sample ಸತ್ಯ ಹೇಳುತ್ತದೆಯೋ ಸುಳ್ಳು ಹೇಳುತ್ತದೆಯೋ ಎಂಬುದನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. 4 classic methods — simple random, stratified, cluster, systematic — ತಪ್ಪು ಆಯ್ಕೆ analysis ಅನ್ನು silent ಆಗಿ ಹಾಳುಮಾಡುತ್ತದೆ.',
      analogy:
        '**ಚುನಾವಣೆ exit poll ಉದಾಹರಣೆ:**\n140 ಕೋಟಿ ಜನರನ್ನು ಎಲ್ಲ ಕೇಳಲಾಗದು — sample ಬೇಕು.\n\n• **Simple random**: 10,000 phones uniform random. Cities over-represent ಆಗಬಹುದು.\n• **Stratified**: strata (urban/rural, region) ಆಗಿ ವಿಭಾಗಿಸಿ proportional sample. Population mirror.\n• **Cluster**: 100 random ಹಳ್ಳಿಗಳು pick, ಪ್ರತಿ ಹಳ್ಳಿಯ **ಎಲ್ಲರೂ** survey. Cheap travel — ಆದರೆ ಒಂದೇ ಹಳ್ಳಿ similar.\n• **Systematic**: voter list ನಿಂದ ಪ್ರತಿ 1000ನೇ ಹೆಸರು. Caste ಆಗಿ sort ಆದರೆ disaster.\n\nಒಂದೇ population, 4 ಬೇರೆ samples, 4 ಬೇರೆ uttara!',
      theory:
        '**Simple Random Sample (SRS)** — equal chance. Clean, ಆದರೆ rare subgroups miss. Complete frame ಬೇಕು.\n\n**Stratified sampling** — population ಅನ್ನು **strata** ಆಗಿ (gender, age, geography), ಪ್ರತಿ stratum ನಿಂದ independent sample.\n• **Proportional**: 60% rural pop → 60% rural sample.\n• **Disproportional / oversampling**: rare groups ಹೆಚ್ಚು sample, re-weight. Rare disease, fraud detection.\n\nStratification SRS ಗಿಂತ variance ⬇ — ಅದಕ್ಕೆ ML ನಲ್ಲಿ `train_test_split(stratify=y)`.\n\n**Cluster sampling** — clusters (geographic blocks, schools) ಆಗಿ, random clusters select, ಆ cluster ನ **ಎಲ್ಲ units** survey. Variance ಹೆಚ್ಚು (intracluster correlation).\n\n**Systematic sampling** — random start, ನಂತರ ಪ್ರತಿ k-th. Hidden periodicity catastrophic (ಪ್ರತಿ 7ನೇ = Sunday).\n\n**ಇನ್ನೂ ತಿಳಿಯಬೇಕಾದದ್ದು**:\n• **Multistage** — clusters + strata combine.\n• **Convenience sampling** — biased.\n• **Snowball** — hard-to-reach groups.\n• **Bootstrap** — replacement ಮೂಲಕ resample, uncertainty estimate.\n\n**Critical concepts**:\n• **Sampling frame** — actual list. Frame miss ಇದ್ದರೆ ಯಾವ method ಗೂ fix ಆಗದು.\n• **Sampling bias** — systematic difference (sampling **error** ಬೇರೆ — random variation).\n• **Selection bias** — units self-select.',
      whyItMatters:
        'ಪ್ರತಿ ML dataset ಒಂದು sample. Deployment population ಅನ್ನು represent ಮಾಡದಿದ್ದರೆ production silent fail. Famous failures: facial recognition white faces ಮೇಲೆ trained → dark faces fail; credit scoring past approvals → discrimination reinforce. **Interview**: "1000 customers ಹೇಗೆ sample?" — strata, biases, frame issues maturity.',
      steps: [
        '**Target population** define: "all worldwide users" vs "active US last 30 days".',
        '**Sampling frame** identify — ಯಾರು miss ಇದ್ದಾರೆ note.',
        'ML splits ಗೆ default **stratified**: `train_test_split(X, y, stratify=y, random_state=42)`.',
        'Imbalance 1:10+ ಗೆ **stratified k-fold CV** ಅಥವಾ training fold ನಲ್ಲಿ ಮಾತ್ರ SMOTE.',
        'Outcome ಗೆ ಹೆಚ್ಚು correlated variable ಮೇಲೆ stratify.',
        'Systematic ಗೆ random start, period check.',
        'Sampling method + frame **document**.',
        'Sample distribution vs population key covariates compare. Differ ಆದರೆ **post-stratify** / re-weight.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Convenience sample ಅನ್ನು random ಎಂದು treat. Twitter followers survey customer base ಬಗ್ಗೆ ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** ತಪ್ಪು variable stratify. Outcome ಗೆ ಹೆಚ್ಚು correlated covariate ಬೇಕು.',
        '**ತಪ್ಪು.** Imbalanced classification ನಲ್ಲಿ stratification ignore. 1% positives → test set zero positives ಬಂದರೆ AUC undefined.',
        '**ಸಮಸ್ಯೆ.** Cluster sampling ಅನ್ನು random ಎಂದು report. Variance ಹೆಚ್ಚು — CIs misleading tight.',
        '**ತಪ್ಪು.** Train/test split ಆದ ಮೇಲೆ SMOTE. Test set oversample = data leakage.',
        '**ಸಮಸ್ಯೆ.** Frame coverage ignore. Random landlines mobile-only youth miss.',
      ],
      tryIt:
        'SRS vs stratified rare-class problem ಗೆ compare:\n```python\nimport numpy as np\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split\n\nrng = np.random.default_rng(0)\nN = 10_000\ndata = pd.DataFrame({\n    "x": rng.normal(0, 1, N),\n    "y": rng.choice([0, 1], N, p=[0.99, 0.01]),\n})\n\nrandom_pos, strat_pos = [], []\nfor seed in range(100):\n    _, _, _, y_te = train_test_split(data.x, data.y, test_size=0.2, random_state=seed)\n    random_pos.append(y_te.sum())\n    _, _, _, y_te = train_test_split(data.x, data.y, test_size=0.2, stratify=data.y, random_state=seed)\n    strat_pos.append(y_te.sum())\n\nprint(f"Random: min={min(random_pos)}, max={max(random_pos)}")\nprint(f"Strat:  min={min(strat_pos)}, max={max(strat_pos)}")\n```\nRandom 10 ರಿಂದ 30 swing; strat ಯಾವಾಗಲೂ ~20. **ಈಗ extend ಮಾಡಿ**: ಯಾವ imbalance ratio ಹೆಚ್ಚು matter?',
      takeaway:
        '**Sampling = ಎಲ್ಲದರ ಬುನಾದಿ**. Categorical variable matter ಆದಾಗ **stratified** default. Classification ಗೆ **`train_test_split(stratify=y)`**. **Sampling frame** document — frame omissions bias ಯಾವ math ಗೂ fix ಆಗದು.',
    },

    // ── m2-t4: Descriptive statistics ───────────────────────
    'm2-t4': {
      explain:
        '**Descriptive statistics** = dataset ಅನ್ನು summarize ಮಾಡುವ ಸಣ್ಣ ಗುಂಪು ಸಂಖ್ಯೆಗಳು. "ಕೇಂದ್ರ?" (mean, median, mode), "ಎಷ್ಟು spread?" (variance, std, IQR), "ಯಾವ shape?" (skewness, kurtosis). `pd.read_csv()` ಆದ ಮೇಲೆ ಮೊದಲು ಇದನ್ನೇ compute.',
      analogy:
        '**Tech company ನ 1000 employees salaries ಉದಾಹರಣೆ:**\n1000 ಸಂಖ್ಯೆಗಳನ್ನು ಓದಲಾಗದು — summary ಬೇಕು.\n\n• **Mean** "average employee" — CEO ₹10 ಕೋಟಿ ಸೇರಿಸಿದರೆ misleading.\n• **Median** "middle person" — CEO salary ಕದಲಿಸಲಾಗದು. **Skewed data ಗೆ representative.**\n• **Std dev** "mean ನಿಂದ deviation" — small = similar; ದೊಡ್ಡ = inequality.\n• **Skewness** tail direction — salaries usually **right (positive) skew**.\n\n4 ಒಟ್ಟಿಗೆ ನೋಡಿದರೆ ಒಂದೇ row ನೋಡದೆ ಪೂರ್ಣ picture.',
      theory:
        '**Central tendency**:\n\n• **Mean**: `μ = Σxᵢ / n`. Outliers ಗೆ sensitive.\n• **Median**: middle value (sorted). **Robust** — top 49% values infinity ಆಗಿ replace ಮಾಡಿದರೂ ಕದಲುವುದಿಲ್ಲ.\n• **Mode**: most frequent. Categorical ಗೆ.\n• **Trimmed mean**: top/bottom k% drop ನಂತರ average.\n\n**Spread**:\n\n• **Range**: `max − min`. Single outlier ruin.\n• **Variance**: `σ² = Σ(xᵢ − μ)² / n` (sample n−1). Units squared.\n• **Standard deviation**: `σ = √variance`. Most-used.\n• **IQR**: `Q3 − Q1`. Robust spread. Box plot, outlier rule (`< Q1 − 1.5·IQR` ಅಥವಾ `> Q3 + 1.5·IQR`).\n• **MAD**: `median(|xᵢ − median(x)|)`. IQR ಗಿಂತ ಹೆಚ್ಚು robust.\n\n**Sample vs population variance**: SAMPLE ನಿಂದ `n−1` (Bessel correction). Pandas `.var()` n−1 default; NumPy `.var()` n default. **ಮುಖ್ಯ!**\n\n**Shape**:\n• **Skewness**: positive (right) = long right tail (income, prices). Symmetric = 0.\n• **Kurtosis**: tails heavy ಎಷ್ಟು.\n\n**Mean–median gap = skewness detector**:\n• `mean ≈ median` → symmetric.\n• `mean > median` → right-skewed.\n• `mean < median` → left-skewed.\n\n**Five-number summary**: min, Q1, median, Q3, max. `df.describe()` ನ ಬುನಾದಿ.',
      whyItMatters:
        'ಪ್ರತಿ analysis descriptive stats ನಿಂದ ಶುರು. Skip ಮಾಡಿದರೆ 30% missing, wrong units, single outlier dominating ಗೊತ್ತಾಗದು. Linear regression normal residuals assume — heavily skewed data ಗೆ log-transform. **Interview**: "dataset ಬಗ್ಗೆ ಹೇಳಿ" — shape, central tendency, spread, missing, outliers.',
      steps: [
        '`pd.read_csv` ಆದ ತಕ್ಷಣ `df.describe()` ಮತ್ತು `df.describe(include="object")`.',
        'ಪ್ರತಿ numeric column ಗೆ **mean vs median** compare. Big gap = skewed → log/sqrt transform.',
        '**Min/max** vs Q1/Q3 compare. Max - Q3 huge gap = outliers.',
        '`df.skew()`, `df.kurtosis()` — histogram ಯಾವಾಗಲೂ plot.',
        'Outliers ಇದ್ದರೆ **IQR std ಗಿಂತ preferred**.',
        'Percentiles: `df.quantile([0.01, 0.05, 0.5, 0.95, 0.99])`.',
        '**`ddof=1`** ಯಾವಾಗಲೂ. NumPy default `ddof=0` ಬೇರೆ.',
        'Numbers + **histogram** + **box plot** ಒಟ್ಟಿಗೆ.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Skewed ಗೆ ಕೇವಲ mean. "Average house ₹3 ಕೋಟಿ" mislead — median ₹80 ಲಕ್ಷ.',
        '**ಸಮಸ್ಯೆ.** Population vs sample variance confuse. NumPy `ddof=1` use.',
        '**ತಪ್ಪು.** `1.5·IQR` outliers ಎಲ್ಲ errors ಎಂದು treat. Power-law data (income) ಗೆ ನಿಜ — bugs ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Histogram skip. Anscombe quartet — same stats, ಬೇರೆ shape.',
        '**ತಪ್ಪು.** Multimodal data ಗೆ std. 30 + 70 → mean 50, ಯಾವ value exist ಆಗದು.',
        '**ಸಮಸ್ಯೆ.** Missing values ignore. `df.salary.mean()` NaNs skip silent. `df.isna().sum()` ಮೊದಲು.',
      ],
      tryIt:
        'Outlier ಇದ್ದು ಇಲ್ಲದೆ mean vs median:\n```python\nimport numpy as np\nrng = np.random.default_rng(0)\nbase = rng.normal(50, 10, 100)\nprint("Without outlier:")\nprint(f"  Mean: {base.mean():.2f}, Median: {np.median(base):.2f}")\n\nwith_o = np.append(base, [10_000])\nprint("With outlier 10,000:")\nprint(f"  Mean: {with_o.mean():.2f}, Median: {np.median(with_o):.2f}")\n\nextreme = base.copy()\nextreme[:49] = 1_000_000\nprint("With 49/100 corrupted:")\nprint(f"  Mean: {extreme.mean():.2f}, Median: {np.median(extreme):.2f}")\n```\nMedian ಕದಲುವುದಿಲ್ಲ; mean swing. **ಈಗ extend ಮಾಡಿ**: 50%+ corrupt ಆದರೆ median ಸಹ break — verify ಮಾಡಿ.',
      takeaway:
        '**Mean, median, std, IQR, min/max** ಪ್ರತಿ numeric column. **Mean ≠ median** = skewed → log-transform. **Median + IQR** robust; **mean + std** efficient. Numbers + histogram ಯಾವಾಗಲೂ.',
    },

    // ── m2-t5: Probability distributions ────────────────────
    'm2-t5': {
      explain:
        '**Probability distribution** = randomness ನ shape ಗೆ ಗಣಿತೀಯ recipe. Heights, 10 coin flips heads, ಗಂಟೆಗೆ help desk calls — ಪ್ರತಿಯೊಂದು ಒಂದು known distribution. Right one identify ಆದರೆ slow simulation ಬದಲು **analytic formulas**.',
      analogy:
        '**ಅಡುಗೆ recipe ಉದಾಹರಣೆ:**\n• **Normal** = ನಿತ್ಯದ **ಚಪಾತಿ** — symmetric, predictable. Heights, exam scores. μ, σ ಗೊತ್ತಿದ್ದರೆ ಎಲ್ಲ.\n• **Binomial** = **20 ಗುಲಾಬ್ ಜಾಮೂನ್ box ನಲ್ಲಿ ಎಷ್ಟು perfect** (ಪ್ರತಿಯೊಂದಕ್ಕೆ 70% chance). Fixed n trials successes.\n• **Poisson** = **7-8 PM ನಡುವೆ dhaba ಗೆ ಎಷ್ಟು ಗ್ರಾಹಕರು** (random, average rate λ).\n• **Exponential** = **ಎರಡು ಗ್ರಾಹಕರ ನಡುವಿನ wait time**. Poisson(λ) events → gaps Exponential(λ).\n\n4 master ಮಾಡಿದರೆ 80% real-world randomness model.',
      theory:
        '**ಎರಡು families**:\n1. **Discrete** — countable. **PMF**: P(X = k).\n2. **Continuous** — real numbers. **PDF**: density. P(X = exactly x) = 0.\n\n**CDF**: F(x) = P(X ≤ x).\n\n**Normal N(μ, σ²)**:\n• Bell curve μ centred, σ spread.\n• **68-95-99.7 rule**.\n• **Standard normal**: Z = (X − μ) / σ has N(0, 1).\n• **CLT**: many independent random things ನ sum normal.\n\n**Binomial(n, p)**:\n• n trials successes count.\n• PMF: `C(n, k) · p^k · (1−p)^(n−k)`.\n• Mean = `np`, variance = `np(1−p)`.\n• Heads in 10 flips, defective items in 100.\n\n**Poisson(λ)**:\n• Fixed window events count (rare, independent).\n• PMF: `λ^k · e^(−λ) / k!`.\n• Mean = variance = λ.\n• Calls/hour, typos/page.\n• Large n + small p Binomial ≈ Poisson.\n\n**Exponential(λ)**:\n• Continuous. Wait until next Poisson event.\n• PDF: `λ · e^(−λx)` for x ≥ 0.\n• Mean = 1/λ. **Memoryless**: ಎಷ್ಟು wait ಮಾಡಿದ್ದರೂ ಈಗ ಶುರು ಆದಂತೆ.\n\n**ಇತರ**: Uniform, Geometric, Gamma, Beta, Log-normal, Pareto.\n\n**SciPy interface — same API**:\n• `.pmf(k)` / `.pdf(x)`, `.cdf(x)`, `.sf(x)` (P(X > x)), `.ppf(q)` (inverse CDF), `.rvs(size=n)`.',
      whyItMatters:
        'Distributions = statistical models ನ **building blocks**. Linear regression normal errors; logistic regression sigmoid; Naive Bayes Gaussian; A/B test binomial. "Poisson with λ = 2.3" identify → simulation ಬದಲು one-line formula. **Interview**: "city accidents/day distribution?" → Poisson.',
      steps: [
        '**Type**: counting (discrete) ಅಥವಾ measuring (continuous)?',
        '**Counts of successes in n trials** → Binomial.',
        '**Counts of rare events in window** → Poisson. λ ಬೇಕು.',
        '**Continuous bell-shaped** → Normal. μ, σ ಬೇಕು.',
        '**Wait times** → Exponential.',
        'SciPy: `from scipy import stats`. Same API.',
        '"P(X ≤ x)" → **`.cdf(x)`**. "P(X > x)" → **`.sf(x)`** (extreme tails accurate).',
        '"95% mass below ಯಾವ value?" → **`.ppf(0.95)`**.',
        'Doubt ಆದರೆ histogram + candidate PDFs overlay.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** PDF, probability confuse. Continuous ಗೆ `pdf(1.5)` density (probability ಅಲ್ಲ) — > 1 ಆಗಬಹುದು.',
        '**ಸಮಸ್ಯೆ.** `1 - cdf(x)` ಬದಲು tail ಗೆ `sf(x)`. Floating-point precision.',
        '**ತಪ್ಪು.** ಎಲ್ಲ normal ಎಂದು assume. Income, file sizes right-skewed.',
        '**ಸಮಸ್ಯೆ.** Binomial vs Poisson confuse. Binomial fixed n; Poisson n unknown / huge.',
        '**ತಪ್ಪು.** `stats.expon(scale=1/λ)` — `scale` MEAN. λ ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Memoryless property ಮರೆ. Machine wears out → Weibull / Gamma.',
        '**ತಪ್ಪು.** Tail estimates ಗೆ ಕಡಿಮೆ samples. 10⁴-10⁶ ಬೇಕು ಅಥವಾ analytic CDF.',
      ],
      tryIt:
        'Help-desk staffing ಗೆ Poisson:\n```python\nfrom scipy import stats\n\nλ = 8\np = stats.poisson(mu=λ)\n\nfor k in range(0, 25):\n    if p.cdf(k) >= 0.95:\n        print(f"95% coverage: {k} agents")\n        break\n\nprint(f"P(X < 4) = {p.cdf(3):.4f}")\nprint(f"P(X > 15) = {p.sf(15):.4f}")\n```\n**ಈಗ extend ಮಾಡಿ**: ಪ್ರತಿ ticket 8 min. 2 agents ಇದ್ದರೆ ಎಷ್ಟು hours ನಲ್ಲಿ backlog?',
      takeaway:
        '4 distributions = real-world randomness. **Normal** (bell), **Binomial** (n trials), **Poisson** (events/window), **Exponential** (wait). Same SciPy API. **Right distribution → analytic answer**.',
    },

    // ── m2-t6: Hypothesis testing framework ─────────────────
    'm2-t6': {
      explain:
        '**Hypothesis testing** = statistics ನ ನ್ಯಾಯಾಲಯ. **Null H₀** true ಎಂದು assume (innocent), data ಸಂಗ್ರಹಿಸಿ "H₀ ನಿಜ ಆದರೆ ಈ data surprising?" ಕೇಳುವುದು. ತುಂಬಾ surprising (p < α) → H₀ reject, H₁ accept.',
      analogy:
        '**ನ್ಯಾಯಾಲಯ trial:**\nDefendant = H₀ ("no effect"). Prosecutor = data (each obs evidence). Judge "beyond reasonable doubt" ಬೇಕು convict (H₀ reject).\n\n**α = 0.05** = "innocent person 5% time wrongly convict ಮಾಡಲು ಸಿದ್ಧ". **p-value** = evidence strength: ಸಣ್ಣ p = strong evidence. p < α → **reject**. p ≥ α → **fail to reject** (proven true ಅಲ್ಲ; insufficient proof).\n\nಚಹಾ ಮಾರಾಟಗಾರ "ಪ್ರತಿ cup 200 ml". 30 cups → mean 195 ml. H₀: μ = 200 (honest). H₁: μ ≠ 200. t-test p compute → p < 0.05 ಆದರೆ helpline call!',
      theory:
        '**Steps**:\n\n1. **H₀ ಮತ್ತು H₁**. H₀ = "no effect"; H₁ = ನೀವು prove ಮಾಡಬೇಕಾದ್ದು. One/two-tailed?\n\n2. **α choose**. Default 0.05. Strict 0.01 (medical). Lenient 0.10.\n\n3. **Test statistic**. z, t, χ², F.\n\n4. **p-value**. "H₀ true ಆದರೆ ಇದು ಅಥವಾ extreme statistic ಸಿಗುವ probability".\n\n5. **Decide**. p < α → reject. p ≥ α → fail to reject.\n\n**ಮುಖ್ಯ tests**:\n• **One-sample t**: sample mean = claimed value?\n• **Two-sample t**: 2 group means same?\n• **Paired t**: before/after.\n• **Z-test**: σ ಗೊತ್ತಾದಾಗ.\n• **Chi-square**: categorical independence.\n• **ANOVA**: 3+ group means.\n• **Mann-Whitney, Wilcoxon**: non-parametric.\n\n**One vs two-tailed**:\n• **Two-tailed**: H₁: μ ≠ value.\n• **One-tailed**: H₁: μ > value (specific direction).\n\n**Mistakes**:\n• "Failed to reject" ≠ "H₀ proven".\n• p-value = "data H₀ ಗೆ surprising". P(H₀ | data) ಅಲ್ಲ.\n• Statistical ≠ practical significance.',
      whyItMatters:
        'A/B testing, clinical trials, manufacturing QC, scientific research, ML feature importance, drift detection. **ಪ್ರತಿ data science interview ನಲ್ಲಿ** "p-value ಎಂದರೇನು?".',
      steps: [
        '**H₀, H₁**. H₀ = no effect.',
        '**α**: 0.05 default.',
        'Right **test**: one/two sample, paired, ANOVA, chi-square.',
        '**Assumptions check**: normality (Shapiro-Wilk), equal variances (Levene). Fail → non-parametric.',
        'SciPy run: `stats.ttest_1samp`, `stats.ttest_ind`, `stats.chi2_contingency`.',
        'p < α → reject H₀.',
        '**Effect size also** (Cohen\'s d, η²) — practical significance.',
        '**Confidence interval** add.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** "Failed to reject" = "H₀ true". Insufficient evidence ಮಾತ್ರ.',
        '**ಸಮಸ್ಯೆ.** p-value = "P(data | H₀)", "P(H₀ | data)" ಅಲ್ಲ.',
        '**ತಪ್ಪು.** p-hacking — significance ಬರುವ ತನಕ multiple tests. Bonferroni / FDR use.',
        '**ಸಮಸ್ಯೆ.** Statistical vs practical significance confuse. n=1M ನಲ್ಲಿ tiny effect significant — useless.',
        '**ತಪ್ಪು.** One-tailed post-hoc choose. α inflate.',
        '**ಸಮಸ್ಯೆ.** Assumptions check ಮಾಡದೆ. Heavily skewed → Mann-Whitney.',
        '**ತಪ್ಪು.** p = 0.04 vs 0.06 dramatically ಬೇರೆ ಎಂದು treat. Threshold arbitrary.',
      ],
      tryIt:
        'A/B test simulate:\n```python\nimport numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(42)\nA = rng.binomial(1, 0.05, 1000)\nB = rng.binomial(1, 0.06, 1000)\n\nt, p = stats.ttest_ind(A, B)\nprint(f"A: {A.mean():.3f}, B: {B.mean():.3f}")\nprint(f"t = {t:.3f}, p = {p:.4f}")\n```\n**ಈಗ extend ಮಾಡಿ**: n 100 ರಿಂದ 100,000 ಗೆ vary — same effect ಆದರೂ ಯಾಕೆ ದೊಡ್ಡ n ಗೆ significant?',
      takeaway:
        'Hypothesis test = ನ್ಯಾಯಾಲಯ. **H₀ reject ಮಾಡಲು p < α**. p = "H₀ true ಆದರೆ data surprising". **Failed to reject ≠ proven true**. **Statistical ≠ practical significance** — effect size ಯಾವಾಗಲೂ.',
    },

    // ── m2-t7: Confidence intervals ─────────────────────────
    'm2-t7': {
      explain:
        '**Confidence interval (CI)** = "true parameter ಈ range ನಲ್ಲಿ ಇರಬಹುದು ಎಂದು 95% confident". Point estimate ಒಂದು ಸಂಖ್ಯೆ; CI uncertainty range. ಪ್ರತಿ poll, clinical trial, A/B test CI report ಮಾಡುತ್ತದೆ.',
      analogy:
        '**ಚುನಾವಣೆ exit poll:**\n"Party X ಗೆ 42% vote" ಒಂದೇ ಸಂಖ್ಯೆ misleading. "42% (margin ±3%)" = 39%-45% range. ಇದು CI.\n\n**ಮಳೆ ಮುನ್ಸೂಚನೆ**: "exact 30 mm" ಬದಲು "20-40 mm range" honest.\n\n**95% confidence ಎಂದರೆ**: ಈ procedure 100 ಸಾರಿ repeat (each new sample) → 95 intervals true parameter contain ಮಾಡುತ್ತವೆ. **NOT** "95% chance true value is in this specific interval" — common misinterpretation.',
      theory:
        '**Definition**: 95% CI = "long-run, ಈ method 95% intervals true parameter contain".\n\n**Mean ಗೆ formula**:\n`CI = x̄ ± t* · (s / √n)`\n• `x̄` = sample mean\n• `s` = sample std\n• `n` = sample size\n• `t*` = critical t (95% ~1.96 large n)\n• `s / √n` = **standard error (SE)**\n\n**Margin of error** = `t* · SE`.\n\n**Width drivers**:\n• n ⬆ → SE ⬇ (√n). 4× sample = half width.\n• Variability s ⬆ → CI wider.\n• Confidence ⬆ → wider.\n\n**Proportion**:\n`CI = p̂ ± z* · √(p̂(1-p̂) / n)`\n\n**Other intervals**:\n• **Bootstrap CI** — resample with replacement, 2.5th/97.5th percentile. Distribution-free.\n• **Bayesian credible interval** — frequentist CI ಗೆ ಬೇರೆ. "95% chance in range" — ಇದು credible interval interpretation.\n\n**95 vs 99**:\n• 95% → t* = 1.96.\n• 99% → t* = 2.58, wider.\n• 90% → t* = 1.65, narrower.\n\n**CI vs hypothesis test**: 95% CI for difference contains 0 → fail to reject H₀.',
      whyItMatters:
        'CI = uncertainty honest reporting. "5% conversion" point; "95% CI [4.2%, 5.8%]" honest. A/B testing tools, polls, drug efficacy ಎಲ್ಲ CI. **Interview**: "95% CI interpret" — long-run framing wrong = red flag.',
      steps: [
        '`x̄ = data.mean()`, `s = data.std(ddof=1)`.',
        '`SE = s / np.sqrt(n)`.',
        '95% large n ~1.96. `scipy.stats.t.ppf(0.975, df=n-1)` exact.',
        '`ME = t_crit * SE`.',
        '`(x̄ - ME, x̄ + ME)`.',
        'Proportion: `p̂ = successes/n`, `SE = sqrt(p̂(1-p̂)/n)`.',
        'SciPy one-line: `stats.t.interval(0.95, df, loc=mean, scale=SE)`.',
        'Assumptions break ಆದರೆ bootstrap (10,000 resamples).',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** "True value 95% chance ಈ range ನಲ್ಲಿ" — Bayesian credible interval interpretation. Frequentist ಬೇರೆ.',
        '**ಸಮಸ್ಯೆ.** CI ಇಲ್ಲದೆ ಕೇವಲ point. Reader ಗೆ uncertainty hide.',
        '**ತಪ್ಪು.** Wider CI = "less reliable". ಅಲ್ಲ — honest uncertainty admit.',
        '**ಸಮಸ್ಯೆ.** Small n ಗೆ z* (1.96). t* `scipy.stats.t.ppf` use.',
        '**ತಪ್ಪು.** SE = std / √n — √n forget ಆಗಬಾರದು.',
        '**ಸಮಸ್ಯೆ.** Two CIs overlap = "no significant difference" wrong. Difference CI check.',
      ],
      tryIt:
        'CI sample size effect:\n```python\nimport numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(42)\nfor n in [10, 100, 1000, 10000]:\n    sample = rng.normal(100, 15, n)\n    mean = sample.mean()\n    se = sample.std(ddof=1) / np.sqrt(n)\n    t_crit = stats.t.ppf(0.975, df=n-1)\n    ci = (mean - t_crit*se, mean + t_crit*se)\n    print(f"n={n:5d}: mean={mean:.2f}, CI=[{ci[0]:.2f}, {ci[1]:.2f}], width={ci[1]-ci[0]:.3f}")\n```\nn 10× → width ~3.16× narrow. **ಈಗ extend ಮಾಡಿ**: 99% CI compute, bootstrap CI compare.',
      takeaway:
        'CI = point estimate ಸುತ್ತ uncertainty range. 95% CI = long-run frequency — NOT "true value here with 95% probability". n ⬆ → narrower. **ಯಾವಾಗಲೂ CI report**.',
    },

    // ── m2-t8: z-distribution & t-distribution ──────────────
    'm2-t8': {
      explain:
        '**Z-distribution** = standard normal N(0, 1). **t-distribution** = z ತರಹ ಆದರೆ heavier tails — small samples ಗೆ. Rule simple: **σ ಗೊತ್ತು → z; σ unknown (s use) → t**.',
      analogy:
        '**ವಿಜ್ಞಾನ ಪ್ರಯೋಗ:**\nZ = ideal world. Population σ ಗೊತ್ತು — z use.\n\nt = real world. σ ಗೊತ್ತಿಲ್ಲ — sample s estimate. Estimate ನ uncertainty → distribution heavier tails (cautious). n ⬆ → s → σ → t → z converge.\n\n**Moral**: ಚಿಕ್ಕ sample (n < 30) → t. Large (n ≥ 30) → t ≈ z. Modern software t default — safer.',
      theory:
        '**Z-distribution**:\n• Mean 0, std 1.\n• **Z-score**: `Z = (X − μ) / σ`.\n• **Critical values**: 90% → 1.645, 95% → 1.96, 99% → 2.576.\n• Use: σ ಗೊತ್ತು (rare), n very large, proportions.\n\n**t-distribution**:\n• Bell ಆದರೆ heavier tails.\n• Shape **df** ಮೇಲೆ depend. df = n − 1.\n• df ⬆ → t → standard normal.\n• df = 30 ಆದಾಗ t ≈ z.\n• **t-score**: `t = (X̄ − μ) / (s / √n)`.\n• Use: σ unknown, small samples.\n\n**Critical values 95% two-tailed**:\n• z*: 1.96 always.\n• t* df=5: 2.571; df=10: 2.228; df=30: 2.042; df=∞: 1.960.\n\nSmaller df = wider critical = harder reject (conservative).\n\n**ಯಾವಾಗ ಯಾವುದು**:\n| Scenario | Use |\n|---|---|\n| σ ಗೊತ್ತು | z |\n| σ unknown small n | t |\n| σ unknown large n | t (z OK) |\n| Proportion test | z |\n| Difference of means | t |\n| Paired test | t |\n\n**CLT reminder**: any underlying distribution → sample mean distribution n ⬆ → normal.',
      whyItMatters:
        'ಪ್ರತಿ CI, t-test, ANOVA — t use. Wrong distribution = wrong critical value = wrong p = wrong decision. Small-sample studies (clinical trial 20 patients) ಗೆ critical. **Interview**: "ಯಾವಾಗ z, ಯಾವಾಗ t?".',
      steps: [
        'σ ಗೊತ್ತು? Yes → **z**. No → **t**.',
        'Z: `(value − μ) / σ`. T: `(x̄ − μ₀) / (s / √n)`.',
        'Tail (z): `stats.norm.cdf(z)` / `stats.norm.sf(z)`.',
        'Tail (t): `stats.t.cdf(t, df=n-1)` / `stats.t.sf(t, df=n-1)`.',
        'Critical (z): `stats.norm.ppf(0.975)` → 1.96.',
        'Critical (t): `stats.t.ppf(0.975, df=n-1)`.',
        'n ≥ 30 ಆದಾಗ t ≈ z.',
        'Doubt → **t** (always safer).',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** σ unknown ಆದರೂ z. Small n → p underestimate → false positives.',
        '**ಸಮಸ್ಯೆ.** df = n − 1 not n. Off-by-one.',
        '**ತಪ್ಪು.** One-tailed vs two-tailed mix. p interpretation depends.',
        '**ಸಮಸ್ಯೆ.** CLT small heavily-skewed ಗೆ assume. n ≥ 30 ಗೆ work — heavily skewed → 100+.',
        '**ತಪ್ಪು.** Proportion ಗೆ t. Use z ಅಥವಾ exact binomial.',
        '**ಸಮಸ್ಯೆ.** Heavy outliers ಇದ್ದ data ಗೆ t. Median, Mann-Whitney.',
      ],
      tryIt:
        'Small sample t vs z compare:\n```python\nimport numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(42)\nfor n in [5, 10, 30, 100]:\n    sample = rng.normal(100, 15, n)\n    x_bar, s = sample.mean(), sample.std(ddof=1)\n    se = s / np.sqrt(n)\n    t_crit = stats.t.ppf(0.975, df=n-1)\n    z_crit = 1.96\n    print(f"n={n:3d}: t_crit={t_crit:.3f}, z_crit={z_crit:.3f}, ratio={t_crit/z_crit:.3f}")\n```\nn=5 ಗೆ t 30%+ wider; n=100 almost same. **ಈಗ extend ಮಾಡಿ**: 99% CI critical values compare.',
      takeaway:
        '**σ ಗೊತ್ತು → z; σ unknown → t**. t heavier tails, df ⬆ → z converge. n ≥ 30 ಗೆ practically same. **Doubt → t use**.',
    },

    // ── m2-t9: Type I & Type II errors ──────────────────────
    'm2-t9': {
      explain:
        '**Type I**: H₀ true ಆದರೂ reject (false positive). Rate = α.\n**Type II**: H₀ false ಆದರೂ reject ಮಾಡಲಿಲ್ಲ (false negative). Rate = β.\n**Power = 1 − β** = effect ಇದ್ದಾಗ detect ಮಾಡುವ probability.',
      analogy:
        '**ವೈದ್ಯ ಪರೀಕ್ಷೆ:**\n**Type I (false alarm)**: ಆರೋಗ್ಯವಂತ ಗೆ "disease" ಎಂದು ಹೇಳುವುದು. Panic, unnecessary treatment.\n**Type II (miss)**: ರೋಗ ಇರುವ ವ್ಯಕ್ತಿಗೆ "healthy". Disease grows untreated.\n\n**Trade-off**: ತೀರಾ strict → Type I ⬇, ಆದರೆ Type II ⬆ (real disease miss). ತೀರಾ lenient → opposite.\n\n**Security guard analogy**: ಪ್ರತಿಯೊಬ್ಬರ bag check → Type I ⬆ (false alarms), Type II ⬇ (thief catch). ಯಾರನ್ನೂ check ಇಲ್ಲ → Type I = 0, Type II = 100%. Sample size + α ಎರಡೂ tune.',
      theory:
        '**Decision matrix**:\n\n|  | H₀ true | H₀ false |\n|---|---|---|\n| Reject H₀ | **Type I (α)** | Correct (Power = 1−β) |\n| Fail to reject | Correct (1−α) | **Type II (β)** |\n\n**α** = max acceptable Type I. Default 0.05.\n**β** = Type II rate.\n**Power = 1 − β**: convention ≥ 0.80.\n\n**Power 4 things ಮೇಲೆ depend**:\n1. **Effect size** ⬆ → power ⬆.\n2. **Sample size n** ⬆ → SE ⬇ → power ⬆.\n3. **α** ⬆ (lenient) → power ⬆, ಆದರೆ Type I ⬆.\n4. **Variability σ** ⬇ → power ⬆.\n\n**Trade-off**:\n• α ⬇ → β ⬆ (n constant).\n• Both ⬇ ಬೇಕು → n ⬆.\n\n**Power analysis** = experiment ಮೊದಲು "80% power ಗೆ ಎಷ್ಟು n?" compute. Clinical trials, A/B tests ಗೆ critical.\n\n**Different fields, priorities**:\n• Medical screening: Type II minimize (don\'t miss).\n• Court: Type I minimize (don\'t convict innocent).\n• Spam filter: Type I minimize.\n• Cancer detection: Type II minimize.\n\n**Multiple testing**: 100 tests at α=0.05 → ~5 false positives by chance. Bonferroni / FDR correction.',
      whyItMatters:
        'A/B testing decisions, clinical trial conclusions, fraud alerts — ಎಲ್ಲ Type I/II trade-off. Power analysis ಗೊತ್ತಿಲ್ಲ → "underpowered study" — replication failures common reason. **Interview**: "α, β, power" fundamentals.',
      steps: [
        '**α** set (typically 0.05).',
        '**Effect size** estimate (literature / pilot).',
        '**Power = 0.80** target.',
        '`statsmodels.stats.power` ಬಳಸಿ n compute.',
        'Experiment run, p-value get.',
        'p < α → reject. p ≥ α → power adequate ಆಗಿತ್ತೇ check.',
        'Field tailor: medical → Type II minimize.',
        'Multiple tests → Bonferroni / FDR.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Power analysis ಇಲ್ಲದೆ experiment. Underpowered → effect ಇದ್ದರೂ miss.',
        '**ಸಮಸ್ಯೆ.** α ಒಂದೇ minimize. β ಸಹ matter. Both ⬇ → n ⬆.',
        '**ತಪ್ಪು.** "Failed to reject" = "no effect". Underpowered ಸಹ ಇರಬಹುದು.',
        '**ಸಮಸ್ಯೆ.** Multiple tests correction ಇಲ್ಲ. 20 tests at α=0.05 → ~1 FP expected.',
        '**ತಪ್ಪು.** Significant ಆಗುವ ತನಕ data add (peeking). α inflate. Pre-register stopping.',
        '**ಸಮಸ್ಯೆ.** Effect size ignore. n=1M tiny effect significant — useless.',
      ],
      tryIt:
        'Power analysis:\n```python\nfrom statsmodels.stats.power import TTestIndPower\n\nanalysis = TTestIndPower()\n\nfor effect_size in [0.1, 0.2, 0.5, 0.8]:\n    n = analysis.solve_power(effect_size=effect_size, alpha=0.05, power=0.80)\n    print(f"Effect {effect_size}: n = {n:.0f} per group")\n\nfor n in [50, 100, 500, 1000]:\n    power = analysis.solve_power(effect_size=0.3, alpha=0.05, nobs1=n)\n    print(f"n={n}: power = {power:.3f}")\n```\nSmall effect → huge n! **ಈಗ extend ಮಾಡಿ**: α 0.01 ಗೆ ಇಳಿಸಿ — n ಎಷ್ಟು ⬆?',
      takeaway:
        '**Type I (α)** = false positive. **Type II (β)** = false negative. **Power = 1 − β**, target 0.80. α ⬇ → β ⬆. Both ⬇ → **n ⬆**. **Power analysis ಮೊದಲೇ** — underpowered failed-to-reject = inconclusive (not "no effect").',
    },

    // ── m2-t10: Chi-square, ANOVA ───────────────────────────
    'm2-t10': {
      explain:
        '**Chi-square** = categorical variables compare. "Independent?" "Distribution match?". **ANOVA (F-test)** = 3+ group means compare. Both reduce to "observed vs expected".',
      analogy:
        '**ಬೆಳೆ ಇಳುವರಿ ಪ್ರಯೋಗ:**\n4 fertilizers — ಪ್ರತಿಯೊಂದು 30 plots. Mean yields ಬೇರೆ ಬೇರೆ.\n\n**Pairwise t-tests (wrong)**: 4 groups → 6 pairs. ಪ್ರತಿ pair test → α inflate, false positive rate ⬆.\n\n**ANOVA (right)**: ಒಂದೇ test "ಎಲ್ಲ 4 means same?" reject ಆದರೆ post-hoc tests ಯಾವ pairs ಬೇರೆ identify.\n\n**Chi-square**: 4 colours — ಪ್ರತಿ region preference distribution same? "Region & colour independent" H₀. Observed vs expected counts.',
      theory:
        '**Chi-square (χ²)**:\n\n`χ² = Σ (O − E)² / E`\n\n**ಎರಡು types**:\n1. **Goodness-of-fit**: distribution match? Die fair? expected 1/6 ಪ್ರತಿ face.\n2. **Independence**: 2 categorical variables independent? Contingency table.\n\n**Steps**:\n• O frequencies count.\n• E frequencies under H₀ compute.\n• χ² compute.\n• df = (rows−1)(cols−1) independence; categories−1 GoF.\n• p = `stats.chi2.sf(χ², df)`.\n\n**Assumptions**:\n• Expected ≥ 5 ಪ್ರತಿ cell. Smaller → Fisher exact.\n• Independent obs.\n• Counts (not percentages).\n\n**ANOVA**:\n\n**One-way** = 3+ groups one numeric var compare.\n\nF = `between-group var / within-group var`. Different groups → F ⬆.\n\nH₀: all means equal. H₁: ಒಂದು differs.\n\n**df**: between = k−1, within = N−k.\n\np < α → ಒಂದು pair differs. **Post-hoc** (Tukey HSD) ಯಾವ pairs.\n\n**Assumptions**:\n• Independent obs.\n• Each group ~normal.\n• Equal variances (Levene). Fail → Welch ANOVA.\n\n**Two-way ANOVA**: 2 factors. Main effects + interaction.\n\n**Non-parametric**:\n• χ² → Fisher exact (small counts).\n• ANOVA → Kruskal-Wallis (non-normal).',
      whyItMatters:
        'A/B/C/D testing, survey analysis (region × preference), feature selection (categorical features), clinical trials (dose levels) — ಎಲ್ಲ chi-square / ANOVA. **Interview**: "3 groups compare?" — pairwise wrong; ANOVA right.',
      steps: [
        '**GoF**: `stats.chisquare(obs, exp)`.',
        '**Independence**: `stats.chi2_contingency(table)`.',
        '**Expected ≥ 5** verify. Fail → `stats.fisher_exact` (2×2).',
        '**ANOVA**: `stats.f_oneway(g1, g2, g3, ...)`.',
        '**Equal variances**: `stats.levene`. Fail → Welch ANOVA.',
        '**Post-hoc**: `pairwise_tukeyhsd(data, groups)`.',
        'Effect size: chi-square ಗೆ Cramér V; ANOVA ಗೆ η².',
        'Non-parametric: `stats.kruskal`.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** ANOVA ಬದಲು multiple t-tests. 4 groups → 6 pairs at α=0.05 → P(at least 1 FP) ≈ 26%.',
        '**ಸಮಸ್ಯೆ.** Chi-square ನಲ್ಲಿ percentages. Counts ಬೇಕು.',
        '**ತಪ್ಪು.** Expected < 5 ಆದರೂ chi-square. Fisher exact.',
        '**ಸಮಸ್ಯೆ.** ANOVA assumptions skip. Unequal variances → Welch. Non-normal small n → Kruskal-Wallis.',
        '**ತಪ್ಪು.** ANOVA significant → "ಎಲ್ಲ groups ಬೇರೆ". ಅಲ್ಲ — ಒಂದು pair. Post-hoc ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** Effect size report ಮಾಡದೆ. p significant ಆದರೂ tiny effect. Cramér V, η² report.',
      ],
      tryIt:
        '```python\nimport numpy as np\nfrom scipy import stats\n\nrng = np.random.default_rng(42)\n\n# ANOVA: 4 fertilizers\nf1 = rng.normal(50, 5, 30)\nf2 = rng.normal(52, 5, 30)\nf3 = rng.normal(55, 5, 30)\nf4 = rng.normal(50, 5, 30)\nF, p = stats.f_oneway(f1, f2, f3, f4)\nprint(f"ANOVA: F={F:.3f}, p={p:.4f}")\n\n# Chi-square: region × product\ntable = np.array([[50,30,20],[40,35,25],[30,40,30],[25,35,40]])\nchi2, p, df, exp = stats.chi2_contingency(table)\nprint(f"χ²={chi2:.3f}, df={df}, p={p:.4f}")\n```\n**ಈಗ extend ಮಾಡಿ**: ANOVA significant ಆದರೆ Tukey HSD ಯಾವ pairs ಬೇರೆ identify. `from statsmodels.stats.multicomp import pairwise_tukeyhsd`.',
      takeaway:
        '**Chi-square** = categorical (independence / GoF). **ANOVA** = 3+ group means. ANOVA preferred (α inflation avoid). Significant → **Tukey HSD post-hoc**. Expected ≥ 5, equal variances assumptions check.',
    },

    // ── m2-t11: Vectors & vector spaces ─────────────────────
    'm2-t11': {
      explain:
        '**Vector** = ordered numbers ಪಟ್ಟಿ — ಆದರೆ ML ನಲ್ಲಿ ಅಪಾರ ಅರ್ಥ. ಒಂದು dataset feature row, gradient, word embedding, ಅಥವಾ space ನಲ್ಲಿ direction represent ಮಾಡಬಹುದು. **Vector space** = same dimension ನ ಎಲ್ಲ vectors + addition, scalar multiplication operations.',
      analogy:
        '**GPS location ಉದಾಹರಣೆ:**\n(3, 4) ಎಂದರೆ "origin ನಿಂದ 3 km east, 4 km north". ಆ ordered pair ಒಂದು vector.\n\n• **2-D vector** = flat plane ನಲ್ಲಿ point.\n• **3-D vector** = space ನಲ್ಲಿ point (lat, long, altitude).\n• **300-D word embedding** = 300-dimensional space ನಲ್ಲಿ "point" — visualize ಮಾಡಲಾಗದು, ಆದರೆ math identical.\n\n**Operations transfer**: ಎರಡು GPS displacements add → total displacement; ಎರಡು word embeddings add → combined meaning. Scalar 2 ಗೆ multiply → length double, direction same.\n\nಪ್ರತಿ ML object — input row, learned weight, internal activation — ಬೇರೆ ಬೇರೆ ಹೆಸರುಗಳಲ್ಲಿ ಒಂದು vector ಮಾತ್ರ.',
      theory:
        '**Vector** v = [v₁, v₂, ..., vₙ] **ℝⁿ** ನಲ್ಲಿ. ಪ್ರತಿ vᵢ axis i ಮೇಲೆ **component**.\n\n**Operations**:\n• **Addition**: v + w = [v₁+w₁, ..., vₙ+wₙ]. Same shape ಬೇಕು.\n• **Scalar multiplication**: c·v = [c·v₁, ...]. Direction preserve (c<0 ಆದರೆ reverse).\n• **Dot product**: v·w = Σ vᵢwᵢ. ಎರಡು vectors → ಒಂದು ಸಂಖ್ಯೆ.\n• **Norm (magnitude)**: ‖v‖ = √Σvᵢ² (ℓ²-norm).\n  - ℓ¹: Σ|vᵢ| (Manhattan).\n  - ℓ∞: max|vᵢ|.\n• **Unit vector**: v̂ = v / ‖v‖ — same direction, length 1.\n\n**Geometric**:\n• Same direction iff angle 0° (cos θ = 1).\n• Orthogonal iff dot product 0.\n• cos θ = (v·w) / (‖v‖·‖w‖).\n\n**Vector space axioms** (V + scalar mult vector space ಆದರೆ):\n1. Closure under +, scalar mult.\n2. Associativity, commutativity of +.\n3. Zero vector exists.\n4. Inverses (−v).\n5. Distributivity.\n\n**Linear combination**: c₁v₁ + c₂v₂ + ... + cₖvₖ. Span = {v₁, ..., vₖ} ನ ಎಲ್ಲ linear combinations.\n\n**Linear independence**: ಯಾವುದೂ ಇನ್ನೊಂದರ linear combination ಆಗಿಲ್ಲ. **Basis** = maximal independent set; size = **dimension**.\n\n**Standard basis** ℝⁿ: e₁ = (1,0,...,0), e₂ = (0,1,0,...,0).\n\n**ML ನಲ್ಲಿ**:\n• **Feature row** = sample ನ measurements vector.\n• **Weight vector** linear regression = strongest predictive direction.\n• **Gradient** = loss steepest increase direction; opposite move ಮಾಡುತ್ತೇವೆ.\n• **Embedding** = token, user, image ನ learned vector.',
      whyItMatters:
        'ಪ್ರತಿ neural network layer = vector × weight matrix + bias vector. ಪ್ರತಿ gradient descent step = scaled gradient subtract. ಪ್ರತಿ cosine similarity = dot product. Vector intuition ಇಲ್ಲದೆ ML code magic; ಇದ್ದರೆ math self-explanatory. **Interview**: "ಈ NumPy line ಏನು ಮಾಡುತ್ತದೆ?" — fluently translate ಬೇಕು.',
      steps: [
        '`np.array([1, 2, 3])`. `.shape` ಯಾವಾಗಲೂ check.',
        'Add/subtract: `v + w` (element-wise, same shape).',
        'Scalar: `c * v` (`2 * v` doubles each).',
        '**Norm**: `np.linalg.norm(v)` (default ℓ²).',
        '**Unit vector**: `v / np.linalg.norm(v)`.',
        '**Dot product**: `v @ w` (preferred) ಅಥವಾ `np.dot(v, w)`.',
        '**Cosine similarity**: `(v @ w) / (np.linalg.norm(v) * np.linalg.norm(w))`.',
        '**Orthogonality**: dot product close to zero = perpendicular.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Mismatched shapes addition. `[1,2,3] + [1,2]` broadcast surprising ways ಅಥವಾ error. `.shape` check.',
        '**ಸಮಸ್ಯೆ.** Dot product, element-wise confuse. `v * w` element-wise; `v @ w` dot product. Bere bere — NumPy warn ಮಾಡುವುದಿಲ್ಲ.',
        '**ತಪ್ಪು.** Cosine similarity ಗೆ normalize forget. Norm denominator ಇಲ್ಲದೆ unbounded inner product.',
        '**ಸಮಸ್ಯೆ.** Vectors Python lists ಎಂದು treat. `[1,2] + [3,4] = [1,2,3,4]` (concat!). `np.array` ಮೊದಲು.',
        '**ತಪ್ಪು.** Vectors `==` compare. Element-wise booleans; single answer ಅಲ್ಲ. `np.array_equal(v, w)`.',
        '**ಸಮಸ್ಯೆ.** High-dim sparse data ಗೆ L2 norm. ಎಲ್ಲ far apart "boring". Cosine similarity better.',
      ],
      tryIt:
        'Random embeddings ಗೆ "find similar word":\n```python\nimport numpy as np\nnp.random.seed(0)\nvocab = ["king", "queen", "man", "woman", "apple", "fruit", "car"]\nembeddings = {w: np.random.normal(0, 1, 50) for w in vocab}\nembeddings["queen"] = embeddings["king"] + np.random.normal(0, 0.1, 50)\nembeddings["fruit"] = embeddings["apple"] + np.random.normal(0, 0.1, 50)\n\ndef cosine(a, b):\n    return (a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))\n\ndef most_similar(word, top_k=3):\n    target = embeddings[word]\n    sims = [(w, cosine(target, v)) for w, v in embeddings.items() if w != word]\n    return sorted(sims, key=lambda x: -x[1])[:top_k]\n\nprint("Similar to king:", most_similar("king"))\n```\n**ಈಗ extend ಮಾಡಿ**: famous "king − man + woman ≈ queen" analogy implement — resulting vector compute, vocab ನಲ್ಲಿ nearest neighbour find.',
      takeaway:
        'Vector = **direction + magnitude**. **`@` dot product**, **`*` element-wise**. **Cosine similarity** = "how similar?" king. ಪ್ರತಿ ML object — features, weights, gradients, embeddings — vector ಮಾತ್ರ.',
    },

    // ── m2-t12: Matrices & matrix operations ────────────────
    'm2-t12': {
      explain:
        '**Matrix** = 2-D numbers array (rows × columns). ML ನಲ್ಲಿ ಎರಡು faces: **dataset** (rows = samples, cols = features) ಅಥವಾ **linear transformation** (vector × matrix → ಹೊಸ vector). Same A, context ಆಧಾರಿತ ಎರಡೂ.',
      analogy:
        '**ಎರಡು faces ಉದಾಹರಣೆ:**\n• **Spreadsheet of student scores** — rows = students, cols = subjects. ಒಂದು face: **data chunk**.\n• **ಕಾರ್ಖಾನೆ machine** — 3-D input (steel, plastic, rubber) → 2-D output (cars, profit). Recipe = 2×3 matrix M. M × raw_materials → output. ಇನ್ನೊಂದು face: **transformation**.\n\nಎರಡೂ same math. Multiplying matrices = **chaining transformations**: A maps ℝ³→ℝ², B maps ℝ²→ℝ⁴, BA maps ℝ³→ℝ⁴ ಒಂದೇ step ನಲ್ಲಿ. Order matters — BA ≠ AB ("shoes ನಂತರ socks" ≠ "socks ನಂತರ shoes"). **Inner shape match ಆಗಬೇಕು** (middle 2), outer = final shape.',
      theory:
        '**Matrix** A shape (m, n) — m rows, n columns. A_{ij} = row i col j entry.\n\n**Operations**:\n• **Add/subtract**: element-wise; shapes match.\n• **Scalar mult**: `c·A`.\n• **Transpose**: `Aᵀ` rows ↔ columns; (n, m). `(AB)ᵀ = BᵀAᵀ`.\n• **Matrix product**: A (m,k) × B (k,n) = C (m,n). C_{ij} = Σ_k A_{ik}·B_{kj}.\n• **Element-wise (Hadamard)**: A * B, same shape. Matmul ಅಲ್ಲ.\n\n**Key matrices**:\n• **Identity I**: 1s diagonal. `I @ A = A`.\n• **Zero**.\n• **Diagonal**: per-axis scaling.\n• **Symmetric**: A = Aᵀ. Covariance, Gram matrix XᵀX. Real eigenvalues.\n• **Orthogonal**: AᵀA = I. Rotations, reflections. Norms preserve.\n• **Sparse**: mostly zeros. `scipy.sparse`.\n\n**Matrix as transformation**: ಪ್ರತಿ column = standard basis vector ಎಲ್ಲಿಗೆ map ಆಗುತ್ತದೆ.\n\n**Rules**:\n• Matmul **NOT commutative**: AB ≠ BA.\n• Matmul **IS associative**: (AB)C = A(BC).\n• Distributive: A(B+C) = AB + AC.\n• Inverse exists iff square + non-singular: A·A⁻¹ = I.\n• Rank = linearly independent rows/columns count.\n\n**Broadcasting**: NumPy (3,) vector + (2,3) matrix → vector replicates rows ಮೇಲೆ. Powerful, ಆದರೆ silent bugs.\n\n**ML ನಲ್ಲಿ**:\n• Dataset X = (n_samples, n_features).\n• Linear regression: `y = X @ w + b`.\n• Neural net layer: `out = activation(X @ W + b)`.\n• Covariance: `(1/n) · XᵀX` (centered).',
      whyItMatters:
        'ಪ್ರತಿ neural net forward pass = `X @ W + b` sequence. ಪ್ರತಿ regression XᵀX system. PCA covariance decompose. Slow training? Suboptimal matrix shapes. GPU efficiency? Matrix multiplication. PyTorch, TensorFlow, JAX = high-performance matrix engines.',
      steps: [
        '`np.array([[1,2],[3,4]])`, `np.zeros((m,n))`, `np.eye(n)`.',
        '**`.shape` check** ಯಾವಾಗಲೂ.',
        '`A @ B` matmul. Inner dim: `A.shape[1] == B.shape[0]`.',
        '`A * B` element-wise — confuse ಮಾಡಬೇಡಿ.',
        '`A.T` transpose. `A.reshape(m, n)`.',
        'Ax = b ಗೆ `np.linalg.solve(A, b)` — never `inv(A) @ b`.',
        'Batched ops ಗೆ broadcasting; shapes print check.',
        'Huge sparse: `scipy.sparse.csr_matrix`.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** `@` ಮತ್ತು `*` confuse. Element-wise (same shape) vs matmul. ಎರಡೂ silent succeed.',
        '**ಸಮಸ್ಯೆ.** Inner shapes match ಆಗದಿರುವುದು. `(3,4) @ (5,2)` error. Outer = final, inner match.',
        '**ತಪ್ಪು.** `np.linalg.inv()` system solve ಗೆ. Slow + unstable. `solve()` use.',
        '**ಸಮಸ್ಯೆ.** Broadcasting bugs. (5,3) + (5,) NOT column-wise; reshape (5,1) ಬೇಕು.',
        '**ತಪ್ಪು.** Iterating instead of vectorising. Loop 100× slow.',
        '**ಸಮಸ್ಯೆ.** Bias column forget. Linear regression `y = Xw` intercept ಇಲ್ಲ → line origin ಮೂಲಕ.',
        '**ತಪ್ಪು.** Sparse data ಗೆ dense matrix. (1M × 1M) dense = 8 TB. `scipy.sparse`.',
        '**ಸಮಸ್ಯೆ.** `XᵀX` singular ಆಗಬಹುದು (multicollinearity). Ridge: `solve(XᵀX + λI, Xᵀy)` ಅಥವಾ pinv.',
      ],
      tryIt:
        'NumPy ಬಳಸಿ 5 lines ನಲ್ಲಿ linear regression:\n```python\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(42)\nn = 100\nx = np.random.uniform(0, 10, n)\ny = 2.5 * x + 3 + np.random.normal(0, 1.5, n)\n\nX = np.column_stack([x, np.ones(n)])\nw = np.linalg.solve(X.T @ X, X.T @ y)\nprint(f"Slope: {w[0]:.3f}, Intercept: {w[1]:.3f}")\n```\n**ಈಗ extend ಮಾಡಿ**: polynomial column (x²) ಸೇರಿಸಿ refit — polynomial regression ಒಂದು extra line ನಲ್ಲಿ. sklearn internally ಇದನ್ನೇ ಮಾಡುತ್ತದೆ.',
      takeaway:
        'Matrices = **dataset OR transformation** — same math, ಎರಡು interpretations. **`@` matmul, `*` element-wise**. **`.shape` check**. **`solve` use, `inv` ಬೇಡ**. Inner dims match. Broadcasting master → loops 100× faster.',
    },

    // ── m2-t13: Dot product & projections ───────────────────
    'm2-t13': {
      explain:
        '**Dot product** a·b = Σ aᵢbᵢ — ML ನಲ್ಲಿ most-used operation. Geometric: a·b = ‖a‖·‖b‖·cos(θ) — alignment measure. **Cosine similarity** = normalized dot product. **Projection** "a vector b ಕಡೆ ಎಷ್ಟು align ಆಗಿದೆ" ಹೇಳುತ್ತದೆ.',
      analogy:
        '**ಶಾಪಿಂಗ್ cart ಉದಾಹರಣೆ:**\nForce **F** ನಿಂದ cart ಅನ್ನು direction **d** ನಲ್ಲಿ push ಮಾಡುತ್ತೀರಿ. Work done = **F·d** — motion ಜೊತೆ aligned force component ಮಾತ್ರ count. Perpendicular push (sideways) → zero work. Opposite push → negative.\n\nಇದೇ dot product. Alignment reward, opposition penalize. ML ನಲ್ಲಿ feature vector weight vector ಜೊತೆ "same way point" ಆದರೆ prediction ಗೆ positive contribution; opposite → subtract.\n\n**Cosine similarity** = ಎರಡೂ vectors length 1 ಗೆ normalize ಮಾಡಿದ ನಂತರ dot product. "How aligned?" ಮಾತ್ರ ಕೇಳುತ್ತದೆ. "King" ಮತ್ತು "monarch" embeddings cosine ~1; "king" + "banana" ~0; "happy" + "sad" ~−1.',
      theory:
        '**Definition**: a·b = a₁b₁ + ... + aₙbₙ.\n\n**Geometric**: a·b = ‖a‖·‖b‖·cos(θ).\n\n**Properties**:\n• **Commutative**: a·b = b·a.\n• **Distributive**: a·(b+c) = a·b + a·c.\n• **a·a = ‖a‖²**.\n• Sign: positive = same direction, zero = perpendicular, negative = opposite.\n\n**Cosine similarity**: cos(θ) = (a·b) / (‖a‖·‖b‖) ∈ [−1, 1].\n• Magnitude-invariant — `2v` ಮತ್ತು `v` same cosine.\n• Euclidean distance vs cosine: distance magnitude care, cosine ಇಲ್ಲ.\n\n**Projection of a onto b**:\n  proj_b(a) = ((a·b)/(b·b)) · b\n• a ನಿಂದ b line ಮೇಲೆ perpendicular drop.\n• Unit b ಆದರೆ (a·b)·b.\n• **Rejection** = a − proj_b(a) — perpendicular component.\n\n**Decomposition**: ANY a ಅನ್ನು b along + b perpendicular split ಮಾಡಬಹುದು. ಇದೇ:\n• **PCA** — principal directions ಮೇಲೆ project.\n• **Gram-Schmidt** — orthogonal bases.\n• **Linear regression** — y ಅನ್ನು X ನ column space ಮೇಲೆ project.\n\n**ML ನಲ್ಲಿ ಎಲ್ಲಿ**:\n• Linear regression: ŷ_i = w·x_i.\n• Cosine similarity in vector DBs (Pinecone, Chroma), word2vec, recommenders.\n• **Self-attention** Transformers: scores = Q·Kᵀ.\n• Convolution = filter ಮತ್ತು patch dot product.\n• Kernel methods.\n\n**Cauchy-Schwarz**: |a·b| ≤ ‖a‖·‖b‖.',
      whyItMatters:
        'Dot product = ML primitive operation. ಪ್ರತಿ neural-net forward = ಲಕ್ಷ dot products. ಪ್ರತಿ vector DB cosine similarity rank. ಪ್ರತಿ attention Q·K. Matrix multiplication = ML engine; dot product = piston. Quickly tell similar — debug far faster.',
      steps: [
        'Dot: `a @ b`.',
        'Geometric verify: a·b = ‖a‖·‖b‖·cos(θ).',
        '**Cosine**: `(a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))`.',
        'Batched: `sklearn.metrics.pairwise.cosine_similarity`.',
        '**Orthogonality**: dot product near zero (float tolerance).',
        '**Projection**: `proj = (a @ b / (b @ b)) * b`.',
        '**Angle degrees**: `np.rad2deg(np.arccos(cos_sim))`.',
        '**Scale**: cosine [−1, 1]; raw dot product unbounded.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Normalize forget. Raw dot products longer vectors favour. "Similarity" → cosine.',
        '**ಸಮಸ್ಯೆ.** `np.dot()` unexpected shape. 1-D dot, 2-D matmul, higher confusing. `@` use.',
        '**ತಪ್ಪು.** Float exact equality check. `np.isclose(dot, 0)` ಅಥವಾ `abs(dot) < 1e-9`.',
        '**ಸಮಸ್ಯೆ.** Pairwise similarities Python loop. O(n²) slow. `cosine_similarity` vectorized.',
        '**ತಪ್ಪು.** Zero vector cosine. Division by zero. `norm < eps` handle.',
        '**ಸಮಸ್ಯೆ.** Negative cosine misinterpret. cos = −1 = OPPOSITE direction, "very different" ಅಲ್ಲ.',
        '**ತಪ್ಪು.** Dot product, cross product confuse. Cross product 3-D ಮಾತ್ರ — graphics/physics.',
        '**ಸಮಸ್ಯೆ.** Different embedding spaces ಅಲ್ಲಿ cosine compare. Apples vs oranges.',
      ],
      tryIt:
        'Tiny semantic search:\n```python\nimport numpy as np\nnp.random.seed(0)\ndocs = ["Python is a programming language",\n        "Snakes are reptiles",\n        "Java and Python are both popular",\n        "Crocodiles live in rivers"]\n\ndef fake_embed(text):\n    rng = np.random.RandomState(abs(hash(text)) % (2**31))\n    return rng.randn(50)\n\ndoc_vecs = np.stack([fake_embed(d) for d in docs])\n\ndef cosine(a, B):\n    return (B @ a) / (np.linalg.norm(B, axis=1) * np.linalg.norm(a) + 1e-9)\n\nq_vec = fake_embed("tell me about pythons")\nscores = cosine(q_vec, doc_vecs)\nfor doc, s in sorted(zip(docs, scores), key=lambda x: -x[1]):\n    print(f"{s:+.3f}  {doc}")\n```\n**ಈಗ extend ಮಾಡಿ**: `fake_embed` ಬದಲು real embedding model (OpenAI, sentence-transformers) → 20 lines ನಲ್ಲಿ working semantic-search engine.',
      takeaway:
        'a·b = **‖a‖·‖b‖·cos(θ)** — alignment one number. **Cosine similarity** magnitudes count ಆಗದಿದ್ದಾಗ. **Projection** decompose. Dot products power **regression, attention, vector search, kernels** — ML ಎಲ್ಲೆಡೆ.',
    },

    // ── m2-t14: Determinants & inverses ─────────────────────
    'm2-t14': {
      explain:
        '**Determinant |A|** = square matrix ಒಂದು ಸಂಖ್ಯೆಯಲ್ಲಿ summary. Geometric: A transformation ಆಗಿ act ಮಾಡಿದಾಗ **volume scaling factor**. **Inverse A⁻¹** = A ಅನ್ನು "undo" ಮಾಡುವ matrix: A·A⁻¹ = I. **|A| ≠ 0 ಆದರೆ ಮಾತ್ರ inverse exists**.',
      analogy:
        '**Photo filter ಉದಾಹರಣೆ:**\nA = image stretch + tilt filter. **Determinant** = ಪ್ರತಿ shape ನ area ಎಷ್ಟು multiply. |A| = 2 → areas double. |A| = 0.5 → halve. **|A| = 0** → entire 2-D image ಒಂದೇ line ಗೆ squash; un-squash impossible (infinite original points → same flat line). **Inverse exist ಆಗದಿರುವ ಪರಿಸ್ಥಿತಿ.**\n\nDeterminant sign: positive = orientation preserve (ಬಲ ಕೈ ಬಲ); negative = flip (mirror image, left/right swap).\n\n**Inverse** = rewind button. A maps x → Ax; A⁻¹ maps Ax → x. Forward transform information lose ಮಾಡದಿದ್ದರೆ ಮಾತ್ರ work. |A| = 0 → multiple x same Ax → unique rewind ಇಲ್ಲ → **singular**.',
      theory:
        '**Determinant**:\n• 2×2: |A| = ad − bc.\n• Higher: cofactor expansion / LU.\n• NumPy: `np.linalg.det(A)`.\n\n**Properties**:\n• |I| = 1.\n• |Aᵀ| = |A|.\n• |AB| = |A|·|B|.\n• |cA| = c^n · |A|.\n• |A⁻¹| = 1/|A|.\n• Row swap → |A| × −1.\n• Row + multiple of another → unchanged.\n\n**Geometric**:\n• 2×2: signed area parallelogram (columns).\n• 3×3: signed volume.\n• n×n: signed n-D hyper-volume scaling.\n\n**Inverse**:\n• Square + non-singular ಗೆ ಮಾತ್ರ.\n• A·A⁻¹ = I.\n• 2×2: A⁻¹ = (1/|A|) · [[d, −b], [−c, a]].\n• NumPy: `np.linalg.inv(A)`.\n\n**Solving Ax = b**:\n• Mathematically: x = A⁻¹b.\n• Practically: **NEVER inverse explicit**. `np.linalg.solve(A, b)` — LU, faster + stable.\n\n**Singular vs near-singular**:\n• |A| = 0 → columns dependent, no inverse.\n• |A| ≈ 0 → ill-conditioned. Tiny b perturbation → huge x swing.\n• **Condition number** κ(A): large → ill-conditioned.\n\n**Pseudo-inverse A⁺**:\n• Non-square / singular ಗೆ generalize.\n• `np.linalg.pinv(A)`.\n• Least-squares ಗೆ.\n\n**Dependence check**: rank(A) < n ⇔ |A| = 0 ⇔ singular.',
      whyItMatters:
        'Linear regression `XᵀX·w = Xᵀy` — matrix invertible ಬೇಕು. Multicollinear features → XᵀX singular → regression explode. Ax=b = simulations, optimisation, Markov chains, physics ಒಳಗಿನ engine. **`inv()` bad, `solve()` good** — clean expert vs beginner tell numerical computing interviews.',
      steps: [
        '`np.linalg.det(A)`.',
        '|A| **near zero** check ಮೊದಲು — pseudo-inverse.',
        'Ax = b ಗೆ **always** `np.linalg.solve(A, b)`.',
        'Non-square / singular: `np.linalg.pinv(A)`.',
        '**Condition number**: `np.linalg.cond(A)` — >>1e10 = trouble.',
        '2×2: |A| = ad − bc.',
        'Invertibility: `np.linalg.matrix_rank(A) == n`.',
        'Ridge regression: `solve(XᵀX + λI, Xᵀy)`.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** `inv()` system solve ಗೆ. Slow, unstable, errors. `solve()` ಯಾವಾಗಲೂ.',
        '**ಸಮಸ್ಯೆ.** |A| == 0 exact equality. Floats ~ never exactly 0. `abs(det) < 1e-10` ಅಥವಾ `cond < 1e10`.',
        '**ತಪ್ಪು.** Multicollinear features. XᵀX near-singular. Ridge ಅಥವಾ feature drop.',
        '**ಸಮಸ್ಯೆ.** Non-square invert ಮಾಡಲು try. Square only. `pinv` use.',
        '**ತಪ್ಪು.** `.linalg` forget. `np.det()` ಇಲ್ಲ; `np.linalg.det()`.',
        '**ಸಮಸ್ಯೆ.** High-dim |A| trust. Astronomically large/small purely scale ನಿಂದ. `slogdet` use.',
        '**ತಪ್ಪು.** A⁻¹·B compute. `solve(A, B)` matrix B handle — faster.',
        '**ಸಮಸ್ಯೆ.** Condition number ignore. cond=1e15 → effectively singular even det≠0.',
      ],
      tryIt:
        'Linear system 3 ways compare:\n```python\nimport numpy as np\nimport time\n\nnp.random.seed(0)\nn = 500\nA = np.random.randn(n, n)\nb = np.random.randn(n)\n\nt = time.time(); x1 = np.linalg.inv(A) @ b; t1 = time.time() - t\nt = time.time(); x2 = np.linalg.solve(A, b); t2 = time.time() - t\n\nfrom scipy.linalg import lu_factor, lu_solve\nt = time.time(); lu = lu_factor(A); x3 = lu_solve(lu, b); t3 = time.time() - t\n\nprint(f"inv:   {t1:.4f}s, residual={np.linalg.norm(A@x1-b):.2e}")\nprint(f"solve: {t2:.4f}s, residual={np.linalg.norm(A@x2-b):.2e}")\nprint(f"lu:    {t3:.4f}s, residual={np.linalg.norm(A@x3-b):.2e}")\n```\n**ಈಗ extend ಮಾಡಿ**: n=2000 ಗೆ scale, multiple right-hand sides via `lu_solve(lu, B)`, time savings.',
      takeaway:
        '**|A| ≠ 0 ⇔ invertible**. Determinant = volume scale; sign = orientation. **Always `solve()`, never `inv()`**. Non-square/singular → **`pinv()`**. **Condition number** ill-conditioned spot.',
    },

    // ── m2-t15: Eigenvalues & eigenvectors ──────────────────
    'm2-t15': {
      explain:
        'Square matrix A ಗೆ **eigenvector** v = special direction A ಕೇವಲ **stretch** (rotate ಇಲ್ಲ) ಮಾಡುವ. Stretch amount = **eigenvalue λ**. **Av = λv**. PCA, spectral clustering, PageRank, quantum mechanics — ಎಲ್ಲ "natural axes" reveal.',
      analogy:
        '**ಟ್ರಾಂಪೋಲಿನ್ ಉದಾಹರಣೆ:**\nOval bouncy ಆಕಾರದ trampoline. Random spots push → mixed directions rebound. ಆದರೆ ನಿಖರವಾಗಿ ಎರಡು special directions: oval long axis ಅಥವಾ short axis push → rebound *ಅದೇ line ಮೇಲೆ*. ಆ directions = **eigenvectors**. Push gegen rebound = **eigenvalue**.\n\n3-D rotating object: eigenvectors = rotation axes (move ಆಗದ points). Stretching transformation: eigenvectors = stretch directions. Data ನ covariance matrix: eigenvectors = **principal directions of variation** (data cloud ನ "long axes"); eigenvalues = ಪ್ರತಿ direction ಮೇಲೆ spread.\n\n**Insight**: ಯಾವುದೇ messy linear transformation = "stretch by λ₁ along v₁, stretch by λ₂ along v₂, ...". **Diagonalisation** — own eigenbasis ನಲ್ಲಿ matrix simple diagonal.',
      theory:
        '**Definition**: λ eigenvalue of A iff non-zero v with **Av = λv**. v = corresponding eigenvector.\n\n**Computing**:\n• **det(A − λI) = 0** — characteristic polynomial roots.\n• ಪ್ರತಿ λ ಗೆ **(A − λI)v = 0** solve.\n• NumPy: `vals, vecs = np.linalg.eig(A)`. Columns of `vecs` = eigenvectors.\n• Symmetric: `eigh` — faster, stable, real, orthogonal.\n\n**Properties**:\n• **Sum eigenvalues = trace(A)**.\n• **Product eigenvalues = det(A)**.\n• A ಮತ್ತು Aᵀ same eigenvalues.\n• A⁻¹ eigenvalues 1/λ.\n• Aⁿ eigenvalues λⁿ.\n• Symmetric A: real eigenvalues, orthogonal eigenvectors.\n• **Positive semi-definite** (covariance, Gram, kernel): all eigenvalues ≥ 0.\n\n**Diagonalisation**: A = V·Λ·V⁻¹. Symmetric: A = V·Λ·Vᵀ.\n\n**ಯಾಕೆ useful**:\n• Aⁿ = V·Λⁿ·V⁻¹ — O(n) instead n matmuls.\n• Differential equations trivial eigenbasis ನಲ್ಲಿ.\n• PCA: top eigenvectors of covariance project.\n\n**Spectral theorem** (symmetric): real symmetric matrix → full orthogonal real-eigenvalued eigenvectors. **ML linear algebra ನ most-used result**.\n\n**SVD** (Singular Value Decomposition): non-square ಗೆ generalize. **A = UΣVᵀ**. Singular values = AᵀA / AAᵀ eigenvalues. Recommendations, image compression, LSA.\n\n**ML ನಲ್ಲಿ**:\n• **PCA**: top eigenvectors of covariance.\n• **PageRank**: link matrix dominant eigenvector.\n• **Spectral clustering**: graph Laplacian eigenvectors.\n• Vibration analysis, Markov chains, quantum mechanics.',
      whyItMatters:
        'Eigendecomposition = PCA, recommendation systems (matrix factorization), spectral graph algorithms, dynamics stability ನ ಗಣಿತೀಯ ಹೃದಯ. **ML interviews "explain PCA"** — right answer "covariance matrix eigendecomposition" ನಿಂದ ಶುರು. Hessian eigvals → loss surface bowl/saddle/hill — optimization debugging.',
      steps: [
        '`vals, vecs = np.linalg.eig(A)`.',
        '**Symmetric** → `np.linalg.eigh(A)` — faster, real, orthogonal.',
        'Sort largest first: `order = np.argsort(vals)[::-1]`.',
        'Verify: `A @ v ≈ λ * v`.',
        '**PCA**: `np.cov(X, rowvar=False)` eigendecompose (centered).',
        'Non-square / stability: `np.linalg.svd(X)`.',
        'Definiteness: positive semi-definite ⇔ all λ ≥ 0.',
        'Trace = sum λ; det = product λ — sanity checks.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Symmetric matrix ಗೆ `eig`. Complex-typed values (zero imaginary). `eigh` use.',
        '**ಸಮಸ್ಯೆ.** Eigenvectors unit / sorted assume. NumPy unit, ಆದರೆ order arbitrary. `argsort` sort.',
        '**ತಪ್ಪು.** Eigenvectors sign-unique ಎಂದು assume. v ಮತ್ತು −v ಎರಡೂ valid. Different runs sign flip — `==` compare ಬೇಡ.',
        '**ಸಮಸ್ಯೆ.** Non-square eigendecompose try. Doesn\'t exist. SVD use.',
        '**ತಪ್ಪು.** Non-symmetric ಗೆ complex eigenvalues ignore. Rotation matrices complex pairs — correct, bug ಅಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Huge matrix top-k ಗೆ full eigendecomp. `scipy.sparse.linalg.eigs(A, k=10)` — much faster.',
        '**ತಪ್ಪು.** Eigenvalues ಮಾತ್ರ matrices compare. Same eigenvalues ≠ same matrix. Eigenvectors carry rest.',
        '**ಸಮಸ್ಯೆ.** PCA centering ಇಲ್ಲ. First eigenvector mean direction — useless. Column means subtract.',
      ],
      tryIt:
        'PCA = eigendecomposition 2-D ಮೇಲೆ visualize:\n```python\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nnp.random.seed(0)\ntheta = np.deg2rad(30)\nR = np.array([[np.cos(theta), -np.sin(theta)],\n              [np.sin(theta),  np.cos(theta)]])\nX = np.random.randn(300, 2) @ np.diag([3, 1]) @ R.T\n\nXc = X - X.mean(axis=0)\ncov = np.cov(Xc, rowvar=False)\nvals, vecs = np.linalg.eigh(cov)\norder = np.argsort(vals)[::-1]\nvals, vecs = vals[order], vecs[:, order]\n\nplt.scatter(Xc[:, 0], Xc[:, 1], alpha=0.4)\nfor i in range(2):\n    plt.arrow(0, 0,\n              vecs[0, i] * np.sqrt(vals[i]) * 2,\n              vecs[1, i] * np.sqrt(vals[i]) * 2,\n              width=0.05, color="red")\nplt.axis("equal"); plt.show()\n```\n**ಈಗ extend ಮಾಡಿ**: 3-feature dataset, top 2 eigenvectors ಮೂಲಕ 2-D project — PCA scratch ನಿಂದ! `sklearn.decomposition.PCA` ಇದನ್ನೇ ಮಾಡುತ್ತದೆ.',
      takeaway:
        '**Av = λv** — eigenvectors A rotate ಮಾಡದ directions, eigenvalues stretch ಎಷ್ಟು. **Symmetric → `eigh`**, otherwise `eig`, non-square → `svd`. **Trace = Σλ**, **det = Πλ**. PCA, PageRank, spectral methods — ML ರೇಖಾಗಣಿತದ ಅರ್ಧ.',
    },

    // ── m2-t16: Principal Component Analysis (PCA) ──────────
    'm2-t16': {
      explain:
        '**PCA** ಡೇಟಾ ಹೆಚ್ಚು vary ಆಗುವ orthogonal axes — **principal components (PCs)** — find ಮಾಡುತ್ತದೆ. PC1 most variance, PC2 perpendicular ಮತ್ತು next most. **Compress** high-dim data, **visualise** 2-D/3-D, **denoise**, ಅಥವಾ **decorrelate** features.',
      analogy:
        '**ಪ್ಯಾನ್ ಕೇಕ್ ಉದಾಹರಣೆ:**\n3-D space ನಲ್ಲಿ ಒಂದು flat oval pancake ಆಗಿ floating data points. Tilted angle ನಲ್ಲಿ — ನಿಮ್ಮ X/Y/Z axes pancake ಜೊತೆ align ಆಗಿಲ್ಲ. PCA = automatically rotate ಮಾಡುವ chashma — pancake flat front, longest axis ಹೊಸ "X", shorter "Y". Thin perpendicular direction (almost no info) ಹೊಸ "Z" — safely drop.\n\nPancake metaphor 100 dimensions ಗೆ scale. ಹೆಚ್ಚಿನ real datasets — images, gene expression, customer features — feature space ಒಳಗಿನ much lower-dimensional "pancake" ಮೇಲೆ live. PCA ಆ pancake auto find.\n\nHigh-resolution photo compress — first few "directions of variation" ನಲ್ಲಿ most detail. Keep those, rest drop → smaller file 95% information.',
      theory:
        '**Algorithm** (canonical recipe):\n1. **Center**: X_c = X − mean. Centering ಇಲ್ಲ → PCA mean direction capture, real variation ಅಲ್ಲ.\n2. **Standardise** features bere bere scales (cm, ₹).\n3. **Covariance matrix** Σ = (1/n) · X_cᵀ·X_c.\n4. **Eigendecompose** Σ = V·Λ·Vᵀ.\n5. Sort eigenvectors **descending**. ಪ್ರತಿ eigenvector = principal component.\n6. **Project**: X_pca = X_c · V[:, :k].\n\n**SVD recipe** (more stable):\n1. Center X.\n2. X_c = U·Σ·Vᵀ.\n3. Top k PCs = first k columns V.\n4. Variance i = σᵢ² / Σσⱼ².\n5. Projected = U[:, :k] · Σ[:k, :k].\n\n**Variance explained**:\n• `explained_variance_ratio_` = ಪ್ರತಿ eigenvalue / total.\n• Cumulative ≥ 0.95 ರ k pick.\n\n**Reconstruction**: x_reconstructed = X_pca · V[:, :k]ᵀ + mean. Lossy unless k = n_features.\n\n**ಎರಡು flavours**:\n• **Standard PCA** — covariance-based.\n• **Kernel PCA** — kernel trick ಮೂಲಕ non-linear feature space.\n• **Sparse PCA** — interpretability.\n• **Incremental PCA** — batch-by-batch (memory ನಲ್ಲಿ ಬರದಿರುವಾಗ).\n\n**PCA shines**:\n• Linear regression decorrelate (multicollinear).\n• 2-D clusters visualise.\n• Image compression (eigenfaces).\n• Downstream models speed up.\n\n**PCA fails**:\n• Non-linear manifold (UMAP / t-SNE).\n• Variance ≠ usefulness (classification → LDA).\n• Discrete / categorical (TruncatedSVD / LSA).',
      whyItMatters:
        'PCA = high-dim data ನ universal "first move" — visualisation, sanity-check, denoising, feature-prep. **ML interview "explain PCA"** = eigendecomposition recipe walk through. Real apps: e-commerce (user-feature compress), industrial IoT (sensor denoise), eigenfaces, genomics. `sklearn.decomposition.PCA` ಮತ್ತು manual SVD = using vs *understanding* PCA.',
      steps: [
        '**Standardise** with `StandardScaler` (scales differ ಆದರೆ).',
        '`pca = PCA(n_components=2).fit(X_scaled)`.',
        '`pca.explained_variance_ratio_` inspect.',
        'Cumulate `np.cumsum(...)` — 0.90 / 0.95 cross k pick.',
        '`X_pca = pca.transform(X_scaled)`.',
        '2-D scatter visualise (class colour).',
        'Huge data: `IncrementalPCA`.',
        'Non-linear: `KernelPCA(kernel="rbf")`, **UMAP**, **t-SNE**.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Standardise forget. Millions feature millimetres ಮೇಲೆ overwhelm. `StandardScaler` ಮೊದಲು.',
        '**ಸಮಸ್ಯೆ.** Centre forget (manual). Mean direction first PC — useless.',
        '**ತಪ್ಪು.** PC1 = "most important feature" ಎಂದು treat. PC1 = features combination. Loadings read.',
        '**ಸಮಸ್ಯೆ.** Classification ಗೆ PCA class separation check ಇಲ್ಲ. PCA variance maximize, discrimination ಅಲ್ಲ. **LDA** use.',
        '**ತಪ್ಪು.** Categorical/sparse data. PCA continuous numeric. **TruncatedSVD (LSA)**.',
        '**ಸಮಸ್ಯೆ.** k=2 ಕೇವಲ plot ಗೆ. Variance 30% ಮಾತ್ರ explain ಆದರೆ "clusters" artefacts.',
        '**ತಪ್ಪು.** Test data ಮೇಲೆ fit. Train ಮಾತ್ರ; test transform. Otherwise leakage.',
        '**ಸಮಸ್ಯೆ.** PCA = feature selection ಎಂದು confuse. PCA combines; original interpretability lose. Sparse PCA / Lasso.',
      ],
      tryIt:
        'PCA ಮೂಲಕ image compress:\n```python\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom sklearn.decomposition import PCA\nfrom scipy.datasets import face\n\nimg = face(gray=True).astype(float) / 255.\nh, w = img.shape\n\nfig, axes = plt.subplots(1, 4, figsize=(15, 4))\naxes[0].imshow(img, cmap="gray"); axes[0].set_title("original")\n\nfor i, k in enumerate([5, 50, 200], start=1):\n    pca = PCA(n_components=k).fit(img)\n    img_c = pca.inverse_transform(pca.transform(img))\n    axes[i].imshow(img_c, cmap="gray")\n    var = pca.explained_variance_ratio_.sum()\n    axes[i].set_title(f"k={k}  ({var:.1%})")\nplt.tight_layout(); plt.show()\n```\n**ಈಗ extend ಮಾಡಿ**: compression ratio compute (h·w vs k·(h+w+1)), k vs reconstruction error plot — elbow ನೋಡಿ k choose.',
      takeaway:
        'PCA = **covariance matrix eigendecomposition**, variance ranked. **Standardise + centre** ಯಾವಾಗಲೂ. Cumulative variance (≥ 95%) ನಿಂದ k. PC1 = features combination, feature ಅಲ್ಲ. **PCA** compression; **LDA** class separation; **t-SNE/UMAP** non-linear.',
    },

    // ══════════════════════════════════════════════════════════
    // MODULE 6 — Data Structures & Algorithms
    // ══════════════════════════════════════════════════════════

    'm6-t1': {
      explain:
        '**Array** ಎಂದರೆ ಒಂದೇ type ನ values ಅನ್ನು memory ಯಲ್ಲಿ ಪಕ್ಕ-ಪಕ್ಕ store ಮಾಡುವ structure. Index ಕೊಟ್ಟರೆ `O(1)` ನಲ್ಲಿ ಯಾವುದೇ element ಸಿಗುತ್ತದೆ. **Dynamic array** (Python `list`) full ಆದಾಗ capacity double ಮಾಡಿಕೊಳ್ಳುತ್ತದೆ — ಹಾಗಾಗಿ `append` average-ನಲ್ಲಿ `O(1)`. ಮಧ್ಯದಲ್ಲಿ insert/delete ಮಾಡಿದರೆ ಮಾತ್ರ `O(n)`.',
      analogy:
        '**ಅಂಚೆ ಕಚೇರಿಯ ಪತ್ರ ಪೆಟ್ಟಿಗೆ ಸಾಲು:**\n' +
        'Apartment ನಲ್ಲಿ 1 ರಿಂದ 100 ರ ತನಕ number ಹಾಕಿದ ಪೆಟ್ಟಿಗೆಗಳ ಒಂದು ಉದ್ದ ಸಾಲು ಇದೆ. Postman ಗೆ box 47 ಬೇಕೆಂದರೆ — ನೇರವಾಗಿ ಅಲ್ಲಿಗೆ ಹೋಗುತ್ತಾರೆ. 1, 2, 3 check ಮಾಡುವ ಅಗತ್ಯ ಇಲ್ಲ. ಇದೇ **`O(1)` random access**.\n\n' +
        'ಈಗ apartment full ಆಯಿತು. ಗೋಡೆಯನ್ನು ಎಳೆಯಲು ಆಗದು! ಹಾಗಾಗಿ watchman ಎರಡು ಪಟ್ಟು ದೊಡ್ಡ ಸಾಲು ಕಟ್ಟಿ, ಎಲ್ಲ ಹಳೆಯ boxes ಸಾಗಿಸಿ, ಹಳೆಯದು ಬಿಸಾಡುತ್ತಾನೆ. ಆ ಒಂದು ಬಾರಿಯ ಶ್ರಮ `O(n)` — ಆದರೆ ಪ್ರತಿ doubling ಗೆ ಒಂದು ಬಾರಿ ಮಾತ್ರ. ಸರಾಸರಿ constant — **amortised `O(1)` append**.\n\n' +
        'Box 47-48 ನಡುವೆ ಹೊಸ ಕುಟುಂಬ ಸೇರಿಸಬೇಕೆಂದರೆ? 48 ರಿಂದ ಎಲ್ಲರೂ ಒಂದು ಸ್ಥಳ ಮುಂದೆ ಸರಿಯಬೇಕು — slow (`O(n)`).',
      theory:
        '**Static array** = memory ಯ contiguous block, `n` cells, ಒಂದೇ type. `arr[i]` = `base_address + i * sizeof(element)`. CPU ಒಂದು instruction ನಲ್ಲಿ ಲೆಕ್ಕ — random access **`O(1)`**.\n\n' +
        'ಜೊತೆಗೆ array **cache-friendly**. CPU `arr[i]` ಓದಿದಾಗ ~64 bytes ಪಕ್ಕದ data sahaja cache ಗೆ. Sequential scan, linked list ಗಿಂತ 3-10× fast. ಆದರೆ size **fixed**.\n\n' +
        '**Dynamic array** = `size` + `capacity` track. `append` ಸಮಯ size<capacity ಆದರೆ direct write. Equal ಆದರೆ **capacity × 2** ಹೊಸ block, copy. `n` appends ಗೆ `1+2+4+...+n ≈ 2n` work — ಸರಾಸರಿ constant. **Amortised `O(1)`**.\n\n' +
        '**Python `list`** = pointers ನ dynamic array — ಪ್ರತಿ cell heap PyObject ಗೆ pointer. NumPy ಗಿಂತ slow numeric work ನಲ್ಲಿ. **NumPy** = static, fixed-type, contiguous — Python ನ C-array ಸಮಾನ.',
      whyItMatters:
        'Array = **default container**. "ಯಾವ data structure?" ಎಂಬ 90% questions ಗೆ ಉತ್ತರ "an array". Hash tables, heaps, DataFrames — ಎಲ್ಲ array ಮೇಲೆ. Interview ನಲ್ಲಿ two-pointer, sliding-window, prefix-sum questions ಎಲ್ಲವೂ array layout ಮೇಲೆ ಆಧಾರಿತ.',
      steps: [
        'Default container Python `list`.',
        '**`list.append(x)`** end-add — `O(1)` amortised. Loop ನಲ್ಲಿ `list.insert(0, x)` ಬೇಡ — `O(n²)`.',
        'Front-insertion ಗೆ **`collections.deque`** — `appendleft` `O(1)`.',
        'Numeric work ಗೆ **NumPy** — 10-100× fast.',
        'Size ಗೊತ್ತಿದ್ದರೆ pre-allocate: `arr = [0] * n`.',
        '**Slicing** `arr[a:b]` — `O(b-a)` range copy.',
        '**`list.pop(0)` `O(n)`** — `pop()` (no arg) `O(1)`.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Loop ನಲ್ಲಿ `list.insert(0, x)` → `O(n²)`. **ಪರಿಹಾರ:** `deque` + `appendleft`.',
        '**ಸಮಸ್ಯೆ.** `[[]] * 3` shallow copy — ಒಂದೇ inner list 3 places. **ಪರಿಹಾರ:** `[[] for _ in range(3)]`.',
        '**ತಪ್ಪು.** Iterate ಮಾಡುವಾಗ list mutate — elements skip/duplicate. **ಪರಿಹಾರ:** `for x in arr[:]:`.',
        '**ಸಮಸ್ಯೆ.** Heavy numeric math ಗೆ Python list — boxed PyObject. NumPy switch — 30-100× fast.',
        '**ತಪ್ಪು.** Big list ನಲ್ಲಿ `x in arr` — `O(n)`. Many checks ಆದರೆ `set` ಗೆ convert.',
        '**ಸಮಸ್ಯೆ.** `.append()` ಯಾವಾಗಲೂ cheap ಎಂದು ಭಾವಿಸುವುದು. Resize ಸಮಯ `O(n)`.',
      ],
      tryIt:
        '```python\nimport time\nN = 200_000\ntimes = []\narr = []\nfor i in range(N):\n    t0 = time.perf_counter_ns()\n    arr.append(i)\n    times.append(time.perf_counter_ns() - t0)\nprint(f"avg ns/append: {sum(times)/len(times):.1f}")\nprint(f"max ns: {max(times)}")\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** `list` ಬದಲು `collections.deque` — spikes ಮಾಯ.',
      takeaway:
        'Array = `O(1)` random access + cache-friendly + amortised `O(1)` append; ಮಧ್ಯದಲ್ಲಿ `O(n)`. 90% code-ಗೆ default.',
    },

    'm6-t2': {
      explain:
        '**Singly linked list** = `Node` chain — ಪ್ರತಿ node value ಮತ್ತು **`next` pointer**. List = `head` reference. Head insert/delete `O(1)` — index access `O(n)`.',
      analogy:
        '**ನಿಧಿ ಶೋಧ ಆಟ:**\n' +
        'ಪ್ರತಿ clue ಮುಂದಿನ clue ಎಲ್ಲಿದೆ ಎಂದು ಹೇಳುತ್ತದೆ. ಮೊದಲ clue (**head**) ನಿಂದ start. "ಮಾವಿನ ಮರಕ್ಕೆ ಹೋಗಿ" → "ಬಸ್ ಸ್ಟಾಂಡಿಗೆ ಹೋಗಿ" → ... ಕೊನೆಯ clue ನ `next` `None`.\n\n' +
        '**Head-ಗೆ ಹೊಸ clue add** ಸುಲಭ — `O(1)`. End add ಮಾಡಲು ಪೂರ್ತಿ trail walk — `O(n)`. "5ನೇ clue ಎಲ್ಲಿ?" — 1, 2, 3, 4 walk. Map ಇಲ್ಲ.\n\n' +
        'ಲಾಭ: ಪ್ರತಿ clue **ಬೇರೆ paper** — contiguous block ಬೇಡ. Resize copy ಇಲ್ಲ.',
      theory:
        'Linked list = **random access ತ್ಯಾಗ → flexible structure**. ಪ್ರತಿ node tiny heap object.\n\n' +
        '**Operations:**\n' +
        '• Head insert: `O(1)`. Tail insert: `O(n)` (cache `tail` ಆದರೆ `O(1)`).\n' +
        '• Index access: `O(n)`. Head delete: `O(1)`. Given-node delete: prev ಬೇಕು → `O(n)`.\n\n' +
        '**Array ಯಾಕೆ usually win?** Nodes heap ನಲ್ಲಿ scattered → cache locality destroy. 1M scan: list ~10ms, hand-rolled linked list ~100ms+.\n\n' +
        '**Linked list ಎಲ್ಲಿ shine?** Splice/concat `O(1)`; `deque` ನ internal mechanism; graph adjacency lists; LRU cache.',
      whyItMatters:
        'Linked list = **interview staple** — almost ಪ್ರತಿ coding round (reverse, merge, detect cycle, find middle). **Pointer manipulation** teaching device — re-point confidently ಆದರೆ recursion, trees, graphs natural.',
      steps: [
        '`Node(val, next)` define.',
        '**`head`** ಇಡಿ; frequent end-append ಆದರೆ `tail` cache.',
        'Traverse: `cur = head; while cur: ... ; cur = cur.next`.',
        '**Head insert** `O(1)`: new → old head, head = new.',
        '**Value delete**: `prev`+`cur` walk; `cur.val == target` → `prev.next = cur.next`.',
        '**Reverse**: `prev`, `cur`, `nxt` — `cur.next = prev` flip. Memorise.',
        '**Middle/cycle**: slow 1, fast 2. Meet → cycle.',
        'Real code ನಲ್ಲಿ `deque`/`list` ಮೊದಲು.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** `cur.next` overwrite ಮುಂಚೆ save ಮಾಡದಿರುವುದು. `nxt = cur.next` ಮೊದಲು.',
        '**ಸಮಸ್ಯೆ.** Head off-by-one. **ಪರಿಹಾರ:** `dummy.next = head` sentinel.',
        '**ತಪ್ಪು.** Two pointers ಬೇಕಾದಲ್ಲಿ ಒಂದೇ — value-delete ಗೆ `prev`+`cur`.',
        '**ಸಮಸ್ಯೆ.** Reversal ನಂತರ wrong head — new head `prev`, `cur` (`None`) ಅಲ್ಲ.',
        '**ತಪ್ಪು.** Cycle ಇದ್ದರೆ infinite loop. Floyd ಬಳಸಿ.',
        '**ಸಮಸ್ಯೆ.** Production ನಲ್ಲಿ hand-rolled — cache miss, slow.',
        '**ತಪ್ಪು.** `head is None` check ಮಾಡದಿರುವುದು — crash on empty.',
      ],
      tryIt:
        '```python\nclass Node:\n    def __init__(self, val, nxt=None):\n        self.val = val; self.nxt = nxt\n\ndef reverse(head):\n    prev, cur = None, head\n    while cur:\n        nxt = cur.nxt\n        cur.nxt = prev\n        prev, cur = cur, nxt\n    return prev\n\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.nxt:\n        slow = slow.nxt\n        fast = fast.nxt.nxt\n        if slow is fast:\n            return True\n    return False\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** `merge_sorted(a, b)` write — ಎರಡು sorted lists merge `O(n+m)`, existing nodes re-point.',
      takeaway:
        'Singly linked list = `(value, next)` chain. **Head `O(1)`, ಉಳಿದ `O(n)`**. Pointer skill master ಮಾಡಿದರೆ trees/graphs ಸುಲಭ.',
    },

    'm6-t3': {
      explain:
        '**Doubly linked list** = singly + `prev` pointer. ಎರಡೂ ಕಡೆ walk, **node reference ಕೊಟ್ಟರೆ `O(1)` delete**. LRU cache, browser history, `OrderedDict` — ಎಲ್ಲ ಇದರ ಮೇಲೆ.',
      analogy:
        '**ಕೈ ಹಿಡಿದ ಸಾಲು:**\n' +
        'ಪ್ರತಿಯೊಬ್ಬರೂ ಮುಂದಿನ AND ಹಿಂದಿನ ವ್ಯಕ್ತಿಯ ಕೈ ಹಿಡಿದಿದ್ದಾರೆ. ಮಧ್ಯದ ಸ್ನೇಹಿತ ಹೊರಡಬೇಕಾದರೆ — front ನಿಂದ walk ಬೇಡ! ಎರಡೂ neighbours ಪರಸ್ಪರ ಕೈ ಜೋಡಿಸಿ ಸ್ನೇಹಿತ slip out — `O(1)`.\n\n' +
        'Singly ನಲ್ಲಿ ಎಲ್ಲರೂ next ನ ಕೈ ಮಾತ್ರ ಹಿಡಿದಿದ್ದಾರೆ — front ನಿಂದ walk `O(n)`. Doubly extra ~8 bytes/node ಪಾವತಿಸಿ bidirectional convenience.',
      theory:
        '**DLL node** = `(val, prev, next)`. **Sentinel head/tail** ಬಳಸಿದರೆ edge cases ಮಾಯ.\n\n' +
        '**Operations:** Head/tail insert/delete `O(1)`. **Given node delete `O(1)`** — `node.prev.next = node.next; node.next.prev = node.prev`.\n\n' +
        '**LRU cache pattern:**\n' +
        '```\nmap: key -> node (O(1) lookup)\nDLL: head=most recent, tail=least\nget(k): move to head\nput(k,v): insert head; full → tail evict\n```\nಪ್ರತಿ op `O(1)`.\n\n' +
        '**Python tools using DLL:**\n' +
        '• `collections.deque` — DLL of blocks.\n' +
        '• `collections.OrderedDict` — hashmap+DLL. `move_to_end`, `popitem(last=False)` = LRU primitives.\n' +
        '• `functools.lru_cache` — same idea.\n\n' +
        '**Memory:** ~3× single value size. Small values ಗೆ overhead dominate.',
      whyItMatters:
        'DLL+hashmap = **THE classic interview question** — Amazon/Google/Meta L4-L6 ಎಲ್ಲ candidate ಗೆ LRU cache ಕೇಳುತ್ತಾರೆ. OS page replacement, browser back/forward, music playlist, DB buffer pool — ಎಲ್ಲ.',
      steps: [
        '`Node(val, prev, next)`. List class ಗೆ `head`+`tail`.',
        'Sentinel head/tail — edge cases eliminate.',
        'Head insert: 4 references re-point.',
        'Given node delete: `node.prev.next = node.next; node.next.prev = node.prev`.',
        '**LRU**: DLL + dict (key→node). `O(1)` get/put.',
        'Real Python ನಲ್ಲಿ `OrderedDict.move_to_end` + `popitem(last=False)` = 2-line LRU.',
        'Test: empty, single-element, head delete, tail delete.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** `prev` AND `next` ಎರಡೂ update ಮಾಡದಿರುವುದು.',
        '**ಸಮಸ್ಯೆ.** Sentinels ಇಲ್ಲದೆ head/tail edge cases.',
        '**ತಪ್ಪು.** Eviction ನಂತರ dict ನಿಂದ key delete ಮಾಡದಿರುವುದು — memory leak.',
        '**ಸಮಸ್ಯೆ.** Existing key `put` ಗೆ `move_to_end` ಮರೆಯುವುದು — LRU policy wrong.',
        '**ತಪ್ಪು.** `OrderedDict.move_to_end` default `last=True`. Confuse → wrong end evict.',
        '**ಸಮಸ್ಯೆ.** Small values ಗೆ DLL — ~3× overhead.',
        '**ತಪ್ಪು.** Iterate ಮಾಡುವಾಗ `_remove(node)` — `cur=cur.next` save ಬೇಕು.',
      ],
      tryIt:
        '```python\nfrom collections import OrderedDict\nimport random\n\nclass LRU:\n    def __init__(self, cap):\n        self.cap = cap; self.od = OrderedDict()\n    def get(self, k):\n        if k not in self.od: return None\n        self.od.move_to_end(k)\n        return self.od[k]\n    def put(self, k, v):\n        if k in self.od: self.od.move_to_end(k)\n        self.od[k] = v\n        if len(self.od) > self.cap: self.od.popitem(last=False)\n\ncache = LRU(20)\nhits = misses = 0\nrandom.seed(0)\nfor _ in range(10_000):\n    key = random.choices(range(100), weights=[10 if k<10 else 1 for k in range(100)])[0]\n    if cache.get(key) is None:\n        misses += 1; cache.put(key, key*key)\n    else: hits += 1\nprint(f"hits: {hits}  ratio: {hits/(hits+misses):.2%}")\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** Manual DLL+dict ಬರೆದು identical ratio verify.',
      takeaway:
        'Doubly linked list = `(val, prev, next)`. **Node ref ಕೊಟ್ಟರೆ `O(1)` delete** = superpower. Hashmap ಜೊತೆ → `O(1)` LRU. Python ನಲ್ಲಿ `OrderedDict` ಮೊದಲು.',
    },

    'm6-t4': {
      explain:
        '**Circular linked list** = ಕೊನೆಯ node ನ `next` head ಗೆ wrap — closed ring. Round-robin scheduling, playlist on repeat. **Floyd-ನ tortoise-and-hare** = cycle detect classic.',
      analogy:
        '**ತಿರುಗುವ ತವಾ:**\n' +
        '5 cooks ವೃತ್ತದಲ್ಲಿ — Cook 1 → Cook 2 → ... → Cook 5 → ಮತ್ತೆ Cook 1. "ಮೊದಲ" ಇಲ್ಲ — ring. Customer order maître d\\\' next cook ಗೆ assign — **round-robin**.\n\n' +
        '**Cycle detect:** ತಪ್ಪಾದ ದಾರಿ ಸೂಚನೆಗಳು — "ದೇವಸ್ಥಾನ ಬಳಿ left, ಶಾಲೆ ಬಳಿ right..." ಎಂದು ಹೋಗಿ ಮತ್ತೆ ದೇವಸ್ಥಾನಕ್ಕೆ ಬಂದರೆ loop ಇದೆ. ಪರಿಹಾರ: **ಎರಡು pointers** — `slow` ಒಂದು step, `fast` ಎರಡು steps. Loop ಇದ್ದರೆ ಇಬ್ಬರೂ meet; fast end ತಲುಪಿದರೆ cycle ಇಲ್ಲ. **Floyd-ನ tortoise-and-hare** real life. `O(n)` time, 2 pointers memory.',
      theory:
        '**Circular linked list** = tail.next = head.\n\n' +
        '**Use cases:** OS round-robin scheduler, music repeat, I/O ring buffers, Josephus problem, card game turns.\n\n' +
        '**Traversal:** `while cur: ...` ಬಳಸಲಾಗದು. ಬದಲು:\n' +
        '```\nstart = cur = head\nwhile True:\n    process(cur); cur = cur.next\n    if cur is start: break\n```\n\n' +
        '**Floyd-ನ cycle detection:**\n' +
        '`slow` 1 step, `fast` 2 steps. No cycle → `fast` `None`. Cycle → fast-slow gap shrink 1/iter → meet. `O(n)` time, `O(1)` memory.\n\n' +
        '**Cycle entry find:** detect ಆದ ಮೇಲೆ slow=head; ಎರಡೂ 1 step → meet point = entry.',
      whyItMatters:
        'Cycle detection real systems ನಲ್ಲಿ — dependency graphs (cyclic import?), garbage collection, deadlock detection. Tortoise-and-hare iterated functions, pseudo-random period detect ಗೆ ಸಹ. FAANG senior whiteboard ನಲ್ಲಿ derive ಮಾಡಬೇಕು.',
      steps: [
        'Tail.next = head — `None` ಇಲ್ಲ.',
        'Traverse: `while True: ... if cur is start: break`.',
        '**Floyd**: slow=fast=head; fast 2 steps, slow 1; meet → cycle.',
        'Empty list (`head is None`) ಮೊದಲು handle.',
        'Cycle entry: detect → slow=head; ಎರಡೂ 1 step — meet = entry.',
        'Round-robin scheduler ಗೆ `cur = cur.next` — `None` check ಬೇಡ.',
        'Production ನಲ್ಲಿ `itertools.cycle(iterable)` — clean.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Circular ನಲ್ಲಿ `while cur:` — infinite. Stop condition ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** Tail.next reset ಮಾಡದೆ regular operations — crash.',
        '**ತಪ್ಪು.** Floyd ನಲ್ಲಿ `fast and fast.next` check ಮಾಡದೆ — `AttributeError`.',
        '**ಸಮಸ್ಯೆ.** Cycle entry algorithm slow head reset ಮಾಡದೆ — wrong point.',
        '**ತಪ್ಪು.** Empty list ಮೇಲೆ Floyd run — guard ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** Hash set with visited (`O(n)` memory) — Floyd `O(1)` ಗಿಂತ slow + heavy.',
        '**ತಪ್ಪು.** Doubly circular ನಲ್ಲಿ tail.next=head ಮಾಡಿ head.prev=tail ಮರೆಯುವುದು.',
      ],
      tryIt:
        '```python\nclass Node:\n    def __init__(self, val, nxt=None):\n        self.val = val; self.nxt = nxt\n\ndef detect_cycle(head):\n    slow = fast = head\n    while fast and fast.nxt:\n        slow = slow.nxt\n        fast = fast.nxt.nxt\n        if slow is fast:\n            entry = head\n            while entry is not slow:\n                entry = entry.nxt\n                slow = slow.nxt\n            return entry\n    return None\n\nhead = Node(1, Node(2, Node(3, Node(4, Node(5)))))\ntail = head\nwhile tail.nxt: tail = tail.nxt\ntail.nxt = head.nxt.nxt   # cycle entry = node 3\nprint(detect_cycle(head).val)   # 3\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** Josephus problem solve — n people circle, ಪ್ರತಿ k-th eliminate, last survivor?',
      takeaway:
        'Circular linked list = ring. Round-robin, repeat, buffer rings ಗೆ perfect. **Floyd ನ tortoise-and-hare** = `O(n)` time + `O(1)` memory cycle detect — interview must.',
    },

    'm6-t5': {
      explain:
        '**Stack** = LIFO. ಕೊನೆಗೆ push → ಮೊದಲು pop. Function call stack, undo, expression evaluation, DFS. Python ನಲ್ಲಿ plain `list` — `append`/`pop` ಎರಡೂ `O(1)`.',
      analogy:
        '**ಊಟದ plates ಸ್ಟಾಕ್:**\n' +
        'ಕ್ಯಾಂಟೀನ್ ನಲ್ಲಿ plates ಒಂದರ ಮೇಲೊಂದು. ಹೊಸ plate ಮೇಲೆ ಮಾತ್ರ ಸೇರಿಸಬಹುದು, ತೆಗೆಯಲು ಸಹ ಮೇಲಿನ ಮಾತ್ರ. ಕೊನೆಗೆ ಇಟ್ಟ plate ಮೊದಲು ಹೊರಗೆ — **LIFO**.\n\n' +
        '**Browser back:** ಪ್ರತಿ page push, back ಒತ್ತಿದಾಗ pop. **Undo:** ಪ್ರತಿ action stack ನಲ್ಲಿ — `Ctrl+Z` ಕೊನೆಯ action reverse. **Function call stack:** `f()` call → frame push, `return` → pop. ಆಳವಾದ recursion = "stack overflow".',
      theory:
        '**Stack operations** ಎಲ್ಲ `O(1)`: push, pop, peek/top, is_empty.\n\n' +
        '**Implementations:**\n' +
        '• Python `list` — `append`/`pop` (no arg). ಸುಲಭ, fast.\n' +
        '• `collections.deque` — slightly faster.\n' +
        '• Linked list — head ನಲ್ಲಿ push/pop.\n\n' +
        '**Real uses:** function call stack, expression evaluation (postfix, infix→postfix), balanced parentheses, undo/redo (two stacks), DFS traversal, browser history, compiler parsing.\n\n' +
        '**Stack overflow:** Python recursion limit 1000. ಆಳವಾದ recursion ಗೆ `sys.setrecursionlimit(10000)` ಅಥವಾ iterative+explicit stack.\n\n' +
        '**Monotonic stack** = advanced — values monotonic ಆಗಿಡಿ. "Next greater element", "largest rectangle" ಗೆ key.',
      whyItMatters:
        'Stack = **interview must**. Balanced brackets, postfix, daily temperatures, largest rectangle — ಎಲ್ಲ stack questions. Real-world ನಲ್ಲಿ undo/redo, browser history, function calls. Recursion vs iterative+stack switch ತಿಳಿದರೆ overflow bugs avoid.',
      steps: [
        'Python ನಲ್ಲಿ plain `list` — `stack.append(x)`, `stack.pop()`.',
        '`stack[-1]` = peek.',
        '`if not stack:` = empty check.',
        '**Balanced brackets:** opening push; closing → pop+match.',
        '**Postfix eval:** number push; operator → pop 2, compute, push.',
        '**DFS iterative:** start push; loop: pop, process, neighbours push.',
        'Recursion limit hit → iterative + explicit `stack`.',
        'Concurrent ಗೆ `queue.LifoQueue` (thread-safe).',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Empty stack ಮೇಲೆ `pop()` — `IndexError`.',
        '**ಸಮಸ್ಯೆ.** `pop(0)` — queue (FIFO) + `O(n)` slow.',
        '**ತಪ್ಪು.** Balanced brackets ನಲ್ಲಿ matching check ಮಾಡದಿರುವುದು — `[(])` valid ಎಂದು ತಿಳಿಯುತ್ತೀರಿ.',
        '**ಸಮಸ್ಯೆ.** Recursion stack overflow — Python 1000 limit.',
        '**ತಪ್ಪು.** Stack ನಲ್ಲಿ wrong type mix — comparison fail.',
        '**ಸಮಸ್ಯೆ.** Multi-thread ನಲ್ಲಿ plain list — race. `queue.LifoQueue`.',
        '**ತಪ್ಪು.** "Stack" data structure vs CPU stack memory ಗೊಂದಲ.',
      ],
      tryIt:
        '```python\ndef is_balanced(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch in ")]}":\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack\n\nprint(is_balanced("({[]})"))   # True\nprint(is_balanced("([)]"))     # False\n\ndef eval_postfix(expr):\n    stack = []\n    for tok in expr.split():\n        if tok in "+-*/":\n            b = stack.pop(); a = stack.pop()\n            stack.append(eval(f"{a}{tok}{b}"))\n        else:\n            stack.append(int(tok))\n    return stack[0]\n\nprint(eval_postfix("3 4 + 2 *"))   # 14\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** "Daily temperatures" — ಪ್ರತಿ day ಗೆ next warmer day ಎಷ್ಟು days? Monotonic stack `O(n)`.',
      takeaway:
        'Stack = LIFO. `list.append`/`pop` Python ನಲ್ಲಿ `O(1)`. Brackets, postfix, DFS, undo, function calls — ಎಲ್ಲ stack patterns.',
    },

    'm6-t6': {
      explain:
        '**Queue** = FIFO. ಮೊದಲು enqueue → ಮೊದಲೇ dequeue. Print queue, BFS, scheduler. Python ನಲ್ಲಿ **`collections.deque`** — `append`/`popleft` ಎರಡೂ `O(1)`. **Deque** both-ends `O(1)` — stack+queue ಎರಡೂ.',
      analogy:
        '**ಬ್ಯಾಂಕ್ ಸಾಲು:**\n' +
        'ಮೊದಲು ಬಂದವರು ಮೊದಲು serve. ಹೊಸಬರು end-ಗೆ join (**enqueue**), counter ನಲ್ಲಿ front person serve+ಹೊರಡುತ್ತಾರೆ (**dequeue**). Stack ಗಿಂತ ಭಿನ್ನ — fairness ಮುಖ್ಯ.\n\n' +
        '**Print queue:** ಹಿಂದೆ ಬಂದ jobs ಮೊದಲು print. **Customer support:** FIFO ಗೆ ticket resolve.\n\n' +
        '**Deque (Double-ended):** ಎರಡು doors corridor — front/back ಎರಡಲ್ಲೂ ಜನ ಸೇರಬಹುದು/ಹೋಗಬಹುದು. Sliding window, browser history, palindrome check — ಎಲ್ಲ deque.',
      theory:
        '**Queue operations** ಎಲ್ಲ `O(1)`: enqueue (tail append), dequeue (head remove), peek (head read).\n\n' +
        '**Implementations:**\n' +
        '• `collections.deque` — DLL of blocks. `append`/`appendleft`/`pop`/`popleft` `O(1)`. **Default.**\n' +
        '• `queue.Queue` — thread-safe, multi-thread/process producer-consumer. Slower.\n' +
        '• Plain `list` — **AVOID** — `pop(0)` `O(n)`.\n' +
        '• `multiprocessing.Queue` — process-safe.\n\n' +
        '**Real uses:** BFS, print spooler, task scheduler, producer-consumer, rate limiting, streaming I/O buffer.\n\n' +
        '**Deque** = Double-Ended Queue. Both ends `O(1)`. Stack ಸಹ work (`append`+`pop`), queue ಸಹ (`append`+`popleft`).\n\n' +
        '**Memory:** deque ~25 bytes/element, list ~8.',
      whyItMatters:
        'Queue = **BFS engine**, system design (RabbitMQ, Kafka), web request queue, background jobs. `list.pop(0)` `O(n)` mistake fresher Python developers ಎಲ್ಲರೂ ಮಾಡುತ್ತಾರೆ — deque switch ಮಾಡಿದರೆ 100× speedup. Sliding-window interview ಗೆ deque essential.',
      steps: [
        '**Queue ಗೆ ಯಾವಾಗಲೂ `collections.deque`**.',
        '`q.append(x)` enqueue, `q.popleft()` dequeue — `O(1)`.',
        '`q[0]` front, `q[-1]` back peek.',
        '**`deque(maxlen=10)`** — sliding window, recent-N items perfect.',
        '**BFS:** `q = deque([start]); while q: node = q.popleft(); ...`.',
        'Multi-thread → `queue.Queue`.',
        '**`list.pop(0)` ಎಂದಿಗೂ ಬೇಡ**.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** Queue ಗೆ plain `list` + `pop(0)` — `O(n)`. **ಪರಿಹಾರ:** `deque`.',
        '**ಸಮಸ್ಯೆ.** `deque` random index — `O(n)`, `O(1)` ಅಲ್ಲ. Random ಬೇಕಾದರೆ `list`.',
        '**ತಪ್ಪು.** Single-thread ನಲ್ಲಿ `queue.Queue` — over-engineered.',
        '**ಸಮಸ್ಯೆ.** Empty deque `popleft()` — `IndexError`.',
        '**ತಪ್ಪು.** BFS ನಲ್ಲಿ visited set forget — infinite loop.',
        '**ಸಮಸ್ಯೆ.** `maxlen` deque overflow ಎಂದು ಭಾವಿಸುವುದು — actually old end silently drop.',
        '**ತಪ್ಪು.** Producer-consumer ನಲ್ಲಿ thread-unsafe deque.',
      ],
      tryIt:
        '```python\nfrom collections import deque\n\ndef bfs_grid(grid, start, end):\n    rows, cols = len(grid), len(grid[0])\n    q = deque([(start, 0)])\n    visited = {start}\n    while q:\n        (r, c), dist = q.popleft()\n        if (r, c) == end: return dist\n        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:\n            nr, nc = r+dr, c+dc\n            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr,nc) not in visited:\n                visited.add((nr,nc))\n                q.append(((nr,nc), dist+1))\n    return -1\n\ngrid = [[0,0,1],[0,0,0],[1,0,0]]\nprint(bfs_grid(grid, (0,0), (2,2)))   # 4\n\ndef sliding_max(arr, k):\n    dq = deque()\n    out = []\n    for i, x in enumerate(arr):\n        while dq and arr[dq[-1]] < x:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k: dq.popleft()\n        if i >= k - 1: out.append(arr[dq[0]])\n    return out\n\nprint(sliding_max([1,3,-1,-3,5,3,6,7], 3))   # [3,3,5,5,6,7]\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** Rate limiter — last 60 sec ನಲ್ಲಿ N requests ಗಿಂತ ಹೆಚ್ಚು block. Timestamps deque ಬಳಸಿ.',
      takeaway:
        'Queue = FIFO. Python ನಲ್ಲಿ **`collections.deque`** ಯಾವಾಗಲೂ — `list.pop(0)` ಎಂದಿಗೂ ಬೇಡ. Both-ends `O(1)` BFS, sliding window, rate limiting ಗೆ go-to.',
    },

    'm6-t7': {
      explain:
        '**Priority queue** = ಪ್ರತಿ element ಗೆ priority. Highest (ಅಥವಾ lowest) ಮೊದಲು dequeue. **Heap** = standard implementation — complete binary tree, parent ≤ children (min-heap). Python `heapq` = min-heap. Insert/extract `O(log n)`, peek `O(1)`. Dijkstra, A*, top-K, scheduler.',
      analogy:
        '**ಆಸ್ಪತ್ರೆ ತುರ್ತು ವಿಭಾಗ (ER):**\n' +
        'ಬರುವ ಕ್ರಮದಲ್ಲಿ serve ಮಾಡುವುದಿಲ್ಲ. **Triage nurse** ಪ್ರತಿಯೊಬ್ಬರಿಗೂ priority — heart attack=1, broken arm=5, fever=9. Doctor **lowest number** (highest priority) ಮೊದಲು ನೋಡುತ್ತಾರೆ. ಹೊಸ critical patient → queue ನಲ್ಲಿ ಮುಂದೆ jump.\n\n' +
        '**Min-heap** ಸರಿಯಾಗಿ ಇದೇ — insert ಆದಾಗ structure rearrange → smallest top. `O(log n)`.\n\n' +
        '**Top-K problem:** "1M numbers ನಿಂದ top 10 ಯಾವುದು?" — sort ಎಲ್ಲ `O(n log n)`. Min-heap of size 10 — number > heap[0] ಆದರೆ swap. Total `O(n log k)` — far better.',
      theory:
        '**Heap property:** Min-heap: parent ≤ children, root = smallest. Max-heap reverse.\n\n' +
        '**Storage trick:** complete binary tree → array, NO pointers!\n' +
        '• Index `i` ನ children: `2i+1`, `2i+2`. Parent: `(i-1)//2`. Cache-friendly.\n\n' +
        '**Operations:**\n' +
        '• `heappush(h, x)` — append, sift-up. `O(log n)`.\n' +
        '• `heappop(h)` — root return, last element root-ಗೆ, sift-down. `O(log n)`.\n' +
        '• `heap[0]` = peek. `O(1)`.\n' +
        '• `heapify(list)` — list-ಅನ್ನು heap-ಗೆ `O(n)` (not `O(n log n)`!).\n\n' +
        '**Python `heapq`:** plain `list` ಮೇಲೆ functions — only **min-heap**. Max-heap ಗೆ values negate.\n\n' +
        '**Real uses:** Dijkstra, A*, top-K, median maintenance (two heaps), task scheduler, merge K sorted, Huffman coding (m6-t35).\n\n' +
        '**Limitation:** arbitrary element search/delete `O(n)`. Indexed heap (heap+dict) ಬೇಕು.',
      whyItMatters:
        'Priority queue = Dijkstra, A*, Huffman, top-K. **System design**: scheduler, message broker priority, OS process scheduling. **Interview**: "K largest", "median of stream", "merge K sorted" — ಎಲ್ಲ heap. `heapq` API ಇಲ್ಲದೆ Python ML interviews fail.',
      steps: [
        '`import heapq`. Plain `list` — heap "type" ಇಲ್ಲ.',
        '`heapq.heappush(h, x)`, `heapq.heappop(h)`.',
        '`h[0]` = current smallest peek.',
        '`heapq.heapify(lst)` — `O(n)`.',
        '**Max-heap** ಗೆ values negate.',
        '**Tuples:** `(priority, item)`. Tie-break: `(priority, counter, item)`.',
        '**Top-K:** size-K min-heap. value > heap[0] → pop+push.',
        '`heapq.nlargest(k, iter)` / `nsmallest` — convenience.',
      ],
      pitfalls: [
        '**ತಪ್ಪು.** `heapq` max-heap ಎಂದು ಭಾವಿಸುವುದು — actually min-heap.',
        '**ಸಮಸ್ಯೆ.** Heap middle direct access — `O(n)`. Indexed heap ಬೇಕು.',
        '**ತಪ್ಪು.** Tuple priority same → non-comparable items `TypeError`. **ಪರಿಹಾರ:** counter add.',
        '**ಸಮಸ್ಯೆ.** `heap[0]` modify ಮಾಡಿ heap property break. **ಪರಿಹಾರ:** `heapreplace`.',
        '**ತಪ್ಪು.** Top-K ಗೆ ಎಲ್ಲ sort + K take — `O(n log n)`. K-size heap = `O(n log k)`.',
        '**ಸಮಸ್ಯೆ.** Push ನಂತರ heapify — push already maintains. Wasteful.',
        '**ತಪ್ಪು.** `sorted(list)[0]` = `O(n log n)`. `min(list)` `O(n)` ಸಾಕು.',
      ],
      tryIt:
        '```python\nimport heapq\n\nstream = [4, 1, 7, 3, 8, 5, 2, 9, 6]\nheap = []\nfor x in stream:\n    if len(heap) < 3:\n        heapq.heappush(heap, x)\n    elif x > heap[0]:\n        heapq.heapreplace(heap, x)\nprint(sorted(heap, reverse=True))   # [9, 8, 7]\n\nlists = [[1,4,7], [2,5,8], [3,6,9]]\nh = []\nfor i, lst in enumerate(lists):\n    if lst: heapq.heappush(h, (lst[0], i, 0))\nmerged = []\nwhile h:\n    val, li, idx = heapq.heappop(h)\n    merged.append(val)\n    if idx + 1 < len(lists[li]):\n        heapq.heappush(h, (lists[li][idx+1], li, idx+1))\nprint(merged)   # [1..9]\n\nclass MedianFinder:\n    def __init__(self):\n        self.lo = []; self.hi = []\n    def add(self, x):\n        heapq.heappush(self.lo, -heapq.heappushpop(self.hi, x))\n        if len(self.lo) > len(self.hi):\n            heapq.heappush(self.hi, -heapq.heappop(self.lo))\n    def median(self):\n        if len(self.hi) > len(self.lo):\n            return self.hi[0]\n        return (self.hi[0] - self.lo[0]) / 2\n\nmf = MedianFinder()\nfor x in [1,2,3,4,5]:\n    mf.add(x); print(f"after {x}: median={mf.median()}")\n```\n' +
        '**ಈಗ extend ಮಾಡಿ:** Task scheduler — `(deadline, task)` tuples, ಪ್ರತಿ tick earliest deadline first execute.',
      takeaway:
        'Heap = priority queue, complete tree in array. Python `heapq` = **min-heap**, max ಗೆ negate. `heappush`/`heappop` `O(log n)`, peek `O(1)`. Dijkstra, top-K, median, merge-K — heap classic.',
    },

    // ══════════════════════════════════════════════════════════
    // MODULE 3 — Generative AI & Agentic AI — §1 GenAI Fundamentals
    // ══════════════════════════════════════════════════════════

    'm3-t1': {
      explain:
        '**Generative models** ಎಂದರೆ data ಯ ಆಳವಾದ structure (`P(X)` distribution) ಅನ್ನು ಕಲಿತು, *ಹೊಸ* examples ಗಳನ್ನು ತಯಾರಿಸಬಲ್ಲ models. Classifier "ಇದು ನಾಯಿಯೇ ಬೆಕ್ಕೇ?" ಎಂದು ಕೇಳಿದರೆ, generative model "ನಾಯಿ ಹೇಗೆ *ಕಾಣಿಸುತ್ತದೆ*?" ಎಂದು ಕೇಳಿ ಹೊಸ ನಾಯಿಯ ಚಿತ್ರ ಬಿಡಿಸುತ್ತದೆ. **LLMs (text), GANs/Diffusion (images), Whisper (audio), Codex (code)** — ಎಲ್ಲ GenAI ಯ ಮೂಲ ಇದೇ.',
      analogy:
        '**ಚಿತ್ರಕಲಾ ಶಾಲೆಯ ಇಬ್ಬರು ಶಿಷ್ಯರನ್ನು** ಊಹಿಸಿಕೊಳ್ಳಿ.\n\n' +
        '• **ಶಿಷ್ಯ A — Classifier**: museum ನಲ್ಲಿ ಯಾವುದೇ painting ತೋರಿಸಿದರೆ "Renaissance" ಅಥವಾ "Impressionist" ಎಂದು ಸರಿಯಾಗಿ ಹೇಳುತ್ತಾರೆ. ಆದರೆ ಸ್ವತಃ ಒಂದು painting ಬಿಡಿಸಲು ಹೇಳಿದರೆ ಖಾಲಿ canvas ನೋಡಿ ನಿಂತೇ ಇರುತ್ತಾರೆ — ಅವರು *ಗಡಿರೇಖೆ* ಕಲಿತಿದ್ದಾರಷ್ಟೆ.\n\n' +
        '• **ಶಿಷ್ಯ B — Generative**: ವರ್ಷಗಟ್ಟಲೆ paintings ಗಳ *ಒಳ recipe* ಕಲಿತಿದ್ದಾರೆ — colour palette, brushstroke pattern, composition. ಖಾಲಿ canvas ಕೊಟ್ಟರೆ, ಯಾರೂ ನೋಡದ ಹೊಸ Impressionist painting ಬಿಡಿಸಿ ಕೊಡುತ್ತಾರೆ.\n\n' +
        'Classifier `P(label | x)` (ಗಡಿ) ಕಲಿಯುತ್ತದೆ; Generative model `P(x)` (ಸಂಪೂರ್ಣ recipe) ಕಲಿಯುತ್ತದೆ. Recipe ಕಲಿತ ಮೇಲೆ ನೀವು — *ಹೊಸ samples ತಯಾರಿಸಬಹುದು*, *ಅಪೂರ್ಣ data fill ಮಾಡಬಹುದು*, *outliers detect ಮಾಡಬಹುದು*. LLM ಕೂಡ ಇಷ್ಟೇ — "ಮುಂದಿನ token ಯಾವುದು?" ಎಂಬ distribution ಕಲಿತು, token by token sample ಮಾಡಿ ಪೂರ್ತಿ paragraph ಬರೆಯುತ್ತದೆ.',
      theory:
        '**ಗುರಿ**: training data ಯಿಂದ `P(X)` ಅಥವಾ `P(X|Y)` estimate ಮಾಡಿ, ಹೊಸ `x ~ P(X)` sample ಮಾಡಲು ಸಾಧ್ಯವಾಗುವಷ್ಟು ಚೆನ್ನಾಗಿ ಕಲಿಯುವುದು.\n\n' +
        '**ಮುಖ್ಯ families**:\n\n' +
        '• **Autoregressive** — `P(x) = Π P(xᵢ | x<ᵢ)`. Token by token generate ಮಾಡುತ್ತದೆ. GPT, Claude, Gemini, LLaMA. **Quality ಚೆನ್ನಾಗಿರುತ್ತದೆ, generation ನಿಧಾನ.**\n' +
        '• **GANs** — Generator vs discriminator. **Sharp images, training ಕಷ್ಟ**.\n' +
        '• **VAEs** — Latent space ಕಲಿತು reconstruct. **Smooth latent, blurry samples**.\n' +
        '• **Diffusion** — noise add ಮಾಡಿ, ಆಮೇಲೆ step-by-step denoise. **DALL·E 3, Stable Diffusion**.\n\n' +
        '**Sampling vs decoding**:\n' +
        '• **Greedy** — ಯಾವಾಗಲೂ ಅತಿ ಹೆಚ್ಚು probability token. Boring.\n' +
        '• **Temperature** — `T=0` greedy, `T=1` distribution as is, `T>1` ಜಾಸ್ತಿ creative.\n' +
        '• **Top-k / top-p** — top probability mass ಗೆ choices ಸೀಮಿತಗೊಳಿಸುವುದು.\n\n' +
        '**ಕಷ್ಟ ಸಮಸ್ಯೆಗಳು**:\n' +
        '• **Evaluation** — single metric ಇಲ್ಲ. BLEU, ROUGE, FID, perplexity, human eval.\n' +
        '• **Quality vs diversity** — greedy → repetitive; high-temp → incoherent.\n' +
        '• **Hallucination** — LLMs ಧೈರ್ಯವಾಗಿ ತಪ್ಪು ಹೇಳುತ್ತವೆ. RAG, grounding ಬೇಕು.\n' +
        '• **Cost** — billions of parameters, gigabytes memory.\n\n' +
        '**2017 ರ ನಂತರ GenAI ಏಕೆ ಸ್ಫೋಟಿಸಿತು?** Transformers (m3-t6), GPU scale, internet-scale data, RLHF — ಈ ನಾಲ್ಕು ಒಟ್ಟಿಗೆ ಬಂದವು.',
      whyItMatters:
        'GenAI software ಎಂದರೆ ಏನು ಎಂಬುದನ್ನೇ ಬದಲಾಯಿಸಿತು — 2024 ರ ನಂತರ ಪ್ರತಿ product team ಗೂ AI feature ship ಮಾಡಬೇಕು. ChatGPT, Copilot, Midjourney — ಬೆಲೆ ಊಹಿಸಲಾಗದು. 10 lines ನಲ್ಲಿ OpenAI API wire ಮಾಡಬಲ್ಲ engineer ಗಳಿಗೆ ಪ್ರತಿ company ಹುಡುಕುತ್ತಿದೆ. Interview ನಲ್ಲಿ "explain LLMs to non-technical person" ಮತ್ತು "generative vs discriminative" — ಎರಡೂ ಬರುವುದು ಗ್ಯಾರಂಟಿ.',
      steps: [
        '**Goal** ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಿ: `P(Y|X)` ಅಲ್ಲ, `P(X)` ಕಲಿಯುವುದು.',
        '**Modality** ಆಯ್ಕೆ ಮಾಡಿ: text (LLM), image (diffusion), audio, code.',
        'Text ಗೆ **OpenAI**, **Anthropic**, **Gemini**, ಅಥವಾ open-source **LLaMA 3**.',
        'Images ಗೆ **Stable Diffusion** ಅಥವಾ **DALL·E 3** API.',
        'API key ಪಡೆದು SDK install: `pip install openai` ಅಥವಾ `pip install anthropic`.',
        '`messages` payload ಕಳಿಸಿ — `system`, `user`, `assistant` roles ಜೊತೆ.',
        '**temperature**, **max_tokens**, **top_p** task ಗೆ tune ಮಾಡಿ.',
        'Production ಗೆ — **rate limits**, **retries**, **cost monitoring** ನಿಭಾಯಿಸಿ.',
        'Grounded answers ಗೆ generative model ಜೊತೆ **RAG** combine ಮಾಡಿ.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** API keys hardcode. Bots GitHub scan ಮಾಡಿ ಕದಿಯುತ್ತವೆ — ಯಾವಾಗಲೂ env var.',
        '**ತಪ್ಪು.** Consistency ಬೇಕಾದಾಗ temperature ignore. Fact extraction ಗೆ `temperature=0`; creative ಗೆ 0.7-1.0.',
        '**ಸಮಸ್ಯೆ.** LLM output ಕಣ್ಮುಚ್ಚಿ trust. Hallucinations common — RAG, validation, human-in-loop.',
        '**ತಪ್ಪು.** ಸಣ್ಣ task ಗೆ ದೊಡ್ಡ model. GPT-4o-mini $0.15/1M vs GPT-4o $5 — 30× cost, marginal benefit.',
        '**ಸಮಸ್ಯೆ.** Long output ಗೆ streaming ಬಳಸದಿರುವುದು. UX dramatically better.',
        '**ತಪ್ಪು.** Rate limits ಮರೆಯುವುದು. 429 errors normal — exponential backoff ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** LLMs deterministic ಎಂದು treat. `temperature=0` ಆದರೂ floating-point drift. Output hash ಮಾಡಬೇಡಿ.',
      ],
      tryIt:
        'OpenAI ಬಳಸಿ ಸಣ್ಣ multi-modal demo:\n\n' +
        '```\nfrom openai import OpenAI\nclient = OpenAI()\n\nresp = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role":"user","content":"Give me 5 startup name ideas for an AI tutoring app for Indian students."}],\n    temperature=0.9,\n)\nprint(resp.choices[0].message.content)\n```\n\n' +
        'ಈಗ extend ಮಾಡಿ — startup names generate ಮಾಡಿ, ಪ್ರತಿ ಒಂದಕ್ಕೂ DALL·E ಯಿಂದ logo ಚಿತ್ರ ಬಿಡಿಸಿ. ಒಂದೇ Python script ನಲ್ಲಿ multi-modal product feature start.',
      takeaway:
        'Generative models **`P(X)` ಕಲಿತು ಹೊಸ samples ಮಾಡುತ್ತವೆ**. Families: **autoregressive (LLMs), GANs, VAEs, diffusion**. Tune **temperature, top_p, max_tokens**. ಕಷ್ಟ ಸಮಸ್ಯೆ generation ಅಲ್ಲ — **quality, factuality, safety**.',
    },

    'm3-t2': {
      explain:
        '**Discriminative** models `P(y|x)` ಕಲಿಯುತ್ತವೆ — input ಕೊಟ್ಟರೆ label predict. **Generative** models `P(x)` ಅಥವಾ `P(x,y)` ಕಲಿಯುತ್ತವೆ — data ಯ ಸ್ವರೂಪ ಅರ್ಥ ಮಾಡಿಕೊಂಡು **ಹೊಸ examples sample** ಮಾಡಬಲ್ಲವು. Logistic regression, SVM, RF — discriminative. Naive Bayes, GANs, VAEs, LLMs — generative. ಒಂದೇ task family, ವಿರುದ್ಧ philosophy.',
      analogy:
        '**ಹಣ್ಣಿನ ಅಂಗಡಿಯ ಇಬ್ಬರು ಸಹಾಯಕರನ್ನು** ನೋಡಿ.\n\n' +
        '• **Discriminative ರವಿ**: ಮಾವು ಮತ್ತು ಪಪ್ಪಾಯಿ ನಡುವಿನ *ಗಡಿರೇಖೆ* ಕಲಿತಿದ್ದಾನೆ. ಹಣ್ಣು ಕೊಟ್ಟರೆ — ಮುಟ್ಟಿ, ತೂಗಿ, "ಮಾವು" ಅಥವಾ "ಪಪ್ಪಾಯಿ" ಎಂದು ಧೈರ್ಯವಾಗಿ ಹೇಳುತ್ತಾನೆ. ಆದರೆ "ಮಾವು ಬಿಡಿಸಿ ಕೊಡು" ಎಂದರೆ ಬಿಳಿ ಕಾಗದ ನೋಡಿ ಸ್ತಬ್ಧ — ಮಾವು *ಏನು* ಎಂದು ಯಾವತ್ತೂ ಕಲಿತಿಲ್ಲ.\n\n' +
        '• **Generative ರೀಣಾ**: ವರ್ಷಗಟ್ಟಲೆ ಎರಡೂ ಹಣ್ಣುಗಳ ಬಣ್ಣ, structure, weight, ವಾಸನೆ — ಎಲ್ಲ ಆಳವಾಗಿ ಅಧ್ಯಯನ ಮಾಡಿದ್ದಾಳೆ. ಬಿಳಿ ಕಾಗದ ಕೊಟ್ಟರೆ — ಪ್ರಕೃತಿಯಲ್ಲಿ ಇಲ್ಲದ ಹೊಸ ಮಾವಿನ ಚಿತ್ರ ಬಿಡಿಸುತ್ತಾಳೆ. Classify ಸಹ ಮಾಡಬಲ್ಲಳು — ಆದರೆ ನಿಜವಾದ ಶಕ್ತಿ **synthesis**.\n\n' +
        'ರವಿ space ನಲ್ಲಿ ಒಂದು line. ರೀಣಾ data ಯ ಸಂಪೂರ್ಣ landscape — full recipe. Pure classification ಗೆ same data ಮೇಲೆ ರವಿ ಗೆಲ್ಲುತ್ತಾನೆ. ರೀಣಾ ತುಂಬಾ ಬೇರೆ ಕೆಲಸ ಮಾಡಬಲ್ಲಳು — classification ನಲ್ಲಿ ಸ್ವಲ್ಪ ಹಿಂದೆ.',
      theory:
        '**Discriminative**: `P(y|x)` ನೇರವಾಗಿ model. Logistic regression `σ(wᵀx + b)`. SVM max-margin hyperplane. ಇವು input space ಗೆ ಗಡಿ ಎಳೆಯುತ್ತವೆ.\n\n' +
        '**Generative**: `P(x)` ಅಥವಾ `P(x, y)` model. Bayes\' rule: `P(y|x) = P(x|y)·P(y) / P(x)`.\n\n' +
        '**ನಿಮಗೆ ಗೊತ್ತಿರುವ generative models**:\n' +
        '• **Naive Bayes** — features class given independent. Spam filter classic.\n' +
        '• **Gaussian Mixture Models** — `P(x)` Gaussian sum.\n' +
        '• **HMMs** — sequences with hidden states.\n' +
        '• **VAEs** — smooth latent space.\n' +
        '• **GANs** — implicit generative.\n' +
        '• **LLMs** — autoregressive `P(token | prev tokens)`.\n\n' +
        '**Classic tradeoff** (Andrew Ng & Jordan, 2002):\n' +
        '• Discriminative — ಸಾಕಷ್ಟು data ಇದ್ದಾಗ lower error.\n' +
        '• Generative — ಕಡಿಮೆ data ಇದ್ದಾಗ ಬೇಗ converge.\n' +
        '• ಸಣ್ಣ dataset → Naive Bayes ಗೆಲ್ಲಬಹುದು. ದೊಡ್ಡ dataset → Logistic Regression.\n\n' +
        '**Generative ಯಿಂದ extra**:\n' +
        '1. **Sampling** — ಹೊಸ examples synthesize.\n' +
        '2. **Imputation** — missing features fill.\n' +
        '3. **Anomaly detection** — low `P(x)` → unusual.\n' +
        '4. **Semi-supervised** — unlabeled x ಯಿಂದಲೂ ಕಲಿಯಬಹುದು.\n' +
        '5. **Uncertainty** — explicit probability.\n\n' +
        '**Modern blur**: ಇಂದಿನ LLMs generative ಆದರೂ classifier ಆಗಿ ಬಳಸುತ್ತೇವೆ. "Is this email spam?" — generative model discriminatively. Conceptual line ಸ್ಪಷ್ಟ, practical line fuzzy.',
      whyItMatters:
        '**ML interview ನ ಅತಿ ಸಾಮಾನ್ಯ theory question** — "discriminative vs generative". Interview ಹೊರತಾಗಿ — choice architecture decide ಮಾಡುತ್ತದೆ: spam filter? Discriminative. Chatbot? Generative. Anomaly? Generative density. Week 1 ನಲ್ಲಿ ಸರಿಯಾದ lens ಆರಿಸಿದರೆ Week 6 ನಲ್ಲಿ rewrite ಮಾಡಬೇಕಾಗಿಲ್ಲ.',
      steps: [
        'Problem ಬಂದಾಗ ಕೇಳಿ: "labels ಬೇಕೋ, ಹೊಸ samples / density ಬೇಕೋ?"',
        'Pure classification + labeled data → **discriminative** (LR, RF, gradient boosting).',
        'Generation, density, anomaly, imputation → **generative** (NB, GMM, VAE, GAN, LLM).',
        'ಸಣ್ಣ labeled dataset → **Naive Bayes** ಮೊದಲು try ಮಾಡಿ.',
        'Bayes\' rule ಬಳಸಿ generative ಅನ್ನು classifier ಆಗಿಸಿ: `P(y|x) ∝ P(x|y)·P(y)`.',
        'LLM classifier ಗೆ — output constrain: "Reply only `spam` or `not_spam`."',
        'Generative ಗೆ **calibration** check ಮಾಡಿ.',
        'Production ನಲ್ಲಿ — JSON-schema enforcer ಹಿಂದೆ generative LLM = effectively discriminative.',
      ],
      pitfalls: [
        '**ಗೊಂದಲ.** "Generates labels" ಮತ್ತು "generative model" ಬೇರೆ. Class output ಕೊಡುವ model discriminative ಆಗಿರಬಹುದು.',
        '**ತಪ್ಪು.** Classification ಬೇಕಾದಾಗ generative ಆರಿಸುವುದು. LR / gradient boosting ಆಧುನಿಕ datasets ನಲ್ಲಿ ಗೆಲ್ಲುತ್ತದೆ.',
        '**ಸಮಸ್ಯೆ.** Data-size tradeoff ಮರೆಯುವುದು. <100 labels → strong-prior generative.',
        '**ತಪ್ಪು.** Naive Bayes independence assumption ಸಂಪೂರ್ಣ trust. `viagra` + `cheap` co-occur, ಆದರೂ NB work.',
        '**ಸಮಸ್ಯೆ.** Generative ಗೆ accuracy report — calibration ಇಲ್ಲದೆ. `brier_score_loss` check.',
        '**ತಪ್ಪು.** LLM probabilities calibrated ಎಂದು ನಂಬುವುದು. **logprobs** + temperature scaling ಬೇಕು.',
        '**ಸಮಸ್ಯೆ.** GAN vs VAE confusion. GAN *implicit*, VAE *explicit* (variational lower bound).',
        '**ತಪ್ಪು.** "Discriminative = supervised, generative = unsupervised". GANs unsupervised generative; conditional GANs supervised. Split *what they model*.',
      ],
      tryIt:
        'ಎರಡೂ models ಒಂದೇ data ಮೇಲೆ build ಮಾಡಿ compare:\n\n' +
        '```\nimport numpy as np\nfrom sklearn.datasets import load_iris\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.naive_bayes import GaussianNB\n\nX, y = load_iris(return_X_y=True)\n\ndisc = LogisticRegression(max_iter=200).fit(X, y)\ngen  = GaussianNB().fit(X, y)\n\n# Only generative can SAMPLE new flowers\nfor cls in range(3):\n    mu, var = gen.theta_[cls], gen.var_[cls]\n    fake = np.random.normal(mu, np.sqrt(var))\n    print(f"Synthetic class {cls}: {fake.round(2)}")\n```\n\n' +
        'ಈಗ extend ಮಾಡಿ — 10 samples vs full data train ಮಾಡಿ. NB ಮತ್ತು LR gap ಕಡಿಮೆಯಾಗುವುದನ್ನು ನೋಡಿ — Andrew Ng ರ 2002 result.',
      takeaway:
        'Discriminative **ಗಡಿ** `P(y|x)` ಕಲಿಯುತ್ತದೆ — enough data ಇದ್ದಾಗ classification ನಲ್ಲಿ ಗೆಲ್ಲುತ್ತದೆ. Generative **ಸಂಪೂರ್ಣ distribution** `P(x)` ಕಲಿತು sampling, imputation, anomaly detection unlock.',
    },

    'm3-t3': {
      explain:
        '**Prompt engineering** ಎಂದರೆ — LLM ನಿಂದ ಬೇಕಾದದ್ದನ್ನು ಪಡೆಯಲು input ಹೇಗೆ phrase ಮಾಡಬೇಕು ಎಂಬ ಶಿಸ್ತು. Model ಶಕ್ತಿಯುತ ಆದರೆ *literal*, *suggestible*, ಮನಸ್ಸು ಓದಬಲ್ಲ ಜ್ಞಾನಿ ಅಲ್ಲ. ಉತ್ತಮ prompt ಗಳು **specific** (task, format, length, audience), **contextual** (data inline paste), **structured** (sections, examples), **role-assigned** ("ನೀವು senior security reviewer..."). Same model, ಅದೇ task — ಹೇಗೆ ಕೇಳುತ್ತೀರಿ ಎಂಬುದರ ಮೇಲೆ 5/10 ಅಥವಾ 9/10 output.',
      analogy:
        'ಒಬ್ಬ **ಪ್ರತಿಭಾವಂತ freelancer** ಅನ್ನು hire ಮಾಡಿದ್ದೀರಿ. ಎರಡು ರೀತಿಯಲ್ಲಿ brief.\n\n' +
        '• **Bad brief**: "ನಮ್ಮ company ಬಗ್ಗೆ ಏನೋ ಒಳ್ಳೆಯದು ಬರೆಯಿರಿ." Generic blog post; ನಿಮಗೆ ಬೇಸರ.\n\n' +
        '• **Good brief**: "250-word LinkedIn post — confident-but-warm tone, B2B SaaS. Theme: ಹೊಸ pricing finance teams ಗೆ budgeting ಸುಲಭ. `[QUOTE]` placeholder. Final CTA. *Revolutionary* buzzword ಬೇಡ. Markdown. ಇಷ್ಟವಾದ 2 examples — [paste]. 3 variations."\n\n' +
        'ಅದೇ freelancer. ಸಂಪೂರ್ಣ ಬೇರೆ output. **LLM ಅದೇ freelancer**. Specificity beats verbosity.\n\n' +
        'ಎರಡನೇ ಉದಾಹರಣೆ: prompts **fuzzy database ಮೇಲೆ SQL queries** ಇದ್ದಂತೆ. SELECT, FROM, WHERE, ORDER BY. Vague `SELECT *` garbage; precise queries gold.',
      theory:
        '**Prompts ಏಕೆ work**: LLM context ಕೊಟ್ಟು next token predict. *prompt ನಲ್ಲಿ ಏನು ಹಾಕುತ್ತೀರೋ ಅದು model ಗೆ ಪ್ರಪಂಚ*.\n\n' +
        '**ನಾಲ್ಕು levers**:\n\n' +
        '1. **Specificity** — task, audience, format, length, tone.\n\n' +
        '2. **Context** — data inline paste. Model ಗೆ internet access ಇಲ್ಲ. "Here is the article: <article>...</article>."\n\n' +
        '3. **Persona/role** — "Act as a senior FAANG interviewer". Vocabulary, depth, confidence ಬದಲಾಯಿಸುತ್ತದೆ. Persona style ಮಾತ್ರ — factual accuracy ಅಲ್ಲ.\n\n' +
        '4. **Examples** (few-shot) — 2-3 input/output pairs. Pattern-match abstract rules ಗಿಂತ ಚೆನ್ನಾಗಿ.\n\n' +
        '**Production structure**:\n\n' +
        '```\nSYSTEM: <role + global rules>\nUSER:\n  ## Task\n  ## Context\n  ## Format\n  ## Constraints\n```\n\n' +
        'Claude **XML-style tags** (`<article>`, `<example>`) ಗೆ ಚೆನ್ನಾಗಿ ಸ್ಪಂದಿಸುತ್ತದೆ.\n\n' +
        '**Patterns**:\n' +
        '• **Delimiters** — user data `"""..."""` ಅಥವಾ XML wrap. Prompt injection defense.\n' +
        '• **Constraints first** — hard rules system prompt *ಮೇಲೆ*. Recency bias mid-prompt rules ಮರೆಸುತ್ತದೆ.\n' +
        '• **Format example** — schema show.\n' +
        '• **Negative weak** — "do NOT use buzzwords" weaker than "use plain language".\n\n' +
        '**Prompts code**: same input ≠ same output (sampling). Production prompts **versioned**, **A/B tested**, eval set ಮೇಲೆ regression-tested. Small wording change quality 1.5-3× swing.',
      whyItMatters:
        '2026 AI work ನಲ್ಲಿ prompt engineering ಅತಿ ಹೆಚ್ಚು leverage skill. Vague PM request ಯಿಂದ ship-ready prompt craft ಮಾಡುವ engineers ಗೆ premium pay. "LLM ನಲ್ಲಿ ಇದು ಮಾಡಬಹುದೇ?" ಗೆ ಉತ್ತರ — "ಹೌದು, ಸರಿಯಾದ prompt ಬರೆದರೆ". Interview ನಲ್ಲಿ "rewrite this bad prompt" — junior ಯಿಂದ senior ಗೆ ನೇರ ದಾರಿ.',
      steps: [
        '**Task ಒಂದು sentence ನಲ್ಲಿ** ಬರೆಯಲು ಆಗದಿದ್ದರೆ — prompt vague.',
        '**Format** specify: bullet list, JSON schema, exact word count.',
        '**Context inline** paste — doc, code, data.',
        '**Role** assign — "You are a senior Python reviewer."',
        '**2-3 examples** input → output. ಅತಿ ಹೆಚ್ಚು leverage move.',
        'User-supplied data **delimiters** ನಲ್ಲಿ wrap.',
        'Consistency ಗೆ **temperature=0**; stable ಆದ ಮೇಲೆ creativity.',
        'Final prompt **version number** + **eval set** (5-20 cases).',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Vague tasks. *Which dimension* (speed, security, length) specify ಮಾಡಿ.',
        '**ತಪ್ಪು.** Format ಮರೆಯುವುದು. JSON ಬೇಕಾದರೆ schema show.',
        '**ಸಮಸ್ಯೆ.** Instructions burying. Hard rules system message *top* ನಲ್ಲಿ.',
        '**ತಪ್ಪು.** Telling, not showing. "Friendly tone" fuzzy. Example paste ಮಾಡಿದರೆ 10× effective.',
        '**ಸಮಸ್ಯೆ.** Delimiters ignore. `<user_input>` tag — **prompt injection** defense.',
        '**ತಪ್ಪು.** Persona ಮೇಲೆ over-rely. Style ಬದಲಾಯಿಸುತ್ತದಷ್ಟೆ.',
        '**ಸಮಸ್ಯೆ.** Version control ಇಲ್ಲ. Prompt = code. Git commit, tag.',
        '**ತಪ್ಪು.** Eval set ಇಲ್ಲ. Improved prompt ನಿಜವಾಗಿ ಚೆನ್ನಾಗಿದೆಯೋ ಗೊತ್ತಾಗಲ್ಲ.',
        '**ಸಮಸ್ಯೆ.** Negative-only instructions. ಏನು *ಮಾಡಬೇಕು* ಹೇಳಿ.',
      ],
      tryIt:
        'Vague prompt 3 ರೀತಿಯಲ್ಲಿ rewrite, compare:\n\n' +
        '```\nfrom openai import OpenAI\nclient = OpenAI()\n\nvague    = "Tell me about Python."\nrole     = "You are a Python instructor for absolute beginners. Tell me about Python in 4 short bullets."\nstructured = """\nYou are a Python instructor for absolute beginners.\n\n## Task\nExplain Python in EXACTLY 4 bullets.\n\n## Audience\nIndian college students.\n\n## Format\nMarkdown bullets, each <= 20 words.\n\n## Constraints\n- No buzzwords.\n- Mention one real-world use case in each bullet.\n"""\n\nfor name, p in [("vague", vague), ("role", role), ("structured", structured)]:\n    out = client.chat.completions.create(\n        model="gpt-4o-mini",\n        messages=[{"role":"user","content": p}],\n        temperature=0,\n    )\n    print(f"=== {name} ===\\n", out.choices[0].message.content)\n```\n\n' +
        'ಈಗ extend ಮಾಡಿ — 4ನೇ variant 2 example bullets ಜೊತೆ. *Showing > telling* — few-shot version rule-based ಗಿಂತ ಗೆಲ್ಲುತ್ತದೆ.',
      takeaway:
        'ಉತ್ತಮ prompt — **role, task, context, format, examples** + **versioned like code**. Specificity beats verbosity.',
    },

    'm3-t4': {
      explain:
        '**Zero-shot** = ನೇರವಾಗಿ ಕೇಳಿ, examples ಇಲ್ಲ. **Few-shot** = format ತೋರಿಸಲು 2-5 input/output examples. **Chain-of-thought (CoT)** = "step by step ಯೋಚಿಸು" — math, logic, multi-step reasoning ನಲ್ಲಿ accuracy ತುಂಬಾ ಹೆಚ್ಚುತ್ತದೆ. **Self-consistency** = multiple CoT samples, majority vote. ಈ ನಾಲ್ಕು techniques try ಮಾಡಲು ಏನೂ ಖರ್ಚಿಲ್ಲ — ಆದರೆ ಕಷ್ಟ tasks ನಲ್ಲಿ accuracy 20-40 points swing.',
      analogy:
        'ಒಬ್ಬ **ಬುದ್ಧಿವಂತ ಶಾಲಾ ವಿದ್ಯಾರ್ಥಿನಿ**ಯನ್ನು ಮೂರು ರೀತಿಯಲ್ಲಿ ಕೇಳಿ.\n\n' +
        '• **Zero-shot**: "ಬಗೆಹರಿಸು: 23 × 17." Similar problem ನೋಡಿದ್ದರೆ ಸರಿ. Format new ಆದರೆ — freeze.\n\n' +
        '• **Few-shot**: "`12 × 5 = 60`, `8 × 9 = 72`, `7 × 11 = 77`. ಈಗ `23 × 17 = ?`" — *exact format* ನೋಡಿದಳು. Pattern lock. Accuracy ಜಿಗಿಯುತ್ತದೆ.\n\n' +
        '• **Chain-of-thought**: "**Step by step ಯೋಚಿಸು.**" ಅವಳು "23 × 17 = 230 + 161 = 391" ಎಂದು. Final answer ಗೆ ಮೊದಲು forced reasoning — guess ತಪ್ಪಿಸುತ್ತದೆ.\n\n' +
        '• **Self-consistency**: ಮೂರು ಬಾರಿ ಕೇಳಿ majority. ಎರಡು 391, ಒಂದು 396 → 391.\n\n' +
        'LLM ಅದೇ ತರಹ. **Few-shot format ಕಲಿಸುತ್ತದೆ**, **CoT scratch paper**, **self-consistency noise average**.',
      theory:
        '**Zero-shot**: model training ನಲ್ಲಿ task ನೋಡಿದೆ ಎಂದು assume. Modern LLMs sentiment, summarisation, translation, code — zero-shot capable.\n\n' +
        '**Few-shot** (in-context learning, ICL) — GPT-3 (2020) ಸರ್ಪ್ರೈಸ್. Gradient updates ಇಲ್ಲ — context ನಲ್ಲಿ pattern ಕಲಿಯುತ್ತದೆ. **Sweet spot: 3-5 examples**.\n\n' +
        '**Chain-of-thought** (Wei 2022) — "Let\'s think step by step" append. Model ತನ್ನ scratch paper input ಆಗಿ use. GSM8K math ಮೇಲೆ PaLM-540B 18% → 57%.\n\n' +
        '**Variants**:\n' +
        '• **Zero-shot CoT** — ಚೀಪ್.\n' +
        '• **Few-shot CoT** — examples reasoning ಜೊತೆ. Strongest.\n' +
        '• **Self-consistency** (Wang 2022) — N chains `temperature>0`, majority. ~10 sweet spot.\n' +
        '• **Tree of Thoughts** — paths explore + prune.\n' +
        '• **ReAct** — reasoning + tool call. Agents foundation.\n\n' +
        '**Reasoning models** (o1, o3, Claude extended thinking, DeepSeek R1) — CoT *internal*. Manual CoT ಬೇಡ — built in.\n\n' +
        '**Few-shot beats fine-tuning when**: tiny dataset (<100), format change, fast iteration.\n' +
        '**Fine-tuning beats few-shot when**: large stable dataset (>1000), niche skills.',
      whyItMatters:
        'ಈ techniques "GPT cannot do my task" ಯಿಂದ "GPT does it well" ಗ್ಯಾಪ್ ಮುಚ್ಚುತ್ತವೆ. *Fine-tuning ಮೊದಲು few-shot, model dumb ಎಂದು assume ಮುಂಚೆ CoT*. Interview "math ತಪ್ಪು — first try?" → CoT. Skip ಮಾಡಿದರೆ — 3 example bullets ನಲ್ಲಿ free ಆಗಿ solve ಆಗುತ್ತಿದ್ದದ್ದಕ್ಕೆ weeks fine-tune.',
      steps: [
        'ಹೊಸ task ಗೆ **zero-shot** start — baseline.',
        'Quality poor → **2-5 few-shot examples**. *Diverse* edge cases.',
        'Math, logic ಗೆ **"Let\'s think step by step"** — zero-shot CoT.',
        'ಕಷ್ಟ reasoning → **few-shot CoT** with worked-out reasoning.',
        'Flaky outputs → **self-consistency** N=5, `temperature=0.7`.',
        'Reasoning models (o1, Claude extended thinking) — **manual CoT ಬೇಡ**.',
        '20-50 cases **eval set** measure. Simple tasks ಮೇಲೆ CoT hurt ಮಾಡಬಹುದು.',
        'Token cost watch. Few-shot + CoT + self-consistency = thousands tokens.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Few-shot examples ~10 ಮೀರಿ confused. 3-5 sweet spot.',
        '**ತಪ್ಪು.** Similar examples. ಎಲ್ಲ positive → model assume. Diversity.',
        '**ಸಮಸ್ಯೆ.** ಕಷ್ಟ math ಗೆ CoT ಮರೆಯುವುದು. ಅತಿ ಹೆಚ್ಚು leverage move.',
        '**ತಪ್ಪು.** Reasoning models ಗೆ CoT. Internal CoT ಇದೆ — tokens waste.',
        '**ಸಮಸ್ಯೆ.** `temperature=0` ಜೊತೆ self-consistency. Identical samples — ಒಂದೇ vote 5 ಬಾರಿ.',
        '**ತಪ್ಪು.** Structured final answer ಇಲ್ಲ. "After reasoning, output `Answer:` line".',
        '**ಸಮಸ್ಯೆ.** Token cost ignore. 25× zero-shot cost possible.',
        '**ತಪ್ಪು.** Examples contradict. Curate.',
        '**ಸಮಸ್ಯೆ.** Confident CoT factually correct ಎಂದು trust. Verify final numerical.',
      ],
      tryIt:
        'ನಾಲ್ಕೂ techniques compare:\n\n' +
        '```\nfrom openai import OpenAI\nfrom collections import Counter\nclient = OpenAI()\n\nproblem = "Roger has 5 tennis balls. He buys 2 cans of tennis balls. Each can has 3 balls. How many balls does he have now?"\n\n# Zero-shot\nz = client.chat.completions.create(\n    model="gpt-4o-mini",\n    messages=[{"role":"user","content": problem}],\n    temperature=0,\n)\nprint("Zero-shot:", z.choices[0].message.content)\n\n# Self-consistency CoT\nanswers = []\nfor _ in range(7):\n    r = client.chat.completions.create(\n        model="gpt-4o-mini",\n        messages=[{"role":"user","content": problem + " Think step by step, then end with: Final answer: <NUMBER>."}],\n        temperature=0.7,\n    )\n    last = r.choices[0].message.content.strip().split("Final answer:")[-1].strip()\n    answers.append(last)\nprint("Self-consistency vote:", Counter(answers).most_common(1)[0][0])\n```\n\n' +
        'ಈಗ extend ಮಾಡಿ — 10 GSM8K-style problems ನಲ್ಲಿ accuracy compute. Real research result reproduce.',
      takeaway:
        'ಸುಲಭ tasks → **zero-shot**, novel formats → **few-shot**, reasoning → **CoT**, flaky → **self-consistency**. ಎಲ್ಲ fine-tuning ಮುಂಚಿನ free accuracy levers.',
    },

    'm3-t5': {
      explain:
        '**Prompt chaining** = ಸಂಕೀರ್ಣ task ಅನ್ನು focused prompts ಗಳ sequence ಆಗಿ decompose — ಪ್ರತಿ step ಮುಂದಿನದಕ್ಕೆ input. ಒಂದೇ mega-prompt ಬದಲು — pipeline: extract → validate → analyse → summarise → format. ಪ್ರತಿ step ಸಣ್ಣ, debuggable, replaceable. ಬೇರೆ steps ಗೆ ಬೇರೆ models — cheap models grunt work, smart models synthesis. Production LLM systems ಹೀಗೆಯೇ build.',
      analogy:
        '**ಹೋಟೆಲ್ ಅಡುಗೆಮನೆ** vs **ಒಬ್ಬನೇ ಅಡುಗೆಯವ**.\n\n' +
        '• **ಒಬ್ಬನೇ ಅಡುಗೆಯವ (mega-prompt)**: order ತೆಗೆದು, ತರಕಾರಿ ತಂದು, ತೊಳೆದು, ಕತ್ತರಿಸಿ, ಬೇಯಿಸಿ, plate, ತಲುಪಿಸುತ್ತಾನೆ. Quality coin flip; ಒಂದು step drop ಆದರೆ ಪೂರ್ತಿ ಡಿಶ್ ಹಾಳು; *ಎಲ್ಲಿ* ತಪ್ಪಾಯಿತು ಗೊತ್ತಾಗಲ್ಲ.\n\n' +
        '• **Kitchen brigade (chained)**: *prep cook* (cheap model) ಕತ್ತರಿಸುತ್ತಾನೆ. *line cook* (mid) ಬೇಯಿಸುತ್ತಾನೆ. *sauce specialist* (smart) finish. *expediter* (validator) check. ತಪ್ಪಾದರೆ — ಯಾವ station ಎಂದು exact ಗೊತ್ತು.\n\n' +
        'ಎರಡನೇ ಅಡುಗೆಮನೆ — **ನಿಧಾನ ಆದರೆ ವಿಶ್ವಾಸಾರ್ಹ, debuggable, scale ನಲ್ಲಿ ಚೀಪ್**.\n\n' +
        'ಎರಡನೇ ಉದಾಹರಣೆ: **Unix pipes**. `cat | grep | awk | sort | uniq -c`. ಪ್ರತಿ tool ಒಂದು job. Intermediate inspect. Replace. Prompt chains ಅದೇ idea — LLM steps.',
      theory:
        '**Chaining mega-prompt ಗಿಂತ ಏಕೆ ಚೆನ್ನಾಗಿ**:\n\n' +
        '1. **Attention dilution** — 6 instructions → ಪ್ರತಿಯೊಂದಕ್ಕೂ ಕಡಿಮೆ attention.\n' +
        '2. **Error compounding** — mega-prompt ನಲ್ಲಿ step 1 fail → silent. Explicit chains inspectable.\n' +
        '3. **Heterogeneous compute** — extraction `gpt-4o-mini`, synthesis `gpt-4o`. Money where matters.\n' +
        '4. **Reliability** — step 3 invalid → just step 3 retry.\n' +
        '5. **Evals per step** — independent eval set.\n\n' +
        '**Chain patterns**:\n' +
        '• **Extract → Transform → Load**.\n' +
        '• **Plan → Execute → Verify**.\n' +
        '• **Map → Reduce** — N chunks parallel, combine.\n' +
        '• **Router** — classifier prompt → specialised prompt.\n' +
        '• **Reflexion / Self-critique** — answer → critique → revise.\n' +
        '• **Tool-augmented** — tool call decide, execute, ಮುಂದುವರಿಸು. Agents foundation.\n\n' +
        '**Frameworks vs raw**: **LangChain**, **LlamaIndex**, **Haystack** — ready-made abstractions. Prototyping ಚೆನ್ನಾಗಿ — production ಗೆ **plain Python with explicit functions** debuggable. Memory, callbacks, tracing ಬೇಕಾದಾಗ framework.\n\n' +
        '**Validation between steps** non-negotiable. `pydantic`, `jsonschema` — ಪ್ರತಿ step output well-formed. Bad output silently 3 steps ಮುಂದೆ — 4-hour mystery debug.\n\n' +
        '**Cost**: chaining *increases* tokens. 3-step ~1.5-3× single. Win = reliability + quality. Cache common results (Redis, Anthropic prompt caching).',
      whyItMatters:
        'ಪ್ರತಿ real LLM product — chain, not single prompt. "ChatGPT demo" ನಿಂದ "1M users" ಗೆ ದಾರಿ — chaining + validation. Senior interview "design LLM-powered X" — ಸರಿ ಉತ್ತರ *ಯಾವಾಗಲೂ* chain diagram. Master ಆದರೆ — prompt-tweaker ಯಿಂದ system designer.',
      steps: [
        '**Whole task flowchart** — input → step → output. ಪ್ರತಿ box ಒಂದು prompt.',
        'ಪ್ರತಿ step Python function: `def extract_entities(text) -> list[Entity]`.',
        'ಪ್ರತಿ step output `pydantic` ಜೊತೆ validate.',
        '**Cheap models grunt**, **smart models synthesis**.',
        '**Retry-with-feedback** — error model ಗೆ ಕಳಿಸಿ "fix it".',
        'Intermediate output file/DB log — debug + evals.',
        'Independent sub-tasks → **parallel** (asyncio).',
        'Cost per step profile.',
      ],
      pitfalls: [
        '**ಸಮಸ್ಯೆ.** Steps ನಡುವೆ validation ಇಲ್ಲ. `pydantic`.',
        '**ತಪ್ಪು.** Same instructions repeat. Global rules system prompt; per-step focused.',
        '**ಸಮಸ್ಯೆ.** Mega-chains. *Minimum* chain aim.',
        '**ತಪ್ಪು.** Sequential when parallel. `asyncio.gather`.',
        '**ಸಮಸ್ಯೆ.** Final output ಮಾತ್ರ log. ಪ್ರತಿ step input + output log.',
        '**ತಪ್ಪು.** LangChain prematurely adopt. 3-step chain ಗೆ plain Python ಸ್ಪಷ್ಟ.',
        '**ಸಮಸ್ಯೆ.** Retry-with-feedback ignore. Error message model ಗೆ ಕಳಿಸಿ.',
        '**ತಪ್ಪು.** Cost telemetry ಇಲ್ಲ. Tokens-per-step track.',
      ],
      tryIt:
        'Tiny 3-step chain — extract, enrich, summarise:\n\n' +
        '```\nfrom openai import OpenAI\nimport json\nclient = OpenAI()\n\ndef llm(prompt, model="gpt-4o-mini"):\n    r = client.chat.completions.create(\n        model=model,\n        messages=[{"role":"user","content": prompt}],\n        temperature=0,\n    )\n    return r.choices[0].message.content\n\narticle = """Sundar Pichai met Mukesh Ambani in Mumbai. Reliance Jio will integrate Google Gemini in Q3 2026."""\n\n# Step 1: extract\nstep1 = llm(f"Return JSON array of entities (name + type). Only JSON.\\n\\n<article>{article}</article>")\nentities = json.loads(step1)\nprint("STEP 1:", entities)\n\n# Step 3: smart synthesis\nstep3 = llm(f"Article:\\n{article}\\n\\nWrite a 2-paragraph briefing for an executive.", model="gpt-4o")\nprint("STEP 3:\\n", step3)\n```\n\n' +
        'ಈಗ extend ಮಾಡಿ — step 0 *router* ಸೇರಿಸಿ article `business`/`politics`/`sports` classify, ಬೇರೆ template ಗೆ dispatch.',
      takeaway:
        '**Validation between steps ಜೊತೆ focused prompts ಗಳ chain** — single mega-prompt ಗಿಂತ ಗೆಲ್ಲುತ್ತದೆ. ಪ್ರತಿ production LLM system ನ foundation.',
    },

    // ══════════════════════════════════════════════════════════
    // Remaining topics fall back to English automatically.
    // Add more Kannada entries here as the curriculum grows.
    // ══════════════════════════════════════════════════════════
  },
}
