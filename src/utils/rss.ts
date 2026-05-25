const RSS_URL = 'https://rss.libsyn.com/shows/221804/destinations/1618760.xml';

export interface Episode {
  guid: string;
  slug: string;        // URL-safe, derived from guid
  title: string;       // full original title
  guestName: string;   // extracted from title
  guestTitle: string;  // job title extracted from title
  description: string;
  audioUrl: string;
  artworkUrl: string;
  duration: string;    // "38:31"
  season: number;
  episodeNumber: number;
  pubDate: string;     // ISO date string
  libsynUrl: string;
}

export interface ShowInfo {
  title: string;
  description: string;
  imageUrl: string;
}

// ---------------------------------------------------------------------------
// Low-level XML helpers (no external libs)
// ---------------------------------------------------------------------------

/**
 * Returns the text content of the FIRST occurrence of <tag>...</tag>.
 * Handles both plain tags and namespaced tags like <itunes:duration>.
 */
function getText(xml: string, tag: string): string {
  // Escape special regex characters in the tag name (e.g. "itunes:duration")
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return decodeCData(m[1].trim());
}

/**
 * Returns the value of `attr` from the first occurrence of <tag ...attr="value"...>.
 */
function getAttr(xml: string, tag: string, attr: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${escaped}[^>]*\\s${escapedAttr}\\s*=\\s*["']([^"']*)["'][^>]*>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

/**
 * Unwrap CDATA sections and decode basic HTML entities.
 */
function decodeCData(str: string): string {
  // Strip CDATA wrappers
  str = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  // Decode common HTML entities
  str = str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  return str.trim();
}

/**
 * Strip HTML tags from a string (for plain-text descriptions).
 */
function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Split the full XML document into individual <item>...</item> blocks.
 */
function splitItems(xml: string): string[] {
  const items: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    items.push(m[1]);
  }
  return items;
}

// ---------------------------------------------------------------------------
// Title parser
// ---------------------------------------------------------------------------

function parseSeasonEpisodeFromTitle(title: string): { season: number; episodeNumber: number } {
  const m = title.match(/^Season\s+(\d+)\s+Episode\s+(\d+)/i);
  if (m) return { season: parseInt(m[1], 10), episodeNumber: parseInt(m[2], 10) };
  return { season: 0, episodeNumber: 0 };
}

function parseTitle(full: string): { guestName: string; guestTitle: string } {
  // Full title example: "Season 5 Episode 5 | Sabine Fell-Douglas – Director of Business Operations"
  const pipeIdx = full.indexOf(' | ');
  if (pipeIdx === -1) {
    // No pipe — use the whole title as guest name
    return { guestName: full.trim(), guestTitle: '' };
  }
  const afterPipe = full.slice(pipeIdx + 3).trim();

  // Try em-dash with spaces first, then regular hyphen with spaces
  const emDash = ' – '; // en-dash (–)
  const emDash2 = ' — '; // em-dash (—)
  const hyphen = ' - ';

  for (const sep of [emDash, emDash2, hyphen]) {
    const sepIdx = afterPipe.indexOf(sep);
    if (sepIdx !== -1) {
      return {
        guestName: afterPipe.slice(0, sepIdx).trim(),
        guestTitle: afterPipe.slice(sepIdx + sep.length).trim(),
      };
    }
  }

  // No separator found after pipe
  return { guestName: afterPipe, guestTitle: '' };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let _cachedEpisodes: Episode[] | null = null;
let _cachedShowInfo: ShowInfo | null = null;

async function fetchXml(): Promise<string> {
  const res = await fetch(RSS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch RSS feed: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export async function getEpisodes(): Promise<Episode[]> {
  if (_cachedEpisodes) return _cachedEpisodes;

  const xml = await fetchXml();
  const itemBlocks = splitItems(xml);

  const episodes: Episode[] = itemBlocks.map((item): Episode => {
    const guid = getText(item, 'guid') || getText(item, 'id');
    const title = getText(item, 'title');
    const pubDateRaw = getText(item, 'pubDate');
    const description = stripHtml(
      getText(item, 'content:encoded') || getText(item, 'description')
    );
    const duration = getText(item, 'itunes:duration');
    const seasonRaw = getText(item, 'itunes:season');
    const episodeRaw = getText(item, 'itunes:episode');
    const artworkUrl = getAttr(item, 'itunes:image', 'href');
    const audioUrl = getAttr(item, 'enclosure', 'url');
    const libsynUrl = getText(item, 'link');

    const { guestName, guestTitle } = parseTitle(title);
    const fromTitle = parseSeasonEpisodeFromTitle(title);

    // Parse pubDate to ISO string
    let pubDate = '';
    try {
      pubDate = new Date(pubDateRaw).toISOString();
    } catch {
      pubDate = pubDateRaw;
    }

    return {
      guid,
      slug: guid, // UUID is already URL-safe
      title,
      guestName,
      guestTitle,
      description,
      audioUrl,
      artworkUrl,
      duration,
      season: fromTitle.season || parseInt(seasonRaw, 10) || 0,
      episodeNumber: fromTitle.episodeNumber || parseInt(episodeRaw, 10) || 0,
      pubDate,
      libsynUrl,
    };
  });

  // Sort: most recent first
  episodes.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });

  _cachedEpisodes = episodes;
  return episodes;
}

export async function getShowInfo(): Promise<ShowInfo> {
  if (_cachedShowInfo) return _cachedShowInfo;

  const xml = await fetchXml();

  // Extract channel-level info (before the first <item>)
  const channelMatch = xml.match(/<channel>([\s\S]*?)<item>/i);
  const channelBlock = channelMatch ? channelMatch[1] : xml;

  const title = getText(channelBlock, 'title');
  const description = stripHtml(getText(channelBlock, 'description'));

  // Channel image URL can be in <image><url>...</url></image> or <itunes:image href="...">
  let imageUrl = '';
  const imageBlockMatch = channelBlock.match(/<image>([\s\S]*?)<\/image>/i);
  if (imageBlockMatch) {
    imageUrl = getText(imageBlockMatch[1], 'url');
  }
  if (!imageUrl) {
    imageUrl = getAttr(channelBlock, 'itunes:image', 'href');
  }

  _cachedShowInfo = { title, description, imageUrl };
  return _cachedShowInfo;
}
