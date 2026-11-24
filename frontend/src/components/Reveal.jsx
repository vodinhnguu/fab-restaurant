import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

// Bọc 1 khối để nó hiện dần (mờ → rõ, trượt lên) khi cuộn tới. CSS ở index.css (.reveal, .is-visible).
//   <Reveal as="section" className="container-page mt-20">...</Reveal>
//   <Reveal delay={150}>...</Reveal>   // trễ 150ms, dùng cho các thẻ xếp hàng hiện lần lượt
// Trình duyệt không có IntersectionObserver thì hiện luôn (không bao giờ bị ẩn mất nội dung).
export default function Reveal({ as: Tag = 'div', delay = 0, className, style, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => typeof window === 'undefined' || !('IntersectionObserver' in window));

  useEffect(() => {
    if (shown || !ref.current) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={clsx('reveal', shown && 'is-visible', className)}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
