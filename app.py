import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Dhara Team Project Dashboard", layout="wide")

st.markdown("""
<style>
    .stApp { background: linear-gradient(135deg, #F5F7FA 0%, #EDF0F5 100%); }
    .main > div { padding-top: 1.5rem; }
    h1 {
        color: #1E3A5F !important;
        font-weight: 700 !important;
        font-size: 1.8rem !important;
        text-shadow: 1px 1px 0 rgba(255,255,255,0.8);
        border-bottom: 3px solid #1E3A5F;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
    }
    .stTabs [data-baseweb="tab"] { font-weight: 600; font-size: 0.95rem; letter-spacing: 0.3px; }
    div[data-testid="stExpander"] {
        background: white; border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        border: none; margin: 8px 0;
    }
    div[data-testid="stExpander"] > div:first-child { border-radius: 12px 12px 0 0; }
    div[data-testid="metric-container"] {
        background: linear-gradient(145deg, #FFFFFF 0%, #F8FAFE 100%);
        padding: 16px 20px; border-radius: 14px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        border: 1px solid rgba(30,58,95,0.08);
        position: relative; overflow: hidden;
    }
    div[data-testid="metric-container"]::before {
        content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
        background: linear-gradient(180deg, #1E3A5F, #2A5080);
        border-radius: 14px 0 0 14px;
    }
    div[data-testid="metric-container"]::after {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
        background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
        pointer-events: none;
    }
    .chart-card {
        background: white; border-radius: 14px; padding: 10px 14px 6px 14px;
        margin: 14px 0;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        border: 1px solid rgba(30,58,95,0.06);
    }
</style>
""", unsafe_allow_html=True)

st.title("Dhara Team Project Dashboard")

uploaded_file = st.file_uploader("Upload PM Excel File", type=["xlsx"])

FILTER_COLS_PROJ = ['Funding Type', 'AI Project or Not', 'DT Owner', 'Current Phase',
                     'Budget Status', 'Vetra Adopted or Not', 'Overall Status']
FILTER_COLS_TASK = ['Linked Project', 'Assignee', 'Priority', 'Progress']

PHASE_COLORS = {
    'DEV': '#7FC97F',
    'Budget Application': '#BEAED4',
    'UAT': '#FDC086',
}

def _fmt_lines(text):
    import re
    s = re.sub(r'([。])\s*', r'\1<br>', str(text))
    s = re.sub(r'(\.)\s+', r'\1<br>', s)
    return s.strip()

if uploaded_file:
    projects = pd.read_excel(uploaded_file, sheet_name="Projects")
    tasks = pd.read_excel(uploaded_file, sheet_name="Tasks")
    members = pd.read_excel(uploaded_file, sheet_name="Members")

    projects = projects[projects['Project Name'].notna()].copy()
    tasks = tasks[tasks['Task'].notna()].copy()
    members = members[members['Name'].notna()].copy()

    tab1, tab2, tab3 = st.tabs(["Dashboard", "Team Members", "Presentation View"])

    with tab1:
        mc1, mc2, mc3, mc4, mc5 = st.columns(5)
        mc1.metric("Project Count", len(projects))
        vetra_rate = len(projects[projects['Vetra Adopted or Not'] == 'Yes']) / len(projects) * 100
        mc2.metric("Vetra Adoption Rate", f"{vetra_rate:.1f}%")
        mc3.metric("Total Budget ($K)", f"${projects['Budget Amount ($K)'].sum():,.0f}")
        mc4.metric("Task Count", len(tasks))
        comp_rate = len(tasks[tasks['Progress'] == 'Completed']) / len(tasks) * 100
        mc5.metric("Task Completion Rate", f"{comp_rate:.1f}%")

        st.divider()

        phase_counts = projects['Current Phase'].value_counts().reset_index()
        phase_counts.columns = ['Current Phase', 'Count']
        colors = px.colors.qualitative.Bold + px.colors.qualitative.Set2
        fig_phase = px.bar(
            phase_counts, y='Current Phase', x='Count',
            orientation='h', title="Project Status Overview",
            color='Current Phase', color_discrete_sequence=colors,
            text='Count'
        )
        fig_phase.update_traces(
            textposition='outside', cliponaxis=False,
            marker=dict(line=dict(width=1, color='rgba(0,0,0,0.12)'))
        )
        fig_phase.update_layout(
            showlegend=False,
            yaxis={'categoryorder': 'total ascending', 'title': None},
            xaxis={
                'range': [0, 50], 'dtick': 5,
                'gridcolor': '#D0D8E0', 'gridwidth': 1,
                'title': None, 'showline': True, 'linecolor': '#B0B8C0',
                'zeroline': True, 'zerolinecolor': '#C0C8D0', 'zerolinewidth': 1.5
            },
            plot_bgcolor='rgba(245,247,250,0.6)',
            paper_bgcolor='rgba(255,255,255,0.5)',
            margin=dict(t=40, r=40, b=20, l=10),
            hoverlabel=dict(bgcolor='white', font_size=12, font_color='#1E3A5F'),
            font=dict(color='#4A6A8A')
        )
        st.markdown('<div class="chart-card">', unsafe_allow_html=True)
        st.plotly_chart(fig_phase, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)

        left, right = st.columns(2)
        with left:
            st.markdown('<div class="chart-card">', unsafe_allow_html=True)
            st.markdown(
                '<div style="font-size:1rem;font-weight:700;color:#1E3A5F;text-align:center;'
                'margin-bottom:4px;">Budget Distribution by Funding Type</div>',
                unsafe_allow_html=True
            )
            bs_opts = sorted(projects['Budget Status'].dropna().unique().tolist())
            sel_bs = st.multiselect("Filter by Budget Status", bs_opts, default=bs_opts)
            p_filtered = projects[projects['Budget Status'].isin(sel_bs)] if sel_bs else projects
            type_budget = p_filtered.groupby('Funding Type')['Budget Amount ($K)'].sum().reset_index()
            fig_type = px.pie(
                type_budget, values='Budget Amount ($K)', names='Funding Type',
                title=None, hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Set2,
            )
            fig_type.update_traces(
                texttemplate='%{label}<br>%{percent}<br><b>$%{value:,.0f}K</b>',
                textposition='outside', hovertemplate='<b>%{label}</b><br>$%{value:,.0f}K<br>%{percent}<extra></extra>',
                pull=[0.02]*len(type_budget),
                marker=dict(line=dict(width=2, color='white'))
            )
            fig_type.update_layout(
                hoverlabel=dict(bgcolor='white', font_size=12, font_color='#1E3A5F'),
                font=dict(color='#4A6A8A'),
                paper_bgcolor='rgba(255,255,255,0.3)',
            )
            st.plotly_chart(fig_type, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)

        with right:
            st.markdown('<div class="chart-card">', unsafe_allow_html=True)
            st.markdown(
                '<div style="font-size:1rem;font-weight:700;color:#1E3A5F;text-align:center;'
                'margin-bottom:4px;">Budget Distribution by Budget Status</div>',
                unsafe_allow_html=True
            )
            st.markdown('<div style="height:68px;"></div>', unsafe_allow_html=True)
            status_budget = projects.groupby('Budget Status')['Budget Amount ($K)'].sum().reset_index()
            fig_status = px.pie(
                status_budget, values='Budget Amount ($K)', names='Budget Status',
                title=None, hole=0.4,
                color_discrete_sequence=px.colors.qualitative.Set1,
            )
            fig_status.update_traces(
                texttemplate='%{label}<br>%{percent}<br><b>$%{value:,.0f}K</b>',
                textposition='outside', hovertemplate='<b>%{label}</b><br>$%{value:,.0f}K<br>%{percent}<extra></extra>',
                pull=[0.02]*len(status_budget),
                marker=dict(line=dict(width=2, color='white'))
            )
            fig_status.update_layout(
                hoverlabel=dict(bgcolor='white', font_size=12, font_color='#1E3A5F'),
                font=dict(color='#4A6A8A'),
                paper_bgcolor='rgba(255,255,255,0.3)',
            )
            st.plotly_chart(fig_status, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)

        with st.expander("Project Details"):
            pf = projects.copy()
            avail = [c for c in FILTER_COLS_PROJ if c in pf.columns]
            if avail:
                fcols = st.columns(len(avail))
                for i, c in enumerate(avail):
                    opts = ['All'] + sorted(pf[c].dropna().unique().tolist())
                    sel = fcols[i].selectbox(c, opts, key=f"pf_{c}")
                    if sel != 'All':
                        pf = pf[pf[c] == sel]
            st.dataframe(pf, use_container_width=True, hide_index=True)

        with st.expander("Task Details"):
            tf = tasks.copy()
            avail = [c for c in FILTER_COLS_TASK if c in tf.columns]
            if avail:
                fcols = st.columns(len(avail))
                for i, c in enumerate(avail):
                    opts = ['All'] + sorted(tf[c].dropna().unique().tolist())
                    sel = fcols[i].selectbox(c, opts, key=f"tf_{c}")
                    if sel != 'All':
                        tf = tf[tf[c] == sel]
            st.dataframe(tf, use_container_width=True, hide_index=True)

    with tab2:
        team_order = ['Regular Team', 'ISS Team']
        for team_name in team_order:
            team_members = members[members['Team'] == team_name]
            if team_members.empty:
                continue

            team_members = team_members.sort_values('Name')

            st.markdown(
                f'<div style="font-size:1.1rem;font-weight:700;color:#1E3A5F;'
                f'margin:20px 0 12px 0;padding:10px 16px;border-radius:10px;'
                f'background:linear-gradient(135deg,#E8EDF3,#DDE4EC);'
                f'box-shadow:inset 0 1px 0 rgba(255,255,255,0.6),0 2px 6px rgba(0,0,0,0.04);">'
                f'👥 {team_name}  ·  {len(team_members)} members</div>',
                unsafe_allow_html=True
            )

            prev_initial = ''
            for _, m in team_members.iterrows():
                name = m['Name']
                email = m.get('Email Address') or m.get('Email') or ''
                initial = name[0].upper() if name else ''

                if initial != prev_initial:
                    st.markdown(
                        f'<div style="font-size:0.8rem;font-weight:700;color:#9AAFC5;'
                        f'padding:2px 0 2px 8px;margin:8px 0 2px 0;'
                        f'border-bottom:1px solid #D8E0E8;">{initial}</div>',
                        unsafe_allow_html=True
                    )
                    prev_initial = initial

                projs = projects[projects['DT Owner'] == name]['Project Name'].tolist()
                tks = tasks[tasks['Assignee'] == name]['Task'].tolist()

                mc1, mc2 = st.columns([1, 3])
                with mc1:
                    st.markdown(
                        f'<div style="display:flex;align-items:center;gap:10px;padding:6px 8px;">'
                        f'<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(145deg,#1E3A5F,#2A5080);color:white;'
                        f'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;flex-shrink:0;'
                        f'box-shadow:0 2px 6px rgba(30,58,95,0.25),inset 0 1px 0 rgba(255,255,255,0.15);">'
                        f'{initial}</div>'
                        f'<div><div style="font-size:0.95rem;font-weight:600;color:#1E3A5F;">{name}</div>'
                        f'<div style="font-size:0.7rem;color:#8AA0B8;margin-top:1px;">{email}</div></div></div>',
                        unsafe_allow_html=True
                    )

                with mc2:
                    cc1, cc2 = st.columns(2)
                    with cc1:
                        badge = (f'<span style="display:inline-block;background:linear-gradient(145deg,#1565C0,#1976D2);color:white;'
                                 f'border-radius:12px;padding:0 10px;font-size:0.7rem;font-weight:700;'
                                 f'margin-left:8px;box-shadow:0 2px 4px rgba(21,101,192,0.3);'
                                 f'text-shadow:0 1px 1px rgba(0,0,0,0.15);">{len(projs)}</span>') if projs else ''
                        items = "".join(
                            f'<div style="background:linear-gradient(135deg,#E3F2FD,#D6E8FA);padding:4px 10px;border-radius:6px;'
                            f'margin:2px 0;font-size:0.82rem;color:#1E3A5F;'
                            f'box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 1px 2px rgba(0,0,0,0.04);">{p}</div>'
                            for p in projs
                        ) or '<div style="color:#AAA;font-style:italic;font-size:0.82rem;">No Projects</div>'
                        st.markdown(
                            f'<div style="background:linear-gradient(145deg,#F0F6FF,#E4EEFA);border:1px solid #C8D8EC;border-radius:10px;'
                            f'padding:10px;height:100%;'
                            f'box-shadow:0 4px 12px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.7);">'
                            f'<div style="font-size:0.78rem;font-weight:700;color:#1565C0;text-transform:uppercase;'
                            f'letter-spacing:0.5px;margin-bottom:6px;border-bottom:2px solid #1565C0;padding-bottom:4px;'
                            f'text-shadow:0 1px 0 rgba(255,255,255,0.5);">'
                            f'PROJECTS{badge}</div>{items}</div>',
                            unsafe_allow_html=True
                        )
                    with cc2:
                        badge = (f'<span style="display:inline-block;background:linear-gradient(145deg,#E65100,#F57C00);color:white;'
                                 f'border-radius:12px;padding:0 10px;font-size:0.7rem;font-weight:700;'
                                 f'margin-left:8px;box-shadow:0 2px 4px rgba(230,81,0,0.3);'
                                 f'text-shadow:0 1px 1px rgba(0,0,0,0.15);">{len(tks)}</span>') if tks else ''
                        items = "".join(
                            f'<div style="background:linear-gradient(135deg,#FFF3E0,#FDE8D0);padding:4px 10px;border-radius:6px;'
                            f'margin:2px 0;font-size:0.82rem;color:#A04000;'
                            f'box-shadow:inset 0 1px 0 rgba(255,255,255,0.5),0 1px 2px rgba(0,0,0,0.04);">{t}</div>'
                            for t in tks
                        ) or '<div style="color:#AAA;font-style:italic;font-size:0.82rem;">No Tasks</div>'
                        st.markdown(
                            f'<div style="background:linear-gradient(145deg,#FFF8F0,#FEF0E0);border:1px solid #E8D0B8;border-radius:10px;'
                            f'padding:10px;height:100%;'
                            f'box-shadow:0 4px 12px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,0.7);">'
                            f'<div style="font-size:0.78rem;font-weight:700;color:#E65100;text-transform:uppercase;'
                            f'letter-spacing:0.5px;margin-bottom:6px;border-bottom:2px solid #E65100;padding-bottom:4px;'
                            f'text-shadow:0 1px 0 rgba(255,255,255,0.5);">'
                            f'TASKS{badge}</div>{items}</div>',
                            unsafe_allow_html=True
                        )

                st.markdown('<div style="height:10px;"></div>', unsafe_allow_html=True)

    with tab3:
        owners = sorted(projects['DT Owner'].dropna().unique())
        selected = st.multiselect("Filter by DT Owner", owners, default=owners)

        pf = projects[projects['DT Owner'].isin(selected)] if selected else projects

        for owner in sorted(pf['DT Owner'].unique()):
            owner_projs = pf[pf['DT Owner'] == owner]
            st.markdown(
                f'<div style="font-size:1.05rem;font-weight:700;color:#1E3A5F;'
                f'margin:24px 0 12px 0;padding:8px 14px;border-radius:8px;'
                f'background:linear-gradient(135deg,#E8EDF3,#DDE4EC);'
                f'box-shadow:inset 0 1px 0 rgba(255,255,255,0.6),0 2px 6px rgba(0,0,0,0.04);">'
                f'👤 {owner}  ·  {len(owner_projs)} projects</div>',
                unsafe_allow_html=True
            )

            for _, proj in owner_projs.iterrows():
                pname = proj['Project Name']
                phase = proj.get('Current Phase', '')
                obj_val = proj.get('Objectives', '')
                obj = '' if (isinstance(obj_val, float) and pd.isna(obj_val)) else str(obj_val or '')
                upd_val = proj.get('Key Updates', '')
                updates = '' if (isinstance(upd_val, float) and pd.isna(upd_val)) else str(upd_val or '')
                linked = tasks[tasks['Linked Project'] == pname]

                phase_color = PHASE_COLORS.get(phase, '#1E3A5F')
                phase_badge = (
                    f'<span style="display:inline-block;background:{phase_color};color:white;'
                    f'border-radius:10px;padding:0 10px;font-size:0.7rem;font-weight:600;'
                    f'margin-left:8px;">{phase}</span>'
                ) if phase else ''

                st.markdown(
                    f'<div style="background:white;border-radius:12px;padding:16px 20px;margin:8px 0;'
                    f'box-shadow:0 4px 16px rgba(0,0,0,0.06),0 1px 3px rgba(0,0,0,0.04);'
                    f'border-left:4px solid #1E3A5F;">'
                    f'<div style="font-size:1rem;font-weight:700;color:#1E3A5F;margin-bottom:12px;'
                    f'border-bottom:2px solid #E8EDF3;padding-bottom:8px;">'
                    f'{pname}{phase_badge}</div>'
                    f'<div style="display:flex;gap:20px;">'
                    f'<div style="flex:1;"><div style="font-size:0.75rem;font-weight:700;color:#1565C0;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Objectives</div>'
                    f'<div style="font-size:0.88rem;color:#333;line-height:1.6;">{_fmt_lines(obj) or "<span style=color:#AAA;font-style:italic;>No objectives recorded</span>"}</div></div>'
                    f'<div style="flex:1;"><div style="font-size:0.75rem;font-weight:700;color:#E65100;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Key Updates</div>'
                    f'<div style="font-size:0.88rem;color:#333;line-height:1.6;">{_fmt_lines(updates) or "<span style=color:#AAA;font-style:italic;>No updates recorded</span>"}</div></div>'
                    f'</div></div>',
                    unsafe_allow_html=True
                )

                if len(linked):
                    with st.expander(f"📋 Tasks ({len(linked)})"):
                        show = linked[['Task', 'Priority', 'Progress', 'Start Date', 'End Date']].copy()
                        for c in ['Start Date', 'End Date']:
                            if c in show.columns:
                                show[c] = pd.to_datetime(show[c], errors='coerce').dt.strftime('%Y-%m-%d')
                        st.dataframe(show, use_container_width=True, hide_index=True)

else:
    st.info("Upload Excel file to get started")