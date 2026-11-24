import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { RegionalSatelliteData } from '../../../data/satelliteData';
import { 
  TreePine, 
  Building2, 
  Thermometer, 
  Wind, 
  TrendingDown, 
  TrendingUp, 
  Minus 
} from 'lucide-react';

interface IndicatorPanelProps {
  region: RegionalSatelliteData;
}

export const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ region }) => {
  const getTrendIcon = (status: 'stable' | 'declining' | 'improving') => {
    switch (status) {
      case 'declining':
        return <TrendingDown className="w-3.5 h-3.5 text-warning-500" />;
      case 'improving':
        return <TrendingUp className="w-3.5 h-3.5 text-eco-500" />;
      case 'stable':
        return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Normalized Difference Vegetation Index (NDVI) */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold">Vegetation Index (NDVI)</span>
          <TreePine className="w-4 h-4 text-eco-600" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {region.vegetationIndexNdvi.current.toFixed(2)}
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-500">
          {getTrendIcon(region.vegetationIndexNdvi.status)}
          <span className="capitalize">{region.vegetationIndexNdvi.status}</span>
          <span>({region.vegetationIndexNdvi.trend5YearPct > 0 ? '+' : ''}{region.vegetationIndexNdvi.trend5YearPct}% 5y)</span>
        </div>
      </Card>

      {/* 2. Forest & Canopy Cover */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold">Forest & Tree Cover</span>
          <TreePine className="w-4 h-4 text-eco-700" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {region.forestCoverPct}%
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Of total regional geographic area
        </p>
      </Card>

      {/* 3. Urban Built-up Density */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold">Urban Impervious Area</span>
          <Building2 className="w-4 h-4 text-sky-500" />
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {region.urbanBuiltUpPct}%
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Paved and built infrastructure
        </p>
      </Card>

      {/* 4. Urban Heat Island Anomaly */}
      <Card className="p-4 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold">Surface Heat Anomaly</span>
          <Thermometer className="w-4 h-4 text-warning-500" />
        </div>
        <div className="text-xl font-bold text-warning-600 dark:text-warning-400">
          +{region.surfaceHeatAnomalyC}°C
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Versus rural surrounding baseline
        </p>
      </Card>
    </div>
  );
};
