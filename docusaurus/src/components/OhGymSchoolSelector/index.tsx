import {useEffect} from 'react';

function setSelectedSchool(page: HTMLElement, school: string) {
  const triggers = page.querySelectorAll<HTMLButtonElement>('[data-ohgym-school-trigger]');
  const cards = page.querySelectorAll<HTMLElement>('[data-ohgym-school-card]');
  const gallery = page.querySelector<HTMLElement>('.ohgym-school-gallery');

  gallery?.classList.add('has-active');

  triggers.forEach((trigger) => {
    const isActive = trigger.dataset.ohgymSchoolTrigger === school;

    trigger.classList.toggle('is-active', isActive);
    trigger.setAttribute('aria-pressed', String(isActive));
  });

  cards.forEach((card) => {
    const isActive = card.dataset.ohgymSchoolCard === school;

    card.classList.toggle('is-active', isActive);
  });
}

export default function OhGymSchoolSelector() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.ohgym-page');

    if (!page) {
      return undefined;
    }

    const triggers = Array.from(
      page.querySelectorAll<HTMLButtonElement>('[data-ohgym-school-trigger]'),
    );

    setSelectedSchool(page, triggers[0]?.dataset.ohgymSchoolTrigger ?? 'gacheon');

    const cleanupHandlers = triggers.map((trigger) => {
      const school = trigger.dataset.ohgymSchoolTrigger;

      if (!school) {
        return () => {};
      }

      const showSchool = () => setSelectedSchool(page, school);

      trigger.addEventListener('mouseenter', showSchool);
      trigger.addEventListener('focus', showSchool);
      trigger.addEventListener('click', showSchool);

      return () => {
        trigger.removeEventListener('mouseenter', showSchool);
        trigger.removeEventListener('focus', showSchool);
        trigger.removeEventListener('click', showSchool);
      };
    });

    return () => cleanupHandlers.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
