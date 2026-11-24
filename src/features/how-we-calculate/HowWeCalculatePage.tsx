import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  EMISSION_FACTORS, 
  EMISSION_FACTOR_VERSION 
} from '../../data/emissionFactors';
import { 
  Calculator, 
  ExternalLink, 
  BookOpen, 
  Zap, 
  Car, 
  Trash2, 
  CheckCircle2, 
  Info,
  ShieldCheck
} from 'lucide-react';

export const HowWeCalculatePage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'transportation' | 'electricity' | 'waste_lifestyle'>('all');

  const filteredFactors = categoryFilter === 'all'
    ? EMISSION_FACTORS
    : EMISSION_FACTORS.filter(f => f.category === categoryFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              How We Calculate
            </h2>
            <Badge variant="success" size="sm" className="font-mono">
              Version {EMISSION_FACTOR_VERSION}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent emission factor database, assumptions, and formulas backed by official Indian & IPCC authorities.
          </p>
        </div>
      </div>

      {/* Core Carbon Formula Banner */}
      <Card className="p-5 border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-eco-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-eco-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              The Fundamental Calculation Formula
            </h3>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-eco-700 dark:text-eco-300 font-bold">
              Carbon Emission (kg CO2e) = Activity Quantity × Emission Factor
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              For shared household utilities (such as air conditioning and direct electricity grid meters), the resulting emissions are allocated per capita by dividing by the verified household size: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">Personal kg CO2e = (Household Usage × Factor) ÷ Household Size</code>.
            </p>
          </div>
        </div>
      </Card>

      {/* Electricity Estimation Assumptions Card */}
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-warning-500" /> Transparent Household Electricity Assumptions
          </CardTitle>
          <CardDescription>
            When users do not have their monthly electricity bill handy, our estimation engine applies these verified domestic engineering baselines:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Air Conditioning Load
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                1.5-Ton 3-Star Inverter AC assumes an average steady-state compressor power draw of <strong>1.2 kW</strong> at a standard 24°C setpoint.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Lighting Circuit Load
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Active household illumination assumes 3-4 LED/CFL fixtures active concurrently at an aggregate of <strong>0.04 kW (40 Watts)</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Auxiliary Base Appliances
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Continuous domestic baseline (refrigerator compressor cycling, ceiling fans, Wi-Fi router, TV standby) estimated at <strong>6 kWh/day (~180 kWh/month)</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emission Factor Directory */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Verified Emission Factor Directory
            </h3>
            <Badge variant="default" size="sm">
              {filteredFactors.length} Factors
            </Badge>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'transportation', label: 'Transport' },
              { id: 'electricity', label: 'Electricity' },
              { id: 'waste_lifestyle', label: 'Waste & Diet' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                  categoryFilter === cat.id
                    ? 'border-eco-600 bg-eco-50 dark:bg-eco-950/70 text-eco-800 dark:text-eco-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Factors Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Activity Name</th>
                <th className="py-3 px-4 text-right">Factor Value</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Source & Benchmark</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredFactors.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {f.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {f.notes}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {f.value.toFixed(3)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    kg CO2e / {f.unit}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <a
                      href={f.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-eco-600 dark:text-eco-400 hover:underline font-medium inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>{f.sourceName}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {f.year}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={f.status === 'measured' ? 'success' : 'default'} size="sm">
                      {f.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
