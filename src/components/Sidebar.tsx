import { useLocation, useNavigate } from 'react-router-dom';

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-xs border-l-[3px] transition-all duration-150 ${
      active
        ? 'bg-blue-500/15 text-blue-300 border-blue-500'
        : 'text-slate-400 border-transparent hover:bg-white/7 hover:text-slate-200'
    }`}
  >
    <span className="w-4 text-center text-sm">{icon}</span>
    <span>{label}</span>
  </div>
);

const NAV_ITEMS = [
  { icon: '📄', label: 'Reports', path: '/' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-[220px] bg-navy-800 text-slate-200 flex flex-col fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={item.path !== null && (location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/builder')))}
            onClick={() => item.path && navigate(item.path)}
          />
        ))}
      </nav>

      {/* User */}
      
    </div>
  );
};
