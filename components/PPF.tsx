'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyPricingOverrides,
  PricingOverrides,
} from '../lib/pricingRuntime';
import PriceBossAdmin from './PriceBossAdmin';
import CarViewer from './CarViewer';
import ConfiguratorFrame from './ConfiguratorFrame';

function shouldOpenAdmin() {
  if (typeof window === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1' || window.location.hash === '#admin';
}

export default function PPF() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [pricingTick, setPricingTick] = useState(0);
  const [secretClicks, setSecretClicks] = useState(0);

  const bumpPricing = useCallback(() => {
    setPricingTick((n) => n + 1);
  }, []);

  const openAdmin = useCallback(() => {
    setAdminOpen(true);
  }, []);

  useEffect(() => {
    if (shouldOpenAdmin()) {
      setAdminOpen(true);
    }

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

    return () => {
      cancelled = true;
    };
  }, [bumpPricing]);

  function onSecretClick() {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 5) {
      openAdmin();
      setSecretClicks(0);
    }
  }

  return (
    <>
      <section className="ppf ppf-v2" id="ppf">
        <div className="section-block">
          <ConfiguratorFrame accent="ppf">
            <CarViewer
              key={'ppf-' + pricingTick}
              onAdminSecretClick={onSecretClick}
            />
          </ConfiguratorFrame>
        </div>
      </section>

      <PriceBossAdmin
        open={adminOpen}
        mode="ppf"
        onClose={() => setAdminOpen(false)}
        onPricingApplied={bumpPricing}
      />
    </>
  );
}
