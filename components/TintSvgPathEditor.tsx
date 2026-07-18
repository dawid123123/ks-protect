'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  pointsToSvgPath,
  SvgPathEditorOverlay,
  TracePoint,
} from './SvgPathEditor';
import { tintWindowLabels } from './tintData';
import { TintWindow } from './tintTypes';

export type TintSavedPanelPath = {
  id: string;
  window: TintWindow;
  d: string;
  points: TracePoint[];
};

export function useTintPathEditor(initialWindow: TintWindow | null = null) {
  const [points, setPoints] = useState<TracePoint[]>([]);
  const [savedPaths, setSavedPaths] = useState<TintSavedPanelPath[]>([]);
  const [activeWindow, setActiveWindow] = useState<TintWindow | null>(
    initialWindow
  );
  const [lastExported, setLastExported] = useState<string | null>(null);

  const addPoint = useCallback(
    (point: TracePoint) => {
      if (activeWindow === null) return;
      setPoints((current) => [...current, point]);
      setLastExported(null);
    },
    [activeWindow]
  );

  const undoPoint = useCallback(() => {
    setPoints((current) => current.slice(0, -1));
    setLastExported(null);
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
    setLastExported(null);
  }, []);

  const finalizePath = useCallback(() => {
    if (activeWindow === null || points.length < 3) return false;
    const d = pointsToSvgPath(points);
    setSavedPaths((current) => {
      const withoutWindow = current.filter(
        (item) => item.window !== activeWindow
      );
      return [
        ...withoutWindow,
        {
          id: `${activeWindow}-${Date.now()}`,
          window: activeWindow,
          d,
          points: [...points],
        },
      ];
    });
    setLastExported(d);
    setPoints([]);
    return true;
  }, [activeWindow, points]);

  const removeSavedPath = useCallback((id: string) => {
    setSavedPaths((current) => current.filter((item) => item.id !== id));
  }, []);

  const loadSavedPath = useCallback((path: TintSavedPanelPath) => {
    setActiveWindow(path.window);
    setPoints([...path.points]);
    setLastExported(path.d);
  }, []);

  return {
    points,
    savedPaths,
    activeWindow,
    setActiveWindow,
    lastExported,
    addPoint,
    undoPoint,
    clearPoints,
    finalizePath,
    removeSavedPath,
    loadSavedPath,
  };
}

type PanelProps = {
  windows: TintWindow[];
  zonesName?: string;
  points: TracePoint[];
  savedPaths: TintSavedPanelPath[];
  activeWindow: TintWindow | null;
  setActiveWindow: (window: TintWindow | null) => void;
  lastExported: string | null;
  onUndo: () => void;
  onClear: () => void;
  onFinalize: () => boolean;
  onRemoveSaved: (id: string) => void;
  onLoadSaved: (path: TintSavedPanelPath) => void;
};

export function TintSvgPathEditorPanel({
  windows,
  zonesName = 'tintFrontZones',
  points,
  savedPaths,
  activeWindow,
  setActiveWindow,
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
        `  {\n    window: '${path.window}',\n    label: '${tintWindowLabels[path.window].toUpperCase()}',\n    d: '${path.d}',\n  },`
    )
    .join('\n');

  return (
    <div className="svg-path-editor-panel">
      <div className="svg-path-editor-panel-header">
        <div>
          <p className="svg-path-editor-eyebrow">TINT SVG EDITOR</p>
          <h3>Trace window panels</h3>
          <p className="svg-path-editor-help">
            Click on the photo to place points. Press <kbd>Enter</kbd> to export
            the polygon. <kbd>Backspace</kbd> removes the last point.{' '}
            <kbd>Esc</kbd> clears the current polygon.
          </p>
        </div>
        <label className="svg-path-editor-part-picker">
          <span>Window</span>
          <select
            value={activeWindow ?? ''}
            onChange={(event) =>
              setActiveWindow(
                event.target.value ? (event.target.value as TintWindow) : null
              )
            }
          >
            <option value="">Select window...</option>
            {windows.map((window) => (
              <option key={window} value={window}>
                {tintWindowLabels[window]}
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
          disabled={activeWindow === null || points.length < 3}
          onClick={() => onFinalize()}
        >
          Export path (Enter)
        </button>
      </div>

      <div className="svg-path-editor-status">
        <span>
          {activeWindow
            ? `${points.length} points placed`
            : 'Select a window to begin'}
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
          <h4>Saved windows ({savedPaths.length})</h4>
          {savedPaths.map((path) => (
            <div key={path.id} className="svg-path-editor-saved-item">
              <div>
                <strong>{tintWindowLabels[path.window]}</strong>
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
              {copiedId === 'all' ? 'Copied' : 'Copy all windows'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { SvgPathEditorOverlay as TintSvgPathEditorOverlay };
