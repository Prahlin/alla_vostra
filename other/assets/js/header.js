const siteHeaderMount = document.getElementById("site-header");

if (siteHeaderMount) {
  siteHeaderMount.innerHTML = `
    <header>
      <div class="announcement">
        <span class="announcement-text">
          Order the Alla Vostra favorites in time for the holidays
        </span>
      </div>

      <nav class="nav">
        <a class="logo" href="index.html">
          Alla<br />
          Vostra
        </a>

        <a class="nav-link nav-shop" href="shop.html">SHOP</a>
        <a class="nav-link" href="products.html">Products</a>
        <a class="nav-link" href="aboutus.html">About Us</a>
        <a class="nav-link" href="contact.html">Contact</a>
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