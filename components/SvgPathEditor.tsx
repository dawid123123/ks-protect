'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Part, partLabels } from './carParts';

export type TracePoint = { x: number; y: number };

export type SavedPanelPath = {
  id: string;
  part: Part;
  d: string;
  points: TracePoint[];
};

const SNAP_CLOSE_DIST = 1.6;
const HIT_RADIUS = 1.4;
const GRID_STEP = 0.5;

function formatCoord(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function dist(a: TracePoint, b: TracePoint) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function snapPoint(point: TracePoint, enabled: boolean): TracePoint {
  if (!enabled) return point;
  return {
    x: Math.round(point.x / GRID_STEP) * GRID_STEP,
    y: Math.round(point.y / GRID_STEP) * GRID_STEP,
  };
}

export function pointsToSvgPath(points: TracePoint[]) {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  let d = `M ${formatCoord(first.x)},${formatCoord(first.y)}`;
  for (const point of rest) {
    d += ` L ${formatCoord(point.x)},${formatCoord(point.y)}`;
  }
  d += ' Z';
  return d;
}

function getSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): TracePoint {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const mapped = pt.matrixTransform(matrix.inverse());
  return {
    x: Math.round(mapped.x * 10) / 10,
    y: Math.round(mapped.y * 10) / 10,
  };
}

function nearestPointIndex(points: TracePoint[], target: TracePoint, maxDist: number) {
  let best = -1;
  let bestDist = maxDist;
  points.forEach((point, index) => {
    const d = dist(point, target);
    if (d <= bestDist) {
      best = index;
      bestDist = d;
    }
  });
  return best;
}

function nearestEdgeInsert(
  points: TracePoint[],
  target: TracePoint,
  maxDist: number
): { index: number; point: TracePoint } | null {
  if (points.length < 2) return null;
  let best: { index: number; point: TracePoint; d: number } | null = null;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const len2 = abx * abx + aby * aby;
    if (len2 === 0) continue;
    let t = ((target.x - a.x) * abx + (target.y - a.y) * aby) / len2;
    t = Math.max(0.05, Math.min(0.95, t));
    const proj = { x: a.x + abx * t, y: a.y + aby * t };
    const d = dist(proj, target);
    if (d <= maxDist && (!best || d < best.d)) {
      best = { index: i + 1, point: proj, d };
    }
  }

  return best ? { index: best.index, point: best.point } : null;
}

export function useSvgPathEditor(initialPart: Part | null = null) {
  const [points, setPoints] = useState<TracePoint[]>([]);
  const [savedPaths, setSavedPaths] = useState<SavedPanelPath[]>([]);
  const [activePart, setActivePart] = useState<Part | null>(initialPart);
  const [lastExported, setLastExported] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const addPoint = useCallback(
    (point: TracePoint) => {
      if (activePart === null) return;
      const next = snapPoint(point, snapToGrid);
      setPoints((current) => [...current, next]);
      setSelectedIndex(null);
      setLastExported(null);
    },
    [activePart, snapToGrid]
  );

  const updatePoint = useCallback(
    (index: number, point: TracePoint) => {
      const next = snapPoint(point, snapToGrid);
      setPoints((current) =>
        current.map((item, i) => (i === index ? next : item))
      );
      setLastExported(null);
    },
    [snapToGrid]
  );

  const insertPoint = useCallback(
    (index: number, point: TracePoint) => {
      if (activePart === null) return;
      const next = snapPoint(point, snapToGrid);
      setPoints((current) => [
        ...current.slice(0, index),
        next,
        ...current.slice(index),
      ]);
      setSelectedIndex(index);
      setLastExported(null);
    },
    [activePart, snapToGrid]
  );

  const undoPoint = useCallback(() => {
    setPoints((current) => current.slice(0, -1));
    setSelectedIndex(null);
    setLastExported(null);
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
    setSelectedIndex(null);
    setLastExported(null);
  }, []);

  const reversePoints = useCallback(() => {
    setPoints((current) => [...current].reverse());
    setSelectedIndex(null);
    setLastExported(null);
  }, []);

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      if (selectedIndex === null) return;
      setPoints((current) => {
        const point = current[selectedIndex];
        if (!point) return current;
        const next = snapPoint(
          { x: Math.round((point.x + dx) * 10) / 10, y: Math.round((point.y + dy) * 10) / 10 },
          snapToGrid
        );
        return current.map((item, i) => (i === selectedIndex ? next : item));
      });
      setLastExported(null);
    },
    [selectedIndex, snapToGrid]
  );

  const finalizePath = useCallback(() => {
    if (activePart === null || points.length < 3) return false;
    const d = pointsToSvgPath(points);
    setSavedPaths((current) => {
      const withoutPart = current.filter((item) => item.part !== activePart);
      return [
        ...withoutPart,
        {
          id: `${activePart}-${Date.now()}`,
          part: activePart,
          d,
          points: [...points],
        },
      ];
    });
    setLastExported(d);
    setPoints([]);
    setSelectedIndex(null);
    return true;
  }, [activePart, points]);

  const removeSavedPath = useCallback((id: string) => {
    setSavedPaths((current) => current.filter((item) => item.id !== id));
  }, []);

  const loadSavedPath = useCallback((path: SavedPanelPath) => {
    setActivePart(path.part);
    setPoints([...path.points]);
    setLastExported(path.d);
    setSelectedIndex(null);
  }, []);

  return {
    points,
    savedPaths,
    activePart,
    setActivePart,
    lastExported,
    selectedIndex,
    setSelectedIndex,
    snapToGrid,
    setSnapToGrid,
    showLabels,
    setShowLabels,
    addPoint,
    updatePoint,
    insertPoint,
    undoPoint,
    clearPoints,
    reversePoints,
    nudgeSelected,
    finalizePath,
    removeSavedPath,
    loadSavedPath,
  };
}

type OverlayProps = {
  points: TracePoint[];
  savedPaths: SavedPanelPath[];
  onAddPoint: (point: TracePoint) => void;
  onUpdatePoint?: (index: number, point: TracePoint) => void;
  onInsertPoint?: (index: number, point: TracePoint) => void;
  onSelectPoint?: (index: number | null) => void;
  onClosePath?: () => void;
  selectedIndex?: number | null;
  showLabels?: boolean;
};

export function SvgPathEditorOverlay({
  points,
  savedPaths,
  onAddPoint,
  onUpdatePoint,
  onInsertPoint,
  onSelectPoint,
  onClosePath,
  selectedIndex = null,
  showLabels = false,
}: OverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [cursor, setCursor] = useState<TracePoint | null>(null);
  const [nearClose, setNearClose] = useState(false);

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const point = getSvgPoint(svg, event.clientX, event.clientY);
    setCursor(point);

    if (dragIndexRef.current !== null && onUpdatePoint) {
      didDragRef.current = true;
      onUpdatePoint(dragIndexRef.current, point);
      return;
    }

    if (points.length >= 3) {
      setNearClose(dist(point, points[0]) <= SNAP_CLOSE_DIST);
    } else {
      setNearClose(false);
    }
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const svg = svgRef.current;
    if (!svg) return;
    const point = getSvgPoint(svg, event.clientX, event.clientY);
    const hit = nearestPointIndex(points, point, HIT_RADIUS);

    if (hit >= 0 && onUpdatePoint) {
      event.preventDefault();
      dragIndexRef.current = hit;
      didDragRef.current = false;
      onSelectPoint?.(hit);
      svg.setPointerCapture(event.pointerId);
      return;
    }
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (dragIndexRef.current !== null) {
      if (svg?.hasPointerCapture(event.pointerId)) {
        svg.releasePointerCapture(event.pointerId);
      }
      if (didDragRef.current) {
        suppressClickRef.current = true;
      }
      dragIndexRef.current = null;
      didDragRef.current = false;
    }
  }

  function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const svg = svgRef.current;
    if (!svg) return;
    const point = getSvgPoint(svg, event.clientX, event.clientY);
    const hit = nearestPointIndex(points, point, HIT_RADIUS);

    if (hit === 0 && points.length >= 3 && onClosePath) {
      onClosePath();
      return;
    }

    if (hit >= 0) {
      onSelectPoint?.(hit);
      return;
    }

    if (event.altKey && onInsertPoint) {
      const edge = nearestEdgeInsert(points, point, 1.8);
      if (edge) {
        onInsertPoint(edge.index, {
          x: Math.round(edge.point.x * 10) / 10,
          y: Math.round(edge.point.y * 10) / 10,
        });
        return;
      }
    }

    onSelectPoint?.(null);
    onAddPoint(point);
  }

  function handlePointerLeave() {
    setCursor(null);
    setNearClose(false);
  }

  const previewPath =
    points.length >= 2
      ? `M ${points.map((p) => `${formatCoord(p.x)},${formatCoord(p.y)}`).join(' L ')}`
      : '';

  return (
    <svg
      ref={svgRef}
      className={
        'svg-path-editor-overlay' + (nearClose ? ' is-near-close' : '')
      }
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-label="SVG path editor - click to place points"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {savedPaths.map((path) => (
        <path
          key={path.id}
          className="svg-path-editor-saved"
          d={path.d}
          aria-hidden="true"
        />
      ))}

      {previewPath && (
        <path className="svg-path-editor-preview-line" d={previewPath} />
      )}

      {points.length >= 3 && (
        <path
          className="svg-path-editor-preview-fill"
          d={pointsToSvgPath(points)}
        />
      )}

      {cursor && (
        <g className="svg-path-editor-cursor" pointerEvents="none">
          <line x1={cursor.x - 1.2} y1={cursor.y} x2={cursor.x + 1.2} y2={cursor.y} />
          <line x1={cursor.x} y1={cursor.y - 1.2} x2={cursor.x} y2={cursor.y + 1.2} />
        </g>
      )}

      {nearClose && points[0] && (
        <circle
          className="svg-path-editor-close-ring"
          cx={points[0].x}
          cy={points[0].y}
          r={SNAP_CLOSE_DIST}
        />
      )}

      {points.map((point, index) => {
        const isSelected = selectedIndex === index;
        const isFirst = index === 0;
        return (
          <g key={`${point.x}-${point.y}-${index}`}>
            <circle
              className="svg-path-editor-point-hit"
              cx={point.x}
              cy={point.y}
              r={HIT_RADIUS}
            />
            <line
              className={
                'svg-path-editor-point-cross' +
                (isSelected ? ' is-selected' : '') +
                (isFirst ? ' is-first' : '')
              }
              x1={point.x - 0.55}
              y1={point.y}
              x2={point.x + 0.55}
              y2={point.y}
            />
            <line
              className={
                'svg-path-editor-point-cross' +
                (isSelected ? ' is-selected' : '') +
                (isFirst ? ' is-first' : '')
              }
              x1={point.x}
              y1={point.y - 0.55}
              x2={point.x}
              y2={point.y + 0.55}
            />
            <circle
              className={
                'svg-path-editor-point' +
                (isSelected ? ' is-selected' : '') +
                (isFirst ? ' is-first' : '')
              }
              cx={point.x}
              cy={point.y}
              r={isSelected ? 0.38 : 0.28}
            />
            {(showLabels || isSelected || isFirst) && (
              <text
                className="svg-path-editor-point-label"
                x={point.x + 0.9}
                y={point.y - 0.7}
              >
                {index + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

type PanelProps = {
  parts: Part[];
  zonesName?: string;
  points: TracePoint[];
  savedPaths: SavedPanelPath[];
  activePart: Part | null;
  setActivePart: (part: Part | null) => void;
  lastExported: string | null;
  selectedIndex?: number | null;
  snapToGrid?: boolean;
  showLabels?: boolean;
  onUndo: () => void;
  onClear: () => void;
  onFinalize: () => boolean;
  onRemoveSaved: (id: string) => void;
  onLoadSaved: (path: SavedPanelPath) => void;
  onReverse?: () => void;
  onNudge?: (dx: number, dy: number) => void;
  onToggleSnap?: () => void;
  onToggleLabels?: () => void;
};

export function SvgPathEditorPanel({
  parts,
  zonesName = 'frontZones',
  points,
  savedPaths,
  activePart,
  setActivePart,
  lastExported,
  selectedIndex = null,
  snapToGrid = false,
  showLabels = false,
  onUndo,
  onClear,
  onFinalize,
  onRemoveSaved,
  onLoadSaved,
  onReverse,
  onNudge,
  onToggleSnap,
  onToggleLabels,
}: PanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        onUndo();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        onFinalize();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClear();
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        onUndo();
      } else if (onNudge && selectedIndex !== null) {
        const step = event.shiftKey ? 0.5 : 0.1;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onNudge(-step, 0);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          onNudge(step, 0);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          onNudge(0, -step);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          onNudge(0, step);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear, onFinalize, onNudge, onUndo, selectedIndex]);

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  }

  const livePath = points.length >= 3 ? pointsToSvgPath(points) : '';
  const pointsJson = JSON.stringify(points);
  const exportSnippet = savedPaths
    .map(
      (path) =>
        `  {\n    part: '${path.part}',\n    label: '${partLabels[path.part].toUpperCase()}',\n    d: '${path.d}',\n  },`
    )
    .join('\n');

  return (
    <div className="svg-path-editor-panel">
      <div className="svg-path-editor-panel-header">
        <div>
          <p className="svg-path-editor-eyebrow">SVG PATH EDITOR</p>
          <h3>Trace body panels</h3>
          <p className="svg-path-editor-help">
            Tiny crosshairs mark points so you can see the panel edge.
            Click to place · drag to move · click first point to close ·{' '}
            <kbd>Alt</kbd>+click on an edge to insert · arrows nudge selected ·{' '}
            <kbd>Enter</kbd> export · <kbd>⌫</kbd> undo · <kbd>Esc</kbd> clear.
          </p>
        </div>
        <label className="svg-path-editor-part-picker">
          <span>Panel</span>
          <select
            value={activePart ?? ''}
            onChange={(event) =>
              setActivePart(
                event.target.value ? (event.target.value as Part) : null
              )
            }
          >
            <option value="">Select panel...</option>
            {parts.map((part) => (
              <option key={part} value={part}>
                {partLabels[part]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="svg-path-editor-actions">
        <button type="button" className="svg-path-editor-btn" onClick={onUndo}>
          Undo
        </button>
        <button type="button" className="svg-path-editor-btn" onClick={onClear}>
          Clear
        </button>
        {onReverse && (
          <button
            type="button"
            className="svg-path-editor-btn"
            disabled={points.length < 2}
            onClick={onReverse}
          >
            Reverse
          </button>
        )}
        {onToggleSnap && (
          <button
            type="button"
            className={
              'svg-path-editor-btn' + (snapToGrid ? ' is-active' : '')
            }
            aria-pressed={snapToGrid}
            onClick={onToggleSnap}
          >
            Snap 0.5
          </button>
        )}
        {onToggleLabels && (
          <button
            type="button"
            className={
              'svg-path-editor-btn' + (showLabels ? ' is-active' : '')
            }
            aria-pressed={showLabels}
            onClick={onToggleLabels}
          >
            Labels
          </button>
        )}
        <button
          type="button"
          className="svg-path-editor-btn svg-path-editor-btn-primary"
          disabled={activePart === null || points.length < 3}
          onClick={() => onFinalize()}
        >
          Export path (Enter)
        </button>
      </div>

      {onNudge && (
        <div className="svg-path-editor-nudge">
          <span>
            {selectedIndex === null
              ? 'Select a point to nudge'
              : `Point ${selectedIndex + 1} selected`}
          </span>
          <div className="svg-path-editor-nudge-grid">
            <button
              type="button"
              className="svg-path-editor-btn"
              disabled={selectedIndex === null}
              onClick={() => onNudge(0, -0.1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="svg-path-editor-btn"
              disabled={selectedIndex === null}
              onClick={() => onNudge(-0.1, 0)}
            >
              ←
            </button>
            <button
              type="button"
              className="svg-path-editor-btn"
              disabled={selectedIndex === null}
              onClick={() => onNudge(0.1, 0)}
            >
              →
            </button>
            <button
              type="button"
              className="svg-path-editor-btn"
              disabled={selectedIndex === null}
              onClick={() => onNudge(0, 0.1)}
            >
              ↓
            </button>
          </div>
        </div>
      )}

      <div className="svg-path-editor-status">
        <span>
          {activePart
            ? `${points.length} points · ${
                snapToGrid ? 'grid on' : 'free place'
              }`
            : 'Select a panel to begin'}
        </span>
        {livePath && (
          <code className="svg-path-editor-live-path">{livePath}</code>
        )}
        {points.length > 0 && (
          <div className="svg-path-editor-export">
            <span>Points JSON</span>
            <code>{pointsJson}</code>
            <button
              type="button"
              className="svg-path-editor-btn"
              onClick={() => copyText(pointsJson, 'points')}
            >
              {copiedId === 'points' ? 'Copied' : 'Copy points'}
            </button>
          </div>
        )}
        {lastExported && (
          <div className="svg-path-editor-export">
            <span>Last exported path</span>
            <code>{lastExported}</code>
            <button
              type="button"
              className="svg-path-editor-btn"
              onClick={() => copyText(lastExported, 'last')}
            >
              {copiedId === 'last' ? 'Copied' : 'Copy path'}
            </button>
          </div>
        )}
      </div>

      {savedPaths.length > 0 && (
        <div className="svg-path-editor-saved-list">
          <h4>Saved panels ({savedPaths.length})</h4>
          {savedPaths.map((path) => (
            <div key={path.id} className="svg-path-editor-saved-item">
              <div>
                <strong>{partLabels[path.part]}</strong>
                <code>{path.d}</code>
              </div>
              <div className="svg-path-editor-saved-actions">
                <button
                  type="button"
                  className="svg-path-editor-btn"
                  onClick={() => onLoadSaved(path)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="svg-path-editor-btn"
                  onClick={() => copyText(path.d, path.id)}
                >
                  {copiedId === path.id ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  className="svg-path-editor-btn"
                  onClick={() => onRemoveSaved(path.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="svg-path-editor-export-block">
            <span>{zonesName} snippet</span>
            <textarea
              readOnly
              value={exportSnippet}
              rows={Math.min(12, Math.max(4, savedPaths.length * 3))}
            />
            <button
              type="button"
              className="svg-path-editor-btn svg-path-editor-btn-primary"
              onClick={() => copyText(exportSnippet, 'all')}
            >
              {copiedId === 'all' ? 'Copied' : 'Copy all panels'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
