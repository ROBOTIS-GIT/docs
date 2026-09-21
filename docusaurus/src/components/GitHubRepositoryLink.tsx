import type {ReactNode} from 'react';

type GitHubRepositoryLinkProps = {
  href: string;
  children: ReactNode;
};

export default function GitHubRepositoryLink({
  href,
  children,
}: GitHubRepositoryLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        whiteSpace: 'nowrap',
      }}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{flex: '0 0 auto'}}>
        <path
          fill="currentColor"
          d="M12 .5C5.73.5.66 5.57.66 11.84c0 5.01 3.25 9.26 7.76 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.15.68-3.82-1.52-3.82-1.52-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.44.11-3 0 0 .95-.3 3.12 1.16a10.88 10.88 0 0 1 5.68 0c2.17-1.46 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.79 1.17 1.8 1.17 3.04 0 4.36-2.65 5.31-5.18 5.6.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55a11.35 11.35 0 0 0 7.75-10.76C23.34 5.57 18.27.5 12 .5Z"
        />
      </svg>
      <code>{children}</code>
    </a>
  );
}
