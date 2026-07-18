'use client';

import { Part, partLabels, partPrices, SelectedParts, isZoneActive, resolvePart } from './carParts';
import { PhotoZone, PhotoZonePath } from './PhotoZonePath';
import {
  SavedPanelPath,
  SvgPathEditorOverlay,
  TracePoint,
} from './SvgPathEditor';

type Props = {
  selected: SelectedParts;
  toggle: (part: Part) => void;
  vehicleClass: string;
  vehicleName: string;
  vehicleId: string;
  traceMode?: boolean;
  tracePoints?: TracePoint[];
  tracedPaths?: SavedPanelPath[];
  onTracePoint?: (point: TracePoint) => void;
};

const rearPhoto = '/gle-rear.png';

// Rear photo overlay (viewBox 0–100 = image %; traced paths may extend slightly outside).
const rearZones: PhotoZone[] = [
  {
    part: 'roof',
    label: 'ROOF',
    d: 'M 16.1,19.4 L 27.7,16.0 L 40.9,15.4 L 59.5,15.2 L 73.4,17.7 L 79.1,19.7 L 80.2,19.1 L 78.0,15.9 L 74.3,11.6 L 71.4,10.2 L 55.2,9.1 L 35.9,9.3 L 28.0,10.0 L 19.8,11.8 L 17.7,15.9 Z',
  },
  {
    part: 'leftTaillight',
    label: 'LEFT TAILLIGHT',
    d: 'M -3.4,48.3 L 3.0,48.0 L 9.5,47.8 L 19.3,46.4 L 25.0,45.5 L 28.0,42.6 L 17.7,41.2 L 10.9,40.3 L 6.4,39.2 L 2.0,38.5 L 0.0,38.0 L -2.3,40.8 Z',
  },
  {
    part: 'rightTaillight',
    label: 'RIGHT TAILLIGHT',
    d: 'M 68.0,42.1 L 70.9,45.1 L 76.1,46.7 L 83.2,47.6 L 87.5,48.0 L 96.4,47.8 L 99.3,48.0 L 99.1,43.5 L 97.3,39.6 L 96.1,37.3 L 86.8,39.6 Z',
  },
  {
    part: 'tailgate',
    label: 'TAILGATE',
    d: 'M 10.0,34.4 L 9.8,39.8 L 28.9,42.1 L 26.4,44.8 L 18.6,46.9 L 11.8,47.3 L 10.0,47.8 L 11.1,52.1 L 14.8,56.0 L 19.1,59.4 L 23.9,61.0 L 32.7,61.4 L 48.4,61.7 L 60.2,61.9 L 72.3,61.9 L 78.0,58.9 L 83.6,54.2 L 86.1,48.5 L 86.1,47.1 L 75.0,46.2 L 69.3,43.7 L 67.5,42.3 L 79.8,40.3 L 86.4,39.8 L 85.7,34.4 L 81.1,22.8 L 77.7,16.4 L 78.9,20.5 L 80.9,28.3 L 75.9,29.6 L 53.0,29.8 L 33.9,29.6 L 18.2,29.2 L 14.5,27.8 L 16.1,20.3 L 15.0,18.3 Z',
  },
  {
    part: 'rearBumper',
    label: 'REAR BUMPER',
    d: 'M 9.8,47.9 L -3.9,48.6 L -5.5,58.8 L -5.7,68.6 L -4.5,76.3 L -2.0,66.6 L 4.3,65.0 L 17.3,65.0 L 21.6,67.2 L 73.9,66.8 L 81.4,64.1 L 95.0,65.0 L 99.1,67.0 L 100.5,75.2 L 101.8,60.6 L 100.5,53.1 L 99.8,47.7 L 86.6,47.5 L 81.6,56.1 L 77.5,60.0 L 72.5,62.2 L 22.7,61.6 L 14.8,56.3 L 10.7,53.1 Z',
  },
];

function Zone({
  part,
  label,
  className,
  selected,
  toggle,
}: {
  part: Part;
  label: string;
  className: string;
  selected: SelectedParts;
  toggle: (part: Part) => void;
}) {
  const canonical = resolvePart(part);
  const active = isZoneActive(selected, part);
  return (
    <div className={'car-zone ' + className + (active ? ' active' : '')}>
      <button
        type="button"
        className="car-zone-hitbox"
        onClick={(event) => {
          event.stopPropagation();
          toggle(part);
        }}
        aria-pressed={active}
        aria-label={
          partLabels[canonical] +
          ' — ' +
          partPrices[canonical].toLocaleString('is-IS') +
          ' kr.'
        }
      >
        <span className="zone-label">{label}</span>
      </button>
      <span className="part-tooltip">
        <small>{partLabels[canonical]}</small>
        <strong>{partPrices[canonical].toLocaleString('is-IS')} kr.</strong>
        <em>
          {active ? 'Selected · click to remove' : 'Click to select'}
        </em>
      </span>
    </div>
  );
}

export default function RearView({
  selected,
  toggle,
  vehicleClass,
  vehicleName,
  vehicleId,
  traceMode = false,
  tracePoints = [],
  tracedPaths = [],
  onTracePoint,
}: Props) {
  const isPhotoMode = vehicleId === 'gle';

  return (
    <div
      className={
        'car-model car-model-rear vector-car ' +
        vehicleClass +
        (isPhotoMode ? ' photo-car' : '') +
        (traceMode ? ' photo-car-trace-mode' : '')
      }
    >
      <span className="direction-label rear-view-label">
        {vehicleName} · REAR VIEW
      </span>
      {isPhotoMode ? (
        <>
          <img
            className="vehicle-svg vehicle-svg-rear vehicle-photo"
            src={rearPhoto}
            alt={vehicleName + ' · rear'}
            draggable={false}
          />
          {!traceMode && (
            <svg
              className="rear-zone-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              aria-label={vehicleName + ' — select PPF zones'}
            >
              {rearZones.map((zone) => (
                <PhotoZonePath
                  key={zone.part}
                  zone={zone}
                  selected={selected}
                  toggle={toggle}
                />
              ))}
            </svg>
          )}
          {traceMode && onTracePoint && (
            <SvgPathEditorOverlay
              points={tracePoints}
              savedPaths={tracedPaths}
              onAddPoint={onTracePoint}
            />
          )}
        </>
      ) : (
        <>
          <svg
            className="vehicle-svg vehicle-svg-rear"
            viewBox="0 0 600 430"
            role="img"
            aria-label={vehicleName + ' rear view'}
          >
            <defs>
              <linearGradient id="rearBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#626c65" />
                <stop offset=".38" stopColor="#252b27" />
                <stop offset=".68" stopColor="#424a44" />
                <stop offset="1" stopColor="#101310" />
              </linearGradient>
              <linearGradient id="rearGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#34483f" />
                <stop offset="1" stopColor="#07100c" />
              </linearGradient>
            </defs>
            <ellipse
              cx="300"
              cy="393"
              rx="230"
              ry="23"
              fill="#000"
              opacity=".62"
            />
            <path
              className="svg-wheel"
              d="M75 260 Q44 275 44 337 Q45 381 78 388 L98 360 L98 276Z"
            />
            <path
              className="svg-wheel"
              d="M525 260 Q556 275 556 337 Q555 381 522 388 L502 360 L502 276Z"
            />
            <path
              className="svg-body"
              fill="url(#rearBody)"
              d="M92 356 Q76 308 91 225 L126 114 Q144 58 213 39 Q300 15 387 39 Q456 58 474 114 L509 225 Q524 308 508 356 Q487 389 434 397 L166 397 Q113 389 92 356Z"
            />
            <path
              className="svg-roof"
              d="M175 119 Q197 55 300 39 Q403 55 425 119 L405 139 L195 139Z"
            />
            <path
              className="svg-glass"
              fill="url(#rearGlass)"
              d="M176 122 Q202 65 300 53 Q398 65 424 122 L396 207 L204 207Z"
            />
            <path className="svg-glass-shine" d="M207 91 Q278 58 367 82" />
            <path
              className="svg-spoiler"
              d="M172 105 Q300 81 428 105 L412 121 L188 121Z"
            />
            <path
              className="svg-tailgate-line"
              d="M145 224 Q300 199 455 224 L436 346 Q300 370 164 346Z"
            />
            <path
              className="svg-tail-light"
              d="M105 230 Q159 206 239 224 L224 264 Q155 271 104 249Z"
            />
            <path
              className="svg-tail-light"
              d="M495 230 Q441 206 361 224 L376 264 Q445 271 496 249Z"
            />
            <path
              className="svg-tail-led"
              d="M124 237 Q169 222 222 237 M476 237 Q431 222 378 237"
            />
            <path
              className="svg-sport-stripe rear-accent"
              d="M110 286 Q300 314 490 286"
            />
            <circle className="svg-star-ring" cx="300" cy="270" r="27" />
            <path
              className="svg-star"
              d="M300 247 L306 264 L324 270 L306 276 L300 294 L294 276 L276 270 L294 264Z"
            />
            <text className="svg-model-text" x="385" y="291">
              MERCEDES-BENZ
            </text>
            <rect
              className="svg-plate"
              x="244"
              y="299"
              width="112"
              height="31"
              rx="4"
            />
            <text className="svg-plate-text" x="300" y="319" textAnchor="middle">
              KS PROTECT
            </text>
            <path
              className="svg-rear-bumper"
              d="M108 335 Q300 369 492 335 L478 382 Q300 411 122 382Z"
            />
            <path
              className="svg-diffuser"
              d="M168 369 Q300 391 432 369 L414 392 L186 392Z"
            />
            <rect
              className="svg-exhaust"
              x="137"
              y="365"
              width="60"
              height="18"
              rx="9"
            />
            <rect
              className="svg-exhaust"
              x="403"
              y="365"
              width="60"
              height="18"
              rx="9"
            />
          </svg>
          <div className="zone-layer">
            <Zone
              part="roof"
              label="ROOF"
              className="rear-roof-zone"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="leftTaillight"
              label="L. LIGHT"
              className="rear-light-left"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="rightTaillight"
              label="R. LIGHT"
              className="rear-light-right"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="tailgate"
              label="TAILGATE"
              className="rear-tailgate"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="rearBumper"
              label="REAR BUMPER"
              className="rear-bumper"
              selected={selected}
              toggle={toggle}
            />
          </div>
        </>
      )}
    </div>
  );
}
