function DashboardShell({ header, filters, children, sidebar }) {
  return (
    <div className="app-shell">
      <header className="app-header">{header}</header>
      <section className="toolbar-panel">{filters}</section>
      <main className="dashboard-grid">
        <section className="dashboard-main">{children}</section>
        <aside className="dashboard-sidebar">{sidebar}</aside>
      </main>
    </div>
  );
}

export default DashboardShell;
