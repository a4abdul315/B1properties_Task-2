import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';
import ChartEmptyState from './ChartEmptyState';

function MarketHeatChart({ data }) {
  const series = data?.series || [];

  return (
    <ChartCard title="Market Heat Index" subtitle="Composite score from listings, pricing, and social activity">
      {series.length === 0 ? (
        <ChartEmptyState
          title="No market heat data yet"
          hint="Market heat needs listings and social mentions in the selected range."
          command="cd backend && npm run seed"
        />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7dddc" />
            <XAxis dataKey="area" stroke="#4c635a" />
            <YAxis stroke="#4c635a" />
            <Tooltip />
            <Bar dataKey="heatIndex" fill="#b91c1c" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export default MarketHeatChart;
