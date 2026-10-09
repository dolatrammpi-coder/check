import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import categoriesData from '../services/mockData/store_categories_c.json';
import productsData from '../services/mockData/store_products_c.json';

export const route = {
  path: '/',
  layout: 'public',
  access: 'public',
};

const categories = categoriesData.records.map((record) => ({
  name: record.Name,
  subtitle: record.subtitle_c,
  image: record.image_c,
  target: record.slug_c,
}));

const products = productsData.records.map((record) => ({
  id: record.slug_c,
  name: record.Name,
  category: record.category_c,
  price: record.price_c,
  oldPrice: record.old_price_c,
  discount: record.discount_c,
  tag: record.tag_c,
  image: record.image_c,
  tone: record.description_c,
}));

const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

function BrandMark({ compact = false }) {
  return (
    <Link to="/" className={`brand-mark ${compact ? 'brand-mark-compact' : ''}`} aria-label="Zikson Prime Enterprise home">
      <span className="brand-emblem" aria-hidden="true">
        <Icon name="House" size={34} strokeWidth={1.5} />
        <span className="brand-spark">✦</span>
      </span>
      <span className="brand-wording">
        <span className="brand-name">ZIKS<span className="brand-o">O</span>N</span>
        <span className="brand-caption">PRIME ENTERPRISE</span>
      </span>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="section-heading">
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <div className="ornament-title">
        <span />
        <h2>{title}</h2>
        <span />
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

function ProductCard({ product, onAdd, added }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && <span className={`product-tag ${product.tag === 'New' ? 'tag-new' : ''}`}>{product.tag}</span>}
        <button className="wishlist-button" aria-label={`Save ${product.name} to wishlist`} onClick={(event) => event.currentTarget.classList.toggle('is-saved')}>
          <Icon name="Heart" size={17} />
        </button>
      </div>
      <div className="product-info">
        <p className="product-kicker">{product.tone}</p>
        <h3>{product.name}</h3>
        <div className="product-rating" aria-label="Rated 4.8 out of 5">
          <span>★★★★★</span>
          <small>4.8</small>
        </div>
        <div className="product-pricing">
          <strong>{formatPrice(product.price)}</strong>
          <del>{formatPrice(product.oldPrice)}</del>
          <span>{product.discount}</span>
        </div>
        <button className={`add-cart-button ${added ? 'added' : ''}`} onClick={() => onAdd(product)}>
          <Icon name={added ? 'Check' : 'ShoppingCart'} size={16} />
          {added ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.tone.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchText]);

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setAnnouncement(product.name + ' added to cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const subscribe = (event) => {
    event.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAnnouncement('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    setAnnouncement('Thank you for subscribing to Zikson updates.');
  };

  return (
    <div className="storefront">
      <div className="announcement-bar">
        <div className="announcement-inner">
          <span><Icon name="Truck" size={15} /> Free Shipping on Orders Above ₹999</span>
          <span className="announcement-center">Premium Home Décor & Kitchen Essentials</span>
          <span><Icon name="ShieldCheck" size={15} /> Secure Payments</span>
          <span><Icon name="Headset" size={15} /> 24/7 Customer Support</span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-main">
          <button className="mobile-menu-toggle icon-action" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={23} />
          </button>
          <BrandMark />
          <nav className={`main-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
            <a className="nav-link active" href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a className="nav-link" href="#products" onClick={() => setMobileMenuOpen(false)}>Shop</a>
            <a className="nav-link" href="#decor" onClick={() => setMobileMenuOpen(false)}>Home Decor</a>
            <a className="nav-link" href="#categories" onClick={() => setMobileMenuOpen(false)}>Home & Kitchen</a>
            <a className="nav-link" href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a className="nav-link" href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </nav>
          <div className="header-actions">
            <button className="icon-action" aria-label="Search products" onClick={() => setSearchOpen(!searchOpen)}>
              <Icon name="Search" size={23} />
            </button>
            <button className="icon-action account-action" aria-label="My account" onClick={() => setAnnouncement('Account sign-in will be available soon.')}>
              <Icon name="UserRound" size={22} />
            </button>
            <button className="icon-action cart-action" aria-label={`Shopping cart with ${cartCount} items`} onClick={() => setCartOpen(!cartOpen)}>
              <Icon name="ShoppingCart" size={24} />
              <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="search-panel">
            <Icon name="Search" size={19} />
            <input autoFocus aria-label="Search products" placeholder="Search decor, cookware, dinnerware…" value={searchText} onChange={(event) => { setSearchText(event.target.value); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }} />
            <button className="search-close" onClick={() => { setSearchOpen(false); setSearchText(''); }} aria-label="Close search"><Icon name="X" size={18} /></button>
          </div>
        )}
        {cartOpen && (
          <div className="cart-popover">
            <div className="cart-popover-title">
              <h3>Your Shopping Bag</h3>
              <button className="icon-action" aria-label="Close cart" onClick={() => setCartOpen(false)}><Icon name="X" size={18} /></button>
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart"><Icon name="ShoppingBag" size={34} /><p>Your bag is waiting for something lovely.</p><button onClick={() => { setCartOpen(false); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore bestsellers</button></div>
            ) : (
              <>
                <div className="cart-lines">
                  {cart.map((item) => (
                    <div className="cart-line" key={item.id}>
                      <img src={item.image} alt="" />
                      <div className="cart-line-copy"><strong>{item.name}</strong><span>{formatPrice(item.price)} · Qty {item.quantity}</span></div>
                      <button aria-label={`Remove one ${item.name}`} onClick={() => setCart((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity - 1 } : entry).filter((entry) => entry.quantity > 0))}><Icon name="Minus" size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                <p className="cart-note">Shipping and taxes calculated at checkout.</p>
                <button className="cart-checkout" onClick={() => setAnnouncement('Checkout preview: your bag is ready. Online payment setup is the next step.')}>Continue to checkout <Icon name="ArrowRight" size={17} /></button>
              </>
            )}
          </div>
        )}
      </header>
      <main>
        {announcement && <div className="live-announcement" role="status">{announcement}<button onClick={() => setAnnouncement('')} aria-label="Dismiss notification"><Icon name="X" size={15} /></button></div>}
        <section className="hero" id="home">
          <img className="hero-image" src="/assets/hero.jpg" alt="Warm, thoughtfully styled living room with soft neutral furnishings" />
          <div className="hero-overlay" />
          <div className="hero-copy">
            <p className="hero-eyebrow"><span /> Stylish Homes <i>•</i> Happy Lives</p>
            <h1>Beautiful Homes<br />Start Here.</h1>
            <p className="hero-description">Premium Home Décor & Kitchen Essentials<br className="desktop-break" /> for a Better Tomorrow.</p>
            <a className="gold-button" href="#products">Shop Now <Icon name="ArrowRight" size={19} /></a>
            <div className="hero-proof"><span><Icon name="Sparkles" size={15} /> Thoughtfully curated</span><span><Icon name="Heart" size={15} /> Made for your home</span></div>
          </div>
          <div className="hero-script">Decor<br />Your Space<br />Live Better <span>♡</span></div>
          <div className="hero-pagination"><span className="pagination-active" /><span /><span /></div>
        </section>
        <section className="category-section" id="categories">
          <SectionHeading title="Shop by Category" subtitle="Explore our wide range of premium products for your home" />
          <div className="category-grid">
            {categories.map((category) => (
              <button className={`category-item ${activeCategory === category.target ? 'category-selected' : ''}`} key={category.target} onClick={() => { setActiveCategory(category.target); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <span className="category-image"><img src={category.image} alt="" loading="lazy" /><span className="category-arrow"><Icon name="ArrowUpRight" size={18} /></span></span>
                <strong>{category.name}</strong>
                <small>{category.subtitle}</small>
                <span className="view-all">View All <Icon name="ArrowRight" size={14} /></span>
              </button>
            ))}
          </div>
        </section>
        <section className="featured-section" id="products">
          <SectionHeading eyebrow="Curated for your everyday" title="Featured Products" subtitle="Handpicked for your home, loved by many" />
          <div className="product-toolbar">
            <div className="filter-tabs" aria-label="Filter products by category">
              <button className={activeCategory === 'all' ? 'filter-active' : ''} onClick={() => setActiveCategory('all')}>All picks</button>
              <button className={activeCategory === 'decor' ? 'filter-active' : ''} onClick={() => setActiveCategory('decor')}>Decor</button>
              <button className={activeCategory === 'cookware' ? 'filter-active' : ''} onClick={() => setActiveCategory('cookware')}>Cookware</button>
              <button className={activeCategory === 'storage' ? 'filter-active' : ''} onClick={() => setActiveCategory('storage')}>Storage</button>
              <button className={activeCategory === 'dinnerware' ? 'filter-active' : ''} onClick={() => setActiveCategory('dinnerware')}>Dinnerware</button>
              <button className={activeCategory === 'tools' ? 'filter-active' : ''} onClick={() => setActiveCategory('tools')}>Kitchen tools</button>
            </div>
            <span className="result-count">{filteredProducts.length} products</span>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} added={cart.some((item) => item.id === product.id)} />)}
            </div>
          ) : (
            <div className="no-products"><Icon name="SearchX" size={30} /><p>No products match that search yet.</p><button onClick={() => { setSearchText(''); setActiveCategory('all'); }}>Clear filters</button></div>
          )}
          <div className="all-products-wrap"><button className="outline-button" onClick={() => { setActiveCategory('all'); setSearchText(''); }}>Explore all products <Icon name="ArrowRight" size={17} /></button></div>
        </section>
        <section className="about-section" id="about">
          <div className="about-image"><img src="/assets/about.jpg" alt="A peaceful dining setting with natural textures and warm home accents" loading="lazy" /><div className="image-caption"><span>THE ART OF LIVING WELL</span><strong>Little details.<br />A lovely difference.</strong></div></div>
          <div className="about-copy">
            <p className="section-eyebrow">About Zikson Prime Enterprise</p>
            <h2>More Than Just Products.<br /><em>It’s a Lifestyle.</em></h2>
            <p>We bring you thoughtfully curated home décor and kitchen essentials that add style, comfort and function to everyday life. Our goal is to make your home more beautiful, organized and joyful—with quality you can trust.</p>
            <a className="gold-button gold-button-small" href="#values">Our Story <Icon name="ArrowRight" size={17} /></a>
            <div className="about-signature">Made for the moments that make a home.</div>
          </div>
          <div className="values-list" id="values">
            <div className="value-item"><span className="value-icon"><Icon name="Award" size={22} /></span><div><strong>Premium Quality</strong><p>Only the best for your home</p></div></div>
            <div className="value-item"><span className="value-icon"><Icon name="House" size={22} /></span><div><strong>Stylish & Modern Designs</strong><p>Timeless touches for every space</p></div></div>
            <div className="value-item"><span className="value-icon"><Icon name="BadgeIndianRupee" size={22} /></span><div><strong>Affordable Prices</strong><p>Beautiful finds, better value</p></div></div>
            <div className="value-item"><span className="value-icon"><Icon name="HeartHandshake" size={22} /></span><div><strong>Trusted with Care</strong><p>Here to help make it home</p></div></div>
          </div>
        </section>
        <section className="editorial-banners" id="decor">
          <a className="editorial-banner decor-banner" href="#products" onClick={() => setActiveCategory('decor')}>
            <img src="/assets/banner-decor.jpg" alt="" loading="lazy" />
            <span className="banner-shade" />
            <span className="banner-copy"><strong>Home Décor</strong><small>Add Beauty to Every Corner</small><span className="banner-button">Discover Decor <Icon name="ArrowRight" size={16} /></span></span>
          </a>
          <a className="editorial-banner kitchen-banner" href="#products" onClick={() => setActiveCategory('cookware')}>
            <img src="/assets/banner-kitchen.jpg" alt="" loading="lazy" />
            <span className="banner-shade" />
            <span className="banner-copy"><strong>Home & Kitchen</strong><small>Make Cooking a Joy</small><span className="banner-button">Shop Kitchen <Icon name="ArrowRight" size={16} /></span></span>
          </a>
        </section>
        <section className="newsletter-strip" id="contact">
          <div className="newsletter-intro"><span className="newsletter-icon"><Icon name="Mail" size={29} /></span><div><strong>Little joys, delivered.</strong><p>Get exclusive offers & updates</p></div></div>
          <p className="newsletter-note">Be the first to know about new arrivals, special discounts and more.</p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <label className="sr-only" htmlFor="newsletter-email">Your email address</label>
            <input id="newsletter-email" type="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <button type="submit">{subscribed ? 'Subscribed ✓' : 'Subscribe'}</button>
          </form>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand"><BrandMark compact /><p>Thoughtful details for<br />beautiful everyday living.</p><div className="footer-social"><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="Instagram" size={18} /></a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="Facebook" size={18} /></a><a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" aria-label="Pinterest"><Icon name="Pin" size={18} /></a></div></div>
          <div className="footer-column"><h3>Quick Links</h3><a href="#home">Home</a><a href="#products">Shop</a><a href="#decor">Home Décor</a><a href="#categories">Home & Kitchen</a><a href="#about">About Us</a><a href="#contact">Contact</a></div>
          <div className="footer-column"><h3>Customer Care</h3><a href="tel:+919411876338"><Icon name="Phone" size={15} /> +91 94118 76338</a><a href="mailto:ZiksonPrimeEnterprise@gmail.com"><Icon name="Mail" size={15} /> ZiksonPrimeEnterprise@gmail.com</a><a href="#contact"><Icon name="PackageSearch" size={15} /> Track Your Order</a><a href="#contact"><Icon name="CircleHelp" size={15} /> FAQs & Support</a></div>
          <div className="footer-promise"><span>Better Homes</span><span>Happier Lives</span><i>♡</i></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Zikson Prime Enterprise. All Rights Reserved.</span><div><a href="#home">Home</a><a href="#products">Shop</a><a href="#decor">Home Décor</a><a href="#categories">Home & Kitchen</a><a href="#about">Quality & Trust</a><a href="#contact">Contact</a></div></div>
      </footer>
      <style>{`
        .storefront { --ink: var(--foreground); --paper: var(--background); --gold: var(--primary); --gold-light: var(--highlight); --line: var(--border); overflow: clip; background: var(--paper); color: var(--ink); font-family: var(--font-sans); }
        .announcement-bar { background: #211f1c; color: #f9f5ed; font-size: 11px; letter-spacing: .01em; }
        .announcement-inner { min-height: 33px; max-width: 1440px; padding: 0 4%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
        .announcement-inner span { display: flex; align-items: center; gap: 7px; white-space: nowrap; }
        .announcement-center { opacity: .83; }
        .site-header { position: sticky; top: 0; z-index: 30; background: color-mix(in oklab, var(--background) 96%, transparent); backdrop-filter: blur(18px); border-bottom: 1px solid color-mix(in oklab, var(--border) 65%, transparent); }
        .header-main { min-height: 74px; max-width: 1440px; margin: auto; padding: 0 4%; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
        .brand-mark { display: inline-flex; align-items: center; gap: 9px; min-width: 220px; }
        .brand-emblem { position: relative; color: var(--primary); display: grid; place-items: center; width: 44px; height: 44px; }
        .brand-emblem:before { content: ''; position: absolute; width: 21px; height: 21px; border: 1px solid var(--highlight); border-radius: 50%; right: 0; top: 1px; }
        .brand-spark { position: absolute; color: var(--highlight); font-size: 13px; right: 4px; top: 5px; }
        .brand-wording { display: flex; flex-direction: column; align-items: flex-start; line-height: 1; }
        .brand-name { font-family: var(--font-heading); font-weight: 600; font-size: 29px; letter-spacing: .025em; }
        .brand-o { color: var(--primary); }
        .brand-caption { margin-top: 4px; font-size: 9px; letter-spacing: .26em; font-weight: 700; }
        .main-nav { display: flex; align-items: center; justify-content: center; gap: clamp(17px, 2.1vw, 34px); flex: 1; }
        .nav-link { height: 74px; display: inline-flex; align-items: center; position: relative; font-size: 12px; font-weight: 600; white-space: nowrap; transition: color .2s ease; }
        .nav-link:after { content: ''; position: absolute; height: 2px; bottom: 17px; left: 0; right: 100%; background: var(--highlight); transition: right .2s ease; }
        .nav-link:hover, .nav-link.active { color: var(--primary); }
        .nav-link:hover:after, .nav-link.active:after { right: 0; }
        .header-actions { display: flex; gap: clamp(10px, 1.5vw, 22px); align-items: center; }
        .icon-action { border: 0; background: transparent; color: var(--ink); cursor: pointer; padding: 7px; border-radius: 50%; display: inline-grid; place-items: center; position: relative; transition: color .18s ease, background .18s ease; }
        .icon-action:hover { background: var(--accent); color: var(--primary); }
        .cart-count { position: absolute; top: 0; right: -1px; min-width: 17px; height: 17px; padding: 0 4px; display: grid; place-items: center; border-radius: 99px; background: var(--highlight); color: var(--highlight-foreground); font-size: 10px; font-weight: 700; }
        .mobile-menu-toggle { display: none; }
        .search-panel { max-width: 1360px; margin: 0 auto; padding: 12px 4%; display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--line); }
        .search-panel input { flex: 1; border: none; outline: none; background: transparent; color: var(--ink); min-width: 0; padding: 7px; font-size: 13px; }
        .search-close { display: grid; place-items: center; padding: 7px; border: 0; background: transparent; cursor: pointer; color: var(--ink); }
        .cart-popover { position: absolute; right: max(4%, calc((100vw - 1320px) / 2)); top: calc(100% - 1px); width: min(400px, 94vw); padding: 22px; background: var(--card); border: 1px solid var(--line); box-shadow: 0 20px 45px #0002; z-index: 35; }
        .cart-popover-title { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid var(--line); }
        .cart-popover-title h3 { font: 600 21px var(--font-heading); margin: 0; }
        .empty-cart { padding: 25px 6px 8px; display: grid; place-items: center; text-align: center; gap: 12px; color: var(--muted-foreground); }
        .empty-cart p { margin: 0; font-size: 13px; }
        .empty-cart button { border: none; background: var(--primary); color: var(--primary-foreground); padding: 11px 18px; cursor: pointer; }
        .cart-lines { max-height: 330px; overflow: auto; }
        .cart-line { display: flex; gap: 11px; align-items: center; padding: 13px 0; border-bottom: 1px solid var(--line); }
        .cart-line img { width: 58px; height: 58px; object-fit: cover; }
        .cart-line-copy { display: flex; flex: 1; flex-direction: column; gap: 5px; min-width: 0; }
        .cart-line-copy strong { font-size: 12px; }
        .cart-line-copy span { color: var(--muted-foreground); font-size: 11px; }
        .cart-line > button { border: 1px solid var(--line); background: transparent; padding: 6px; cursor: pointer; }
        .cart-subtotal { display: flex; justify-content: space-between; padding-top: 18px; font-size: 14px; }
        .cart-note { font-size: 11px; color: var(--muted-foreground); }
        .cart-checkout { width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; background: var(--primary); color: var(--primary-foreground); border: 0; padding: 13px; cursor: pointer; font-weight: 600; font-size: 12px; }
        .live-announcement { position: fixed; top: 118px; right: 18px; max-width: min(420px, calc(100vw - 36px)); z-index: 60; padding: 13px 15px; display: flex; gap: 15px; align-items: center; background: var(--card); border: 1px solid var(--line); box-shadow: var(--shadow-soft); font-size: 13px; }
        .live-announcement button { border: none; background: transparent; cursor: pointer; display: grid; place-items: center; color: var(--muted-foreground); }
        .hero { position: relative; min-height: clamp(360px, 31vw, 490px); isolation: isolate; overflow: hidden; display: flex; align-items: center; background: #d8c3a4; }
        .hero-image { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 56%; }
        .hero-overlay { position: absolute; z-index: -1; inset: 0; background: linear-gradient(90deg, rgba(247,235,213,.96) 0%, rgba(247,235,213,.86) 29%, rgba(247,235,213,.28) 51%, rgba(30,23,16,.04) 100%); }
        .hero-copy { margin-left: max(7.8%, calc((100vw - 1320px) / 2)); padding: 45px 20px 46px 0; width: min(47%, 600px); position: relative; z-index: 1; color: #171410; }
        .hero-eyebrow { display: flex; align-items: center; gap: 10px; color: #81632e; font-size: 13px; letter-spacing: .015em; margin: 0 0 15px; }
        .hero-eyebrow > span { width: 21px; height: 1px; background: #98773b; }
        .hero-eyebrow i { font-style: normal; font-size: 9px; }
        .hero h1 { font-family: var(--font-heading); font-size: clamp(42px, 4.3vw, 67px); font-weight: 600; letter-spacing: -.04em; line-height: .99; margin: 0 0 17px; }
        .hero-description { font-size: clamp(14px, 1.2vw, 17px); line-height: 1.55; margin: 0 0 23px; }
        .gold-button { display: inline-flex; align-items: center; justify-content: center; gap: 14px; min-height: 44px; padding: 0 24px; background: var(--primary); color: var(--primary-foreground); border: 1px solid var(--primary); border-radius: 100px; font-weight: 700; font-size: 13px; transition: transform .2s, background .2s, box-shadow .2s; box-shadow: 0 5px 16px #5940181a; }
        .gold-button:hover { transform: translateY(-2px); background: color-mix(in oklab, var(--primary) 88%, black); box-shadow: 0 8px 18px #59401828; }
        .hero-proof { margin-top: 23px; display: flex; align-items: center; gap: 18px; font-size: 10px; color: #62513a; }
        .hero-proof span { display: flex; align-items: center; gap: 6px; }
        .hero-script { position: absolute; top: 13%; right: 7.5%; color: #fffaf1; font-family: var(--font-heading); font-style: italic; font-size: clamp(25px, 2.3vw, 35px); line-height: 1.14; transform: rotate(-7deg); text-shadow: 0 2px 15px #0005; }
        .hero-script span { display: block; text-align: center; font-size: 30px; }
        .hero-pagination { position: absolute; bottom: 18px; left: 50%; display: flex; gap: 7px; align-items: center; }
        .hero-pagination span { width: 6px; height: 6px; border-radius: 100px; background: #fff9; }
        .hero-pagination .pagination-active { width: 22px; background: var(--primary); }
        .category-section { padding: 37px 4% 31px; max-width: 1440px; margin: auto; }
        .section-heading { text-align: center; margin: 0 auto 26px; }
        .section-eyebrow { margin: 0 0 7px; color: var(--primary); text-transform: uppercase; letter-spacing: .14em; font-weight: 700; font-size: 9px; }
        .ornament-title { display: flex; justify-content: center; align-items: center; gap: 23px; }
        .ornament-title > span { width: 42px; height: 1px; background: var(--highlight); }
        .ornament-title h2 { font: 600 clamp(26px, 2.5vw, 35px)/1.15 var(--font-heading); margin: 0; letter-spacing: -.025em; }
        .section-subtitle { font-size: 12px; margin: 9px 0 0; color: var(--muted-foreground); }
        .category-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: clamp(12px, 2.8vw, 42px); max-width: 1210px; margin: 25px auto 0; }
        .category-item { display: flex; flex-direction: column; align-items: center; background: transparent; border: 0; padding: 0 0 4px; color: var(--ink); cursor: pointer; min-width: 0; }
        .category-image { position: relative; display: block; width: min(100%, 146px); aspect-ratio: 1; overflow: hidden; border-radius: 50%; background: var(--secondary); margin-bottom: 11px; transition: transform .25s ease, box-shadow .25s ease; }
        .category-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .category-item:hover .category-image, .category-selected .category-image { transform: translateY(-3px); box-shadow: 0 9px 25px #3d2b141d; }
        .category-item:hover .category-image img { transform: scale(1.07); }
        .category-arrow { position: absolute; right: 7px; bottom: 7px; display: grid; place-items: center; width: 29px; height: 29px; border-radius: 50%; background: var(--background); color: var(--primary); opacity: 0; transform: translateY(5px); transition: .2s ease; }
        .category-item:hover .category-arrow, .category-selected .category-arrow { opacity: 1; transform: translateY(0); }
        .category-item > strong { font-size: clamp(10px, .95vw, 13px); font-weight: 700; text-align: center; line-height: 1.3; }
        .category-item > small { font-size: 10px; color: var(--muted-foreground); margin-top: 4px; text-align: center; }
        .view-all { display: flex; align-items: center; gap: 4px; color: var(--primary); font-size: 11px; margin-top: 9px; }
        .featured-section { padding: 37px 4% 40px; background: color-mix(in oklab, var(--background) 68%, var(--secondary)); }
        .featured-section > .section-heading { margin-bottom: 20px; }
        .product-toolbar { max-width: 1320px; margin: 0 auto 17px; display: flex; justify-content: space-between; align-items: center; gap: 15px; }
        .filter-tabs { display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none; }
        .filter-tabs::-webkit-scrollbar { display: none; }
        .filter-tabs button { flex: 0 0 auto; border: 1px solid transparent; color: var(--muted-foreground); background: transparent; border-radius: 99px; font-size: 11px; padding: 8px 13px; cursor: pointer; transition: .2s; }
        .filter-tabs button:hover { background: var(--accent); color: var(--ink); }
        .filter-tabs button.filter-active { color: var(--primary-foreground); background: var(--primary); border-color: var(--primary); }
        .result-count { font-size: 10px; color: var(--muted-foreground); white-space: nowrap; }
        .products-grid { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 13px; }
        .product-card { min-width: 0; background: var(--card); border: 1px solid color-mix(in oklab, var(--border) 75%, transparent); border-radius: 7px; overflow: hidden; display: flex; flex-direction: column; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-soft); border-color: color-mix(in oklab, var(--highlight) 55%, var(--border)); }
        .product-image-wrap { position: relative; aspect-ratio: 1.13 / 1; overflow: hidden; background: var(--secondary); }
        .product-image-wrap > img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
        .product-card:hover .product-image-wrap > img { transform: scale(1.045); }
        .product-tag { position: absolute; top: 11px; left: 10px; border-radius: 99px; color: #fffaf1; background: #8f6c2d; padding: 5px 10px; font-size: 9px; font-weight: 700; }
        .product-tag.tag-new { background: #33835c; }
        .wishlist-button { position: absolute; top: 9px; right: 9px; background: #fffdf4ef; color: #514533; border: 0; border-radius: 50%; width: 30px; height: 30px; display: grid; place-items: center; cursor: pointer; opacity: 0; transform: translateY(3px); transition: .2s; }
        .product-card:hover .wishlist-button, .wishlist-button:focus-visible { opacity: 1; transform: translateY(0); }
        .wishlist-button.is-saved { color: #a94747; opacity: 1; }
        .wishlist-button.is-saved svg { fill: currentColor; }
        .product-info { display: flex; flex-direction: column; align-items: stretch; flex: 1; padding: 12px 12px 13px; }
        .product-kicker { color: var(--muted-foreground); font-size: 9px; margin: 0 0 5px; }
        .product-info h3 { font-size: 12px; line-height: 1.4; letter-spacing: -.01em; margin: 0; font-weight: 700; min-height: 34px; }
        .product-rating { margin-top: 8px; display: flex; align-items: center; gap: 6px; }
        .product-rating > span { letter-spacing: 1px; color: #a87b2b; font-size: 10px; }
        .product-rating small { font-size: 9px; color: var(--muted-foreground); }
        .product-pricing { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; margin: 9px 0 13px; }
        .product-pricing strong { font-size: 15px; color: var(--foreground); font-weight: 700; }
        .product-pricing del { color: var(--muted-foreground); font-size: 9px; }
        .product-pricing span { color: #357a50; font-size: 9px; font-weight: 600; }
        .add-cart-button { margin-top: auto; display: flex; align-items: center; justify-content: center; gap: 7px; border-radius: 4px; border: 1px solid var(--primary); background: var(--primary); color: var(--primary-foreground); padding: 10px 6px; min-height: 38px; font-size: 11px; font-weight: 700; cursor: pointer; transition: background .2s, color .2s; }
        .add-cart-button:hover { background: transparent; color: var(--primary); }
        .add-cart-button.added { background: #31784f; border-color: #31784f; color: white; }
        .no-products { display: grid; place-items: center; gap: 9px; padding: 45px 10px; color: var(--muted-foreground); }
        .no-products p { margin: 0; font-size: 13px; }
        .no-products button { border: 1px solid var(--line); background: transparent; color: var(--ink); cursor: pointer; padding: 9px 14px; }
        .all-products-wrap { text-align: center; margin-top: 25px; }
        .outline-button { display: inline-flex; align-items: center; gap: 12px; border: 1px solid var(--primary); color: var(--primary); background: transparent; border-radius: 99px; padding: 12px 24px; font-size: 12px; font-weight: 700; cursor: pointer; transition: .2s ease; }
        .outline-button:hover { background: var(--primary); color: var(--primary-foreground); }
        .about-section { max-width: 1440px; margin: 0 auto; padding: 0 4% 28px; display: grid; grid-template-columns: 1.14fr 1fr .75fr; align-items: stretch; gap: clamp(25px, 3vw, 45px); }
        .about-image { position: relative; min-height: 310px; overflow: hidden; }
        .about-image:after { content: ''; position: absolute; inset: 35% 0 0; background: linear-gradient(0deg, #171410a6, transparent); }
        .about-image > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .image-caption { position: absolute; z-index: 1; bottom: 22px; left: 23px; color: #fffaf1; display: flex; flex-direction: column; gap: 7px; }
        .image-caption span { font-size: 8px; letter-spacing: .19em; }
        .image-caption strong { font: 600 23px/1.12 var(--font-heading); }
        .about-copy { padding: 27px 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
        .about-copy h2 { font: 600 clamp(24px, 2.45vw, 34px)/1.14 var(--font-heading); letter-spacing: -.03em; margin: 2px 0 15px; }
        .about-copy h2 em { font-weight: 500; }
        .about-copy > p:not(.section-eyebrow) { font-size: 11px; line-height: 1.9; color: var(--muted-foreground); margin: 0 0 19px; max-width: 410px; }
        .gold-button-small { min-height: 37px; padding: 0 18px; font-size: 11px; }
        .about-signature { margin-top: 16px; font-family: var(--font-heading); font-size: 12px; font-style: italic; color: var(--primary); }
        .values-list { border-left: 1px solid var(--line); padding: 20px 0 20px 25px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
        .value-item { display: flex; align-items: center; gap: 13px; }
        .value-icon { width: 39px; height: 39px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid var(--highlight); border-radius: 50%; color: var(--primary); }
        .value-item strong { display: block; font-size: 11px; }
        .value-item p { margin: 3px 0 0; font-size: 10px; color: var(--muted-foreground); line-height: 1.45; }
        .editorial-banners { max-width: 1440px; margin: 0 auto; padding: 0 4% 25px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .editorial-banner { position: relative; display: block; min-height: clamp(130px, 12vw, 170px); border-radius: 10px; isolation: isolate; overflow: hidden; color: #fffaf1; }
        .editorial-banner > img { position: absolute; z-index: -2; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .editorial-banner:hover > img { transform: scale(1.04); }
        .banner-shade { position: absolute; z-index: -1; inset: 0; background: linear-gradient(90deg, #171410df 0%, #17141091 44%, #17141005 100%); }
        .banner-copy { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 20px 6.5%; }
        .banner-copy > strong { font: 600 clamp(22px, 2.4vw, 33px)/1.08 var(--font-heading); }
        .banner-copy > small { margin-top: 5px; font-size: 12px; }
        .banner-button { margin-top: 13px; display: inline-flex; align-items: center; gap: 9px; border-radius: 99px; background: var(--highlight); color: var(--highlight-foreground); padding: 9px 17px; font-size: 10px; font-weight: 700; }
        .newsletter-strip { background: #24221f; color: #f9f5ed; padding: 20px 4%; display: grid; grid-template-columns: auto minmax(170px, 1fr) minmax(290px, 1.1fr); align-items: center; gap: 24px; }
        .newsletter-intro { display: flex; align-items: center; gap: 12px; }
        .newsletter-icon { display: grid; place-items: center; color: #f9f5ed; }
        .newsletter-intro strong { display: block; font: 600 16px var(--font-heading); }
        .newsletter-intro p { margin: 4px 0 0; font-size: 10px; color: #d3cbbd; }
        .newsletter-note { margin: 0; font-size: 10px; color: #d3cbbd; line-height: 1.5; }
        .newsletter-form { display: flex; min-width: 0; }
        .newsletter-form input { min-width: 0; flex: 1; border: 1px solid #d8d1c6; background: #fffdf8; color: #29231a; padding: 12px 14px; font-size: 11px; border-radius: 4px 0 0 4px; }
        .newsletter-form button { border: 1px solid var(--highlight); background: var(--highlight); color: var(--highlight-foreground); padding: 0 18px; font-size: 11px; font-weight: 700; border-radius: 0 4px 4px 0; cursor: pointer; white-space: nowrap; }
        .site-footer { background: var(--background); }
        .footer-main { max-width: 1440px; margin: auto; padding: 29px 4% 27px; display: grid; grid-template-columns: 1.05fr .8fr 1.3fr .72fr; gap: 28px; }
        .brand-mark-compact { min-width: 0; gap: 6px; }
        .brand-mark-compact .brand-emblem { width: 34px; height: 36px; }
        .brand-mark-compact .brand-emblem svg { width: 29px; height: 29px; }
        .brand-mark-compact .brand-name { font-size: 23px; }
        .brand-mark-compact .brand-caption { font-size: 7px; letter-spacing: .2em; }
        .footer-brand > p { margin: 13px 0 15px; color: var(--muted-foreground); font-size: 10px; line-height: 1.65; }
        .footer-social { display: flex; gap: 9px; }
        .footer-social a { display: grid; place-items: center; width: 29px; height: 29px; border: 1px solid var(--line); border-radius: 50%; color: var(--primary); transition: .2s; }
        .footer-social a:hover { color: var(--primary-foreground); background: var(--primary); }
        .footer-column { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; border-left: 1px solid var(--line); padding-left: 24px; }
        .footer-column h3 { font-size: 11px; margin: 0 0 4px; }
        .footer-column > a { display: flex; align-items: center; gap: 7px; font-size: 10px; color: var(--muted-foreground); transition: color .2s; }
        .footer-column > a:hover { color: var(--primary); }
        .footer-column > a svg { color: var(--primary); flex: 0 0 auto; }
        .footer-promise { display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--primary); font: italic 19px/1.35 var(--font-heading); transform: rotate(-5deg); }
        .footer-promise i { font-size: 24px; font-style: normal; }
        .footer-bottom { background: #211f1c; color: #e5dfd5; padding: 13px 4%; display: flex; align-items: center; justify-content: space-between; gap: 20px; font-size: 9px; }
        .footer-bottom > div { display: flex; align-items: center; gap: 13px; }
        .footer-bottom > div a { border-right: 1px solid #665f55; padding-right: 13px; }
        .footer-bottom > div a:last-child { border: 0; padding-right: 0; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (min-width: 1441px) { .hero-copy { margin-left: calc((100vw - 1215px) / 2); } }
        @media (max-width: 1100px) {
          .header-main { gap: 14px; }
          .brand-mark { min-width: 190px; }
          .brand-name { font-size: 25px; }
          .main-nav { gap: 14px; }
          .nav-link { font-size: 11px; }
          .account-action { display: none; }
          .products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .product-image-wrap { aspect-ratio: 1.25 / 1; }
          .about-section { grid-template-columns: 1fr 1fr; }
          .values-list { grid-column: 1 / -1; border-left: 0; border-top: 1px solid var(--line); padding: 20px 0 0; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }
          .value-item { align-items: flex-start; gap: 9px; }
          .value-icon { width: 34px; height: 34px; }
          .newsletter-strip { grid-template-columns: 1fr 1.2fr; }
          .newsletter-note { display: none; }
        }
        @media (max-width: 760px) {
          .announcement-inner { padding: 8px 4%; justify-content: center; min-height: 32px; }
          .announcement-inner span { font-size: 9px; }
          .announcement-center, .announcement-inner span:nth-last-child(-n+2) { display: none; }
          .header-main { min-height: 66px; padding: 0 4%; gap: 8px; }
          .mobile-menu-toggle { display: inline-grid; padding-left: 0; }
          .brand-mark { min-width: 0; gap: 5px; }
          .brand-emblem { width: 34px; height: 36px; }
          .brand-emblem svg { width: 29px; height: 29px; }
          .brand-name { font-size: 23px; }
          .brand-caption { font-size: 7px; letter-spacing: .18em; }
          .main-nav { display: none; position: absolute; left: 0; right: 0; top: 100%; background: var(--background); padding: 9px 5% 16px; border-bottom: 1px solid var(--line); box-shadow: 0 15px 25px #0000000c; align-items: stretch; flex-direction: column; gap: 0; }
          .main-nav.nav-open { display: flex; }
          .nav-link { height: auto; padding: 12px 5px; font-size: 13px; }
          .nav-link:after { display: none; }
          .header-actions { gap: 3px; }
          .header-actions .icon-action { padding: 6px; }
          .header-actions svg { width: 20px; height: 20px; }
          .cart-count { top: -1px; right: -1px; }
          .hero { min-height: 440px; align-items: flex-end; }
          .hero-image { object-position: 61% center; }
          .hero-overlay { background: linear-gradient(0deg, rgba(247,235,213,.98) 0%, rgba(247,235,213,.94) 31%, rgba(247,235,213,.48) 58%, rgba(247,235,213,.02) 100%); }
          .hero-copy { margin: 0; width: 100%; padding: 35px 6% 47px; }
          .hero h1 { font-size: clamp(41px, 11vw, 56px); }
          .hero-script { top: 10%; right: 6%; font-size: 24px; }
          .hero-proof { gap: 12px; font-size: 9px; }
          .hero-pagination { left: auto; right: 6%; bottom: 19px; }
          .category-section { padding: 29px 4% 23px; }
          .section-heading { margin-bottom: 20px; }
          .ornament-title { gap: 12px; }
          .ornament-title > span { width: 23px; }
          .ornament-title h2 { font-size: 27px; }
          .section-subtitle { max-width: 330px; margin: 8px auto 0; line-height: 1.55; font-size: 11px; }
          .category-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px 12px; margin-top: 19px; }
          .category-image { width: min(100%, 118px); margin-bottom: 9px; }
          .category-item > strong { font-size: 11px; }
          .category-item > small { display: none; }
          .view-all { margin-top: 6px; font-size: 10px; }
          .featured-section { padding: 29px 4% 31px; }
          .product-toolbar { align-items: flex-start; flex-direction: column; margin-bottom: 14px; }
          .filter-tabs { width: 100%; }
          .filter-tabs button { padding: 8px 12px; }
          .result-count { align-self: flex-end; margin-top: -5px; }
          .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .product-image-wrap { aspect-ratio: 1 / .98; }
          .product-info { padding: 10px 9px 10px; }
          .product-info h3 { font-size: 11px; min-height: 31px; }
          .product-pricing { gap: 5px; margin: 8px 0 10px; }
          .product-pricing strong { font-size: 14px; }
          .product-pricing del, .product-pricing span { font-size: 8px; }
          .product-kicker { font-size: 8px; }
          .add-cart-button { min-height: 36px; font-size: 10px; }
          .wishlist-button { opacity: 1; transform: none; width: 27px; height: 27px; }
          .about-section { padding: 0 4% 25px; display: flex; flex-direction: column; gap: 0; }
          .about-image { min-height: 250px; }
          .about-copy { padding: 23px 0 19px; }
          .about-copy h2 { font-size: 30px; }
          .about-copy > p:not(.section-eyebrow) { font-size: 12px; }
          .values-list { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px 12px; padding-top: 18px; margin-top: 3px; }
          .value-item { gap: 8px; }
          .value-item strong { font-size: 10px; line-height: 1.35; }
          .value-item p { font-size: 9px; }
          .editorial-banners { grid-template-columns: 1fr; gap: 11px; padding: 0 4% 24px; }
          .editorial-banner { min-height: 150px; }
          .banner-copy > strong { font-size: 28px; }
          .newsletter-strip { padding: 20px 4%; grid-template-columns: 1fr; gap: 14px; }
          .newsletter-intro strong { font-size: 18px; }
          .newsletter-note { display: block; }
          .newsletter-form input { font-size: 12px; }
          .footer-main { padding: 25px 5%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px 15px; }
          .footer-column { padding-left: 13px; gap: 9px; }
          .footer-brand { padding-right: 3px; }
          .footer-promise { min-height: 100px; font-size: 18px; }
          .footer-bottom { flex-direction: column; align-items: flex-start; gap: 11px; line-height: 1.5; }
          .footer-bottom > div { flex-wrap: wrap; gap: 8px; }
          .footer-bottom > div a { padding-right: 8px; }
          .live-announcement { top: 81px; }
        }
        @media (max-width: 370px) {
          .brand-emblem { display: none; }
          .brand-mark { flex: 1; }
          .header-actions { gap: 0; }
          .hero-proof span:last-child { display: none; }
          .product-pricing { align-items: flex-start; }
          .product-pricing span { flex-basis: 100%; }
          .values-list { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
        }
      `}</style>
    </div>
  );
}