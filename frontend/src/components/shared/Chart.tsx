import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const BRAND_COLORS = [
  '#2563EB', // Ascent Blue
  '#0D9488', // Teal
  '#3B82F6', // Blue Light
  '#14B8A6', // Teal Light
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

export interface ChartDataKey {
  key: string;
  label?: string;
  color?: string;
}

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Record<string, any>[];
  config: {
    xKey?: string;
    dataKeys: ChartDataKey[];
    showGrid?: boolean;
    showLegend?: boolean;
    height?: number;
    stacked?: boolean;
    innerRadius?: number;
    outerRadius?: number;
  };
}

const tooltipStyle = {
  backgroundColor: '#0f2554',
  border: '1px solid #142d63',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#fff',
};

export default function Chart({ type, data, config }: ChartProps) {
  const {
    xKey = 'name',
    dataKeys,
    showGrid = true,
    showLegend = false,
    height = 300,
    stacked = false,
    innerRadius = 0,
    outerRadius = 80,
  } = config;

  const axisProps = {
    tick: { fill: '#6B7280', fontSize: 11 },
    axisLine: { stroke: '#142d63' },
    tickLine: false,
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#142d63" />}
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          {showLegend && <Legend />}
          {dataKeys.map((dk, i) => (
            <Line
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.label || dk.key}
              stroke={dk.color || BRAND_COLORS[i % BRAND_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: dk.color || BRAND_COLORS[i % BRAND_COLORS.length] }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#142d63" />}
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          {showLegend && <Legend />}
          {dataKeys.map((dk, i) => (
            <Bar
              key={dk.key}
              dataKey={dk.key}
              name={dk.label || dk.key}
              fill={dk.color || BRAND_COLORS[i % BRAND_COLORS.length]}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#142d63" />}
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipStyle} />
          {showLegend && <Legend />}
          {dataKeys.map((dk, i) => {
            const color = dk.color || BRAND_COLORS[i % BRAND_COLORS.length];
            return (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.label || dk.key}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
                stackId={stacked ? 'stack' : undefined}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          {showLegend && <Legend />}
          {dataKeys.map((dk) => (
            <Pie
              key={dk.key}
              data={data}
              dataKey={dk.key}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#6B7280' }}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BRAND_COLORS[index % BRAND_COLORS.length]}
                />
              ))}
            </Pie>
          ))}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
