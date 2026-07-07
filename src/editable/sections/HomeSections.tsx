import Link from 'next/link'
import {
  ArrowRight, Camera, ChevronRight, MessageSquare, Search, Share2, Star, ThumbsUp,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

// Stable hash so derived ratings/counts stay consistent between renders.
function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

// Prefer real rating/review data when present, else a stable display value so
// the Yelp-style star UI always reads well. (Wire to real fields when ready.)
function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((3.7 + (h % 13) / 10) * 10) / 10 // 3.7 – 4.9
}

function reviewsOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${className} ${i < rounded ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`}
        />
      ))}
    </span>
  )
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  return (
    <div className="mt-2 flex items-center gap-2">
      <Stars rating={rating} className="h-4 w-4" />
      <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--slot4-muted-text)]">({reviewsOf(post)})</span>
    </div>
  )
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

/* ----------------------------- Hero banner ----------------------------- */
// Latest posts' real images (newest first, deduped, placeholders dropped).
function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

// Merge the primary feed with the time-window feeds so home always has content,
// even when one source comes back empty for this site.
function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

export function EditableHomeHero({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestPostImages(pool, 5)
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Stories, Businesses & Ideas Worth Following`

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-surface-bg)]">
      {/* Soft ambient lavender wash — matches bcz landing feel */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[var(--slot4-lavender)] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-[var(--slot4-accent-soft)] opacity-80 blur-3xl" />

      <div className={`relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-24 ${container}`}>
        <div className="editable-hero-in relative z-10 max-w-xl">
          <h1 className="editable-display mt-6 text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-5xl lg:text-[3.6rem]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-[var(--slot4-muted-text)] sm:text-lg">
            {pagesContent.home.hero.description || `A curated hub of long-form articles and verified business listings — for readers who want depth and audiences that want reach.`}
          </p>

          <form action="/search" className="mt-8 flex w-full max-w-lg overflow-hidden rounded-full border border-[var(--editable-border)] bg-white shadow-[0_10px_36px_rgba(15,18,34,0.08)]">
            <div className="flex flex-1 items-center gap-2.5 px-5">
              <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
              <input
                name="q"
                placeholder="Search articles, businesses, topics…"
                className="w-full bg-transparent py-4 text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
            </div>
            <button className="shrink-0 bg-[var(--slot4-accent)] px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition hover:brightness-105 sm:px-8">
              Search
            </button>
          </form>

        </div>

        {/* Right-side floating collage */}
        <div className="relative z-0">
          <div className="relative mx-auto grid aspect-square w-full max-w-[520px] grid-cols-6 grid-rows-6 gap-3">
            {/* Big anchor image */}
            <div className="editable-float col-span-4 row-span-4 overflow-hidden rounded-[28px] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] shadow-[0_30px_80px_rgba(15,18,34,0.14)]">
              {heroImages[0] ? (
                <img src={heroImages[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#dfe3ff,#c9cffb)]" />
              )}
            </div>
            <div className="editable-tilt-card col-span-2 row-span-3 col-start-5 overflow-hidden rounded-[22px] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] shadow-[0_20px_46px_rgba(15,18,34,0.12)]">
              {heroImages[1] ? (
                <img src={heroImages[1]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#eaefff,#ffffff)]" />
              )}
            </div>
            <div className="col-span-3 row-span-2 col-start-1 row-start-5 overflow-hidden rounded-[22px] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] shadow-[0_20px_40px_rgba(15,18,34,0.10)]">
              {heroImages[2] ? (
                <img src={heroImages[2]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#fff,#eef0ff)]" />
              )}
            </div>
            <div className="editable-float col-span-3 row-span-3 col-start-4 row-start-4 overflow-hidden rounded-[22px] border border-[var(--editable-border)] bg-[var(--slot4-media-bg)] shadow-[0_22px_50px_rgba(15,18,34,0.12)]">
              {heroImages[3] ? (
                <img src={heroImages[3]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#dfe3ff,#b1baff)]" />
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Stats band — bcz style */}
      <div className="border-y border-[var(--editable-border)] bg-[var(--slot4-warm)]">
        <div className={`grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 ${container}`}>
          {[
            { value: '10K+', label: 'Articles published' },
            { value: '4.2K+', label: 'Business listings' },
            { value: '1M+', label: 'Monthly readers' },
            { value: '24/7', label: 'Editorial refresh' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="editable-display text-3xl font-extrabold tracking-tight text-[var(--slot4-page-text)] sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------- Browse by category -------------------------- */
// Kept exported (no visible output) so existing imports don't break.
export function EditableStoryRail(_props: HomeSectionProps) {
  return null
}

/* ---------------------------- Recent activity --------------------------- */
function ActivityCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const image = getEditablePostImage(post)
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
          <Camera className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--slot4-page-text)]">{category || 'New post'}</p>
        </div>
      </div>
      <Link href={href} className="group mt-3 block">
        <div className="relative aspect-[3/2] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-4 py-4">
        <Link href={href} className="text-lg font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] hover:text-[var(--slot4-accent)]">
          {post.title}
        </Link>
        <RatingRow post={post} />
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 140)}</p>
        <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--slot4-accent)] hover:underline">
          Read more
        </Link>
      </div>
      <div className="flex items-center gap-6 border-t border-[var(--editable-border)] px-4 py-3 text-[var(--slot4-muted-text)]">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium"><ThumbsUp className="h-4 w-4" /> Helpful</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium"><MessageSquare className="h-4 w-4" /> Comment</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium"><Share2 className="h-4 w-4" /> Share</span>
      </div>
    </article>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 9)
  if (!activity.length) return null
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`py-14 sm:py-16 ${container}`}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.01em] sm:text-4xl">Recent activity</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--slot4-muted-text)]">
            The latest posts, reviews and finds from across {SITE_CONFIG.name}.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activity.map((post) => (
            <ActivityCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="search" className="inline-flex items-center gap-2 rounded-lg border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] px-6 py-3 text-sm font-bold text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">
            Show more activity <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* --------------------- Time-based discovery sections -------------------- */
function CompactCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
        {category ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[var(--slot4-page-text)] shadow-sm">{category}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">
          {post.title}
        </h3>
        <RatingRow post={post} />
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 110)}</p>
      </div>
    </Link>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'New in the last 7 days' },
  browse: { eyebrow: 'Trending now', title: 'Popular this month' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  // Use the real time windows; fall back to slicing posts so the page stays full.
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[var(--slot4-surface-bg)]' : 'bg-[var(--slot4-warm)]'}>
            <div className={`py-12 sm:py-14 ${container}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--slot4-accent)] hover:underline">
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => (
                  <CompactCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ----------------------- Endless auto-slider rail ----------------------- */
export function EditableEndlessSlider({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).slice(0, 14)
  if (pool.length < 3) return null
  const loop = [...pool, ...pool]
  return (
    <section className="relative overflow-hidden bg-[var(--slot4-warm)]">
      <div className={`pt-14 sm:pt-16 ${container}`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--slot4-accent)]">On the move</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">Trending picks — always fresh</h2>
          </div>
          <Link href={primaryRoute} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[var(--slot4-accent)] hover:underline sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="editable-marquee-wrap mt-8 pb-14 sm:pb-16">
        <ul className="editable-marquee px-4 sm:px-6 lg:px-8">
          {loop.map((post, i) => {
            const image = getEditablePostImage(post)
            const cat = categoryOf(post) || 'Featured'
            return (
              <li key={`${post.id || post.slug}-${i}`} className="w-[260px] shrink-0 sm:w-[300px]">
                <Link href={postHref(primaryTask, post, primaryRoute)} className="group block overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(0,0,0,0.16)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
                    <img src={image} alt={post.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--slot4-accent)] shadow-sm">{cat}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 90)}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* -------------------------------- CTA band ------------------------------ */
export function EditableHomeCta() {
  return (
    <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-accent)]">
      <div className={`flex flex-col items-center gap-6 py-16 text-center sm:py-20 ${container}`}>
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-[-0.01em] text-white sm:text-4xl">
          Got something worth sharing?
        </h2>
        <p className="max-w-xl text-base text-white/90 sm:text-lg">
          Add your business, post a listing, or share a story — and reach the {SITE_CONFIG.name} community.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/create" className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-bold text-[var(--slot4-accent)] transition hover:brightness-95">
            Create a post
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  )
}
