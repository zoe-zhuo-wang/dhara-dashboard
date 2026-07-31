export default function Guide() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.01em' }}>User Guide</h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>How to use the Dhara Team Dashboard — start from Projects to build your data, then explore the rest.</p>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
        {['Invite your team', 'Projects — enter your data first', 'Dashboard — see the big picture', 'People — manage your roster', 'BMS — weekly review meeting', 'Tips'].map((s, i) => (
          <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#1e40af', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <Section number="1" title="Invite Your Team" accent="#0f766e">
        <p style={{ marginTop: 0 }}>Before adding projects, make sure your team members are in the system. Click the <strong>Invite</strong> button in the top bar to send invitations.</p>
        <ul>
          <li><strong>Admin</strong> — full access to all features, including managing people and deleting data.</li>
          <li><strong>Member</strong> — can view and edit all project data.</li>
        </ul>
        <p>Once invited, each person appears in the <strong>People</strong> section automatically. You can also add people manually there.</p>
      </Section>

      <Section number="2" title="Projects" accent="#1e40af">
        <p style={{ marginTop: 0 }}>This is where everything starts. Fill in your project details first — the rest of the dashboard runs on this data.</p>
        <ul>
          <li><strong>Create a Project</strong> — Click <em>+ New Project</em>, fill in all 13 required fields, and submit. Red borders show what's missing.</li>
          <li><strong>DT Focal</strong> — You can assign <strong>multiple</strong> team members. Just check the boxes next to their names, or click <em>+ Add Person</em> if someone isn't in the list yet.</li>
          <li><strong>Edit / Delete</strong> — Use the buttons in the Actions column on the right.</li>
          <li><strong>View</strong> — Click <em>View</em> to see all project details in a read-only modal.</li>
          <li><strong>Customize Columns</strong> — Click the <em>Columns</em> button to show or hide fields. Your most-used columns are on by default.</li>
          <li><strong>Filter & Search</strong> — Use the dropdown filters in each column header, or type in the search box to find projects quickly.</li>
          <li><strong>Export to Excel</strong> — Click <em>Export Excel</em> to download the current filtered list. Each export gets a timestamp so you never overwrite a file.</li>
        </ul>
      </Section>

      <Section number="3" title="Dashboard" accent="#7c3aed">
        <p style={{ marginTop: 0 }}>A high-level view of everything in your Projects table. All charts update automatically as project data changes.</p>
        <ul>
          <li><strong>Overview Cards</strong> — Total Projects, Vetra Adoption Rate, and Total Budget at a glance.</li>
          <li><strong>Bar Chart</strong> — Project count grouped by current phase.</li>
          <li><strong>Donut Charts</strong> — Budget breakdown by funding type and budget status.</li>
        </ul>
      </Section>

      <Section number="4" title="People" accent="#059669">
        <p style={{ marginTop: 0 }}>Manage your team roster. Anyone added here becomes available as a DT Focal in the Projects form.</p>
        <ul>
          <li><strong>Add / Edit / Delete</strong> team members as needed.</li>
          <li><strong>Team Filter</strong> — Toggle between All / Regular Team / ISS Team.</li>
          <li><strong>Search</strong> — by name or email.</li>
        </ul>
      </Section>

      <Section number="5" title="BMS — Weekly Meeting View" accent="#d97706">
        <p style={{ marginTop: 0 }}>Designed for weekly project progress reviews. Quick edits and a clean, status-focused layout.</p>
        <ul>
          <li><strong>Filter by DT Focal</strong> — Pick one person to see only their projects.</li>
          <li><strong>Inline Edit</strong> — Click a project's Current Phase or Overall Status badge to change it on the spot.</li>
          <li><strong>Rich Text Updates</strong> — Use Bold, Italic, Underline, font color, and highlight in the Key Updates editor.</li>
          <li><strong>Auto-save</strong> — Changes are saved instantly and reflected on the Projects page. A green toast confirms success.</li>
        </ul>
      </Section>

      <Section number="6" title="Tips" accent="#78716c">
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
