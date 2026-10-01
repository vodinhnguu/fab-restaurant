import clsx from 'clsx';
import { Link } from 'react-router-dom';

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <img src="/favicon.svg" alt="" className="h-9 w-9" />
      <span className={clsx('font-display text-xl leading-none font-bold', light ? 'text-white' : 'text-ocean-900')}>
        FAB <span className="text-coral-500">Seafood</span>
      </span>
    </Link>
  );
}
