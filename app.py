import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(page_title="Dhara Team Project Dashboard", layout="wide")

st.title("📊 Dhara Team Project Dashboard")

# File uploader
uploaded_file = st.file_uploader("上传最新的 PM Excel 文件", type=["xlsx"])

if uploaded_file:
    # Read all sheets
    projects = pd.read_excel(uploaded_file, sheet_name="Projects")
    tasks = pd.read_excel(uploaded_file, sheet_name="Tasks")
    members = pd.read_excel(uploaded_file, sheet_name="Members")

    # Clean data - remove empty rows
    projects = projects[projects['Project Name'].notna()].copy()
    tasks = tasks[tasks['Task'].notna()].copy()
    members = members[members['Name'].notna()].copy()

    # Create tabs
    tab1, tab2 = st.tabs(["📊 Dashboard", "👥 Team Members"])

    with tab1:
        # === Metrics Row ===
        col1, col2, col3, col4, col5 = st.columns(5)

        # Project Count
        project_count = len(projects)
        col1.metric("Project Count", project_count)

        # Vetra Adoption Rate
        vetra_yes = projects[projects['Vetra Adopted or Not'] == 'Yes']
        vetra_rate = len(vetra_yes) / len(projects) * 100 if len(projects) > 0 else 0
        col2.metric("Vetra Adoption Rate", f"{vetra_rate:.1f}%")

        # Total Budget
        total_budget = projects['Budget Amount ($K)'].sum()
        col3.metric("Total Budget ($K)", f"${total_budget:,.0f}")

        # Task Count
        task_count = len(tasks)
        col4.metric("Task Count", task_count)

        # Task Completion Rate
        completed = tasks[tasks['Progress'] == 'Completed']
        completion_rate = len(completed) / len(tasks) * 100 if len(tasks) > 0 else 0
        col5.metric("Task Completion Rate", f"{completion_rate:.1f}%")

        st.divider()

        # === Charts Row 1 ===
        col_chart1, col_chart2 = st.columns(2)

        # Chart 1: Project Status Overview (Current Phase) - Horizontal Bar
        phase_counts = projects['Current Phase'].value_counts().reset_index()
        phase_counts.columns = ['Current Phase', 'Count']
        
        fig_phase = px.bar(
            phase_counts, 
            y='Current Phase', 
            x='Count', 
            orientation='h',
            title="Project Status Overview",
            color='Count',
            color_continuous_scale='Blues'
        )
        fig_phase.update_layout(yaxis={'categoryorder': 'total ascending'})
        col_chart1.plotly_chart(fig_phase, use_container_width=True)

        # Chart 2: Budget by Funding Type - Pie Chart
        budget_by_type = projects.groupby('Funding Type')['Budget Amount ($K)'].sum().reset_index()
        
        fig_type = px.pie(
            budget_by_type, 
            values='Budget Amount ($K)', 
            names='Funding Type',
            title="Budget Distribution by Funding Type",
            hole=0.4
        )
        col_chart2.plotly_chart(fig_type, use_container_width=True)

        # Chart 3: Budget by Status - Pie Chart
        budget_by_status = projects.groupby('Budget Status')['Budget Amount ($K)'].sum().reset_index()
        
        fig_status = px.pie(
            budget_by_status, 
            values='Budget Amount ($K)', 
            names='Budget Status',
            title="Budget Distribution by Status",
            hole=0.4
        )
        st.plotly_chart(fig_status, use_container_width=True)

        # === Collapsible Details ===
        with st.expander("📋 Projects 详情"):
            search_proj = st.text_input("���索 Projects", key="search_proj")
            if search_proj:
                proj_filtered = projects[projects.apply(lambda row: search_proj.lower() in str(row.values).any(), axis=1)]
            else:
                proj_filtered = projects
            st.dataframe(proj_filtered, use_container_width=True, hide_index=True)

        with st.expander("📋 Tasks 详情"):
            search_task = st.text_input("搜索 Tasks", key="search_task")
            if search_task:
                task_filtered = tasks[tasks.apply(lambda row: search_task.lower() in str(row.values).any(), axis=1)]
            else:
                task_filtered = tasks
            st.dataframe(task_filtered, use_container_width=True, hide_index=True)

    with tab2:
        st.markdown("## 👥 Team Members")
        
        for idx, member in members.iterrows():
            member_name = member['Name']
            member_team = member['Team']
            
            # Get Projects and Tasks for this member
            member_projects = projects[projects['DT Owner'] == member_name]['Project Name'].tolist()
            member_tasks = tasks[tasks['Assignee'] == member_name]['Task'].tolist()
            
            with st.container():
                col_m1, col_m2 = st.columns([1, 3])
                
                with col_m1:
                    st.markdown(f"### {member_name}")
                    st.caption(f"**Team:** {member_team}")
                
                with col_m2:
                    if member_projects:
                        st.markdown("**Projects:**")
                        for p in member_projects:
                            st.markdown(f"  • {p}")
                    else:
                        st.caption("No Projects")
                    
                    if member_tasks:
                        st.markdown("**Tasks:**")
                        for t in member_tasks:
                            st.markdown(f"  • {t}")
                    else:
                        st.caption("No Tasks")
            
            st.divider()

else:
    st.info("请上传 Excel 文件开始")