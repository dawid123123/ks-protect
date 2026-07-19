'use client';

import TintConfigurator from './TintConfigurator';
import ConfiguratorFrame from './ConfiguratorFrame';

export default function Tint() {
  return (
    <section className="ppf tint-section tint-v2" id="tint">
      <div className="section-block">
        <ConfiguratorFrame accent="tint">
          <TintConfigurator />
        </ConfiguratorFrame>
      </div>
    </section>
  );
}
