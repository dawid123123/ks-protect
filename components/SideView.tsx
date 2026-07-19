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

const sidePhoto = '/gle-side.png';

// Side photo overlay (viewBox 0–100 = image %; traced paths may extend slightly outside).
const sideZones: PhotoZone[] = [
  {
    part: 'leftFender',
    label: 'FRONT FENDER',
    d: 'M 80.5,69.3 L 78.3,69.3 L 79.3,65.9 L 80.0,59.6 L 80.0,55.0 L 79.5,50.3 L 79.0,47.2 L 83.7,47.9 L 88.3,47.9 L 91.5,48.4 L 97.8,48.6 L 104.9,50.1 L 107.6,50.6 L 110.0,51.3 L 108.3,52.0 L 109.5,53.2 L 110.7,54.2 L 107.1,56.7 L 102.9,55.4 L 95.4,54.5 L 89.8,55.0 L 88.3,56.4 L 85.4,59.6 L 83.4,62.3 L 82.2,65.7 Z',
  },
  {
    part: 'frontDoor',
    label: 'FRONT DOOR',
    d: 'M 78.3,69.8 L 79.0,66.1 L 79.8,60.2 L 79.8,54.9 L 79.0,49.3 L 78.0,47.3 L 51.7,45.9 L 44.1,45.4 L 44.9,47.8 L 45.6,51.7 L 46.3,58.8 L 46.3,62.2 L 46.1,64.9 L 45.1,68.8 Z',
  },
  {
    part: 'rearDoor',
    label: 'REAR DOOR',
    d: 'M 10.7,44.1 L 44.4,45.6 L 45.4,49.3 L 45.9,52.7 L 46.1,56.1 L 46.3,59.5 L 46.1,62.4 L 46.1,65.1 L 45.1,69.0 L 23.4,68.5 L 22.9,66.1 L 21.7,62.7 L 20.0,59.8 L 18.3,57.3 L 15.6,55.6 L 13.9,54.6 L 12.4,54.4 L 11.2,51.7 L 10.7,49.0 L 10.5,46.3 Z',
  },
  {
    part: 'frontDoorLower',
    label: 'FRONT DOOR LOWER',
    d: 'M 46.3,63.7 L 45.9,66.8 L 45.4,69.3 L 81.0,69.8 L 81.5,67.3 L 82.4,65.1 Z',
  },
  {
    part: 'rearDoorLower',
    label: 'REAR DOOR LOWER',
    d: 'M 46.1,63.7 L 19.0,62.0 L 20.0,64.1 L 21.5,68.5 L 45.4,69.3 Z',
  },
  {
    part: 'sideSkirt',
    label: 'SIDE SKIRT',
    d: 'M 21.2,68.7 L 82.9,69.6 L 82.2,72.1 L 82.2,73.0 L 22.0,73.0 L 21.7,71.6 Z',
  },
  {
    part: 'splashGuard',
    label: 'SPLASH GUARD',
    d: 'M 1.5,56.6 L -1.0,57.6 L -3.4,60.5 L -5.1,63.4 L -6.1,65.9 L -6.8,68.8 L -11.7,67.6 L -14.1,65.9 L -14.9,64.6 L -14.4,63.7 L -12.2,63.9 L -10.2,63.4 L -8.8,62.2 L -7.8,60.2 L -6.8,58.3 L -4.1,55.9 L -2.2,54.9 L -1.0,53.9 Z',
  },
  {
    part: 'frontWheelArch',
    label: 'FRONT WHEEL ARCH',
    d: 'M 81.0,69.0 L 81.7,65.9 L 83.9,60.7 L 86.6,57.1 L 89.8,55.1 L 94.4,54.1 L 100.0,54.4 L 103.9,55.1 L 106.1,56.3 L 103.9,57.6 L 100.0,56.8 L 94.9,56.3 L 91.5,56.8 L 89.0,57.8 L 86.6,61.0 L 84.1,65.9 L 82.9,69.3 Z',
  },
  {
    part: 'rearWheelArch',
    label: 'REAR WHEEL ARCH',
    d: 'M 1.7,56.6 L -0.5,54.9 L 4.9,53.9 L 9.8,53.9 L 14.4,54.9 L 17.6,56.6 L 20.5,60.2 L 22.2,64.1 L 23.4,68.3 L 23.4,68.8 L 21.2,68.8 L 19.3,62.9 L 16.6,58.8 L 11.0,56.3 L 4.6,56.3 Z',
  },
  {
    part: 'leftRearQuarter',
    label: 'REAR QUARTER',
    d: 'M -0.5,54.6 L -7.3,49.2 L -10.0,47.0 L -12.2,46.3 L -14.1,46.5 L -11.7,43.9 L -7.3,43.6 L -1.5,43.9 L 2.0,42.6 L 4.9,40.2 L 9.0,40.4 L 12.4,40.4 L 11.0,43.6 L 11.0,46.8 L 10.7,50.4 L 11.7,53.6 L 12.2,54.6 L 6.3,53.9 Z',
  },
  {
    part: 'leftAPillar',
    label: 'LEFT A-PILLAR',
    d: 'M 80.9,36.8 L 78.9,34.7 L 76.2,27.2 L 74.3,23.0 L 72.1,19.4 L 73.0,19.1 L 74.3,20.9 L 76.0,24.5 L 77.7,27.7 L 79.4,32.1 Z',
  },
  {
    part: 'leftBPillar',
    label: 'DOOR B-PILLAR',
    d: 'M 78.8,47.3 L 83.2,47.8 L 81.7,45.1 L 59.5,32.2 L 41.5,30.4 L 22.4,30.4 L 10.0,31.4 L 2.7,31.9 L 1.7,31.9 L 1.0,33.9 L 15.4,33.1 L 5.6,40.0 L 12.4,40.7 L 16.3,36.8 L 22.9,32.6 L 36.1,32.2 L 50.0,32.2 L 61.7,34.8 L 69.3,39.0 Z',
  },
  {
    part: 'leftCPillar',
    label: 'C-PILLAR',
    d: 'M 18.0,36.9 L 17.1,44.2 L 22.0,44.7 L 22.0,34.7 Z',
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

export default function SideView({
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
        'car-model car-model-side vector-car ' +
        vehicleClass +
        (isPhotoMode ? ' photo-car' : '') +
        (traceMode ? ' photo-car-trace-mode' : '')
      }
    >
      <span className="direction-label side-front-label">
        {vehicleName} · SIDE VIEW
      </span>
      {isPhotoMode ? (
        <>
          <img
            className="vehicle-svg vehicle-svg-side vehicle-photo"
            src={sidePhoto}
            alt={vehicleName + ' · side'}
            draggable={false}
          />
          {!traceMode && (
            <svg
              className="side-zone-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              aria-label={vehicleName + ' — select PPF zones'}
            >
              {sideZones.map((zone) => (
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
            className="vehicle-svg vehicle-svg-side"
            viewBox="0 0 620 410"
            role="img"
            aria-label={vehicleName + ' side view'}
          >
            <defs>
              <linearGradient id="sideBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#626c65" />
                <stop offset=".35" stopColor="#242a26" />
                <stop offset=".7" stopColor="#3d453f" />
                <stop offset="1" stopColor="#101310" />
              </linearGradient>
              <linearGradient id="sideGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#34483f" />
                <stop offset="1" stopColor="#07100c" />
              </linearGradient>
            </defs>
            <ellipse
              cx="310"
              cy="353"
              rx="270"
              ry="22"
              fill="#000"
              opacity=".62"
            />
            <path
              className="svg-body side-main-body"
              fill="url(#sideBody)"
              d="M40 307 Q44 255 88 229 L157 207 L211 139 Q247 98 338 96 Q414 97 459 149 L508 208 Q558 216 582 253 L590 307 Q582 335 547 344 L76 344 Q45 337 40 307Z"
            />
            <path
              className="svg-roof-line"
              d="M182 201 L224 141 Q256 111 338 109 Q404 110 446 156 L482 205"
            />
            <path
              className="svg-glass"
              fill="url(#sideGlass)"
              d="M218 196 L245 143 Q272 119 337 118 L337 196Z"
            />
            <path
              className="svg-glass"
              fill="url(#sideGlass)"
              d="M349 118 Q400 122 435 159 L466 196 L349 196Z"
            />
            <path
              className="svg-pillar-line"
              d="M343 118 L343 203 M215 205 L201 330 M474 204 L497 329"
            />
            <path
              className="svg-panel-line"
              d="M199 209 L494 209 M301 209 L301 332 M421 209 L421 332"
            />
            <path className="svg-body-crease" d="M82 257 Q310 233 544 252" />
            <path
              className="svg-sport-stripe side-accent"
              d="M91 286 Q310 274 548 286"
            />
            <path
              className="svg-light side-light-front"
              d="M503 219 Q548 216 570 239 L536 255 L500 247Z"
            />
            <path
              className="svg-light side-light-rear"
              d="M52 238 Q79 218 112 225 L102 251 L56 258Z"
            />
            <path
              className="svg-grille-side"
              d="M566 253 L588 265 L586 304 L566 299Z"
            />
            <path
              className="svg-lower-trim"
              d="M120 326 L510 326 L488 344 L141 344Z"
            />
            <circle className="svg-wheel-outer" cx="150" cy="326" r="58" />
            <circle className="svg-wheel-inner" cx="150" cy="326" r="37" />
            <circle className="svg-wheel-hub" cx="150" cy="326" r="13" />
            <path
              className="svg-brake-caliper"
              d="M126 302 Q139 295 145 309 L137 334 Q124 333 120 318Z"
            />
            <circle className="svg-wheel-outer" cx="482" cy="326" r="58" />
            <circle className="svg-wheel-inner" cx="482" cy="326" r="37" />
            <circle className="svg-wheel-hub" cx="482" cy="326" r="13" />
            <path
              className="svg-brake-caliper"
              d="M458 302 Q471 295 477 309 L469 334 Q456 333 452 318Z"
            />
            <path
              className="svg-wheel-spoke"
              d="M150 292 L150 360 M116 326 L184 326 M126 302 L174 350 M174 302 L126 350"
            />
            <path
              className="svg-wheel-spoke"
              d="M482 292 L482 360 M448 326 L516 326 M458 302 L506 350 M506 302 L458 350"
            />
            <rect
              className="svg-door-handle"
              x="327"
              y="229"
              width="29"
              height="5"
              rx="3"
            />
            <rect
              className="svg-door-handle"
              x="438"
              y="229"
              width="29"
              height="5"
              rx="3"
            />
            <circle
              className="svg-star-ring small-star"
              cx="527"
              cy="274"
              r="15"
            />
            <path
              className="svg-star small-star-shape"
              d="M527 261 L531 270 L541 274 L531 278 L527 287 L523 278 L513 274 L523 270Z"
            />
          </svg>
          <div className="zone-layer">
            <Zone
              part="frontBumper"
              label="BUMPER"
              className="side-front-bumper"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="frontLip"
              label="FRONT LIP"
              className="side-front-lip"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="hood"
              label="HOOD"
              className="side-hood"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="leftFender"
              label="FENDER"
              className="side-fender"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="frontDoor"
              label={vehicleId === 'amggt' ? 'DOOR' : 'FRONT DOOR'}
              className="side-front-door"
              selected={selected}
              toggle={toggle}
            />
            {vehicleId !== 'amggt' && (
              <Zone
                part="rearDoor"
                label="REAR DOOR"
                className="side-rear-door"
                selected={selected}
                toggle={toggle}
              />
            )}
            <Zone
              part="leftRearQuarter"
              label="REAR QUARTER"
              className="side-rear-quarter"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="sideSkirt"
              label="SIDE SKIRT"
              className="side-skirt"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="frontWheelArch"
              label="FRONT ARCH"
              className="side-front-wheel-arch"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="rearWheelArch"
              label="REAR ARCH"
              className="side-rear-wheel-arch"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="leftAPillar"
              label="A-PILLAR"
              className="side-a-pillar pillar-zone"
              selected={selected}
              toggle={toggle}
            />
            <Zone
              part="leftBPillar"
              label="B"
              className="side-b-pillar pillar-zone"
              selected={selected}
              toggle={toggle}
            />
            {vehicleId !== 'amggt' && (
              <Zone
                part="leftCPillar"
                label="C-PILLAR"
                className="side-c-pillar pillar-zone"
                selected={selected}
                toggle={toggle}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
