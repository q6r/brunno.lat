/**
 * Converts a country display name (as returned by the Last.fm API, e.g. "Spain")
 * into a lowercase ISO 3166-1 alpha-2 code (e.g. "es"), used to build a flag URL.
 *
 * No hardcoded country list: the name→code index is built at module load by
 * asking `Intl.DisplayNames` for the English name of every AA–ZZ code and keeping
 * the valid ones. A few Last.fm aliases that diverge from Intl names are mapped.
 */

const NAME_TO_CODE: Map<string, string> = buildIndex();

function buildIndex(): Map<string, string> {
  const map = new Map<string, string>();
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    for (let i = 65; i <= 90; i++) {
      for (let j = 65; j <= 90; j++) {
        const code = String.fromCharCode(i) + String.fromCharCode(j);
        let name: string | undefined;
        try {
          name = dn.of(code);
        } catch {
          continue;
        }
        if (name && name !== code) {
          map.set(name.toLowerCase(), code.toLowerCase());
        }
      }
    }
  } catch {
    /* Intl.DisplayNames unsupported — countryToCode just returns null */
  }
  return map;
}

const ALIASES: Record<string, string> = {
  "united states of america": "us",
  usa: "us",
  uk: "gb",
  "russian federation": "ru",
  russia: "ru",
  "south korea": "kr",
  "north korea": "kp",
  vietnam: "vn",
  "czech republic": "cz",
  "ivory coast": "ci",
  "the netherlands": "nl",
  "bolivia, plurinational state of": "bo",
  "venezuela, bolivarian republic of": "ve",
  "iran, islamic republic of": "ir",
  "tanzania, united republic of": "tz",
  "syrian arab republic": "sy",
  "viet nam": "vn",
  taiwan: "tw",
};

export function countryToCode(
  name: string | null | undefined
): string | null {
  if (!name) return null;
  const n = name.trim().toLowerCase();
  if (!n || n === "none") return null;
  return NAME_TO_CODE.get(n) ?? ALIASES[n] ?? null;
}

export function flagUrl(code: string | null): string | null {
  if (!code) return null;
  return `https://flagcdn.com/h40/${code}.png`;
}
