import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Dhara Team Project Dashboard", layout="wide")

st.title("📊 Dhara Team Project Dashboard")

uploaded_file = st.file_uploader("上传最新的 PM Excel 文件", type=["xlsx"])

if uploaded_file:
    projects = pd.read_excel(uploaded_file, sheet_name="Projects")
    tasks = pd.read_excel(uploaded_file, sheet_name="Tasks")
    members = pd.read_excel(uploaded_file, sheet_name="Members")

    projects = projects[projects['Project Name'].notna()].copy()
    tasks = tasks[tasks['Task'].notna()].copy()
    members = members[members['Name'].notna()].copy()

    tab1, tab2 = st.tabs(["📊 Dashboard", "👥 Team Members"])

    with tab1:
        col1, col2, col3, col4, col5 = st.columns(5)
        project_count = len(projects)
        col1.metric("Project Count", project_count)
        vetra_yes = projects[projects['Vetra Adopted or Not'] == 'Yes']
        vetra_rate = len(vetra_yes) / len(projects) * 100 if len(projects) > 0 else 0
        col2.metric("Vetra Adoption Rate", f"{vetra_rate:.1f}%")
        total_budget = projects['Budget Amount ($K)'].sum()
        col3.metric("Total Budget ($K)", f"${total_budget:,.0f}")
        task_count = len(tasks)
        col4.metric("Task Count", task_count)
        completed = tasks[tasks['Progress'] == 'Completed']
        completion_rate = len(completed) / len(tasks) * 100 if len(tasks) > 0 else 0
        col5.metric("Task Completion Rate", f"{completion_rate:.1f}%")

        st.divider()

        phase_counts = projects['Current Phase'].value_counts().reset_index()
        phase_counts.columns = ['Current Phase', 'Count']
        fig_phase = px.bar(
            phase_counts, y='Current Phase', x='Count',
            orientation='h', title="Project Status Overview",
            color='Count', color_continuous_scale='Blues'
        )
        fig_phase.update_layout(
            yaxis={'categoryorder': 'total ascending'},
            xaxis={'range': [0, 50], 'dtick': 1}
        )
        st.plotly_chart(fig_phase, use_container_width=True)

        col_pie1, col_pie2 = st.columns(2)
        budget_by_type = projects.groupby('Funding Type')['Budget Amount ($K)'].sum().reset_index()
        fig_type = px.pie(
            budget_by_type, values='Budget Amount ($K)', names='Funding Type',
            title="Budget Distribution by Funding Type", hole=0.4
        )
        col_pie1.plotly_chart(fig_type, use_container_width=True)

        budget_by_status = projects.groupby('Budget Status')['Budget Amount ($K)'].sum().reset_index()
        fig_status = px.pie(
            budget_by_status, values='Budget Amount ($K)', names='Budget Status',
            title="Budget Distribution by Status", hole=0.4
        )
        col_pie2.plotly_chart(fig_status, use_container_width=True)

        with st.expander("📋 Projects 详情"):
            proj_filtered = projects.copy()
            cat_cols_proj = [c for c in proj_filtered.columns
                             if proj_filtered[c].dtype == 'object' and proj_filtered[c].nunique() < 20]
            if cat_cols_proj:
                cols = st.columns(len(cat_cols_proj))
                for i, c in enumerate(cat_cols_proj):
                    vals = ['All'] + sorted(proj_filtered[c].dropna().unique().tolist())
                    sel = cols[i].selectbox(c, vals, key=f"pf_{c}")
                    if sel != 'All':
                        proj_filtered = proj_filtered[proj_filtered[c] == sel]
            st.dataframe(proj_filtered, use_container_width=True, hide_index=True)

        with st.expander("📋 Tasks 详情"):
            task_filtered = tasks.copy()
            cat_cols_task = [c for c in task_filtered.columns
                             if task_filtered[c].dtype == 'object' and task_filtered[c].nunique() < 20]
            if cat_cols_task:
                cols = st.columns(len(cat_cols_task))
                for i, c in enumerate(cat_cols_task):
                    vals = ['All'] + sorted(task_filtered[c].dropna().unique().tolist())
                    sel = cols[i].selectbox(c, vals, key=f"tf_{c}")
                    if sel != 'All':
                        task_filtered = task_filtered[task_filtered[c] == sel]
            st.dataframe(task_filtered, use_container_width=True, hide_index=True)

    with tab2:
        st.markdown("## 👥 Team Members")

        for _, member in members.iterrows():
            member_name = member['Name']
            member_team = member['Team']
            member_email = member['Email Address'] if pd.notna(member.get('Email Address', '')) else ''

            member_projects = projects[projects['DT Owner'] == member_name]['Project Name'].tolist()
            member_tasks = tasks[tasks['Assignee'] == member_name]['Task'].tolist()

            col_m1, col_m2 = st.columns([1, 3])

            with col_m1:
                st.markdown(f"### {member_name}")
                st.caption(f"**Team:** {member_team}")
                if member_email:
                    st.caption(f"*{member_email}*")

            with col_m2:
                c1, c2 = st.columns(2)
                with c1:
                    items_proj = "".join(
                        f'<div style="background:#E3F2FD;padding:6px 10px;border-radius:6px;margin:4px 0;font-size:13px;">📁 {p}</div>'
                        for p in member_projects
                    ) if member_projects else '<div style="color:#999;font-style:italic;font-size:13px;">No Projects</div>'
                    st.markdown(
                        f'<div style="background:#F0F8FF;border-left:4px solid #1976D2;border-radius:8px;padding:12px;height:100%;">'
                        f'<div style="font-weight:600;color:#1976D2;margin-bottom:6px;">📋 Projects</div>{items_proj}</div>',
                        unsafe_allow_html=True
                    )
                with c2:
                    items_task = "".join(
                        f'<div style="background:#FFF3E0;padding:6px 10px;border-radius:6px;margin:4px 0;font-size:13px;">✅ {t}</div>'
                        for t in member_tasks
                    ) if member_tasks else '<div style="color:#999;font-style:italic;font-size:13px;">No Tasks</div>'
                    st.markdown(
                        f'<div style="background:#FFF8F0;border-left:4px solid #F57C00;border-radius:8px;padding:12px;height:100%;">'
                        f'<div style="font-weight:600;color:#F57C00;margin-bottom:6px;">✅ Tasks</div>{items_task}</div>',
                        unsafe_allow_html=True
                    )

            st.divider()

else:
    st.info("请上传 Excel 文件开始")