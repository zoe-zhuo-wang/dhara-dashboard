export default function Guide() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.01em' }}>User Guide</h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>How to use the Dhara Team Dashboard — start from Projects to build your data, then explore the rest.</p>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
        {['Add your team', 'Projects — enter your data first', 'Dashboard — see the big picture', 'People — manage your roster', 'Whitelist — who can sign in', 'BMS — weekly review meeting', 'Tips'].map((s, i) => (
          <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <Section number="1" title="Add Your Team" accent="#0f766e">
        <p style={{ marginTop: 0 }}>Before adding projects, make sure your team members are in the system and know how they'll get in.</p>
        <ul>
          <li><strong>People who will log in</strong> — their email must be on the access <strong>Whitelist</strong>. The whitelist is the gate for <em>both</em> signing in and creating an account: if an email isn't on it, the login page will reject it. Add a person with <em>+ Add Person</em> on the <strong>People</strong> page, then click <em>+ Whitelist</em> on their card — or go straight to the <strong>Whitelist</strong> page and use <em>+ Add Email</em> / <em>Add from People</em>.</li>
          <li><strong>Once whitelisted, there are two ways to get an account:</strong>
            <ul>
              <li><strong>Invite (recommended)</strong> — Any signed-in member clicks the <em>Invite</em> button in the top bar, enters the person's name, email, and team. The system emails them an invite link to set their own password, and also shows a backup copyable link in case the email doesn't arrive.</li>
              <li><strong>Self sign-up</strong> — The person opens the login page, clicks <em>Create Account</em>, and sets their own password (whitelist-checked).</li>
            </ul>
          </li>
          <li><strong>People who won't log in</strong> (e.g. vendors, suppliers) — add them manually with the <em>+ Add Person</em> button on the <strong>People</strong> page. No whitelist entry needed.</li>
          <li><strong>First login</strong> — When a whitelisted person signs in for the first time, their account is automatically linked to their People record (matched by email), so they show up in the <strong>People</strong> list without you adding them twice.</li>
        </ul>
        <p>Everyone who signs in can view, add, and edit all project data. Only the system owner can change the code or database.</p>
      </Section>

      <Section number="2" title="Projects" accent="#1e40af">
        <p style={{ marginTop: 0 }}>This is where everything starts. Fill in your project details first — the rest of the dashboard runs on this data.</p>
        <ul>
          <li><strong>Create a Project</strong> — Click <em>+ New Project</em>, fill in all required fields (marked with *), and submit. Red borders show what's missing.</li>
          <li><strong>Edit / Delete</strong> — Use the buttons in the Actions column on the right.</li>
          <li><strong>View</strong> — Click <em>View</em> to see all project details in a read-only modal.</li>
          <li><strong>Customize Columns</strong> — Click the <em>Columns</em> button to show or hide fields. Your most-used columns are on by default.</li>
          <li><strong>Custom Phase / Custom Biz Group</strong> — The Current Phase and Biz Group dropdowns have a <em>＋ Custom…</em> option if the presets don't cover your project. Custom values automatically appear everywhere (BMS, filters, Dashboard chart).</li>
          <li><strong>Filter & Search</strong> — Use the dropdown filters in each column header (Biz Focal / IT Focal filters are built from the values already entered), or type in the search box to find projects quickly.</li>
          <li><strong>Export to Excel</strong> — Click <em>Export Excel</em> to download the current filtered list. Each export gets a timestamp so you never overwrite a file.</li>
        </ul>

        <h4 style={{ fontSize: 14, fontWeight: 700, margin: '24px 0 8px', color: '#0f172a' }}>Field-by-field guide</h4>
        <div style={{ display: 'grid', gap: 10 }}>
          <FieldGuide name="Project Name" desc="The name of the project as the team will refer to it. Keep it short and recognizable." />
          <FieldGuide name="Biz Group" desc={<>Which business group the project belongs to. Pick one of the three standard groups, or choose ＋ Custom Biz Group… if the project spans groups or uses another name. Once a custom value is saved it becomes filterable and reusable.
            <OptionList items={[
              ['IDG', 'Intelligent Devices Business Group — Lenovo\'s core revenue pillar: PCs/AI PCs, tablets, Moto smartphones, workstations and other smart endpoints (~24% global PC market share).'],
              ['ISG', 'Infrastructure Solutions Business Group — AI infrastructure: AI servers, enterprise storage, networking, HPC and Neptune liquid cooling (top-3 global x86 server share).'],
              ['SSG', 'Solutions & Services Business Group — highest-margin arm: IT support, remote operations, TruScale as-a-Service and vertical AI transformation solutions.'],
            ]} />
          </>} />
          <FieldGuide name="Biz Focal" desc="The business owner / business point-of-contact for this project (free text — type the person's name)." />
          <FieldGuide name="IT Focal" desc="The IT point-of-contact for this project (free text — type the person's name)." />
          <FieldGuide name="DT Focal" desc="The delivery team member(s) accountable for the project. You can assign multiple — just tick the boxes next to their names. If someone isn't in the list yet, use + Add Person to add them on the spot." />
          <FieldGuide name="Start Date / End Date" desc="Planned start and end of the project. Used for scheduling and reporting." />
          <FieldGuide name="Description" desc="A short paragraph explaining what the project is about." />
          <FieldGuide name="Biz Benefit" desc={<>Business benefits are the value or advantages a project is expected to deliver. Common benefit indicators include: cost saving, cost avoidance, HC saving (headcount reduction), man-hour / effort saving, revenue increase, customer satisfaction score (CSAT), operational efficiency (e.g. lead time reduction), compliance adherence, defect escape rate, technical accuracy, reusability rate, and user adoption rate.<br />Where possible, quantify the expected benefit (e.g. reduce lead time from 10 days to 5 days) so it is measurable.</>} />
          <FieldGuide name="Funding Type" desc={<>Where the project's budget comes from.
            <OptionList items={[
              ['R&D', 'Research & Development budget'],
              ['R&D AI', 'Research & Development budget for AI-related work'],
              ['Vendor Onboarding', 'budget tied to onboarding a vendor / supplier'],
              ['BAU', 'Business As Usual — ongoing operational funding'],
            ]} />
          </>} />
          <FieldGuide name="Budget ($)" desc="Approved budget amount in US dollars. Numeric only." />
          <FieldGuide name="Budget Status" desc={<>Lifecycle of the budget.
            <OptionList items={[
              ['Draft', 'budget is being prepared, not yet submitted'],
              ['Ongoing', 'budget request has been submitted; review / approval is still in progress'],
              ['Approved', 'budget is formally approved and available'],
            ]} />
          </>} />
          <FieldGuide name="Vetra Adopted" desc={<>Whether this project follows the Vetra framework.
            <OptionList items={[
              ['Yes', 'the project is adopting Vetra'],
              ['No', 'the project is not using Vetra'],
            ]} />
          </>} />
          <FieldGuide name="Key Updates" desc={<>Structured weekly progress notes, shown as a small table. Each row is one update made of five fields; the sequence number (<strong>#</strong>) is filled in automatically — <strong>#1</strong> is the previous version, <strong>#2</strong> the latest. <strong>Progress</strong> is required; the other fields (Next Steps / Blockers / ETA / Owner) are optional. Edit the latest row from the BMS tab.
            <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
              <PhaseLine name="Progress" desc="What's been done since the last meeting. Supports rich text (bold, color, highlight)." />
              <PhaseLine name="Next Steps" desc="What's planned before the next meeting." />
              <PhaseLine name="Blockers / Risks" desc="Anything blocking progress, or who needs help." />
              <PhaseLine name="ETA" desc="Expected completion date for the current phase / milestone." />
              <PhaseLine name="Owner" desc="Who reported this update." />
            </div>
            <span style={{ color: '#64748b', fontSize: 13 }}>Every save keeps the previous version as the read-only <em>#1 row</em>, so you can compare week to week. On the Projects page, the <em>Key Updates</em> column merges each row into a numbered point (1. Progress: …; Next Step: …).</span>
          </>} />
          <FieldGuide name="Overall Status" desc={<>Overall health of the project.
            <OptionList items={[
              ['On Track', 'progress matches plan; no major risks'],
              ['Caution', 'minor delays or risks; needs attention'],
              ['Off Track', 'significant delay or issue; needs intervention'],
              ['Finished', 'project is complete and closed'],
              ['Not Started', 'work has not begun yet'],
            ]} />
          </>} />
          <FieldGuide name="Current Phase" desc={<>Which stage of the project lifecycle the project is in right now. Pick a preset below or use ＋ Custom Phase… if your stage isn't listed. A project moves through these stages in order; each stage must be completed and approved before the next one begins:
            <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
              <PhaseLine name="Concept" desc="Analyze business pain points, draft high-level initiative and value assessment, validate project opportunity." />
              <PhaseLine name="Budget Application" desc="Prepare project initiation documents and ROI analysis; complete budget submission and senior management review and approval." />
              <PhaseLine name="BSR (Business Solution Requirement)" desc="Define end-to-end business processes and business rules; obtain formal sign-off from business stakeholders." />
              <PhaseLine name="ISR (IT System Requirement)" desc="Translate business requirements into IT-readable specifications: functional & non-functional requirements, interfaces and architecture design; baseline freeze of requirements." />
              <PhaseLine name="DEV (Development)" desc="Conduct coding, unit testing, internal module and interface integration." />
              <PhaseLine name="SIT / UAT / MTP" desc="SIT: System Integration Test — verify end-to-end integration of system modules and interfaces. UAT: User Acceptance Test — business stakeholders validate solution against business needs. MTP: Move-to-Production — full dry-run of production cut-over including data migration and deployment procedure." />
              <PhaseLine name="Pre-Go-live" desc="Complete production environment readiness, master data preparation, end-user training, operation manuals, roll-back plan, go-live checklist and change request approval." />
              <PhaseLine name="Go-live" desc="Production deployment and business cut-over; activate hypercare support window." />
              <PhaseLine name="Post-Go-live / Closure" desc="Verify business benefits after launch; close outstanding issues; conduct project retrospective, archive project documents and release resources for formal project closure." />
            </div>
          </>} />
        </div>
      </Section>

      <Section number="4" title="Dashboard" accent="#7c3aed">
        <p style={{ marginTop: 0 }}>A high-level view of everything in your Projects table. All charts update automatically as project data changes.</p>
        <ul>
          <li><strong>Overview Cards</strong> — Total Projects, Vetra Adoption Rate, and Total Budget at a glance.</li>
          <li><strong>Bar Chart</strong> — Project count grouped by current phase.</li>
          <li><strong>Donut Charts</strong> — Budget breakdown by funding type and budget status.</li>
        </ul>
      </Section>

      <Section number="5" title="People" accent="#059669">
        <p style={{ marginTop: 0 }}>Manage your team roster. Anyone added here becomes available as a DT Focal in the Projects form.</p>
        <ul>
          <li><strong>Add / Edit / Delete</strong> team members as needed.</li>
          <li><strong>Team Filter</strong> — Toggle between All / Regular Team / ISS Team.</li>
          <li><strong>Search</strong> — by name or email.</li>
          <li><strong>Grant login access</strong> — Click <em>+ Whitelist</em> on a person's card to let them sign in. Whitelisted people show an <em>In Whitelist</em> badge. See the next section for managing the whitelist itself.</li>
        </ul>
      </Section>

      <Section number="6" title="Whitelist" accent="#0d9488">
        <p style={{ marginTop: 0 }}>The master list of who is allowed to sign in / create an account — the gate for all access.</p>
        <ul>
          <li><strong>Add Email</strong> — Click <em>+ Add Email</em> to allow a specific address. Only whitelisted emails can get in.</li>
          <li><strong>Add from People</strong> — One click adds every email from the People list that isn't whitelisted yet. The badge shows how many are missing.</li>
          <li><strong>Active toggle</strong> — Switch a person on or off; disabling immediately revokes their access.</li>
          <li><strong>Remove</strong> — Deletes the entry permanently.</li>
          <li><strong>Search</strong> — Filter the list by email or note.</li>
        </ul>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>A whitelist entry only grants <em>permission</em> to sign in — the account itself is created via the top-bar <em>Invite</em> button or the login page's <em>Create Account</em> (see section 1).</p>
      </Section>

      <Section number="7" title="BMS — Weekly Meeting View" accent="#d97706">
        <p style={{ marginTop: 0 }}>Designed for weekly project progress reviews. Quick edits and a clean, status-focused layout.</p>
        <ul>
          <li><strong>Filter by DT Focal</strong> — Pick one person to see only their projects.</li>
          <li><strong>Focal badges</strong> — Each card shows its <em>DT / Biz / IT Focal</em> at a glance.</li>
          <li><strong>Inline Edit</strong> — Click a project's Current Phase or Overall Status badge to change it on the spot. Current Phase also supports <em>＋ Custom Phase…</em>.<br/>
          <span style={{ color: '#94a3b8' }}>Tip: custom values are synced across the app — once added, they show up in other tabs and the Dashboard chart (each phase gets its own color).</span></li>
          <li><strong>Structured Updates</strong> — Key Updates is a small table: each row holds <em>Progress / Next Steps / Blockers / ETA / Owner</em> plus an auto-filled sequence number, ETA, and update date. Text fields support rich text (bold, color, highlight); Progress is required to save.</li>
          <li><strong>Two-row table</strong> — Saving keeps the previous version as row <em>#1</em> (read-only) under the latest row <em>#2</em>, so you can compare week to week.</li>
          <li><strong>Auto-save</strong> — Changes are saved instantly and reflected on the Projects page. A green toast confirms success.</li>
        </ul>
      </Section>

      <Section number="8" title="Tips" accent="#78716c">
        <ul>
          <li>Always start from the <strong>Projects</strong> page — it's the source of truth for everything else.</li>
          <li>Press <strong>Ctrl+F5</strong> (hard refresh) if data seems outdated.</li>
          <li>Collapse the sidebar for more screen space while working.</li>
          <li>Need to add a team member? Do it right inside the Project form via <em>+ Add Person</em>.</li>
        </ul>
      </Section>
    </div>
  )
}

function FieldGuide({ name, desc }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', whiteSpace: 'nowrap', paddingTop: 1, width: 150, flexShrink: 0 }}>{name}</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#334155', flex: 1, minWidth: 0 }}>{desc}</div>
    </div>
  )
}

function OptionList({ items }) {
  return (
    <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
      {items.map(([opt, d]) => (
        <div key={opt} style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
          <strong style={{ color: '#334155' }}>{opt}</strong>
          {' — '}{d}
        </div>
      ))}
    </div>
  )
}

function PhaseLine({ name, desc }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #eef2f7' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', paddingTop: 1, width: 165, flexShrink: 0 }}>{name}</span>
      <span style={{ fontSize: 13, lineHeight: 1.6, color: '#334155', flex: 1, minWidth: 0 }}>{desc}</span>
    </div>
  )
}

function Section({ number, title, children, accent }) {
  return (
    <div style={{ marginBottom: 36, padding: '24px 28px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{number}</span>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#0f172a' }}>{title}</h3>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: '#334155' }}>
        {children}
      </div>
    </div>
  )
}
