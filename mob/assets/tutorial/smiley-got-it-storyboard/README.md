# Exact Smiley Storyboard Animation — Codex Implementation Guide

## Purpose

This folder contains the **exact raster frames extracted from the generated storyboard image**. These are not redrawn SVG approximations. They preserve the exact visual appearance of the generated storyboard panels.

The original storyboard contains **8 panels**. For the intended ~1.0 second animation, use these six keyframes:

- `frame_1.png`
- `frame_2.png`
- `frame_3.png`
- `frame_4.png`
- `frame_6.png`
- `frame_8.png`

Do **not** use `frame_5.png` or `frame_7.png` as primary keyframes unless a smoother intermediate is desired. They can be used as optional in-between frames if needed.

The target animation is:

1. Open-eyed smirking face
2. Gloved hand begins moving into position
3. Eyes begin closing / expression transitions
4. Full closed-eye grin
5. Thumb reaches the thumbs-up pose
6. Tooth sparkle appears as the final accent

Target total duration: **~1.0 second**

The final feel should be:
- fast
- playful
- crisp
- expressive
- slightly springy
- not floaty
- not slow
- not robotic

---

# Recommended React Native stack

Use:

- `react-native-reanimated`
- React Native `Image` or `expo-image`
- optionally `react-native-svg` only if Codex decides to add a separately animated sparkle overlay
- optionally `react-native-skia` only if advanced masking or warping is required

The simplest faithful implementation is to treat the provided PNGs as visual keyframes and crossfade/interpolate them with Reanimated.

Do **not** attempt to recreate the artwork from emoji text glyphs. The generated artwork is custom 3D-style imagery and system emoji glyphs will not match it.

Do **not** redraw the character unless explicitly necessary. Fidelity is more important than vector purity.

---

# Timing map

Use a total duration of approximately:

`1000 ms`

Suggested keyframe timing:

## Frame 1
File:
`frame_1.png`

Time:
`0 ms → ~170 ms`

Visual state:
- face is open-eyed
- sly/smirking expression
- hand has not meaningfully entered yet
- no sparkle

Motion:
- face mostly static
- optional tiny anticipatory scale of 1.00 → 0.99
- this creates a subtle compression before the action starts

Recommended easing:
- `Easing.out(Easing.quad)` for any tiny setup motion

---

## Frame 2
File:
`frame_2.png`

Time:
`~170 ms → ~330 ms`

Visual state:
- hand begins moving rapidly into frame
- smirk remains
- eyes remain open
- motion blur is visually implied in the artwork

Codex behavior:
- move the visible frame/image slightly from left to right or upward if needed to reinforce motion
- if implementing the hand as a separately cropped overlay, animate it rapidly toward the face
- prioritize the feeling of acceleration

Recommended timing:
- transition start: 170 ms
- midpoint: 240 ms
- transition complete: 330 ms

Recommended easing:
- `Easing.out(Easing.cubic)`

The hand should feel like it is entering with momentum, not drifting.

---

## Frame 3
File:
`frame_3.png`

Time:
`~330 ms → ~480 ms`

Visual state:
- expression begins changing
- one/both eyes visually transition toward closed
- face begins becoming happier
- hand is now close to its final position

Codex behavior:
- keep this transition fast
- do not linger here
- this is an expression-change bridge, not a resting pose

Recommended easing:
- `Easing.inOut(Easing.quad)`

Optional transform:
- face scale: `0.99 → 1.015`
- slight upward translation: `0 → -2 px`

This gives the grin transition a mild “pop.”

---

## Frame 4
File:
`frame_4.png`

Time:
`~480 ms → ~650 ms`

Visual state:
- full closed-eye grin
- teeth fully visible
- hand remains nearby
- thumb is not yet fully up
- no tooth sparkle yet

Codex behavior:
- this is where the facial transformation should feel complete
- expression should settle quickly
- face can overshoot in size slightly, then settle

Recommended face scale:
- enter at `1.02`
- settle toward `1.00`

Recommended easing:
- enter: `Easing.out(Easing.back(1.4))`
- settle: `Easing.out(Easing.quad)`

Do not overdo bounce. It should be playful, not cartoonishly elastic.

---

## Frame 6
File:
`frame_6.png`

Time:
`~650 ms → ~830 ms`

Visual state:
- clear thumbs-up pose
- grin fully established
- celebratory motion lines appear near the thumb
- sparkle has not yet reached the final bright tooth flash

This is the most important hand transition.

Codex behavior:
- the thumb should appear to “snap” upward into position
- use a short overshoot
- slight rotation can improve the impression of a thumb flick

Recommended thumb/hand transform if separated:
- translateY: `+10 px → 0 px`
- translateX: `-4 px → 0 px`
- rotation: `-8deg → 2deg → 0deg`
- scale: `0.96 → 1.06 → 1.00`

Recommended easing:
- first part: `Easing.out(Easing.back(1.8))`
- settle: `Easing.out(Easing.quad)`

Recommended duration:
- rise/pop: ~120 ms
- settle: ~60 ms

The thumbs-up should feel fast and decisive.

---

## Frame 8
File:
`frame_8.png`

Time:
`~830 ms → 1000 ms`

Visual state:
- final grin
- thumbs-up fully established
- bright tooth sparkle visible
- additional star accents visible
- final celebratory state

The sparkle should be the last event in the sequence.

Recommended sparkle timing:
- begin around `820–850 ms`
- peak around `900 ms`
- hold through `1000 ms`

Recommended sparkle animation if layered separately:
- opacity: `0 → 1 → 0.85`
- scale: `0.25 → 1.25 → 1.0`
- rotation: `-20deg → 15deg → 0deg`

Recommended easing:
- appearance: `Easing.out(Easing.back(2.0))`
- settle: `Easing.out(Easing.quad)`

Do not make the sparkle fade away before the 1-second endpoint unless the animation is intended to loop.

If looping:
- hold final pose briefly for ~80–120 ms
- then reset instantly or crossfade back to frame 1
- avoid a slow reverse animation unless explicitly desired

---

# Preferred interpolation strategy

Because these are raster keyframes, Codex should NOT simply switch images instantly at each timestamp unless a deliberately stop-motion look is desired.

Preferred approach:

1. Preload all keyframe images
2. Keep two adjacent frames mounted
3. Crossfade between them
4. Apply small transform interpolation during each transition
5. Keep transitions short enough that the result reads as continuous movement

Recommended crossfade windows:

- frame 1 → 2: ~70–100 ms
- frame 2 → 3: ~70–90 ms
- frame 3 → 4: ~70–90 ms
- frame 4 → 6: ~80–110 ms
- frame 6 → 8: ~60–90 ms

The animation should never show a long period where two frames are equally visible, because that can create a ghosted double-face effect.

Prefer:
- outgoing opacity: `1 → 0`
- incoming opacity: `0 → 1`

But bias the blend slightly toward the incoming frame so the character remains visually crisp.

Example:
- outgoing: 1.0 → 0.15
- incoming: 0.0 → 1.0

Then remove/hide the outgoing frame as soon as the incoming frame reaches full opacity.

---

# Spatial movement

The overall emoji should remain visually anchored.

Do not let the face drift around the screen.

Approximate anchoring:
- face center should remain within ±3 px throughout
- hand is the dominant moving element
- face can perform only a very small scale/vertical pop
- sparkle should be local to the teeth

Recommended global transforms:
- face translateY maximum: about 2–4 px
- face scale maximum: about 1.02
- hand travel: whatever is implied by the frame transition
- sparkle scale can be more exaggerated because it is a tiny element

---

# Visual fidelity rules

Codex should preserve:

- exact yellow/orange face appearance
- exact eye style
- exact grin proportions
- exact gloved-hand look
- exact thumb pose
- exact tooth sparkle placement
- exact warm black/gold background appearance if the background is part of the intended asset

Do not:
- replace the face with Unicode emoji
- replace the hand with a system emoji
- redraw the grin using text
- recolor the artwork
- alter aspect ratio
- stretch the PNGs non-uniformly

If resizing:
- preserve original aspect ratio
- use `resizeMode="contain"` or equivalent
- avoid interpolation artifacts where possible

---

# Background handling

The original storyboard panels include a dark warm background.

If the final app UI already has its own background and the emoji must appear isolated, Codex has two options:

## Option A — easiest
Use the entire frame exactly as provided.

This preserves maximum visual fidelity.

## Option B — isolate the character
Create transparent versions of the six frames by removing the background.

If this is done:
- maintain anti-aliased edges
- avoid alpha holes
- preserve soft shadows where possible
- keep the glow around the sparkle
- do not create a hard cutout edge around the glove or face

If transparency is required, preprocessing should be done once and the transparent assets committed to the project.

Do not perform expensive background removal at runtime.

---

# Asset preloading

All six primary frames should be preloaded before starting the animation.

The animation should not begin until assets are ready.

This avoids:
- blank flashes
- frame skipping
- image decode stutter
- first-play hitching

If using Expo:
- consider `expo-image` for reliable caching/preloading
- otherwise use React Native Image prefetch behavior where appropriate

---

# Reanimated implementation structure

Recommended conceptual structure:

```text
SmileyAnimation
├── AbsoluteFill container
├── Frame 1 image
├── Frame 2 image
├── Frame 3 image
├── Frame 4 image
├── Frame 6 image
└── Frame 8 image
```

Each frame:
- absolutely positioned
- identical width/height
- identical center point
- opacity driven by one shared progress value

Shared animation progress:
`0 → 1`

Recommended normalized milestones:

- frame 1 = `0.00`
- frame 2 = `0.17`
- frame 3 = `0.33`
- frame 4 = `0.48`
- frame 6 = `0.66`
- frame 8 = `0.84`
- final hold = `1.00`

Map those milestones to opacity ranges using Reanimated `interpolate`.

Example conceptual mapping:

```text
Frame 1 opacity:
1.0 at 0.00
1.0 at 0.10
0.0 at 0.20

Frame 2 opacity:
0.0 at 0.10
1.0 at 0.18
1.0 at 0.26
0.0 at 0.36

Frame 3 opacity:
0.0 at 0.27
1.0 at 0.34
1.0 at 0.40
0.0 at 0.50

Frame 4 opacity:
0.0 at 0.41
1.0 at 0.49
1.0 at 0.60
0.0 at 0.69

Frame 6 opacity:
0.0 at 0.60
1.0 at 0.67
1.0 at 0.77
0.0 at 0.87

Frame 8 opacity:
0.0 at 0.78
1.0 at 0.86
1.0 through 1.00
```

These are starting values, not absolute requirements. Tune by eye.

---

# Suggested total timing in milliseconds

A practical schedule:

```text
0 ms      frame 1 fully visible
120 ms    anticipation begins
170 ms    frame 2 starts appearing
250 ms    frame 2 dominant
330 ms    frame 3 starts appearing
400 ms    frame 3 dominant
480 ms    frame 4 starts appearing
560 ms    frame 4 dominant
650 ms    frame 6 transition begins
730 ms    thumbs-up dominant
820 ms    frame 8 starts appearing
900 ms    sparkle peak
1000 ms   final pose
```

This is the recommended baseline.

---

# Motion character

The animation should feel like one continuous gesture:

```text
smirk
→ hand rushes in
→ facial expression flips
→ grin lands
→ thumb pops upward
→ tooth sparkles
```

There should be no visible pause between these phases.

The visual rhythm should accelerate toward the grin/thumb moment, then end with the sparkle accent.

Think:
- anticipation
- action
- payoff
- accent

---

# If Codex wants to improve smoothness

Optional:
- use frame 5 as an intermediate between frame 4 and frame 6
- use frame 7 as an intermediate between frame 6 and frame 8

If used:

Suggested timing:
- frame 5 around `610–690 ms`
- frame 7 around `780–860 ms`

This creates an 8-frame version that can look smoother.

However, if the intended requirement is specifically six major steps, keep 5 and 7 as hidden interpolation references only.

---

# Looping behavior

If the animation runs once:
- finish on frame 8
- keep frame 8 visible
- do not automatically reset

If looping:
- recommended full cycle around `1.4–1.8 seconds`
- actual motion remains ~1.0 second
- hold frame 8 for ~200–400 ms
- reset to frame 1 quickly
- optionally add a very short 80–120 ms fade between final and initial states

Avoid reversing the entire timeline because the thumbs-up and sparkle look unnatural when played backward.

---

# Performance requirements

Codex should:
- preload assets
- avoid unnecessary rerenders during playback
- use Reanimated shared values for animation state
- keep animation work on the UI thread where possible
- avoid JS timers for every frame
- avoid `setInterval`
- avoid chained React state updates for timing

Prefer:
- one shared progress value
- `withTiming`
- `withSequence`
- `interpolate`
- animated styles

---

# Recommended default playback trigger

The animation can be triggered by:
- component mount
- button press
- success state
- completion state

If it is a success/checkmark-style feedback animation, play once per successful action.

Do not continuously loop unless the surrounding UI specifically calls for it.

---

# Final instruction to Codex

The priority order is:

1. Preserve the exact appearance of the supplied images
2. Match the intended sequence
3. Match the ~1 second timing
4. Make transitions feel continuous
5. Keep the animation crisp and performant
6. Avoid unnecessarily redrawing the character

Start with the six exact PNG keyframes and use React Native Reanimated to crossfade and lightly transform between them.

Only introduce more complex masking, cropping, or per-element animation if the simple keyframe approach does not sufficiently match the intended movement.

The intended final visual should read immediately as:

**smirking open-eye face → expressive grin → thumbs-up → tooth sparkle**

with the whole action completing in approximately one second.
