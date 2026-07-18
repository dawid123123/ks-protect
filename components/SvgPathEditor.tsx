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

function formatCoord(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
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

export function useSvgPathEditor(initialPart: Part | null = null) {
  const [points, setPoints] = useState<TracePoint[]>([]);
  const [savedPaths, setSavedPaths] = useState<SavedPanelPath[]>([]);
  const [activePart, setActivePart] = useState<Part | null>(initialPart);
  const [lastExported, setLastExported] = useState<string | null>(null);

  const addPoint = useCallback((point: TracePoint) => {
    if (activePart === null) return;
    setPoints((current) => [...current, point]);
    setLastExported(null);
  }, [activePart]);

  const undoPoint = useCallback(() => {
    setPoints((current) => current.slice(0, -1));
    setLastExported(null);
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
    setLastExported(null);
  }, []);

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
    return true;
  }, [activePart, points]);

  const removeSavedPath = useCallback((id: string) => {
    setSavedPaths((current) => current.filter((item) => item.id !== id));
  }, []);

  const loadSavedPath = useCallback((path: SavedPanelPath) => {
    setActivePart(path.part);
    setPoints([...path.points]);
    setLastExported(path.d);
  }, []);

  return {
    points,
    savedPaths,
    activePart,
    setActivePart,
    lastExported,
    addPoint,
    undoPoint,
    clearPoints,
    finalizePath,
    removeSavedPath,
    loadSavedPath,
  };
}

type OverlayProps = {
  points: TracePoint[];
  savedPaths: SavedPanelPath[];
  onAddPoint: (point: TracePoint) => void;
};

export function SvgPathEditorOverlay({
  points,
  savedPaths,
  onAddPoint,
}: OverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const svg = svgRef.current;
    if (!svg) return;
    onAddPoint(getSvgPoint(svg, event.clientX, event.clientY));
  }

  const previewPath =
    points.length >= 2
      ? `M ${points.map((p) => `${formatCoord(p.x)},${formatCoord(p.y)}`).join(' L ')}`
      : '';

  return (
    <svg
      ref={svgRef}
      className="svg-path-editor-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-label="SVG path editor - click to place points"
      onClick={handleClick}
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

      {points.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle
            className="svg-path-editor-point"
            cx={point.x}
            cy={point.y}
            r={index === 0 ? 1.4 : 1.1}
          />
          <text
            className="svg-path-editor-point-label"
            x={point.x + 1.6}
            y={point.y - 1.4}
          >
            {index + 1}
          </text>
        </g>
      ))}
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
  onUndo: () => void;
  onClear: () => void;
  onFinalize: () => boolean;
  onRemoveSaved: (id: string) => void;
  onLoadSaved: (path: SavedPanelPath) => void;
};

export function SvgPathEditorPanel({
  parts,
  zonesName = 'frontZones',
  points,
  savedPaths,
  activePart,
  setActivePart,
  lastExported,
  onUndo,
  onClear,
  onFinalize,
  onRemoveSaved,
  onLoadSaved,
}: PanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (event.key === 'Enter') {
        event.preventDefault();
        onFinalize();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClear();
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        onUndo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear, onFinalize, onUndo]);

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
            Click on the car to place points. Press <kbd>Enter</kbd> to export
            the polygon as an SVG path. <kbd>Backspace</kbd> removes the last
            point. <kbd>Esc</kbd> clears the current polygon.
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
          Undo point
        </button>
        <button type="button" className="svg-path-editor-btn" onClick={onClear}>
          Clear
        </button>
        <button
          type="button"
          className="svg-path-editor-btn svg-path-editor-btn-primary"
          disabled={activePart === null || points.length < 3}
          onClick={() => onFinalize()}
        >
          Export path (Enter)
        </button>
      </div>

      <div className="svg-path-editor-status">
        <span>
          {activePart
            ? `${points.length} points placed`
            : 'Select a panel to begin'}
        </span>
        {livePath && (
          <code className="svg-path-editor-live-path">{livePath}</code>
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
