export type LocalizedText =
  | string
  | {
      en?: string | null;
      sv?: string | null;
    }
  | null
  | undefined;

export type VisitStockholmCategory = {
  title?: string | null;
  slug?: string | null;
  subcategories?: VisitStockholmCategory[];
};

export type VisitStockholmEvent = {
  id?: string;
  title?: LocalizedText;
  description?: LocalizedText;
  external_website_url?: string | null;
  url?: string | null;
  address?: string | null;
  venue_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  categories?: VisitStockholmCategory[];
};

export type StockholmEventSelectionType =
  | "featured"
  | "recommended"
  | "wildcard";

export type StockholmEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category?: string;
  description?: string;
  selectionType: StockholmEventSelectionType;
  url?: string;
};

export type StockholmEventsPeriod = {
  startDate: string;
  endDate: string;
};

export type StockholmEventsResponse = {
  events: StockholmEvent[];
  fetchedAt: string;
  message: string;
  period: StockholmEventsPeriod;
  source: "visit-stockholm";
  status: "live";
  updatedAt: string;
};

type RankedStockholmEvent = Omit<StockholmEvent, "selectionType"> & {
  categorySlugs: string[];
  hasTime: boolean;
  primaryCategorySlug: string;
  relevanceScore: number;
  selectionType?: StockholmEventSelectionType;
};

type ContextualCategoryRule = {
  slugs: string[];
  keywords: RegExp;
  score: number;
  titleOnly?: boolean;
};

const dayMs = 24 * 60 * 60 * 1000;
const defaultMaxEvents = 5;
const majorVenueNames = [
  "Avicii Arena",
  "Strawberry Arena",
  "3Arena",
  "Annexet",
  "Cirkus",
  "Gröna Lund",
  "Konserthuset",
  "Berns",
  "Nalen",
  "Debaser",
  "Fållan",
  "Slaktkyrkan",
  "Stockholm Waterfront",
];

const popularCategoryScores = new Map<string, number>([
  ["clubs-parties", 32],
  ["music", 26],
  ["festivals", 26],
  ["gaming-boardgames", 24],
  ["eat-drink", 22],
  ["sports", 20],
  ["stage-film", 18],
  ["fairs", 16],
  ["networking-community", 14],
  ["exhibitions", 8],
  ["guided-tours", 8],
]);

const contextualCategoryRules: ContextualCategoryRule[] = [
  {
    slugs: ["eat-drink"],
    keywords:
      /mat|food|drink|bar|pub|öl|beer|vin|wine|cocktail|skål|sprit|absolut|saluhall/iu,
    score: 20,
    titleOnly: true,
  },
  {
    slugs: ["networking-community", "stage-film"],
    keywords:
      /standup|stand-up|komedi|comedy|quiz|spel|gaming|måla|skåla|keramik|drejning|bookclub|dj|klubb|club|party|fest|dans|dance/iu,
    score: 24,
  },
  {
    slugs: ["guided-tours", "sports"],
    keywords:
      /kajak|kanot|sauna|bastu|kallbad|yoga|swimrun|workout|träning|löpning|running|cykel|bike/iu,
    score: 18,
  },
  {
    slugs: ["fairs"],
    keywords:
      /marknad|market|loppis|flea|mat|food|drink|bar|öl|beer|vin|wine|quiz|spel|gaming/iu,
    score: 20,
  },
  {
    slugs: ["exhibitions"],
    keywords: /spel|gaming|immersive|mode|fashion|foto|photo|sprit|absolut/iu,
    score: 12,
  },
];

const quietCultureKeywords = /balett|ballet|opera/iu;
const wildcardKeywords =
  /marknad|market|loppis|flea|workshop|popup|pop-up|utomhus|outdoor|standup|stand-up|komedi|comedy|quiz|spel|gaming|keramik|drejning|måla|skåla|kajak|kanot|bastu|kallbad|bookclub|gratis|free|cykel|bike|saluhall|food hall|immersive|rave|magishow|magic|karaoke/iu;

export function buildStockholmEventsResponse(
  visitStockholmEvents: VisitStockholmEvent[],
  maxEvents = defaultMaxEvents,
  now = new Date(),
): StockholmEventsResponse {
  const period = getCurrentWeekPeriod(now);
  const rankedEvents = visitStockholmEvents
    .map(normalizeEvent)
    .filter((event): event is RankedStockholmEvent => event !== null)
    .filter((event) => eventOverlapsPeriod(event, period))
    .filter((event) => !hasEventPassed(event, now));

  const events = selectEvents(rankedEvents, period, maxEvents);
  const fetchedAt = now.toISOString();

  return {
    events,
    fetchedAt,
    message: "Aktuella events från Visit Stockholm.",
    period,
    source: "visit-stockholm",
    status: "live",
    updatedAt: fetchedAt,
  };
}

function normalizeEvent(event: VisitStockholmEvent): RankedStockholmEvent | null {
  if (!event.id || !event.start_date) {
    return null;
  }

  const title = pickLocalizedText(event.title);
  if (!title) {
    return null;
  }

  const category = event.categories?.find((item) => item.title)?.title;
  const categorySlugs = getCategorySlugs(event.categories);
  const description = pickLocalizedText(event.description);
  const location = event.venue_name || event.address || undefined;
  const rankedEvent: RankedStockholmEvent = {
    id: event.id,
    title,
    startDate: event.start_date,
    endDate: event.end_date || undefined,
    startTime: event.start_time || undefined,
    endTime: event.end_time || undefined,
    location,
    category: category || undefined,
    categorySlugs,
    description: description || undefined,
    hasTime: Boolean(event.start_time),
    primaryCategorySlug: categorySlugs[0] ?? "uncategorized",
    relevanceScore: 0,
    url: createEventUrl(event.url) ?? event.external_website_url ?? undefined,
  };

  rankedEvent.relevanceScore = getRelevanceScore(rankedEvent);

  return rankedEvent;
}

function selectEvents(
  events: RankedStockholmEvent[],
  period: StockholmEventsPeriod,
  maxEvents: number,
): StockholmEvent[] {
  const sortedEvents = [...events].sort(sortByRelevance);
  const selectedIds = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const selected: RankedStockholmEvent[] = [];

  const featuredEvents = pickVariedEvents(
    sortedEvents.filter(isFeaturedEvent),
    2,
    selectedIds,
    categoryCounts,
    1,
  ).map((event) => withSelectionType(event, "featured"));

  addSelectedEvents(featuredEvents, selected, selectedIds, categoryCounts);

  const wildcard = pickWeeklyWildcard(sortedEvents, selectedIds, period);
  if (wildcard) {
    selectedIds.add(wildcard.id);
  }

  const recommendedLimit = Math.max(0, maxEvents - selected.length - (wildcard ? 1 : 0));
  const recommendedEvents = pickVariedEvents(
    sortedEvents,
    recommendedLimit,
    selectedIds,
    categoryCounts,
    1,
  ).map((event) => withSelectionType(event, "recommended"));

  addSelectedEvents(recommendedEvents, selected, selectedIds, categoryCounts);

  if (wildcard && selected.length < maxEvents) {
    addSelectedEvents(
      [withSelectionType(wildcard, "wildcard")],
      selected,
      selectedIds,
      categoryCounts,
    );
  }

  const fallbackEvents = pickVariedEvents(
    sortedEvents,
    maxEvents - selected.length,
    selectedIds,
    categoryCounts,
    2,
  ).map((event) => withSelectionType(event, "recommended"));

  addSelectedEvents(fallbackEvents, selected, selectedIds, categoryCounts);

  return selected
    .slice(0, maxEvents)
    .map(stripRankingFields);
}

function pickVariedEvents(
  events: RankedStockholmEvent[],
  limit: number,
  selectedIds: Set<string>,
  categoryCounts: Map<string, number>,
  maxPerCategory: number,
): RankedStockholmEvent[] {
  if (limit <= 0) {
    return [];
  }

  const picked: RankedStockholmEvent[] = [];
  const pickedIds = new Set<string>();
  const localCategoryCounts = new Map(categoryCounts);

  for (const event of events) {
    if (picked.length >= limit || selectedIds.has(event.id)) {
      continue;
    }

    const count = localCategoryCounts.get(event.primaryCategorySlug) ?? 0;
    if (count >= maxPerCategory) {
      continue;
    }

    picked.push(event);
    pickedIds.add(event.id);
    localCategoryCounts.set(event.primaryCategorySlug, count + 1);
  }

  for (const event of events) {
    if (picked.length >= limit) {
      break;
    }

    if (selectedIds.has(event.id) || pickedIds.has(event.id)) {
      continue;
    }

    picked.push(event);
    pickedIds.add(event.id);
  }

  return picked;
}

function pickWeeklyWildcard(
  events: RankedStockholmEvent[],
  selectedIds: Set<string>,
  period: StockholmEventsPeriod,
): RankedStockholmEvent | null {
  const candidates = events
    .filter((event) => !selectedIds.has(event.id))
    .filter(isWildcardCandidate)
    .sort(sortByWildcardStrength);

  if (candidates.length === 0) {
    return null;
  }

  const strongestCandidates = candidates.slice(0, Math.min(candidates.length, 3));
  const wildcardIndex = getWeekSeed(period.startDate) % strongestCandidates.length;
  return strongestCandidates[wildcardIndex];
}

function addSelectedEvents(
  events: RankedStockholmEvent[],
  selected: RankedStockholmEvent[],
  selectedIds: Set<string>,
  categoryCounts: Map<string, number>,
): void {
  for (const event of events) {
    if (selectedIds.has(event.id) && selected.some((item) => item.id === event.id)) {
      continue;
    }

    selectedIds.add(event.id);
    categoryCounts.set(
      event.primaryCategorySlug,
      (categoryCounts.get(event.primaryCategorySlug) ?? 0) + 1,
    );
    selected.push(event);
  }
}

function withSelectionType(
  event: RankedStockholmEvent,
  selectionType: StockholmEventSelectionType,
): RankedStockholmEvent {
  return {
    ...event,
    selectionType,
  };
}

function isFeaturedEvent(event: RankedStockholmEvent): boolean {
  return (
    event.relevanceScore >= 70 ||
    isMajorVenue(event.location) ||
    event.categorySlugs.some((slug) =>
      ["clubs-parties", "festivals", "music", "sports"].includes(slug),
    )
  );
}

function isWildcardCandidate(event: RankedStockholmEvent): boolean {
  const text = `${event.title} ${event.description ?? ""}`;

  return (
    wildcardKeywords.test(text) ||
    event.categorySlugs.some((slug) =>
      ["fairs", "gaming-boardgames", "guided-tours", "networking-community"].includes(
        slug,
      ),
    )
  );
}

function sortByWildcardStrength(
  left: RankedStockholmEvent,
  right: RankedStockholmEvent,
): number {
  const leftScore = getWildcardScore(left);
  const rightScore = getWildcardScore(right);

  if (leftScore !== rightScore) {
    return rightScore - leftScore;
  }

  return `${left.primaryCategorySlug}:${left.title}:${left.id}`.localeCompare(
    `${right.primaryCategorySlug}:${right.title}:${right.id}`,
    "sv-SE",
  );
}

function getWildcardScore(event: RankedStockholmEvent): number {
  const text = `${event.title} ${event.description ?? ""}`;
  let score = 0;

  if (event.categorySlugs.includes("clubs-parties")) {
    score += 35;
  }

  if (event.categorySlugs.includes("gaming-boardgames")) {
    score += 30;
  }

  if (event.categorySlugs.includes("networking-community")) {
    score += 20;
  }

  if (event.categorySlugs.includes("guided-tours")) {
    score += 12;
  }

  if (wildcardKeywords.test(text)) {
    score += 30;
  }

  score += getContextualScore(event, text);
  score += getDateScore(event.startDate) / 4;

  return score;
}

function getRelevanceScore(event: RankedStockholmEvent): number {
  const text = `${event.title} ${event.description ?? ""}`;
  let score = getDateScore(event.startDate);
  score += getCategoryScore(event.categorySlugs);
  score += getContextualScore(event, text);

  if (isMajorVenue(event.location)) {
    score += 30;
  }

  if (event.hasTime) {
    score += 5;
  }

  if (quietCultureKeywords.test(text)) {
    score -= 20;
  }

  score += getDurationAdjustment(event);

  return Math.max(0, score);
}

function getDateScore(startDate: string): number {
  const today = getStockholmDateKey(new Date());
  const todayDate = new Date(`${today}T12:00:00`);
  const start = new Date(`${startDate}T12:00:00`);
  const daysAway = Math.max(0, Math.round((start.getTime() - todayDate.getTime()) / dayMs));

  return Math.max(0, 35 - daysAway * 4);
}

function getCategoryScore(categorySlugs: string[]): number {
  return categorySlugs.reduce(
    (score, slug) => Math.max(score, popularCategoryScores.get(slug) ?? 0),
    0,
  );
}

function getContextualScore(event: RankedStockholmEvent, text: string): number {
  return contextualCategoryRules.reduce((score, rule) => {
    const matchesCategory = event.categorySlugs.some((slug) =>
      rule.slugs.includes(slug),
    );
    const searchText = rule.titleOnly ? event.title : text;

    if (!matchesCategory || !rule.keywords.test(searchText)) {
      return score;
    }

    return Math.max(score, rule.score);
  }, 0);
}

function getDurationAdjustment(event: RankedStockholmEvent): number {
  if (!event.endDate || event.endDate === event.startDate) {
    return 0;
  }

  const start = new Date(`${event.startDate}T12:00:00`);
  const end = new Date(`${event.endDate}T12:00:00`);
  const durationDays = Math.round((end.getTime() - start.getTime()) / dayMs);

  if (durationDays > 90) {
    return -25;
  }

  if (durationDays > 30) {
    return -15;
  }

  if (durationDays > 14) {
    return -8;
  }

  return 0;
}

function isMajorVenue(location: string | undefined): boolean {
  if (!location) {
    return false;
  }

  const normalizedLocation = normalizeSearchText(location);
  return majorVenueNames.some((venue) =>
    normalizedLocation.includes(normalizeSearchText(venue)),
  );
}

function getCategorySlugs(
  categories: VisitStockholmCategory[] | undefined,
): string[] {
  if (!categories) {
    return [];
  }

  return categories.flatMap((category) => (category.slug ? [category.slug] : []));
}

function pickLocalizedText(value: LocalizedText): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return cleanText(value);
  }

  return cleanText(value.sv || value.en || "");
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/gu, "")
    .replace(/&quot;/gu, '"')
    .replace(/&#x27;/gu, "'")
    .replace(/&amp;/gu, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function createEventUrl(slug: string | null | undefined): string | undefined {
  if (!slug) {
    return undefined;
  }

  if (/^https?:\/\//iu.test(slug)) {
    return slug;
  }

  return `https://www.visitstockholm.com/events/${slug}/`;
}

function stripRankingFields(event: RankedStockholmEvent): StockholmEvent {
  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    category: event.category,
    description: event.description,
    selectionType: event.selectionType ?? "recommended",
    url: event.url,
  };
}

function eventOverlapsPeriod(
  event: RankedStockholmEvent,
  period: StockholmEventsPeriod,
): boolean {
  const eventEnd = event.endDate ?? event.startDate;
  return event.startDate <= period.endDate && eventEnd >= period.startDate;
}

function hasEventPassed(event: RankedStockholmEvent, now: Date): boolean {
  const today = getStockholmDateKey(now);
  const currentTime = getStockholmTimeKey(now);
  const eventEnd = event.endDate ?? event.startDate;

  if (eventEnd < today) {
    return true;
  }

  if (eventEnd > today) {
    return false;
  }

  if (event.endTime) {
    return event.endTime < currentTime;
  }

  if (event.startDate === today && event.startTime) {
    return event.startTime < currentTime;
  }

  return false;
}

function sortByRelevance(
  left: RankedStockholmEvent,
  right: RankedStockholmEvent,
): number {
  if (left.relevanceScore !== right.relevanceScore) {
    return right.relevanceScore - left.relevanceScore;
  }

  const leftDate = getSortableDateTime(left.startDate, left.startTime);
  const rightDate = getSortableDateTime(right.startDate, right.startTime);

  if (leftDate !== rightDate) {
    return leftDate.localeCompare(rightDate);
  }

  return left.title.localeCompare(right.title, "sv-SE");
}

function getSortableDateTime(date: string, time: string | undefined): string {
  return `${date}T${time || "00:00"}`;
}

function getWeekSeed(dateKey: string): number {
  const date = new Date(`${dateKey}T12:00:00`);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOffset = Math.floor((date.getTime() - firstDayOfYear.getTime()) / dayMs);
  const weekNumber = Math.ceil((dayOffset + firstDayOfYear.getDay() + 1) / 7);

  return date.getFullYear() * 100 + weekNumber;
}

function getCurrentWeekPeriod(now: Date): StockholmEventsPeriod {
  const today = getStockholmDateKey(now);
  const todayDate = new Date(`${today}T12:00:00`);
  const day = todayDate.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const endDate = new Date(todayDate);
  endDate.setDate(todayDate.getDate() + daysUntilSunday);

  return {
    startDate: today,
    endDate: toDateKey(endDate),
  };
}

function getStockholmDateKey(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Stockholm",
    year: "numeric",
  }).format(date);
}

function getStockholmTimeKey(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }).format(date);
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "");
}
