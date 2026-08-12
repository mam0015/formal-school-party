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


## V5.3 — Pickup-first
- The large transport choice was removed.
- Pickup is now the main flow.
- Main action: Set pick-up time.
- A small low-emphasis “I’d rather meet you there” option remains available.


## V5.4 — Runaway No
- Clicks 1–3: No shrinks normally.
- Click 4: crying bear starts and No begins moving around the phone screen.
- Click 5: No shrinks again and continues moving.
- Click 6: movement stops and the real No ending runs.
- Movement is bounded to the visible viewport and keeps a usable touch target.


## V5.5 — Faster No + clearer Yes text
- After the 4th No tap, the moving No button now changes position every 300 ms.
- The Yes-page copy now clearly says the idea is to go to Formal together, while both people can hang out with their own friends once there.


## V5.6 update
- Runaway No now moves every 450 ms after the 4th No tap.
- Yes-page text was simplified to make it clear you only mean going to Formal together, then hanging out with friends once there.
- Pickup page now says: “I’d really like to pick you up, if that’s okay with you. What time works for you?”
- Final No page is now shorter and gentler: “Okay, fair enough. I hope you at least thought the app was kinda cute. See you at Formal :)”
