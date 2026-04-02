import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';
import ChartEmptyState from './ChartEmptyState';

function PriceTrendChart({ data }) {
  const series = data?.series || [];

  return (
    <ChartCard title="Price Trends" subtitle="Historical pricing movement by time bucket">
      {series.length === 0 ? (
        <ChartEmptyState
          title="No price history available"
          hint="Seed demo data or broaden your filters to see price movement over time."
          command="cd backend && npm run seed"
        />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d7dddc" />
            <XAxis dataKey="x" stroke="#4c635a" />
            <YAxis stroke="#4c635a" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgPrice" stroke="#0f766e" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="maxPrice" stroke="#d97706" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="minPrice" stroke="#334155" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export default PriceTrendChart;
