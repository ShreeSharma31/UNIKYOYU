const byId = (id) => document.getElementById(id);
const introModal = byId("introModal");
const verifyModal = byId("verifyModal");
const hello = byId("hello");

const saveUser = (data) =>
  localStorage.setItem("unikyoyu:user", JSON.stringify(data));
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("unikyoyu:user") || "null");
  } catch {
    return null;
  }
};

const setVerified = (email) =>
  localStorage.setItem(
    "unikyoyu:verified",
    JSON.stringify({ email, at: Date.now() })
  );
const isVerified = () => !!localStorage.getItem("unikyoyu:verified");

function personalize() {
  const u = getUser();
  const y = new Date().getFullYear();
  document.getElementById("year").textContent = y;
  if (u) {
    hello.textContent = `Hi ${u.name} • ${u.university} • ${u.city}`;
  }
}

// Parallax feel: move blobs slightly on scroll
window.addEventListener("scroll", () => {
  const y = window.scrollY || 0;
  document.querySelector(".b1").style.transform = `translateY(${y * 0.08}px)`;
  document.querySelector(".b2").style.transform = `translateY(${y * -0.05}px)`;
  document.querySelector(".b3").style.transform = `translateY(${y * 0.03}px)`;
});

// Show intro on first visit
window.addEventListener("DOMContentLoaded", () => {
  personalize();
  if (!getUser()) introModal.showModal();
  document.querySelectorAll("[data-requires-verify]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (!isVerified()) {
        e.preventDefault();
        verifyModal.showModal();
      }
    });
  });
});

// Intro form handling
byId("introForm").addEventListener("close", function () {
  if (this.returnValue === "ok") {
    const name = byId("name").value.trim();
    const university = byId("university").value.trim();
    const country = byId("country").value.trim();
    const city = byId("city").value.trim();
    if (name && university && country && city) {
      saveUser({ name, university, country, city });
      personalize();
    }
  }
});

// Verification helpers
function looksLikeUniversityEmail(email) {
  const e = (email || "").toLowerCase();
  const basic =
    e.includes("@") && e.split("@")[1] && e.split("@")[1].includes(".");
  const uniHints =
    e.includes(".ac.") ||
    e.endsWith(".ac.in") ||
    e.endsWith(".edu") ||
    e.endsWith(".edu.in");
  return basic && uniHints;
}

// Allow Cancel gracefully
byId("cancelVerify").addEventListener("click", () => {
  verifyModal.close();
});

byId("verifyForm").addEventListener("close", function () {
  if (this.returnValue === "ok") {
    const email = byId("email").value.trim();
    if (looksLikeUniversityEmail(email)) {
      setVerified(email);
      // micro pop
      const n = document.createElement("div");
      n.textContent = "Verified — welcome to the community!";
      n.style.position = "fixed";
      n.style.bottom = "20px";
      n.style.left = "50%";
      n.style.transform = "translateX(-50%)";
      n.style.background = "var(--rust)";
      n.style.color = "#fff";
      n.style.padding = "12px 16px";
      n.style.borderRadius = "12px";
      n.style.boxShadow = "var(--shadow)";
      n.style.animation = "pop .3s ease both";
      document.body.appendChild(n);
      setTimeout(() => n.remove(), 2200);
    } else {
      alert("Use a valid university email (e.g., name@college.ac.in)");
      verifyModal.showModal();
    }
  }
});

// Programmatic navigation honoring guard
function navigateHash(hash) {
  if (["#home", "#browse", "#safety", "#about", "#contact", "#listings"].includes(hash)) {
    location.hash = hash;
    return;
  }
  if (isVerified()) location.hash = hash;
  else verifyModal.showModal();
}
window.navigateHash = navigateHash;
