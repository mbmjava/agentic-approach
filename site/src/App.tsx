import { useEffect, useState, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import flowSvgUrl from '../../guide/coding-flow.svg?url';

const repoUrl = 'https://github.com/mbmjava/agentic-approach';

type MarkdownModules = Record<string, string>;
type DocScope = 'guide' | 'starter';
type SiteDocument = {
  sourcePath: string;
  route: string;
  scope: DocScope;
  title: string;
  body: string;
};

type MarkdownLoader = () => Promise<string>;
type DocumentEntry = Omit<SiteDocument, 'body'> & { load: MarkdownLoader };

const guideModules = import.meta.glob(['../../guide/*.md', '!../../guide/README.md'], {
  query: '?raw',
  import: 'default',
}) as Record<string, MarkdownLoader>;

const guideIndexModules = import.meta.glob('../../guide/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as MarkdownModules;

const starterDocModules = import.meta.glob([
  '../../app/docs/00-index.md',
  '../../app/docs/architecture/**/*.md',
  '../../app/docs/onboarding/**/*.md',
  '../../app/docs/runbooks/**/*.md',
  '../../app/docs/standards/**/*.md',
  '../../app/docs/requirements/README.md',
  '../../app/docs/decisions/**/*.md',
], {
  query: '?raw',
  import: 'default',
}) as Record<string, MarkdownLoader>;

const starterStateModules = import.meta.glob([
  '../../app/working-docs/agent-standards.md',
  '../../app/working-docs/plans/README.md',
], {
  query: '?raw',
  import: 'default',
}) as Record<string, MarkdownLoader>;

function repoPath(modulePath: string) {
  return modulePath.replaceAll('\\', '/').replace(/^(\.\.\/)+/, '');
}

function withoutFrontmatter(markdown: string) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function documentIdentity(sourcePath: string): Pick<SiteDocument, 'route' | 'scope'> | null {
  const isGuide = sourcePath.startsWith('guide/');
  const isStarterDoc = sourcePath.startsWith('app/docs/');
  const isStarterState = sourcePath.startsWith('app/working-docs/');
  if (!isGuide && !isStarterDoc && !isStarterState) return null;
  if (sourcePath.startsWith('app/docs/requirements/') && sourcePath !== 'app/docs/requirements/README.md') return null;
  if (sourcePath === 'app/working-docs/handoff.md' || sourcePath.includes('/observability/')) return null;

  const scope: DocScope = isGuide ? 'guide' : 'starter';
  let route: string;
  if (isGuide) {
    const slug = sourcePath.slice('guide/'.length).replace(/\.md$/, '');
    route = slug === 'README' ? '/guide' : `/guide/${slug}`;
  } else if (isStarterDoc) {
    const slug = sourcePath.slice('app/docs/'.length).replace(/\.md$/, '');
    route = slug === '00-index' ? '/starter/docs' : `/starter/docs/${slug}`;
  } else {
    const slug = sourcePath.slice('app/working-docs/'.length).replace(/\.md$/, '');
    route = `/starter/working/${slug}`;
  }
  return { route, scope };
}

function makeDocument(sourcePath: string, markdown: string): SiteDocument | null {
  const identity = documentIdentity(sourcePath);
  if (!identity) return null;
  const body = withoutFrontmatter(markdown);
  const frontmatterTitle = markdown.match(/^title:\s*['"]?(.+?)['"]?\s*$/m)?.[1];
  const headingTitle = body.match(/^#\s+(.+)$/m)?.[1];
  const title = frontmatterTitle ?? headingTitle ?? sourcePath.split('/').at(-1)?.replace(/\.md$/, '') ?? 'Guide';
  return { sourcePath, ...identity, title, body };
}

function fallbackTitle(sourcePath: string) {
  const specialTitles: Record<string, string> = {
    'app/docs/00-index.md': 'Documentation index',
    'app/docs/onboarding/README.md': 'Onboarding',
    'app/working-docs/agent-standards.md': 'Agent standards',
    'app/working-docs/plans/README.md': 'Plans',
  };
  if (specialTitles[sourcePath]) return specialTitles[sourcePath];
  return sourcePath.split('/').at(-1)?.replace(/\.md$/, '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Document';
}

function makeEntry(modulePath: string, load: MarkdownLoader): DocumentEntry | null {
  const sourcePath = repoPath(modulePath);
  const identity = documentIdentity(sourcePath);
  return identity ? { sourcePath, ...identity, title: fallbackTitle(sourcePath), load } : null;
}

const rawGuideIndex = Object.entries(guideIndexModules)[0];
const guideIndexEntry = rawGuideIndex
  ? makeEntry(rawGuideIndex[0], async () => rawGuideIndex[1])
  : null;
const markdownLoaders = [
  ...Object.entries(guideModules).filter(([path]) => repoPath(path) !== 'guide/README.md'),
  ...Object.entries(starterDocModules),
  ...Object.entries(starterStateModules),
];
const entries = [
  ...(guideIndexEntry ? [guideIndexEntry] : []),
  ...markdownLoaders.flatMap(([path, load]) => {
    const entry = makeEntry(path, load);
    return entry ? [entry] : [];
  }),
];

const entryByRoute = new Map(entries.map((entry) => [entry.route, entry]));
const entryBySource = new Map(entries.map((entry) => [entry.sourcePath, entry]));

function resolveRepoPath(sourcePath: string, target: string) {
  const parts = sourcePath.split('/').slice(0, -1);
  for (const part of target.replaceAll('\\', '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
}

function guideGroups() {
  const index = rawGuideIndex?.[1];
  if (!index) return [];
  const groups: Array<{ title: string; items: Array<{ title: string; route: string }> }> = [];
  let current: (typeof groups)[number] | undefined;

  for (const line of withoutFrontmatter(index).split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      current = { title: heading[1].trim(), items: [] };
      groups.push(current);
      continue;
    }
    const link = line.match(/^\s*-\s+\[([^\]]+)\]\(([^)]+\.md)(?:#[^)]*)?\)/);
    if (!current || !link) continue;
    const target = resolveRepoPath('guide/README.md', link[2]);
    const doc = entryBySource.get(target);
    if (doc) current.items.push({ title: link[1], route: doc.route });
  }

  const economics = groups.flatMap((group) => group.items.filter((item) => item.route === '/guide/token-economics'));
  for (const group of groups) group.items = group.items.filter((item) => item.route !== '/guide/token-economics');
  if (economics.length) groups.unshift({ title: 'Cost & efficiency', items: economics });
  return [{ title: 'Start here', items: [{ title: 'Workflow overview', route: '/guide' }] }, ...groups.filter((group) => group.items.length > 0)];
}

const playbookGroups = guideGroups();

function routeHref(route: string, anchor?: string) {
  return `#${route}${anchor ? `#${anchor}` : ''}`;
}

function buildDocGroups(docs: DocumentEntry[]) {
  const groupOrder = ['architecture', 'onboarding', 'runbooks', 'standards', 'decisions'];
  const groups = groupOrder.flatMap((folder) => {
    const items = docs
      .filter((doc) => doc.scope === 'starter' && doc.route.startsWith(`/starter/docs/${folder}/`))
      .sort((left, right) => left.title.localeCompare(right.title))
      .map((doc) => ({ title: doc.title, route: doc.route }));
    return items.length ? [{ title: folder[0].toUpperCase() + folder.slice(1), items }] : [];
  });
  return [{ title: 'Start here', items: [{ title: 'Documentation index', route: '/starter/docs' }] }, ...groups];
}

function currentLocation() {
  const hash = window.location.hash;
  if (!hash.startsWith('#/')) return { route: '/', anchor: undefined };
  const [route, anchor] = hash.slice(1).split('#', 2);
  return { route: route.replace(/\/$/, '') || '/', anchor };
}

function BrandMark() {
  return (
    <span className="grid size-9 place-items-center rounded-xl bg-[#121a15] text-[#d8fa74]" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path d="m3 17 5.7-11h4.7L19 17h-4.5l-1-2.1H8.4l-1 2.1H3Zm7-5.3h2.2l-1.1-2.5-1.1 2.5Z" fill="currentColor" />
        <circle cx="19.5" cy="5" r="1.5" fill="#70e0c0" />
      </svg>
    </span>
  );
}

function Arrow() {
  return <span className="text-[#a8bb92]" aria-hidden="true">→</span>;
}

function WorkflowPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[630px]">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-[#d8fa74]/15 blur-2xl" aria-hidden="true" />
      <figure className="workflow-panel relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111914] p-5 text-white shadow-2xl shadow-[#122015]/20 sm:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#c0d0b9]">The delivery loop</p>
            <p className="mt-1.5 text-sm font-medium text-white/60">A shared model, not an agent swarm</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#d8fa74]/20 bg-[#d8fa74]/[.08] px-2.5 py-1.5 text-[9px] font-semibold tracking-wide text-[#e4ff9b] sm:px-3 sm:text-[10px]">
            <span className="size-1.5 rounded-full bg-[#d8fa74] shadow-[0_0_12px_#d8fa74]" />
            ONE <span className="hidden sm:inline">ACCOUNTABLE </span>OWNER
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1.2fr_auto_1.5fr] sm:items-center">
          <div className="flow-node border-[#70e0c0]/20 bg-[#70e0c0]/[.07]">
            <span className="flow-kicker text-[#70e0c0]">01 · INTENT</span>
            <strong>The idea</strong>
            <span className="flow-caption">User sets direction</span>
          </div>
          <div className="hidden text-lg sm:block"><Arrow /></div>
          <div className="flow-node border-[#d8fa74]/20 bg-[#d8fa74]/[.07]">
            <span className="flow-kicker text-[#d8fa74]">02 · ORCHESTRATE</span>
            <strong>Frame &amp; route</strong>
            <span className="flow-caption">One owner holds the seams</span>
          </div>
          <div className="hidden text-lg sm:block"><Arrow /></div>
          <div className="flow-node border-[#8ab8ff]/20 bg-[#8ab8ff]/[.07]">
            <span className="flow-kicker text-[#9bc3ff]">03 · WORKERS</span>
            <strong>Bounded slices</strong>
            <span className="flow-caption">Parallel only when safe</span>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[.17em] text-white/45">Workers return evidence</span>
            <span className="text-[10px] text-white/35">No overlapping ownership</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="worker-lane">
              <span className="worker-dot bg-[#8ab8ff]" />
              <span><strong>Feature slice</strong><small>Focused diff</small></span>
            </div>
            <div className="worker-lane">
              <span className="worker-dot bg-[#70e0c0]" />
              <span><strong>Tests / docs</strong><small>Checks + findings</small></span>
            </div>
          </div>
        </div>

        <div className="my-3 flex items-center justify-center gap-2 text-xs text-white/40">
          <span className="h-px w-8 bg-white/15" />
          inspect · integrate · verify
          <span className="h-px w-8 bg-white/15" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="gate-chip"><span className="gate-icon text-[#d8fa74]">✓</span><span>CI checks</span></div>
          <div className="gate-chip"><span className="gate-icon text-[#70e0c0]">⌕</span><span>Independent review</span></div>
          <div className="gate-chip gate-final"><span className="gate-icon text-[#f4bd77]">↗</span><span>Policy decides</span></div>
        </div>

        <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[11px] text-white/45">
          <span>Human intent · bounded execution · evidence before merge</span>
          <a className="font-semibold text-[#d8fa74] transition hover:text-white" href={flowSvgUrl} target="_blank" rel="noreferrer">
            Open full flow <span aria-hidden="true">↗</span>
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

const principles = [
  {
    number: '01',
    title: 'Keep one accountable owner',
    copy: 'The orchestrator collaborates on intent, sets acceptance, integrates the work, and owns the final quality gate.',
    color: 'mint',
  },
  {
    number: '02',
    title: 'Delegate bounded work',
    copy: 'Give workers a precise goal, writable scope, constraints, and a checkable output. They return findings and diffs—not authority.',
    color: 'lime',
  },
  {
    number: '03',
    title: 'Let evidence earn trust',
    copy: 'Run the narrowest useful checks, review the integrated diff, and fail closed when evidence is missing or stale.',
    color: 'blue',
  },
];

const maturity = [
  { id: 'A', title: 'Assist', body: 'Start with a clear brief. Use agents for research, focused edits, and testable slices.' },
  { id: 'B', title: 'Verify', body: 'Add reproducible checks, independent review, and a useful handoff before scaling delegation.' },
  { id: 'C', title: 'Automate selectively', body: 'Make only calibrated, low-risk paths eligible for automation. Keep human escalation explicit.' },
];

function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f2f4ee] text-[#17201a]">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="relative z-10 border-b border-[#17201a]/[.08]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <a className="flex items-center gap-3" href="#/" aria-label="Agentic Approach home">
            <BrandMark />
            <span className="text-sm font-bold tracking-[-.03em]">agentic<span className="font-medium text-[#697365]"> approach</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#566052] md:flex" aria-label="Main navigation">
            <a className="transition hover:text-[#17201a]" href="#flow">The flow</a>
            <a className="transition hover:text-[#17201a]" href="#/guide">Playbook</a>
            <a className="transition hover:text-[#17201a]" href="#/guide/token-economics">Cost</a>
            <a className="transition hover:text-[#17201a]" href="#/starter">Starter</a>
          </nav>
          <details className="mobile-menu relative md:hidden">
            <summary aria-label="Toggle navigation menu" className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-[#17201a]/15 bg-white/70 text-[#17201a]">
              <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </summary>
            <nav className="absolute right-0 top-12 z-50 flex min-w-48 flex-col rounded-2xl border border-[#17201a]/10 bg-white p-2 shadow-xl" aria-label="Mobile navigation">
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#flow">The flow</a>
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#/guide">Playbook</a>
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#/guide/token-economics">Cost &amp; economics</a>
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#/starter">Starter</a>
              <ExternalLink className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href={repoUrl}>GitHub ↗</ExternalLink>
            </nav>
          </details>
          <ExternalLink
            className="hidden items-center gap-2 rounded-full bg-[#17201a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#304332] sm:inline-flex sm:px-5 sm:text-sm"
            href={repoUrl}
          >
            View the project <span aria-hidden="true">↗</span>
          </ExternalLink>
        </div>
      </header>

      <main id="main">
        <section id="top" className="hero-shell relative isolate overflow-hidden">
          <div className="hero-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.92fr_1.08fr] lg:gap-10 lg:px-12 lg:py-24">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#58664f]/15 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#57664b] shadow-sm sm:text-[11px]">
                <span className="size-1.5 rounded-full bg-[#79a34b]" />
                A field guide for agentic software work
              </div>
              <h1 className="text-[clamp(3.35rem,7vw,6.35rem)] font-semibold leading-[.95] tracking-[-.075em] text-[#142018]">
                Let agents
                <br />
                move fast.
                <br />
                Keep the <span className="relative isolate inline-block text-[#567d34]">judgment<span className="hero-underline" aria-hidden="true" /></span>.
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#596456] sm:text-lg sm:leading-8">
                A practical playbook for pairing human judgment with bounded coding agents—from the first idea to a verified merge.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a className="button-primary" href="#flow">See how the flow works <span aria-hidden="true">↓</span></a>
                <a className="button-secondary" href="#/guide">Read the playbook <span aria-hidden="true">→</span></a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#697466]">
                <span className="inline-flex items-center gap-2"><span className="tiny-check">✓</span>Tool-neutral core</span>
                <span className="inline-flex items-center gap-2"><span className="tiny-check">✓</span>Bounded workers</span>
                <span className="inline-flex items-center gap-2"><span className="tiny-check">✓</span>Evidence-first</span>
              </div>
            </div>
            <WorkflowPreview />
          </div>
          <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-3 border-t border-[#17201a]/10 pt-5 text-xs text-[#778072] sm:flex-row sm:items-center">
              <span>Less agent theater. More accepted work.</span>
              <span className="font-mono text-[10px] uppercase tracking-[.12em]">Intent → execution → evidence → merge</span>
            </div>
          </div>
        </section>

        <section id="flow" className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr] md:items-end">
              <div>
                <p className="section-eyebrow">The operating model</p>
                <h2 className="section-heading">The leverage is in the boundaries.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#667064] md:justify-self-end md:text-lg md:leading-8">
                Keep intent, trade-offs, and integration with one accountable orchestrator. Send the bounded legwork to agents that can return something you can inspect.
              </p>
            </div>

            <div id="principles" className="mt-12 grid gap-4 md:grid-cols-3">
              {principles.map((item) => (
                <article className={`principle-card principle-${item.color}`} key={item.number}>
                  <div className="flex items-center justify-between">
                    <span className="principle-number">{item.number}</span>
                    <span className="principle-mark" aria-hidden="true">↗</span>
                  </div>
                  <h3 className="mt-10 text-xl font-semibold tracking-[-.04em] text-[#19221b]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667064]">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cost" className="overflow-hidden bg-[#d8fa74] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div className="max-w-xl">
              <p className="section-eyebrow text-[#405d2a]">Economics that matter</p>
              <h2 className="section-heading text-[#17201a]">Cheap tokens aren’t the goal.</h2>
              <p className="mt-5 text-base leading-7 text-[#3f5038]">
                Optimize the total cost of an accepted result—not a model call in isolation. Good delegation protects expensive attention and avoids review drag and rework.
              </p>
              <a className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#21311d] transition hover:gap-3" href="#/guide/token-economics">
                Explore token economics <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="cost-equation rounded-[1.5rem] border border-[#28391f]/10 bg-[#f4f7e8] p-5 shadow-[0_24px_70px_rgba(35,54,27,.12)] sm:p-7">
              <div className="flex items-center justify-between gap-3 border-b border-[#26371e]/10 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#657651]">The real unit of value</span>
                <span className="rounded-full bg-[#17201a] px-3 py-1.5 font-mono text-[10px] font-semibold text-[#d8fa74]">COST / ACCEPTED CHANGE</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ['01', 'Model spend'],
                  ['02', 'Orchestration'],
                  ['03', 'Review effort'],
                  ['04', 'Rework'],
                ].map(([number, label]) => (
                  <div className="cost-factor" key={number}>
                    <span className="font-mono text-[10px] text-[#79905f]">{number}</span>
                    <span className="mt-3 text-xs font-semibold leading-4 text-[#33432d]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#17201a] px-4 py-4 text-white">
                <span className="text-sm font-semibold">Total cost to accepted work</span>
                <span className="text-xl font-light text-[#d8fa74]" aria-hidden="true">=</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#77846a]">Measure quality, latency, and rework together. A cheaper call that needs three rewrites is not cheaper.</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#121a15] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="max-w-lg">
              <p className="section-eyebrow text-[#bfe66a]">Earn autonomy</p>
              <h2 className="section-heading text-white">Trust is a release process, too.</h2>
              <p className="mt-5 text-base leading-7 text-white/60">
                Don’t jump from “agent can write code” to “agent can ship anything.” Start with evidence, learn where the gates work, then automate only the paths your policy allows.
              </p>
              <a className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#d8fa74] transition hover:text-white" href="#/guide/approval-authority">
                Read about approval authority <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="space-y-3">
              {maturity.map((item, index) => (
                <article className="maturity-row" key={item.id}>
                  <span className={`maturity-id maturity-id-${index}`}>{item.id}</span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-.03em] text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/55">{item.body}</p>
                  </div>
                  <span className="hidden text-white/25 sm:block" aria-hidden="true">↗</span>
                </article>
              ))}
              <p className="px-2 pt-2 text-xs leading-5 text-white/35">Automation depends on project policy, provider protections, and demonstrated review quality.</p>
            </div>
          </div>
        </section>

        <section id="start" className="bg-[#e9eee5] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Start with what you need</p>
                <h2 className="section-heading">A playbook to learn from.<br className="hidden sm:block" /> A starter to build on.</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#64705f]">Keep it lightweight: take the workflow, adapt the guardrails, and add machinery only when repeated work justifies it.</p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <a className="resource-card" href="#/guide">
                <span className="resource-tag">THE PLAYBOOK</span>
                <span className="resource-arrow" aria-hidden="true">↗</span>
                <span className="mt-8 block text-2xl font-semibold tracking-[-.05em]">Learn the approach</span>
                <span className="mt-2 block max-w-md text-sm leading-6 text-[#63705e]">Short, tool-neutral guidance on orchestration, delegation, verification, context, and adoption.</span>
                <span className="resource-link">Explore the guide <span aria-hidden="true">→</span></span>
              </a>
              <a className="resource-card resource-card-dark" href="#/starter">
                <span className="resource-tag">THE STARTER</span>
                <span className="resource-arrow" aria-hidden="true">↗</span>
                <span className="mt-8 block text-2xl font-semibold tracking-[-.05em]">Start with the harness</span>
                <span className="mt-2 block max-w-md text-sm leading-6 text-white/55">A blank Maven + React project with agent roles, docs, reusable templates, checks, and CI wired in.</span>
                <span className="resource-link resource-link-light">Explore the starter <span aria-hidden="true">→</span></span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f2f4ee] px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 border-t border-[#17201a]/10 pt-6 text-xs text-[#687363] sm:flex-row sm:items-center">
          <a className="flex items-center gap-2 font-semibold text-[#17201a]" href="#top"><BrandMark />Agentic Approach</a>
          <span>A practical framework for getting useful work done with coding agents.</span>
          <ExternalLink className="font-semibold transition hover:text-[#17201a]" href={repoUrl}>Open source on GitHub ↗</ExternalLink>
        </div>
      </footer>
    </div>
  );
}

function sourcePathHref(sourcePath: string) {
  return `${repoUrl}/blob/main/${sourcePath}`;
}

function resolveMarkdownLink(doc: SiteDocument, href: string) {
  if (!href || href.startsWith('https:') || href.startsWith('http:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('//')) {
    return href || '#';
  }
  if (href.startsWith('#')) return routeHref(doc.route, decodeURIComponent(href.slice(1)));

  const [targetPath, targetAnchor] = href.split('#', 2);
  let targetSource = resolveRepoPath(doc.sourcePath, decodeURIComponent(targetPath));
  if (targetSource === 'app/working-docs/handoff.md') {
    targetSource = 'app/docs/standards/templates/handoff.md';
  }
  if (targetSource === 'guide/coding-flow.svg') return flowSvgUrl;

  if (targetSource.startsWith('app/docs/requirements/') && targetSource !== 'app/docs/requirements/README.md') {
    return sourcePathHref(targetSource);
  }
  const targetDoc = entryBySource.get(targetSource);
  if (targetDoc) return routeHref(targetDoc.route, targetAnchor ? decodeURIComponent(targetAnchor) : undefined);
  return sourcePathHref(targetSource);
}

function MarkdownBody({ doc }: { doc: SiteDocument }) {
  const components: Components = {
    a: ({ href, children, className }) => {
      const destination = resolveMarkdownLink(doc, href ?? '');
      const external = destination.startsWith('http');
      return (
        <a
          className={className}
          href={destination}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt, title }) => {
      const source = src ? resolveMarkdownLink(doc, src) : undefined;
      return <img className="markdown-image" src={source} alt={alt ?? ''} title={title} loading="lazy" />;
    },
    table: ({ children }) => <div className="markdown-table"><table>{children}</table></div>,
    pre: ({ children }) => <pre className="markdown-pre">{children}</pre>,
    code: ({ children, className }) => <code className={className ?? 'markdown-inline-code'}>{children}</code>,
  };

  const comparison = doc.sourcePath === 'guide/token-economics.md' ? extractCostComparison(doc.body) : null;

  return (
    <div className="markdown-content">
      {comparison ? (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
            {comparison.before}
          </ReactMarkdown>
          <CostComparisonVisual rows={comparison.rows} />
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
            {comparison.after}
          </ReactMarkdown>
        </>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
          {doc.body}
        </ReactMarkdown>
      )}
    </div>
  );
}

type CostRow = {
  scenario: string;
  volume: string;
  baseline: string;
  orchestrator: string;
  workers: string;
  mixed: string;
  savings: string;
};

function parsePipeRow(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function extractCostComparison(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes('| Scenario (total input / output) |'));
  if (start < 0) return null;
  let end = start;
  while (end < lines.length && lines[end].trim().startsWith('|')) end += 1;
  const rows = lines.slice(start, end).map(parsePipeRow);
  const dataRows = rows.slice(2);
  if (!dataRows.length || dataRows.some((row) => row.length !== 6)) return null;

  return {
    before: lines.slice(0, start).join('\n'),
    after: lines.slice(end).join('\n'),
    rows: dataRows.map((row) => {
      const match = row[0].match(/^(.+?)\s+\((.+)\)$/);
      return {
        scenario: match?.[1] ?? row[0],
        volume: match?.[2] ?? '',
        baseline: row[1],
        orchestrator: row[2],
        workers: row[3],
        mixed: row[4],
        savings: row[5],
      } satisfies CostRow;
    }),
  };
}

function amount(value: string) {
  return Number(value.replace(/[$,]/g, ''));
}

function CostComparisonVisual({ rows }: { rows: CostRow[] }) {
  return (
    <section className="cost-comparison-visual" aria-label="Illustrative token cost comparison">
      <div className="cost-visual-heading">
        <div>
          <span className="cost-visual-kicker">Illustrative API spend</span>
          <h2>Same token volume.<br />Different routing.</h2>
        </div>
        <span className="cost-assumption">25% orchestrator · 75% workers</span>
      </div>
      <div className="cost-scenario-grid">
        {rows.map((row) => {
          const baseline = amount(row.baseline);
          const mixed = amount(row.mixed);
          const orchestratorShare = (amount(row.orchestrator) / mixed) * 100;
          const workerShare = 100 - orchestratorShare;
          const mixedWidth = Math.max(2.5, Math.min(100, (mixed / baseline) * 100));
          return (
            <article className="cost-scenario-card" key={row.scenario}>
              <div className="cost-scenario-top">
                <div>
                  <span className="cost-scenario-label">{row.scenario}</span>
                  <p>{row.volume} <span>input / output</span></p>
                </div>
                <span className="cost-savings">{row.savings}</span>
              </div>
              <div className="cost-price-row"><span>All Sonnet 5</span><strong>{row.baseline}</strong></div>
              <div className="cost-track" role="img" aria-label={`Baseline cost ${row.baseline}`}>
                <span className="cost-track-fill cost-baseline-fill" style={{ width: '100%' }} />
              </div>
              <div className="cost-price-row cost-mixed-row"><span>Mixed total</span><strong>{row.mixed}</strong></div>
              <div className="cost-track" role="img" aria-label={`Mixed cost ${row.mixed}, ${row.savings} than baseline`}>
                <span className="cost-track-fill cost-mixed-fill" style={{ width: `${mixedWidth}%` }} />
              </div>
              <div className="cost-role-breakdown">
                <div className="cost-role-bar" role="img" aria-label={`Orchestrator ${row.orchestrator}; workers ${row.workers}`}>
                  <span className="cost-role-orchestrator" style={{ width: `${orchestratorShare}%` }} />
                  <span className="cost-role-workers" style={{ width: `${workerShare}%` }} />
                </div>
                <div className="cost-role-legend">
                  <span><i className="legend-orchestrator" />Orchestrator <strong>{row.orchestrator}</strong></span>
                  <span><i className="legend-workers" />Workers <strong>{row.workers}</strong></span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="cost-visual-footnote">API spend illustration at equal token volumes—not a quality or total-work-cost guarantee. Review effort and rework still matter.</p>
    </section>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#17201a]/[.08] bg-[#f5f6f0]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-12">
        <a className="flex shrink-0 items-center gap-3" href="#/" aria-label="Agentic Approach home">
          <BrandMark />
          <span className="text-sm font-bold tracking-[-.03em]">agentic<span className="font-medium text-[#697365]"> approach</span></span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#566052] md:flex" aria-label="Main navigation">
          <a className="transition hover:text-[#17201a]" href="#/guide">Playbook</a>
          <a className="transition hover:text-[#17201a]" href="#/guide/token-economics">Cost</a>
          <a className="transition hover:text-[#17201a]" href="#/starter">Starter</a>
        </nav>
        <details className="mobile-menu relative md:hidden">
          <summary aria-label="Toggle navigation menu" className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-[#17201a]/15 bg-white/70 text-[#17201a]">
            <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
              <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </summary>
          <nav className="absolute right-0 top-12 z-50 flex min-w-48 flex-col rounded-2xl border border-[#17201a]/10 bg-white p-2 shadow-xl" aria-label="Mobile navigation">
            <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#/guide">Playbook</a>
            <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#/guide/token-economics">Cost &amp; economics</a>
            <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#/starter">Starter</a>
          </nav>
        </details>
        <ExternalLink className="hidden rounded-full bg-[#17201a] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#304332] sm:inline-flex" href={repoUrl}>
          Source on GitHub <span aria-hidden="true">↗</span>
        </ExternalLink>
      </div>
    </header>
  );
}

function GuideReader({ doc }: { doc: SiteDocument }) {
  const [query, setQuery] = useState('');
  const visibleGroups = playbookGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((group) => group.items.length > 0);
  const orderedDocs = playbookGroups.flatMap((group) => group.items.map((item) => entryByRoute.get(item.route)).filter((item): item is DocumentEntry => Boolean(item)));
  const currentIndex = orderedDocs.findIndex((item) => item.route === doc.route);
  const previous = currentIndex > 0 ? orderedDocs[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? orderedDocs[currentIndex + 1] : orderedDocs[0];
  return <ReaderLayout doc={doc} groups={visibleGroups} query={query} onQuery={setQuery} previous={previous} next={next} />;
}

function StarterReader({ doc }: { doc: SiteDocument }) {
  const groups = buildDocGroups(entries);
  const orderedDocs = groups.flatMap((group) => group.items.map((item) => entryByRoute.get(item.route)).filter((item): item is DocumentEntry => Boolean(item)));
  const currentIndex = orderedDocs.findIndex((item) => item.route === doc.route);
  return (
    <ReaderLayout
      doc={doc}
      groups={groups}
      previous={currentIndex > 0 ? orderedDocs[currentIndex - 1] : undefined}
      next={currentIndex >= 0 ? orderedDocs[currentIndex + 1] : undefined}
    />
  );
}

function GuideOverview() {
  const topicGroups = playbookGroups.filter((group) => group.title !== 'Start here');
  const descriptions: Record<string, string> = {
    'Cost & efficiency': 'Optimize the cost of an accepted result—not token count in isolation.',
    Orientation: 'Choose a working mode and get aligned on the outcome before tools take over.',
    'Roles and delegation': 'Keep one accountable owner; send workers bounded tasks with checkable outputs.',
    'Environment and continuity': 'Make long work observable, bounded, and easy to resume.',
    'Improvement from evidence': 'Use real outcomes to improve the workflow without accumulating ceremony.',
    'Adapters and adoption': 'Bring the same core approach to different tools and existing projects.',
  };

  return (
    <div className="min-h-screen bg-[#f2f4ee] text-[#17201a]">
      <SiteHeader />
      <main>
        <section className="guide-overview-hero px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
            <div className="max-w-xl">
              <span className="overview-badge"><i /> A PRACTICAL WAY TO BUILD WITH AGENTS</span>
              <h1 className="mt-7 text-[clamp(3.1rem,6vw,5.5rem)] font-semibold leading-[.96] tracking-[-.075em]">
                Spend less time
                <br />
                herding agents.
                <br />
                <span className="text-[#52793a]">Ship with confidence.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#5b6758] sm:text-lg sm:leading-8">
                Keep your attention on intent and hard decisions. Let coding agents take bounded work, then use evidence—not optimism—to decide what lands.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="button-primary" href={routeHref('/guide', 'operating-loop')}>See the flow <span aria-hidden="true">↓</span></a>
                <a className="button-secondary" href={routeHref('/guide/bootstrap-checklist')}>Start a small pilot <span aria-hidden="true">→</span></a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#697466]">
                <span className="inline-flex items-center gap-2"><span className="tiny-check">✓</span>Tool-neutral</span>
                <span className="inline-flex items-center gap-2"><span className="tiny-check">✓</span>Bounded delegation</span>
                <span className="inline-flex items-center gap-2"><span className="tiny-check">✓</span>Evidence-first</span>
              </div>
            </div>
            <WorkflowPreview />
          </div>
        </section>

        <section className="bg-white px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="section-eyebrow">Why this works</p>
              <h2 className="section-heading">Get your focus back.</h2>
              <p className="mt-5 text-base leading-7 text-[#667064]">The win isn’t the number of agents. It’s more accepted work with less orchestration drag.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ['Keep the judgment', 'You and the orchestrator hold intent, trade-offs, shared contracts, and final acceptance.'],
                ['Parallelize the legwork', 'Workers explore, implement, test, and report in bounded slices—without competing for the same files.'],
                ['Trust what was checked', 'Review the integrated diff, use focused CI, and fail closed when the evidence is missing or stale.'],
              ].map(([title, copy], index) => (
                <article className="principle-card" key={title}>
                  <span className="principle-number">0{index + 1}</span>
                  <h3 className="mt-10 text-xl font-semibold tracking-[-.04em] text-[#19221b]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#667064]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="operating-loop" className="guide-loop-section bg-[#121a15] px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-[.75fr_1.25fr] md:items-end">
              <div>
                <p className="section-eyebrow text-[#bfe66a]">The repeatable loop</p>
                <h2 className="section-heading text-white">A route from idea to merge.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-white/60 md:justify-self-end">Answer the human questions early. Keep worker assignments small. Spend the expensive context on choices, integration, and acceptance.</p>
            </div>
            <div className="guide-step-grid mt-10">
              {[
                ['01', 'Frame', 'Agree on outcome, scope, and what “done” means.'],
                ['02', 'Route', 'Choose human or judge authority before the implementation wave.'],
                ['03', 'Delegate', 'Give workers disjoint slices and one clear return contract.'],
                ['04', 'Verify', 'Integrate diffs, run focused CI, and review independently.'],
                ['05', 'Accept', 'Merge only when the selected policy and required evidence agree.'],
              ].map(([number, title, copy]) => (
                <article className="guide-step" key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
            <a className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d8fa74] hover:text-white" href={routeHref('/guide/agentic-workflow')}>
              Read the detailed workflow <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="bg-[#e9eee5] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="section-eyebrow">Cost that matters</p>
              <h2 className="section-heading">Optimize the accepted change, not the token bill.</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#64705f]">Count model spend, orchestration, review effort, and rework together. A lower-priced model is only a saving if the result still lands cleanly.</p>
              <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#52753a] hover:text-[#17201a]" href={routeHref('/guide/token-economics')}>
                Explore the cost comparison <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="overview-cost-card">
              <div className="overview-cost-row"><span>Model spend</span><b>+</b><span>Orchestration</span></div>
              <div className="overview-cost-row"><span>Review effort</span><b>+</b><span>Rework</span></div>
              <div className="overview-cost-result"><span>Cost per accepted result</span><strong>the number that matters</strong></div>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="section-eyebrow">Keep parallel work independent</p>
                <h2 className="section-heading">Separate candidates.<br />Refresh only when needed.</h2>
              </div>
              <span className="roadmap-badge">DESIGN DIRECTION · IN PROGRESS</span>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#667064]">For concurrent release candidates, isolate each stream and its handoff. When one reaches `main`, mark the others stale; rebase and revalidate a candidate only when it’s ready to resume UAT or promotion.</p>
            <div className="rc-board mt-8">
              <div className="rc-mainline"><span>MAIN · STABLE</span><i /><span className="rc-main-event">Human promotion</span></div>
              <div className="rc-lane">
                <span className="rc-name">RC A</span>
                <div className="rc-flow"><span>Base SHA</span><b>→</b><span>Worker</span><b>→</b><span>CI + judge</span><b>→</b><strong>rc1</strong></div>
                <small>Isolated UAT slot A</small>
              </div>
              <div className="rc-lane rc-lane-stale">
                <span className="rc-name">RC B</span>
                <div className="rc-flow"><span>Base SHA</span><b>→</b><span>Worker</span><b>→</b><span>CI + judge</span><b>→</b><strong>rc1</strong></div>
                <small><i /> Mark stale when main advances</small>
              </div>
              <div className="rc-refresh"><strong>On next UAT or promotion:</strong><span>rebase on new main → rerun checks and judge → immutable rc2 → redeploy</span></div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#808a79]">This candidate-lifecycle automation is a framework direction, not a claim that every forge is wired end-to-end today.</p>
          </div>
        </section>

        <section className="bg-[#f2f4ee] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="section-eyebrow">Go deeper</p>
                <h2 className="section-heading">A guide organized around real work.</h2>
              </div>
              <a className="text-sm font-bold text-[#52753a] hover:text-[#17201a]" href={routeHref('/guide/what-this-is')}>Start with the introduction →</a>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topicGroups.map((group, index) => (
                <article className="topic-card" key={group.title}>
                  <span className="topic-card-number">0{index + 1}</span>
                  <h3>{group.title}</h3>
                  <p>{descriptions[group.title] ?? 'Practical guidance for applying the agentic workflow in a real repository.'}</p>
                  <ul>
                    {group.items.slice(0, 3).map((item) => (
                      <li key={item.route}><a href={routeHref(item.route)}>{item.title}<span aria-hidden="true">→</span></a></li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ReaderFooter />
    </div>
  );
}

function ReaderLayout({
  doc,
  groups,
  query = '',
  onQuery,
  previous,
  next,
}: {
  doc: SiteDocument;
  groups: Array<{ title: string; items: Array<{ title: string; route: string }> }>;
  query?: string;
  onQuery?: (value: string) => void;
  previous?: Pick<SiteDocument, 'title' | 'route'>;
  next?: Pick<SiteDocument, 'title' | 'route'>;
}) {
  const sectionTitle = doc.scope === 'guide' ? 'THE PLAYBOOK' : 'THE STARTER';
  const source = <ExternalLink className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#577845] transition hover:text-[#17201a]" href={sourcePathHref(doc.sourcePath)}>View source <span aria-hidden="true">↗</span></ExternalLink>;
  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#17201a]">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14 lg:px-12 lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8 pr-2">
            <a className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#64705f] hover:text-[#17201a]" href={doc.scope === 'guide' ? '#/guide' : '#/starter'}>
              <span aria-hidden="true">←</span> {doc.scope === 'guide' ? 'Playbook home' : 'Starter overview'}
            </a>
            {onQuery && (
              <label className="mb-6 block">
                <span className="sr-only">Search playbook topics</span>
                <input className="reader-search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Find a topic…" type="search" />
              </label>
            )}
            <ReaderNav groups={groups} currentRoute={doc.route} />
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#17201a]/10 pb-4 lg:mb-8">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#829078]">
              <span>{sectionTitle}</span><span aria-hidden="true">/</span><span className="truncate normal-case tracking-normal text-[#5c6b55]">{doc.title}</span>
            </div>
            {source}
          </div>

          <details className="reader-mobile-nav mb-5 rounded-2xl border border-[#e0e6da] bg-white p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">Browse {doc.scope === 'guide' ? 'the playbook' : 'starter docs'}</summary>
            <div className="mt-4 max-h-80 overflow-y-auto">
              {onQuery && <input className="reader-search mb-4" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Find a topic…" type="search" />}
              <ReaderNav groups={groups} currentRoute={doc.route} />
            </div>
          </details>

          <article className="reader-article">
            <MarkdownBody doc={doc} />
          </article>

          {(previous || next) && (
            <nav className="mt-12 grid gap-3 border-t border-[#17201a]/10 pt-5 sm:grid-cols-2" aria-label="Article navigation">
              {previous ? (
                <a className="page-turn" href={routeHref(previous.route)}><span className="page-turn-label">← Previous</span><strong>{previous.title}</strong></a>
              ) : <span />}
              {next && <a className="page-turn text-right" href={routeHref(next.route)}><span className="page-turn-label">Next →</span><strong>{next.title}</strong></a>}
            </nav>
          )}
        </main>
      </div>
      <ReaderFooter />
    </div>
  );
}

function ReaderNav({ groups, currentRoute }: { groups: Array<{ title: string; items: Array<{ title: string; route: string }> }>; currentRoute: string }) {
  return (
    <nav className="space-y-6" aria-label="Documentation topics">
      {groups.map((group) => (
        <div key={group.title}>
          <h2 className="mb-2 px-2 text-[9px] font-extrabold uppercase tracking-[.17em] text-[#929d89]">{group.title}</h2>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.route}>
                <a
                  className={`reader-nav-link ${item.route === currentRoute ? 'reader-nav-active' : ''}`}
                  href={routeHref(item.route)}
                  aria-current={item.route === currentRoute ? 'page' : undefined}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function StarterOverview() {
  const featuredDocs = [
    ['Architecture', 'Hexagonal package layout', '/starter/docs/architecture/hexagonal'],
    ['Runbook', 'Approval loop', '/starter/docs/runbooks/approval-loop'],
    ['Standards', 'Review checklist', '/starter/docs/standards/review-checklist'],
  ];
  return (
    <div className="min-h-screen bg-[#f2f4ee] text-[#17201a]">
      <SiteHeader />
      <main>
        <section className="starter-hero px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="section-eyebrow">The starter</p>
            <h1 className="max-w-4xl text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[.96] tracking-[-.075em]">Start with a working harness.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6958]">A blank Maven + React project with agent roles, project docs, reusable handoffs, verification scripts, and CI ready to adapt to your product.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ExternalLink className="button-primary" href={`${repoUrl}/tree/main/app`}>Get the starter source <span aria-hidden="true">↗</span></ExternalLink>
              <a className="button-secondary" href="#/starter/docs">Browse starter docs <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>
        <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['01', 'Agent harness', 'OpenCode and Claude Code adapters, bounded worker roles, and explicit permission boundaries.'],
                ['02', 'Verification', 'Fast focused checks, static analysis, docs validation, and a CI baseline.'],
                ['03', 'State that resumes', 'One handoff per wave and one living plan per active workstream.'],
              ].map(([number, title, copy]) => (
                <article className="principle-card" key={number}>
                  <span className="principle-number">{number}</span>
                  <h2 className="mt-10 text-xl font-semibold tracking-[-.04em]">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#667064]">{copy}</p>
                </article>
              ))}
            </div>
            <div className="mt-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="section-eyebrow">Read the template docs</p>
                <h2 className="section-heading">Built to adapt, not copy blindly.</h2>
              </div>
              <a className="inline-flex items-center gap-2 text-sm font-bold text-[#52753a] hover:text-[#17201a]" href="#/starter/docs">Browse all starter docs <span aria-hidden="true">→</span></a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {featuredDocs.map(([kind, title, route]) => (
                <a className="doc-card" href={routeHref(route)} key={route}>
                  <span>{kind}</span><strong>{title}</strong><span className="doc-card-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ReaderFooter />
    </div>
  );
}

function ReaderFooter() {
  return (
    <footer className="border-t border-[#17201a]/10 bg-[#f2f4ee] px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-[#71806a] sm:flex-row sm:items-center">
        <a className="font-semibold text-[#283728]" href="#/">Agentic Approach</a>
        <span>Source content stays canonical in the repository.</span>
        <ExternalLink className="font-semibold hover:text-[#17201a]" href={repoUrl}>View source on GitHub ↗</ExternalLink>
      </div>
    </footer>
  );
}

function App() {
  const [location, setLocation] = useState(currentLocation);
  const [loadedDocument, setLoadedDocument] = useState<{ route: string; doc: SiteDocument | null }>({ route: '', doc: null });
  const entry = location.route === '/guide' ? undefined : entryByRoute.get(location.route);

  useEffect(() => {
    const updateLocation = () => setLocation(currentLocation());
    window.addEventListener('hashchange', updateLocation);
    return () => window.removeEventListener('hashchange', updateLocation);
  }, []);

  useEffect(() => {
    let current = true;
    if (!entry) {
      setLoadedDocument({ route: location.route, doc: null });
      return () => { current = false; };
    }
    entry.load().then((markdown) => {
      if (current) setLoadedDocument({ route: location.route, doc: makeDocument(entry.sourcePath, markdown) });
    }).catch(() => {
      if (current) setLoadedDocument({ route: location.route, doc: null });
    });
    return () => { current = false; };
  }, [entry, location.route]);

  useEffect(() => {
    if (location.route === '/') {
      window.scrollTo(0, 0);
      return;
    }
    requestAnimationFrame(() => {
      if (location.anchor) {
        document.getElementById(decodeURIComponent(location.anchor))?.scrollIntoView({ block: 'start' });
      } else {
        window.scrollTo(0, 0);
      }
    });
  }, [location.route, location.anchor]);

  useEffect(() => {
    const doc = loadedDocument.route === location.route ? loadedDocument.doc : null;
    document.title = location.route === '/guide'
      ? 'The workflow · Agentic Approach'
      : doc
        ? `${doc.title} · Agentic Approach`
        : location.route === '/starter'
          ? 'Starter · Agentic Approach'
          : 'Agentic Approach — Work with agents, keep control';
  }, [location.route, loadedDocument]);

  if (location.route === '/starter') return <StarterOverview />;
  if (location.route === '/guide') return <GuideOverview />;
  const doc = loadedDocument.route === location.route ? loadedDocument.doc : null;
  if (doc?.scope === 'guide') return <GuideReader doc={doc} />;
  if (doc?.scope === 'starter') return <StarterReader doc={doc} />;
  if (location.route.startsWith('/guide') || location.route.startsWith('/starter/docs')) {
    if (entry && loadedDocument.route !== location.route) {
      return <div className="doc-loading"><SiteHeader /><div className="loading-card"><span className="loading-mark" /><p>Loading the guide…</p></div></div>;
    }
    return (
      <div className="min-h-screen bg-[#f7f8f4] px-6 py-20 text-center">
        <SiteHeader />
        <h1 className="mt-12 text-4xl font-semibold tracking-[-.06em]">That page isn’t in this edition.</h1>
        <p className="mt-3 text-[#697466]">The playbook and starter pages are generated from the current repository content.</p>
        <a className="button-primary mt-8" href="#/guide">Open the guide index</a>
      </div>
    );
  }
  return <LandingPage />;
}

export default App;
