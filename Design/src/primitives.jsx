/* Primitive components used everywhere */

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

function fmtTk(n) {
  return '৳' + n.toLocaleString('en-IN');
}

function Stars({ value = 5, size = 12 }) {
  const full = Math.round(value);
  return (
    <span className="stars" style={{ fontSize: size, letterSpacing: '1px' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

const SAMPLE_IMAGES = {
  1:  'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&q=75&auto=format&fit=crop', // rubber duck bath
  2:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75&auto=format&fit=crop', // rc / vehicle
  3:  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=75&auto=format&fit=crop', // wooden stacker
  4:  'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=800&q=75&auto=format&fit=crop', // plush bear
  5:  'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=75&auto=format&fit=crop', // baby bath dinos
  6:  'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=75&auto=format&fit=crop', // stationery / crayons
  7:  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=75&auto=format&fit=crop', // puzzles
  8:  'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=800&q=75&auto=format&fit=crop', // teddy cream
  9:  'https://images.unsplash.com/photo-1560785496-3c9d27877182?w=800&q=75&auto=format&fit=crop', // backpack / school
  10: 'https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=800&q=75&auto=format&fit=crop', // wooden blocks
  11: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=75&auto=format&fit=crop', // diecast red car
  12: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=75&auto=format&fit=crop', // dinosaur figures
};

function Placeholder({ variant = 1, label, rounded = true, shape = true }) {
  const src = SAMPLE_IMAGES[variant] || SAMPLE_IMAGES[1];
  return (
    <div className={`ph-${variant}`} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img
        src={src}
        alt={label || ''}
        loading="lazy"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {label && <div className="ph-label">{label}</div>}
    </div>
  );
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: 'M11 19a8 8 0 1 1 5.3-14 8 8 0 0 1-5.3 14Zm10 2-4.35-4.35',
    heart: 'M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z',
    bag: 'M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
    close: 'M6 6l12 12M18 6 6 18',
    menu: 'M4 7h16M4 12h16M4 17h16',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    check: 'M5 12l5 5L20 7',
    chevronRight: 'm9 6 6 6-6 6',
    chevronDown: 'm6 9 6 6 6-6',
    chevronLeft: 'm15 6-6 6 6 6',
    truck: 'M3 7h10v10H3V7Zm10 3h4l3 3v4h-7M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    arrowRight: 'M5 12h14m-6-6 6 6-6 6',
    arrowUp: 'M12 19V5m-6 6 6-6 6 6',
    sparkle: 'M12 4l1.5 5 5 1.5-5 1.5L12 17l-1.5-5-5-1.5 5-1.5L12 4Z',
    gift: 'M4 10h16v10H4V10Zm2-4h12v4H6V6Zm6 0v14M9 6a2 2 0 1 1 3-2 2 2 0 1 1 3 2H9Z',
    shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z',
    package: 'M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10',
    star: 'M12 3l2.8 6 6.2.9-4.5 4.4 1 6.3L12 17.8l-5.5 2.8 1-6.3L3 9.9l6.2-.9L12 3Z',
    facebook: 'M13 22v-9h3l.5-4H13V7c0-1 .3-2 2-2h2V2l-2.8-.2C11 1.8 9 3 9 6.5V9H6v4h3v9h4Z',
    instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5-1h.01',
    mail: 'M4 6h16v12H4V6Zm0 0 8 7 8-7',
    pin: 'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    filter: 'M4 6h16M7 12h10m-6 6h2',
    grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
    list: 'M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] && <path d={paths[name]} />}
    </svg>
  );
}

function ProductCard({ product, onOpen }) {
  const { cart, toggleWish, wish } = useStore();
  const off = product.was ? Math.round((1 - product.price / product.was) * 100) : 0;
  const isWished = wish.includes(product.id);
  return (
    <div className="pcard" onClick={() => onOpen && onOpen(product)}>
      <div className="pcard-img">
        <Placeholder variant={product.img} label={product.brand} />
        <div className="pcard-badges">
          {product.badge === 'sale' && <span className="pbadge sale">−{off}%</span>}
          {product.badge === 'new' && <span className="pbadge new">New</span>}
          {product.stock < 5 && <span className="pbadge low">Low stock</span>}
        </div>
        <button className={`pcard-wish ${isWished ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}>
          <Icon name="heart" size={16} />
        </button>
      </div>
      <div className="pcard-body">
        <div className="pcard-meta">{product.brand} · {product.age?.replace('age-', '')} yrs</div>
        <h4 className="pcard-name">{product.name}</h4>
        <div className="pcard-price">
          <span className="now">{fmtTk(product.price)}</span>
          {product.was && <span className="was">{fmtTk(product.was)}</span>}
          {off > 0 && <span className="pct">SAVE {off}%</span>}
        </div>
        <div className="pcard-rating">
          <Stars value={product.rating} />
          <span>({product.reviews})</span>
        </div>
        <button className="pcard-add" onClick={(e) => { e.stopPropagation(); cart.add(product); }}>
          <Icon name="plus" size={13} /> Add to bag
        </button>
      </div>
    </div>
  );
}

window.SKUI = { fmtTk, Stars, Placeholder, Icon, ProductCard };
window.fmtTk = fmtTk;
