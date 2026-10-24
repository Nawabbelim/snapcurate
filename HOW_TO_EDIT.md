# How to change what gets picked or rejected  (easy guide)

Everything is in ONE file:  src/rules.config.js   — three layers, top to bottom.
Percentages are decimals: .25 = 25%.   [a, b] = [strict first try, looser second try].
Save the file and the site updates (dev server) — then look at "All photos & why" on the results page.

## LAYER 1 — GLOBAL_REJECT: thrown out of EVERY vibe
    injection:.25,     <- thing : how sure the AI must be.  SMALLER = stricter (rejects more)
- Not rejecting something good?  RAISE its number.   Bad photo getting through?  LOWER it (or add it).
- Add something new: first teach the AI the word in src/lib/prompts.js (JUNK list):
      bills:'a bill, invoice or paper form',
  then add   bills:.3,   to GLOBAL_REJECT.   You can also list any SUBJECT name there (e.g. shoes:.5).
- GLOBAL_PIXEL = no-AI checks: tiny, flat, blurry, too dark/bright images and bad file names.
- HUMAN_REQUIRED = how sure the AI must be that a person is present in "Human in every slide" mode.

## LAYER 2 — CATEGORY_RULES: which photos BELONG in each vibe
    animals:{include:['dog','cat','bird','animal','bigcat'],withHuman:['ppet'],minMatch:[.25,.12],exclude:{faces:.2,kids:.2}},
- include    what the vibe WANTS        (add = accept more, delete = accept less)
- withHuman  extra things accepted only in "Human in every slide" mode (a person with a pet counts as animals)
- top        'top1' AI's #1 guess must be in include | 'top2' #1 or #2 | 'any'
- minMatch   how sure the AI must be.   BIGGER = stricter
- exclude    { thing: max }  reject if photo has MORE of it.   SMALLER = stricter
- need       { thing: min }  reject if photo has LESS of it.   BIGGER = stricter
- pixel      L brightness · sat colour strength · std contrast · warm orange · mono colourless   e.g. bw:{pixel:{mono:[.85,1]}}
- dropLeastPretty   throw away the least pretty share of your photos (.25 = worst 25%)
- Portrait extras:
    faceRules  strict face checks (eyes open, head turn, max faces, score)
    waiver     if the face-detector says "great portrait" (score ≥ .6, whole face in frame, space under the chin)
               the "faces %" and subject checks are SKIPPED.  Lower score / neckRoom = more portraits skip the checks.

## LAYER 3 — RANKING: who wins among accepted photos
- matchWeight / beautyWeight : fits the vibe vs. looks pretty
- pixelLook   sharpness, exposure (well lit), contrast, vividColour, subjectPop, palette   (keep adding to 1)
- faceQuality eyesOpen, smile, straight, tilt, size   (keep adding to 1)
- perCategory.perfect.groupPenalty  points taken off kinds you want LOWER priority (vehicle .15). groupCap = max of one kind.
- duplicateDistance  bigger = more near-duplicates removed

## Where to look when a photo is wrong
Results page -> "All photos & why": every photo shows its status and the exact reason, e.g.
  "Global reject: looks like 'syringe...' (50%; limit 25%)"  -> LAYER 1
  "Contains too much 'faces' (34%; limit 20%)"               -> LAYER 2 exclude
  "Matched this vibe — rank #14"                              -> LAYER 3 (ranking)

## What the AI can see (src/lib/prompts.js)
SUBJECT = things it recognises · JUNK = things it can flag · BORING = skipped in generic vibes · BEAUTY/FACE = taste sentences.
