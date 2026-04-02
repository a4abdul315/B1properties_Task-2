function AlertsPanel({ alerts, loading, connected }) {
  return (
    <section className="alerts-panel">
      <div className="alerts-panel__header">
        <h3>Alerts</h3>
        <span>{loading ? 'Refreshing...' : connected ? 'Live' : `${alerts.length} items`}</span>
      </div>

      <div className="alerts-panel__list">
        {alerts.length === 0 ? (
          <div className="alert-item alert-item--empty">No alerts available right now.</div>
        ) : (
          alerts.map((alert) => (
            <article key={alert._id} className={`alert-item alert-item--${alert.severity || 'medium'}`}>
              <div className="alert-item__top">
                <strong>{alert.title}</strong>
                <span>{alert.severity || 'medium'}</span>
              </div>
              <p>{alert.message}</p>
              {alert.metadata?.threshold ? (
                <small className="alert-item__meta">Threshold: {alert.metadata.threshold}</small>
              ) : null}
              <small>{new Date(alert.createdAt).toLocaleString()}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default AlertsPanel;
