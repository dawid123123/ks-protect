'use client';

import { useTranslation } from '../lib/i18n/context';
import CarViewer from './CarViewer';
import ConfiguratorFrame from './ConfiguratorFrame';
import SectionIntro from './SectionIntro';

export default function PPF() {
  const t = useTranslation();

  return (
    <section className="ppf ppf-v2" id="ppf">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.ppfIntro.eyebrow}
          title={t.ppfIntro.title}
          lead={t.ppfIntro.lead}
        />

        <ConfiguratorFrame accent="ppf">
          <CarViewer />
        </ConfiguratorFrame>
      </div>
    </section>
  );
}
