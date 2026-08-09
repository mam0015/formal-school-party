# Formal Invite — Pixel / Android V5

Phone-first single-page invitation for Android/Google Pixel.

Flow: Intro → Formal question → Yes reaction → transport choice → pickup time/address OR own-way ending → email notification.

## Email setup
Create a Formspree form, then paste its endpoint into `config.js`. GitHub Pages itself cannot send email.

## Publish
Upload `index.html`, `style.css`, `script.js`, and `config.js` to the repository root, then enable GitHub Pages from the main branch.

## Test before sending
Test the Yes email and both transport branches on an actual Android phone.


## V5.1 update
On the 5th No tap, the question bear becomes a crying bear. Animated tears fall and form a heart-shaped puddle beneath it.


## V5.2 — Final No flow
- No taps 1–5 stay playful.
- On tap 5, the bear becomes the crying bear and the heart-shaped tear puddle appears.
- On tap 6 or later, No becomes the final answer.
- The app opens a respectful ending screen saying that a lot of time went into the app, but there is no pressure and everyone can still enjoy Formal with friends.
- If Formspree is connected, a NO response is emailed as well.
