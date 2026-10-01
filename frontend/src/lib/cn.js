import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Gộp class Tailwind: class truyền sau sẽ ghi đè class trùng loại (vd: "w-full" + "w-36" -> "w-36")
export const cn = (...inputs) => twMerge(clsx(inputs));
