'use client';

import { Part, SelectedParts } from './carParts';
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
  onUpdateTracePoint?: (index: number, point: TracePoint) => void;
  onInsertTracePoint?: (index: number, point: TracePoint) => void;
  onSelectTracePoint?: (index: number | null) => void;
  onCloseTracePath?: () => void;
  selectedTraceIndex?: number | null;
  showTraceLabels?: boolean;
};

export const frontPhoto = '/gle-front.jpg';

// Paths traced from the GLE front photo (viewBox 0–100 = image %)
const frontZones: PhotoZone[] = [
  {
    part: 'hood',
    label: 'HOOD',
    d: 'M 20.2,34.4 L 18.5,36.9 L 17.2,39.7 L 16.6,42.2 L 16.6,44.4 L 17.2,45.2 L 21.5,46.1 L 24.0,46.7 L 26.8,47.6 L 30.2,48.6 L 31.3,47.6 L 33.0,47.1 L 36.0,47.1 L 55.7,47.1 L 67.0,47.3 L 69.6,47.3 L 70.6,47.8 L 71.7,48.6 L 77.2,46.9 L 81.1,45.6 L 84.5,45.2 L 84.0,41.8 L 82.6,39.0 L 78.9,34.6 L 56.8,33.7 L 32.3,34.1 Z',
  },
  {
    part: 'leftAPillar',
    label: 'LEFT A-PILLAR',
    d: 'M 80.9,36.8 L 78.9,34.7 L 76.2,27.2 L 74.3,23.0 L 72.1,19.4 L 73.0,19.1 L 74.3,20.9 L 76.0,24.5 L 77.7,27.7 L 79.4,32.1 Z',
  },
  {
    part: 'rightAPillar',
    label: 'RIGHT A-PILLAR',
    d: 'M 18.5,36.5 L 20.9,33.7 L 24.0,24.8 L 26.4,19.5 L 25.1,19.5 L 20.4,30.3 Z',
  },
  {
    part: 'frontBumper',
    label: 'FRONT BUMPER',
    d: 'M 13.8,47.8 L 12.1,48.0 L 11.3,53.3 L 10.9,62.7 L 10.9,71.6 L 11.3,73.1 L 14.0,74.4 L 17.2,75.0 L 20.6,75.2 L 22.6,73.7 L 26.4,71.6 L 29.6,69.5 L 31.9,68.6 L 35.1,67.8 L 39.6,67.8 L 46.0,67.8 L 49.8,67.8 L 56.2,67.8 L 62.1,67.8 L 67.2,68.2 L 69.8,68.6 L 73.4,70.3 L 76.4,72.0 L 80.0,74.4 L 81.7,75.4 L 86.2,74.8 L 88.9,74.1 L 90.2,72.7 L 90.0,70.1 L 90.0,65.9 L 90.0,55.2 L 89.6,51.8 L 88.9,48.4 L 87.4,48.0 L 87.4,50.3 L 87.0,52.2 L 85.3,53.1 L 81.1,53.5 L 77.0,53.3 L 75.7,53.1 L 73.2,48.0 L 71.7,48.6 L 72.6,50.3 L 73.4,52.4 L 74.0,54.4 L 74.0,55.9 L 72.8,58.0 L 70.6,59.5 L 66.4,59.9 L 59.4,60.3 L 49.8,60.5 L 42.1,60.3 L 34.5,59.9 L 31.7,59.5 L 28.5,57.6 L 27.4,55.0 L 27.9,53.5 L 28.1,52.4 L 29.1,50.7 L 30.2,48.6 L 28.3,48.0 L 27.7,49.7 L 26.8,51.2 L 26.2,52.7 L 25.5,53.3 L 24.3,53.3 L 21.3,53.3 L 16.6,52.9 L 14.3,52.2 L 13.8,50.3 L 13.6,47.8 Z',
  },
  {
    part: 'frontLip',
    label: 'FRONT LIP',
    d: 'M 25.5,72.2 L 47.2,72.2 L 67.2,72.0 L 76.4,72.0 L 79.4,73.9 L 70.4,74.6 L 55.3,74.8 L 43.0,75.0 L 30.2,74.6 L 24.5,74.8 L 22.1,74.4 Z',
  },
  {
    part: 'rightMirror',
    label: 'RIGHT MIRROR',
    d: 'M 19.1,35.2 L 17.9,34.8 L 18.1,32.8 L 18.1,30.9 L 17.2,30.4 L 14.5,30.9 L 11.9,31.5 L 11.3,33.2 L 11.3,35.7 L 13.6,36.4 L 18.5,36.8 Z',
  },
  {
    part: 'leftMirror',
    label: 'LEFT MIRROR',
    d: 'M 80.4,35.0 L 81.7,35.0 L 81.3,31.4 L 81.7,30.7 L 83.8,30.7 L 86.2,31.2 L 88.1,32.4 L 88.3,33.9 L 88.3,35.6 L 87.7,36.5 L 81.1,36.9 Z',
  },
];

export default function TopView({
  selected,
  toggle,
  vehicleClass,
  vehicleName,
  traceMode = false,
  tracePoints = [],
  tracedPaths = [],
  onTracePoint,
  onUpdateTracePoint,
  onInsertTracePoint,
  onSelectTracePoint,
  onCloseTracePath,
  selectedTraceIndex = null,
  showTraceLabels = false,
}: Props) {
  return (
    <div
      className={
        'car-model car-model-front vector-car photo-car' +
        (traceMode ? ' photo-car-trace-mode' : '') +
        ' ' +
        vehicleClass
      }
    >
      <img
        className="vehicle-svg vehicle-svg-front vehicle-photo vehicle-photo-front"
        src={frontPhoto}
        alt={vehicleName + ' · front view'}
        draggable={false}
      />
      {!traceMode && (
        <svg
          className="front-zone-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-label={vehicleName + ' — select PPF zones'}
        >
          {frontZones.map((zone) => (
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
          onUpdatePoint={onUpdateTracePoint}
          onInsertPoint={onInsertTracePoint}
          onSelectPoint={onSelectTracePoint}
          onClosePath={onCloseTracePath}
          selectedIndex={selectedTraceIndex}
          showLabels={showTraceLabels}
        />
      )}
    </div>
  );
}
