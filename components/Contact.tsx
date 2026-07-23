'use client';

import { FormEvent } from 'react';
import { useTranslation } from '../lib/i18n/context';
import { brand } from '../lib/brand';
import SectionIntro from './SectionIntro';

export default function Contact() {
  const t = useTranslation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '');
    const phone = String(data.get('phone') || '');
    const email = String(data.get('email') || '');
    const vehicle = String(data.get('vehicle') || '');
    const service = String(data.get('service') || '');
    const message = String(data.get('message') || '');

    const subject = encodeURIComponent(t.contact.mailSubject + ' ' + name);
    const body = encodeURIComponent(
      t.contact.name +
        ': ' +
        name +
        '\n' +
        t.contact.phoneLabel +
        ': ' +
        phone +
        '\n' +
        t.contact.emailLabel +
        ': ' +
        email +
        '\n' +
        t.contact.vehicle +
        ': ' +
        vehicle +
        '\n' +
        t.contact.service +
        ': ' +
        service +
        '\n\n' +
        t.contact.message +
        ':\n' +
        message
    );

    window.location.href =
      'mailto:' + brand.email + '?subject=' + subject + '&body=' + body;
  }

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

          <button className="quote-submit" type="submit">
            {t.contact.sendInquiry} <span>{'\u2197'}</span>
          </button>
          <p className="form-note">{t.contact.formNote}</p>
        </form>
      </div>
    </section>
  );
}
