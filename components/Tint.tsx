'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyPricingOverrides,
  PricingOverrides,
} from '../lib/pricingRuntime';
import PriceBossAdmin from './PriceBossAdmin';
import TintConfigurator from './TintConfigurator';
import ConfiguratorFrame from './ConfiguratorFrame';

export default function Tint() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [pricingTick, setPricingTick] = useState(0);
  const [secretClicks, setSecretClicks] = useState(0);

  const bumpPricing = useCallback(() => {
    setPricingTick((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPricing() {
      try {
        const response = await fetch('/api/pricing', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { overrides?: PricingOverrides };
        if (!cancelled && data.overrides) {
          applyPricingOverrides(data.overrides);
          bumpPricing();
        }
      } catch {
        // keep defaults
      }
    }

    loadPricing();

    function openAdminFromUrl() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1' || window.location.hash === '#admin') {
        setAdminOpen(true);
      }
    }

    openAdminFromUrl();
    window.setTimeout(openAdminFromUrl, 0);

    return () => {
      cancelled = true;
    };
  }, [bumpPricing]);

  function onSecretClick() {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 5) {
      setAdminOpen(true);
      setSecretClicks(0);
    }
  }

  return (
    <>
      <section className="ppf tint-section tint-v2" id="tint">
        <div className="section-block">
          <ConfiguratorFrame accent="tint">
            <TintConfigurator
              key={'tint-' + pricingTick}
              onAdminSecretClick={onSecretClick}
              onOpenAdmin={() => setAdminOpen(true)}
            />
          </ConfiguratorFrame>
        </div>
      </section>

      <PriceBossAdmin
        open={adminOpen}
        mode="tint"
        onClose={() => setAdminOpen(false)}
        onPricingApplied={bumpPricing}
      />
    </>
  );
}
