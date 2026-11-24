import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RegionalSatelliteData } from '../../../data/satelliteData';

interface RegionalMapProps {
  region: RegionalSatelliteData;
  activeLayer: 'ndvi' | 'canopy' | 'heat';
}

export const RegionalMap: React.FC<RegionalMapProps> = ({
  region,
  activeLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: region.center,
        zoom: region.zoom,
        zoomControl: true,
        scrollWheelZoom: false, // Prevent accidental scrolling when browsing page
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center, zoom, and station markers when region or active layer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    map.setView(region.center, region.zoom);
    layerGroup.clearLayers();

    // Regional boundary circle preview (urban agglomeration boundary)
    const boundaryCircle = L.circle(region.center, {
      radius: 12000,
      color: activeLayer === 'heat' ? '#dc2626' : activeLayer === 'ndvi' ? '#16a34a' : '#0284c7',
      fillColor: activeLayer === 'heat' ? '#f87171' : activeLayer === 'ndvi' ? '#4ade80' : '#38bdf8',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 6',
    });
    layerGroup.addLayer(boundaryCircle);

    // Monitoring Station Interactive Markers
    region.monitoringStations.forEach((station) => {
      let markerColor = '#16a34a'; // good
      if (activeLayer === 'canopy') {
        markerColor = station.canopyCoverPct > 35 ? '#15803d' : station.canopyCoverPct > 15 ? '#f59e0b' : '#ef4444';
      } else if (activeLayer === 'heat') {
        markerColor = station.canopyCoverPct < 20 ? '#dc2626' : '#16a34a';
      } else {
        markerColor = station.aqi > 150 ? '#dc2626' : station.aqi > 100 ? '#f59e0b' : '#16a34a';
      }

      const marker = L.circleMarker(station.coords, {
        radius: 9,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #0f172a;">
          <strong style="font-size: 13px; display: block; margin-bottom: 4px;">${station.name}</strong>
          <div>Air Quality (AQI): <strong>${station.aqi}</strong> (${station.dominantPollutant})</div>
          <div>Tree Canopy Density: <strong>${station.canopyCoverPct}%</strong></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Sensor: Sentinel-2 & Ground Monitor</div>
        </div>
      `);

      layerGroup.addLayer(marker);
    });
  }, [region, activeLayer]);

  return (
    <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-subtle z-0">
      <div ref={mapContainerRef} className="w-full h-full" style={{ background: '#f8fafc' }} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-[11px] space-y-1">
        <span className="font-semibold block text-slate-800 dark:text-slate-200">
          Monitoring Stations
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-eco-600 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">High Canopy / Moderate AQI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-warning-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Moderate Canopy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-danger-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">High Heat Island / Elevated AQI</span>
        </div>
      </div>
    </div>
  );
};
