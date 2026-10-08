import type { ReactNode } from 'react';

const repoUrl = 'https://github.com/mbmjava/agentic-approach';

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
          <a className="font-semibold text-[#d8fa74] transition hover:text-white" href={`${repoUrl}/blob/main/guide/coding-flow.svg`} target="_blank" rel="noreferrer">
            View full flow <span aria-hidden="true">↗</span>
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

function App() {
  return (
    <div className="min-h-screen bg-[#f2f4ee] text-[#17201a]">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="relative z-10 border-b border-[#17201a]/[.08]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <a className="flex items-center gap-3" href="#top" aria-label="Agentic Approach home">
            <BrandMark />
            <span className="text-sm font-bold tracking-[-.03em]">agentic<span className="font-medium text-[#697365]"> approach</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#566052] md:flex" aria-label="Main navigation">
            <a className="transition hover:text-[#17201a]" href="#flow">The flow</a>
            <a className="transition hover:text-[#17201a]" href="#principles">Principles</a>
            <a className="transition hover:text-[#17201a]" href="#start">Get started</a>
          </nav>
          <details className="mobile-menu relative md:hidden">
            <summary aria-label="Toggle navigation menu" className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-[#17201a]/15 bg-white/70 text-[#17201a]">
              <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
                <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </summary>
            <nav className="absolute right-0 top-12 z-50 flex min-w-48 flex-col rounded-2xl border border-[#17201a]/10 bg-white p-2 shadow-xl" aria-label="Mobile navigation">
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#flow">The flow</a>
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#principles">Principles</a>
              <a className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#475541] hover:bg-[#f2f4ee]" href="#start">Get started</a>
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
                <ExternalLink className="button-secondary" href={`${repoUrl}/tree/main/guide`}>Read the playbook <span aria-hidden="true">↗</span></ExternalLink>
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

        <section className="overflow-hidden bg-[#121a15] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="max-w-lg">
              <p className="section-eyebrow text-[#bfe66a]">Earn autonomy</p>
              <h2 className="section-heading text-white">Trust is a release process, too.</h2>
              <p className="mt-5 text-base leading-7 text-white/60">
                Don’t jump from “agent can write code” to “agent can ship anything.” Start with evidence, learn where the gates work, then automate only the paths your policy allows.
              </p>
              <ExternalLink className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#d8fa74] transition hover:text-white" href={`${repoUrl}/blob/main/guide/approval-authority.md`}>
                Read about approval authority <span aria-hidden="true">↗</span>
              </ExternalLink>
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
              <ExternalLink className="resource-card" href={`${repoUrl}/tree/main/guide`}>
                <span className="resource-tag">THE PLAYBOOK</span>
                <span className="resource-arrow" aria-hidden="true">↗</span>
                <span className="mt-8 block text-2xl font-semibold tracking-[-.05em]">Learn the approach</span>
                <span className="mt-2 block max-w-md text-sm leading-6 text-[#63705e]">Short, tool-neutral guidance on orchestration, delegation, verification, context, and adoption.</span>
                <span className="resource-link">Explore the guide <span aria-hidden="true">→</span></span>
              </ExternalLink>
              <ExternalLink className="resource-card resource-card-dark" href={`${repoUrl}/tree/main/app`}>
                <span className="resource-tag">THE STARTER</span>
                <span className="resource-arrow" aria-hidden="true">↗</span>
                <span className="mt-8 block text-2xl font-semibold tracking-[-.05em]">Start with the harness</span>
                <span className="mt-2 block max-w-md text-sm leading-6 text-white/55">A blank Maven + React project with agent roles, docs, reusable templates, checks, and CI wired in.</span>
                <span className="resource-link resource-link-light">Explore the starter <span aria-hidden="true">→</span></span>
              </ExternalLink>
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

export default App;
