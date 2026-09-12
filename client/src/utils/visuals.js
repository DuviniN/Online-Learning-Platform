// Deterministic decorative visuals (thumbnail gradients, avatar initials) —
// purely presentational, derived from real course/user data, never fabricated stats.

const GRADIENTS = [
  ['#f97316', '#fb7185'],
  ['#6366f1', '#8b5cf6'],
  ['#06b6d4', '#3b82f6'],
  ['#10b981', '#14b8a6'],
  ['#f59e0b', '#ef4444'],
  ['#8b5cf6', '#ec4899'],
  ['#0ea5e9', '#22d3ee'],
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function gradientFor(seed) {
  const [from, to] = GRADIENTS[hashString(seed || 'course') % GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// A small hand-picked pool of real, verified education photos (Unsplash) —
// students studying, libraries, lecture halls, graduation, books — chosen by
// eye rather than blind tag search, so every photo reliably reads as
// "learning platform" instead of a random unrelated match.
const EDUCATION_PHOTOS = [
  '1741699428220-65f37f3fbbcb', // student browsing library shelves
  '1752920299211-28be8c9b0121', // warm-lit library interior
  '1541339907198-e08756dedf3f', // graduation cap toss
  '1606761568499-6d2451b23c66', // instructor presenting to a class
  '1541829070764-84a7d30dd3f3', // lecture hall
  '1456513080510-7bf3a84b82f8', // writing notes beside an open book and laptop
  '1523240795612-9a054b0db644', // students studying together outdoors
  '1565598611425-45b0878bdd0b', // students at a library bookshelf
];

// Deterministic real photo (same title always gets the same image), picked
// from the verified education pool above.
export function photoUrlFor(seed, width = 600, height = 400) {
  const hash = hashString(seed || 'course');
  const photoId = EDUCATION_PHOTOS[hash % EDUCATION_PHOTOS.length];
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
}

export function initialsFor(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const day = 86400000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
