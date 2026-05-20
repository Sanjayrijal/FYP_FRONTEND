import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

export function Breadcrumbs({ items }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-10 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            )}
            {item.href ? (
              <NavLink
                to={item.href}
                className="text-sm sm:text-base text-blue-600 hover:text-blue-700 transition-colors"
              >
                {item.label}
              </NavLink>
            ) : (
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
