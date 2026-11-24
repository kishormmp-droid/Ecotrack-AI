import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { RegionalSatelliteData } from '../../../data/satelliteData';
import { ExternalLink, Database, Calendar, Globe, Satellite } from 'lucide-react';

interface DatasetMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: RegionalSatelliteData;
}

export const DatasetMetadataModal: React.FC<DatasetMetadataModalProps> = ({
  isOpen,
  onClose,
  region,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Earth Observation Dataset Metadata"
      description="Public remote-sensing telemetry specifications and provenance."
      size="md"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-eco-600" /> Primary Sensor:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-xs">
              {region.sensor}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-sky-500" /> Data Source / Program:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-xs">
              {region.dataSource}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" /> Observation Date:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {region.observationDate}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" /> Last Pipeline Ingestion:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {region.lastUpdatedDate}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-eco-600" /> Geographic Coverage:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
              {region.geographicCoverage}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-eco-50 dark:bg-eco-950/60 border border-eco-200 dark:border-eco-900 text-eco-900 dark:text-eco-200 text-[11px] leading-relaxed">
          NASA Earthdata and Copernicus Sentinel-2 observations are provided under open science licenses for environmental research and climate monitoring.
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href={region.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-eco-600 dark:text-eco-400 font-medium hover:underline inline-flex items-center gap-1"
          >
            Visit Open Data Portal <ExternalLink className="w-3 h-3" />
          </a>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
