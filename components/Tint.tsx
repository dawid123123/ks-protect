'use client';

import { useTranslation } from '../lib/i18n/context';
import TintConfigurator from './TintConfigurator';
import ConfiguratorFrame from './ConfiguratorFrame';
import SectionIntro from './SectionIntro';

export default function Tint() {
  const t = useTranslation();

  return (
    <section className="ppf tint-section tint-v2" id="tint">
      <div className="section-block">
        <SectionIntro
          eyebrow={t.tintIntro.eyebrow}
          title={t.tintIntro.title}
          lead={t.tintIntro.lead}
        />

        <ConfiguratorFrame accent="tint">
          <TintConfigurator />
        </ConfiguratorFrame>
      </div>
    </section>
  );
}
