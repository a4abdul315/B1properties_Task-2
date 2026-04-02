import AlertsPanel from '../components/alerts/AlertsPanel';
import CompetitorComparisonChart from '../components/charts/CompetitorComparisonChart';
import MarketHeatChart from '../components/charts/MarketHeatChart';
import PriceTrendChart from '../components/charts/PriceTrendChart';
import FilterBar from '../components/filters/FilterBar';
import DashboardShell from '../components/layout/DashboardShell';
import StatCard from '../components/layout/StatCard';
import { useDashboard } from '../context/DashboardContext';

function DashboardPage() {
  const { state, setFilter } = useDashboard();
  const { filters, options, data, loading, error } = state;

  const velocitySummary = data.listingVelocity?.summary || {
    totalNewListings: 0,
    activeListings: 0,
  };
  const heatSummary = data.marketHeat?.summary || {
    totalAreas: 0,
    hottestArea: 'n/a',
    highestHeatIndex: 0,
  };
  const pricePoints = data.priceTracker?.series?.length || 0;
  const hasAnyInsightData =
    (data.priceTracker?.series?.length || 0) > 0 ||
    (data.listingVelocity?.series?.length || 0) > 0 ||
    (data.marketHeat?.series?.length || 0) > 0;
  const filtersAreNarrow =
    Boolean(filters.area) || Boolean(filters.category) || Boolean(filters.competitor);

  return (
    <DashboardShell
      header={
        <div className="hero-panel">
          <div>
            <span className="eyebrow">Market Intelligence Dashboard</span>
            <h1>Track competitor movement, pricing signals, and market heat in one workspace.</h1>
            <p>
              Use filters to compare areas, categories, and competitors across listing trends, velocity,
              and alert activity.
            </p>
          </div>
          <div className="hero-stats">
            <StatCard label="Price tracker points" value={pricePoints} helper="Visible data buckets" />
            <StatCard
              label="New listings"
              value={velocitySummary.totalNewListings}
              tone="accent"
              helper="Across selected window"
            />
            <StatCard
              label="Hottest area"
              value={heatSummary.hottestArea}
              tone="warm"
              helper={`Heat index ${heatSummary.highestHeatIndex}`}
            />
          </div>
        </div>
      }
      filters={
        <FilterBar
          filters={filters}
          options={options}
          onFilterChange={setFilter}
        />
      }
      sidebar={
        <AlertsPanel
          alerts={data.alerts}
          loading={loading.alerts}
          connected={state.realtime.connected}
        />
      }
    >
      {error ? <div className="error-banner">{error}</div> : null}
      {!loading.insights && !hasAnyInsightData ? (
        <section className="setup-hint">
          <strong>No dashboard data is available for the current view.</strong>
          <p>
            {filtersAreNarrow
              ? 'Try resetting Area, Competitor, and Category to All first. If the dashboard is still empty, seed the demo data.'
              : 'Your database likely has no seeded data yet. Run the seed command below, then refresh the page.'}
          </p>
          <code>cd C:\Users\diftk\OneDrive\Desktop\B1_Properties\Task_2\backend && npm run seed</code>
        </section>
      ) : null}
      <section className="stats-row">
        <StatCard label="Active listings" value={velocitySummary.activeListings} helper="Filtered scope" />
        <StatCard label="Tracked areas" value={heatSummary.totalAreas} helper="Area heat map rows" />
        <StatCard label="Active alerts" value={data.alerts.length} helper="Latest monitoring events" />
      </section>

      <section className="charts-grid">
        <PriceTrendChart data={data.priceTracker} />
        <CompetitorComparisonChart data={data.listingVelocity} />
        <MarketHeatChart data={data.marketHeat} />
      </section>

      {loading.insights ? <div className="loading-strip">Refreshing dashboard insights...</div> : null}
    </DashboardShell>
  );
}

export default DashboardPage;
