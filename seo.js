const organizationStructuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'INKNOVIO',
  url: 'https://inknovio.com/',
  logo: 'https://inknovio.com/assets/inknovio-logo.jpeg',
  image: 'https://inknovio.com/assets/inknovio-logo.jpeg',
  sameAs: ['https://www.linkedin.com/company/inknoviotech/home/']
});

module.exports = [
  '<title>INKNOVIO TECH | AI Creative Production for DTC &amp; E-Commerce</title>',
  '<meta name="description" content="INKNOVIO creates high-converting AI UGC ad creatives for DTC and e-commerce brands, including video ads, avatars, scripts, hooks, and creative testing assets.">',
  '<meta name="robots" content="index, follow, max-image-preview:large">',
  '<meta name="theme-color" content="#10131c">',
  '<link rel="icon" href="/favicon.png?v=inknovio-logo-v2" type="image/png" sizes="480x480">',
  '<link rel="icon" href="/favicon.ico?v=inknovio-logo-v2" type="image/x-icon" sizes="48x48">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=inknovio-logo-v2" sizes="180x180">',
  '<link rel="canonical" href="https://inknovio.com/">',
  '<meta property="og:type" content="website">',
  '<meta property="og:site_name" content="INKNOVIO TECH">',
  '<meta property="og:title" content="INKNOVIO TECH | AI Creative Production for DTC &amp; E-Commerce">',
  '<meta property="og:description" content="High-converting AI UGC ad creatives for DTC and e-commerce brands.">',
  '<meta property="og:url" content="https://inknovio.com/">',
  '<meta property="og:image" content="https://inknovio.com/assets/inknovio-logo.jpeg">',
  '<meta property="og:image:alt" content="INKNOVIO TECH AI creative production">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="INKNOVIO TECH | AI Creative Production for DTC &amp; E-Commerce">',
  '<meta name="twitter:description" content="High-converting AI UGC ad creatives for DTC and e-commerce brands.">',
  '<meta name="twitter:image" content="https://inknovio.com/assets/inknovio-logo.jpeg">',
  `<script type="application/ld+json">${organizationStructuredData}</script>`
].join('');
