export const icon = (name, cls='') => {
  const paths = {
    search:'<circle cx="11" cy="11" r="6.7"/><path d="m16 16 4 4"/>',
    sliders:'<path d="M4 7h10M17 7h3M4 17h3M10 17h10"/><circle cx="15.5" cy="7" r="1.8"/><circle cx="8.5" cy="17" r="1.8"/>',
    bookmark:'<path d="M7 4.5h10v15l-5-3-5 3z"/>',
    link:'<path d="M9.5 14.5 14.5 9.5M8 17H6.5a4.5 4.5 0 0 1 0-9H9M16 7h1.5a4.5 4.5 0 1 1 0 9H15"/>',
    code:'<path d="m9 6-5 6 5 6M15 6l5 6-5 6"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.7 9.2a2.6 2.6 0 1 1 3.7 2.35c-1 .55-1.4 1-1.4 2M12 17h.01"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.8 8.6 8.8 12s1 6.2 3.2 8.5"/>',
    arrowUp:'<path d="M5 15 10 10l3 3 6-7M14 6h5v5"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    gift:'<path d="M4 10h16v10H4zM3 7h18v4H3zM12 7v13M8.7 7C6 7 5 5.8 5 4.7S6 3 7.1 3c2 0 3.4 2.4 4.9 4M15.3 7C18 7 19 5.8 19 4.7S18 3 16.9 3c-2 0-3.4 2.4-4.9 4"/>',
    swap:'<path d="M6 8h12l-3-3M18 16H6l3 3"/>',
    settings:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||''}</svg>`;
};

export function thumb(kind, size='md') {
  const art = {
    jesus:'<path d="M7 14c3-2 5-3 10-1M12 4c-3 0-5 2-5 5 0 2 1 3 2 4h6c1-1 2-2 2-4 0-3-2-5-5-5Z"/><path d="M8 20c.5-4 2-6 4-6s3.5 2 4 6"/>',
    sea:'<path d="M3 8c4 2 6-2 10 0s6-2 8 0M3 13c4 2 6-2 10 0s6-2 8 0M3 18c4 2 6-2 10 0s6-2 8 0"/><path d="M12 3v18"/>',
    tomb:'<path d="M5 19V11a7 7 0 0 1 14 0v8M9 19v-7a3 3 0 0 1 6 0v7"/><circle cx="17" cy="16" r="3"/>',
    david:'<path d="M5 18c3-5 5-7 7-7s4 2 7 7M12 11V5M9 7l3-2 3 2"/><circle cx="18" cy="5" r="1.5"/>',
    paul:'<path d="M5 19c1-5 3-7 7-7s6 2 7 7M8 7a4 4 0 1 0 8 0M4 4l16 16"/>',
    revelation:'<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/><path d="M16 3l2 2 2-2"/>',
    jonah:'<path d="M3 12c3-4 8-5 12-2l5-3-1 5 1 5-5-3c-4 3-9 2-12-2Z"/><circle cx="7" cy="11" r=".8"/>',
    lazarus:'<path d="M5 20V8l7-5 7 5v12M8 20v-8h8v8"/><path d="m9 12 6 6M15 12l-6 6"/>',
    water:'<path d="M3 17c3-2 5 2 8 0s5 2 10 0M12 4v9M9 7l3-3 3 3"/>',
    mountain:'<path d="m3 20 7-12 4 6 2-3 5 9zM10 8l2-4 2 4"/>',
    walls:'<path d="M4 20V8h4v3h4V8h4v3h4v9zM8 14h8M12 11v9"/>',
    armor:'<path d="M7 4h10l2 5-3 2v9H8v-9L5 9zM9 4l3 4 3-4"/>'
  };
  return `<span class="market-thumb market-thumb-${size} thumb-${kind}"><svg viewBox="0 0 24 24">${art[kind]||art.jesus}</svg></span>`;
}
