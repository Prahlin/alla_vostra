const siteHeaderMount = document.getElementById("site-header");

if (siteHeaderMount) {
  siteHeaderMount.innerHTML = `
    <header>
      <div class="announcement">
        <a class="mobile-orange-logo" href="index.html">
          Alla<br />
          Vostra
        </a>

        <a class="mobile-orange-shop" href="shop.html">SHOP</a>
      </div>

      <nav class="nav nav-desktop">
        <a class="logo" href="index.html">
          Alla<br />
          Vostra
        </a>

        <a class="nav-link nav-shop" href="shop.html">SHOP</a>
        <a class="nav-link" href="products.html">Products</a>
        <a class="nav-link" href="aboutus.html">About Us</a>
        <a class="nav-link" href="contact.html">Contact</a>
      </nav>

      <nav class="nav-mobile">
        <div class="mobile-top-row">
          <a class="mobile-logo" href="index.html">
            Alla<br />
            Vostra
          </a>

          <a class="mobile-shop" href="shop.html">SHOP</a>
        </div>

        <div class="mobile-bottom-row">
          <div class="mobile-carousel-window">
            <div class="mobile-carousel-track">
              <a class="mobile-carousel-link" href="products.html" data-mobile-nav-index="0">
                Products
              </a>

              <a class="mobile-carousel-link" href="aboutus.html" data-mobile-nav-index="1">
                About Us
              </a>

              <a class="mobile-carousel-link" href="contact.html" data-mobile-nav-index="2">
                Contact
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <section class="hero">
      <img
        class="hero-image"
        src="assets/images/background3.png"
        alt="Alla Vostra catering table"
      />
    </section>
  `;
}

const heroImage = document.querySelector(".hero-image");
const root = document.documentElement;

function updateHeroScale() {
  if (!heroImage) {
    return;
  }

  const scrollY = window.scrollY || window.pageYOffset;
  const maxScroll = 520;
  const maxScale = 2.0;
  const maxMainLift = -260;
  const progress = Math.min(scrollY / maxScroll, 1);
  const scale = 1 + progress * (maxScale - 1);
  const mainShift = progress * maxMainLift;

  heroImage.style.transform = `scale(${scale})`;
  root.style.setProperty("--main-scroll-shift", `${mainShift}px`);
}

window.addEventListener("scroll", updateHeroScale, { passive: true });
window.addEventListener("resize", updateHeroScale);
updateHeroScale();

const mobileAnnouncement = document.querySelector(".announcement");
const mobileNav = document.querySelector(".nav-mobile");

function updateMobileStickyHeader() {
  if (!mobileAnnouncement || !mobileNav) {
    return;
  }

  if (window.innerWidth > 760) {
    root.style.removeProperty("--mobile-nav-top");
    return;
  }

  const announcementBottom = mobileAnnouncement.getBoundingClientRect().bottom;
const navTop = Math.max(0, announcementBottom - 6);

  root.style.setProperty("--mobile-nav-top", `${navTop}px`);
}

window.addEventListener("scroll", updateMobileStickyHeader, { passive: true });
window.addEventListener("resize", updateMobileStickyHeader);
updateMobileStickyHeader();

const mobileNavLinks = Array.from(document.querySelectorAll(".mobile-carousel-link"));
const mobileCarouselWindow = document.querySelector(".mobile-carousel-window");
const mobileCarouselTrack = document.querySelector(".mobile-carousel-track");

let mobileNavIndex = 0;
let mobileDragStartX = 0;
let mobileDragCurrentX = 0;
let mobileDragging = false;

function getMobileNavIndexFromPath() {
  const path = window.location.pathname.split("/").pop();

  if (path === "aboutus.html") {
    return 1;
  }

  if (path === "contact.html") {
    return 2;
  }

  return 0;
}

function setMobileDragOffset(value) {
  if (!mobileCarouselTrack) {
    return;
  }

  mobileCarouselTrack.style.setProperty("--mobile-drag-offset", `${value}px`);
}

function renderMobileNav() {
  if (!mobileNavLinks.length) {
    return;
  }

  mobileNavLinks.forEach((link, index) => {
    link.classList.remove("is-left", "is-center", "is-right", "is-hidden");

    if (index === mobileNavIndex) {
      link.classList.add("is-center");
      return;
    }

    if (index === mobileNavIndex - 1) {
      link.classList.add("is-left");
      return;
    }

    if (index === mobileNavIndex + 1) {
      link.classList.add("is-right");
      return;
    }

    link.classList.add("is-hidden");
  });

  setMobileDragOffset(0);
}

function moveMobileNav(direction) {
  const nextIndex = mobileNavIndex + direction;

  if (nextIndex < 0 || nextIndex >= mobileNavLinks.length) {
    return;
  }

  mobileNavIndex = nextIndex;
  renderMobileNav();
}

if (mobileNavLinks.length) {
  mobileNavIndex = getMobileNavIndexFromPath();
  renderMobileNav();
}

if (mobileCarouselWindow) {
  mobileCarouselWindow.addEventListener("pointerdown", (event) => {
    mobileDragging = true;
    mobileDragStartX = event.clientX;
    mobileDragCurrentX = event.clientX;

    mobileCarouselWindow.classList.add("is-dragging");
    mobileCarouselWindow.setPointerCapture(event.pointerId);
  });

  mobileCarouselWindow.addEventListener("pointermove", (event) => {
    if (!mobileDragging) {
      return;
    }

    mobileDragCurrentX = event.clientX;
    setMobileDragOffset(mobileDragCurrentX - mobileDragStartX);
  });

  mobileCarouselWindow.addEventListener("pointerup", (event) => {
    if (!mobileDragging) {
      return;
    }

    const dragDistance = mobileDragCurrentX - mobileDragStartX;

    mobileDragging = false;
    mobileCarouselWindow.classList.remove("is-dragging");

    if (Math.abs(dragDistance) > 55) {
      moveMobileNav(dragDistance < 0 ? 1 : -1);
    } else {
      setMobileDragOffset(0);
    }

    mobileCarouselWindow.releasePointerCapture(event.pointerId);
  });

  mobileCarouselWindow.addEventListener("pointercancel", () => {
    mobileDragging = false;
    mobileCarouselWindow.classList.remove("is-dragging");
    setMobileDragOffset(0);
  });

  mobileCarouselWindow.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      event.preventDefault();
      moveMobileNav(event.deltaX > 0 ? 1 : -1);
    },
    { passive: false }
  );
}