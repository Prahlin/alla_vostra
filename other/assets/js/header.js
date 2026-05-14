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