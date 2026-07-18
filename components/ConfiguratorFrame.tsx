type ConfiguratorFrameProps = {
  accent: 'ppf' | 'tint';
  children: React.ReactNode;
};

export default function ConfiguratorFrame({
  accent,
  children,
}: ConfiguratorFrameProps) {
  return (
    <div className={'configurator-frame configurator-frame-' + accent}>
      {children}
    </div>
  );
}
