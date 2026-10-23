# How to change what the AI picks or rejects (easy guide)

Everything lives in 2 files inside `src/lib/`. Edit with any text editor, save, and the site updates.

## 1) prompts.js  -> "what the AI can SEE"
The AI is told a list of sentences. For every photo it asks: "which sentence describes this best?"

### A) Add something new it should recognise  (SUBJECT list)
Add one line, key + plain English sentence:
    bike2: 'a person riding a bicycle',
Rule: every photo needs a place to land. If a type of photo keeps sneaking into a wrong vibe,
add a sentence for it (e.g. `curtain: 'curtains and cloth hanging'`) so the AI puts it there instead.

### B) Reject more ugly/meaningless stuff  (JUNK list)
Add a line:
    bills: 'a bill, invoice or paper form',
Then (optional) set how strict it is in JUNK_T:
    bills: .3,
Smaller number = stricter (rejects more). 0.3 = strict, 0.5 = only if very sure.
If good photos get rejected, RAISE that number. If bad ones slip in, LOWER it.
(Check the "rejected - see why" box on the results page to see what was thrown out.)

### C) "Boring" subjects  (BORING list)
Subjects in this list are skipped in Most perfect, Colour, Pastel, Moody, B&W, Dump.
Add a key name, e.g. BORING = [..., 'curtain'].

### D) Taste ("what is beautiful")  (BEAUTY list)
Each pair = [good sentence, bad sentence]. Change the words to match your taste,
e.g. ['a soft dreamy pastel photo','a harsh messy photo'].

## 2) curate.js  -> "which photos go in which vibe"
Find `const K={ ... }`. Each vibe has a list of subject keys it accepts:
    animals:['dog','cat','bird','animal','bigcat'],
Add a key to accept more (e.g. 'horse'), delete a key to accept less.
A photo is only used if the AI's #1 guess for it is in that list.

- Too few photos in a vibe?   Add more keys to its list (and add matching sentences in prompts.js).
- Wrong photos in a vibe?     Remove the key that lets them in, or add a sentence in prompts.js so they land elsewhere.
- People in a nature/food vibe? Look at the vibe's `gate:` (e.g. `S(p,PEOPLE)<.4`). Smaller = fewer people allowed.
- Make a vibe stricter/looser:  `min:.2` on a vibe (higher = stricter). Default is .25.

## 3) analyze.js  -> pixel rules (colour, sharpness, size)
Search for `junk.push(` - those lines reject photos by pixels (tiny, blurry, too dark, flat graphics).
Change the numbers there, e.g. `minSide<220` = reject images smaller than 220px.
