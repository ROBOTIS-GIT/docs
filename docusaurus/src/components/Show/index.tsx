import type {ReactNode} from 'react';

type ShowProps = {
  when: unknown;
  children?: ReactNode;
};

/**
 * `when`이 참일 때만 children을 렌더링한다.
 *
 * partial(.mdx) 안에서 모델에 따라 있고 없는 문단·표·admonition을 감싸는 용도.
 * 여는 태그와 닫는 태그 앞뒤에 빈 줄을 두면 안쪽이 마크다운으로 해석된다.
 *
 * 제목(heading)은 넣지 말 것. 목차는 컴파일 시점에 만들어져 조건과 관계없이 항상 남는다.
 */
export default function Show({when, children}: ShowProps) {
  return when ? <>{children}</> : null;
}
