'use client';

import { Part } from './carParts';
import { SavedPanelPath, TracePoint } from './SvgPathEditor';
import { frontPhoto } from './TopView';
import {
  FrontPpfSelection,
  TintSelection,
  TintVehicleId,
  TintView,
  TintWindow,
} from './tintTypes';
import { tintViewLabels, tintViewZones } from './tintPhotoZones';
import { TintPhotoZonePath } from './TintPhotoZonePath';
import { TintSavedPanelPath, TintSvgPathEditorOverlay } from './TintSvgPathEditor';

const sidePhoto = '/gle-side.png';
const rearPhoto = '/gle-rear.png';

type Props = {
  view: TintView;
  vehicleName: string;
  vehicleId: TintVehicleId;
  selection: TintSelection;
  ppfSelection: FrontPpfSelection;
  activeWindow: TintWindow | null;
  onSelectWindow: (window: TintWindow) => void;
  traceMode?: boolean;
  tracePoints?: TracePoint[];
  tracedPaths?: TintSavedPanelPath[];
  onTracePoint?: (point: TracePoint) => void;
};

function toOverlayPaths(paths: TintSavedPanelPath[]): SavedPanelPath[] {
  return paths.map((path) => ({
    id: path.id,
    part: 'hood' as Part,
    d: path.d,
    points: path.points,
  }));
}

export default function TintPhotoView({
  view,
  vehicleName,
  vehicleId,
  selection,
  ppfSelection,
  activeWindow,
  onSelectWindow,
  traceMode = false,
  tracePoints = [],
  tracedPaths = [],
  onTracePoint,
}: Props) {
  const isPhotoMode = vehicleId === 'gle';
  const zones = tintViewZones[view];
  const viewLabel = tintViewLabels[view];

  const modelClass =
    view === 'front'
      ? 'car-model-front'
      : view === 'side'
        ? 'car-model-side'
        : 'car-model-rear';

  const svgClass =
    view === 'front'
      ? 'front-zone-svg'
      : view === 'side'
        ? 'side-zone-svg'
        : 'rear-zone-svg';

  const photoSrc =
    view === 'front' ? frontPhoto : view === 'side' ? sidePhoto : rearPhoto;

  const directionLabel =
    view === 'front'
      ? vehicleName + ' \u00b7 FRONT VIEW'
      : view === 'side'
        ? vehicleName + ' \u00b7 SIDE VIEW'
        : vehicleName + ' \u00b7 REAR VIEW';

  if (!isPhotoMode) {
    return (
      <div className="tint-photo-fallback">
        <p>Select Mercedes-Benz GLE to preview window tint on photo.</p>
      </div>
    );
  }

  return (
    <div
      className={
        'car-model vector-car photo-car tint-photo-view ' +
        modelClass +
        (traceMode ? ' photo-car-trace-mode' : '')
      }
    >
      <span className="direction-label">{directionLabel}</span>
      <img
        className={
          'vehicle-svg vehicle-photo ' +
          (view === 'front' ? 'vehicle-svg-front vehicle-photo-front' : '')
        }
        src={photoSrc}
        alt={vehicleName + ' \u00b7 ' + viewLabel}
        draggable={false}
      />
      {!traceMode && (
        <svg
          className={svgClass}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-label={vehicleName + ' \u2014 select window'}
        >
          {zones.map((zone) => (
            <TintPhotoZonePath
              key={zone.window}
              zone={zone}
              selection={selection}
              ppfSelection={ppfSelection}
              activeWindow={activeWindow}
              vehicleId={vehicleId}
              onSelectWindow={onSelectWindow}
            />
          ))}
        </svg>
      )}
      {traceMode && onTracePoint && (
        <TintSvgPathEditorOverlay
          points={tracePoints}
          savedPaths={toOverlayPaths(tracedPaths)}
          onAddPoint={onTracePoint}
        />
      )}
    </div>
  );
}
