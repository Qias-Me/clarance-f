/**
 * Mapping Photos Overlay
 *
 * Visualizes a PDF page photo with field rectangles overlaid from JSON.
 * Uses artifacts published to /public/validation by scripts/publish-validation-artifacts.js
 */
import React, { useEffect, useMemo, useState } from 'react';
import { getPageFieldMappings } from '~/state/contexts/sections2.0/section13-field-mapping-enhanced';
import { SECTION13_FIELD_MAPPINGS } from '~/state/contexts/sections2.0/section13-field-mapping';

type Rect = { x: number; y: number; width: number; height: number };

type PageField = {
  id: string;
  name: string;
  value: any;
  page: number;
  label: string;
  type: string;
  rect: Rect | null;
  section: number | null;
};

type PageJson = {
  metadata: {
    pdfPath: string;
    pageNumber: number;
    totalFieldsOnPage: number;
    extractedAt: string;
    section: number | null;
    pageWidth?: number;
    pageHeight?: number;
  };
  fields: PageField[];
};

function useJson<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!url) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) setData(json as T);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to fetch');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [url]);
  return { data, error, loading } as const;
}

export default function MappingPhotosOverlay() {
  const [page, setPage] = useState<number>(17);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);

  const photoUrl = `/validation/photos/page${page}.png`;
  const jsonUrl = `/validation/output/page${page}.json`;
  const { data: pageJson } = useJson<PageJson>(jsonUrl);

  const baseDims = useMemo(() => {
    const w = pageJson?.metadata.pageWidth ?? 612; // default PDF points width
    const h = pageJson?.metadata.pageHeight ?? 792; // default PDF points height
    return { w, h };
  }, [pageJson]);

  const mappedPdfNames = useMemo(() => {
    const set = new Set<string>();
    // Explicit names from base mapping (best match to actual PDF field names)
    Object.values(SECTION13_FIELD_MAPPINGS).forEach(v => set.add(v));
    // Enhanced entries (skip placeholder-style names that won't match actual PDF names)
    const entries = getPageFieldMappings(page, 4);
    entries
      .map(m => m.pdfFieldName)
      .filter(name => !name.includes('#field'))
      .forEach(name => set.add(name));
    return set;
  }, [page]);

  const namesOnPage = useMemo(() => new Set((pageJson?.fields || []).map(f => f.name)), [pageJson]);

  const stats = useMemo(() => {
    let mapped = 0;
    for (const n of namesOnPage) if (mappedPdfNames.has(n)) mapped++;
    return {
      total: namesOnPage.size,
      mapped,
      missing: Math.max(0, namesOnPage.size - mapped)
    };
  }, [namesOnPage, mappedPdfNames]);

  const scale = useMemo(() => {
    if (!imgDims) return { x: 1, y: 1 };
    return { x: imgDims.w / baseDims.w, y: imgDims.h / baseDims.h };
  }, [imgDims, baseDims]);

  const fieldsToShow = useMemo(() => {
    const fields = pageJson?.fields || [];
    if (!showOnlyMissing) return fields;
    return fields.filter(f => !mappedPdfNames.has(f.name));
  }, [pageJson, showOnlyMissing, mappedPdfNames]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm">Page:
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="ml-2 px-2 py-1 border rounded"
              >
                {[...Array(33 - 17 + 1)].map((_, i) => 17 + i).map(p => (
                  <option key={p} value={p}>Page {p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={!!showOnlyMissing} onChange={(e) => setShowOnlyMissing(e.target.checked)} />
              Show only missing
            </label>
          </div>
          <div className="text-sm text-gray-700">
            Total: {stats.total} · Mapped: <span className="text-green-600 font-semibold">{stats.mapped}</span> · Missing: <span className="text-red-600 font-semibold">{stats.missing}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 border rounded relative bg-gray-50 overflow-auto">
            <img
              src={photoUrl}
              alt={`Page ${page}`}
              className="w-full h-auto block"
              onLoad={(e) => setImgDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            />
            {pageJson && fieldsToShow.map((f) => {
              if (!f.rect) return null;
              const left = f.rect.x * scale.x;
              const top = (baseDims.h - f.rect.y - f.rect.height) * scale.y; // convert bottom-left to top-left
              const width = f.rect.width * scale.x;
              const height = f.rect.height * scale.y;
              const isMapped = mappedPdfNames.has(f.name);
              return (
                <div
      key={f.id}
      data-testid="overlay-box"
                  title={`${f.name}\n${f.label || ''}`}
                  style={{ position: 'absolute', left, top, width, height, border: `2px solid ${isMapped ? '#16a34a' : '#dc2626'}`, background: isMapped ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.18)' }}
                />
              );
            })}
          </div>

          <div className="border rounded p-3 bg-gray-50">
            <div className="font-semibold mb-2">Artifacts</div>
            <div className="text-xs text-gray-700 space-y-1">
              <div>Photo: <code>/public/validation/photos/page{page}.png</code></div>
              <div>JSON: <code>/public/validation/output/page{page}.json</code></div>
            </div>
            <hr className="my-3" />
            <div className="font-semibold mb-2">Fields on page</div>
            <div className="max-h-80 overflow-auto text-sm">
              {(pageJson?.fields || []).map(f => (
                <div key={f.id} className="flex items-center justify-between py-1 border-b border-gray-200/60">
                  <div className="truncate mr-2">
                    <div className="font-mono text-xs truncate" title={f.name}>{f.name}</div>
                    <div className="text-[11px] text-gray-500 truncate" title={f.label}>{f.label}</div>
                  </div>
                  <div className={`text-[11px] font-medium ${mappedPdfNames.has(f.name) ? 'text-green-700' : 'text-red-700'}`}>
                    {mappedPdfNames.has(f.name) ? 'Mapped' : 'Missing'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
