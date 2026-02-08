interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-navy-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
            active === tab
              ? 'text-[#2563EB]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {tab}
          {active === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]" />
          )}
        </button>
      ))}
    </div>
  );
}
