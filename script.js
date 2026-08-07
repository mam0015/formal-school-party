// ====== EDIT THESE ======
const YOUR_PHONE = "04XXXXXXXX"; // Replace with your Australian mobile number
const YOUR_NAME = "Ali";
// ========================

const noBtn = document.getElementById("noBtn");
const toast = document.getElementById("toast");

if (noBtn && toast) {
  noBtn.addEventListener("click", () => {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  });
}

const textBtn = document.getElementById("textBtn");
if (textBtn) {
  const message = encodeURIComponent(`Yes ${YOUR_NAME}, I’d love to go to Formal with you ❤️`);
  textBtn.href = `sms:${YOUR_PHONE}?&body=${message}`;
}

// Lightweight confetti for the YES page.
const canvas = document.getElementById("confetti");

if (canvas) {
  const ctx = canvas.getContext("2d");
  let pieces = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makePieces() {
    pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: 5 + Math.random() * 8,
      speed: 1.5 + Math.random() * 3,
      drift: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach((p, i) => {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += 0.03;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = i % 3 === 0 ? "#9c3f57" : i % 3 === 1 ? "#d3a2af" : "#d6b58d";
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  resize();
  makePieces();
  draw();
  window.addEventListener("resize", () => {
    resize();
    makePieces();
  });
}
