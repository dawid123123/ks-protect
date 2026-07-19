'use client';

import CarViewer from './CarViewer';
import ConfiguratorFrame from './ConfiguratorFrame';

export default function PPF() {
  return (
    <section className="ppf ppf-v2" id="ppf">
      <div className="section-block">
        <ConfiguratorFrame accent="ppf">
          <CarViewer />
        </ConfiguratorFrame>
      </div>
    </section>
  );
}
