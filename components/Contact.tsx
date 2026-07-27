'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useTranslation } from '../lib/i18n/context';
import { brand } from '../lib/brand';
import SectionIntro from './SectionIntro';
import TurnstileField from './TurnstileField';

export default function Contact() {
  const t = useTranslation();
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorKey, setErrorKey] = useState('');

  const onToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const needsCaptcha = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    if (needsCaptcha && !turnstileToken) {
      setStatus('error');
      setErrorKey('captcha');
      return;
    }

    setStatus('sending');
    setErrorKey('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') || ''),
          phone: String(data.get('phone') || ''),
          email: String(data.get('email') || ''),
          vehicle: String(data.get('vehicle') || ''),
          service: String(data.get('service') || ''),
          message: String(data.get('message') || ''),
          turnstileToken,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setStatus('error');
        setErrorKey(result.error || 'send_failed');
        return;
      }

      setStatus('ok');
      form.reset();
      setTurnstileToken('');
    } catch {
      setStatus('error');
      setErrorKey('send_failed');
    }
  }

  const errorText =
    errorKey === 'captcha'
      ? t.contact.errors.captcha
      : errorKey === 'mail_not_configured'
        ? t.contact.errors.mailNotConfigured
        : t.contact.errors.sendFailed;

  return (
    <section className="contact contact-v2" id="contact">
      <div className="section-block contact-shell-v2">
        <div className="contact-copy contact-panel-v2">
          <SectionIntro
            eyebrow={t.contact.eyebrow}
            title={t.contact.title}
            lead={t.contact.lead}
          />

          <div className="contact-details contact-details-v2">
            <a href={brand.phoneTel}>
              <span>{t.contact.phone}</span>
              {brand.phoneDisplay}
            </a>
            <a href={'mailto:' + brand.email}>
              <span>{t.contact.email}</span>
              {brand.email}
            </a>
            <div>
              <span>{t.contact.location}</span>
              {t.contact.locationValue}
            </div>
          </div>

          <a
            className="booking-link"
            href={brand.bookingUrl}
            target={brand.bookingUrl.startsWith('http') ? '_blank' : undefined}
            rel={brand.bookingUrl.startsWith('http') ? 'noreferrer' : undefined}
          >
            {t.contact.bookDirectly} <span>{'\u2197'}</span>
          </a>
        </div>

        <form className="quote-form quote-form-v2" onSubmit={handleSubmit}>
          <div className="form-heading">
            <span>01</span>
            <div>
              <h3>{t.contact.formHeading}</h3>
              <p>{t.contact.formSubheading}</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              {t.contact.name}
              <input
                name="name"
                type="text"
                placeholder={t.contact.namePlaceholder}
                required
              />
            </label>
            <label>
              {t.contact.phoneLabel}
              <input
                name="phone"
                type="tel"
                placeholder={t.contact.phonePlaceholder}
                required
              />
            </label>
            <label>
              {t.contact.emailLabel}
              <input
                name="email"
                type="email"
                placeholder={t.contact.emailPlaceholder}
                required
              />
            </label>
            <label>
              {t.contact.vehicle}
              <input
                name="vehicle"
                type="text"
                placeholder={t.contact.vehiclePlaceholder}
                required
              />
            </label>
            <label className="form-wide">
              {t.contact.service}
              <select name="service" defaultValue={t.contact.serviceOptions.ppf}>
                <option>{t.contact.serviceOptions.ppf}</option>
                <option>{t.contact.serviceOptions.graphene}</option>
                <option>{t.contact.serviceOptions.tint}</option>
                <option>{t.contact.serviceOptions.consultation}</option>
              </select>
            </label>
            <label className="form-wide">
              {t.contact.message}
              <textarea
                name="message"
                placeholder={t.contact.messagePlaceholder}
                rows={4}
              />
            </label>
          </div>

          <TurnstileField onToken={onToken} />

          <button
            className="quote-submit"
            type="submit"
            disabled={status === 'sending'}
          >
            {status === 'sending'
              ? t.contact.sending
              : t.contact.sendInquiry}{' '}
            <span>{'\u2192'}</span>
          </button>

          {status === 'ok' ? (
            <p className="form-note form-note-ok">{t.contact.success}</p>
          ) : status === 'error' ? (
            <p className="form-note form-note-error">{errorText}</p>
          ) : (
            <p className="form-note">{t.contact.formNote}</p>
          )}
        </form>
      </div>
    </section>
  );
}
