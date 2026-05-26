import type {ReactNode} from 'react';

type BoxVariant = 'default' | 'hero' | 'spec' | 'muted';

type BoxProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: BoxVariant;
};

export default function Box({
  children,
  className,
  title,
  variant = 'default',
}: BoxProps) {
  const classes = ['doc-box', `doc-box--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {title ? <div className="doc-box__title">{title}</div> : null}
      <div className="doc-box__body">{children}</div>
    </section>
  );
}
