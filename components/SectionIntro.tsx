type SectionIntroProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
};

export default function SectionIntro({
  eyebrow,
  title,
  lead,
  align = 'left',
}: SectionIntroProps) {
  return (
    <div className={'section-intro' + (align === 'center' ? ' section-intro-center' : '')}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}
