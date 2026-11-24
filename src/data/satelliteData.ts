export interface RegionalSatelliteData {
  regionId: string;
  name: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  vegetationIndexNdvi: {
    current: number; // e.g. 0.42
    trend5YearPct: number; // e.g. -3.2%
    status: 'stable' | 'declining' | 'improving';
  };
  forestCoverPct: number;
  urbanBuiltUpPct: number;
  surfaceHeatAnomalyC: number;
  observationDate: string;
  lastUpdatedDate: string;
  sensor: string;
  dataSource: string;
  sourceUrl: string;
  geographicCoverage: string;
  isLive: boolean;
  monitoringStations: {
    name: string;
    coords: [number, number];
    aqi: number;
    dominantPollutant: string;
    canopyCoverPct: number;
  }[];
}

export const REGIONS_SATELLITE_DATA: Record<string, RegionalSatelliteData> = {
  bengaluru: {
    regionId: 'bengaluru',
    name: 'Bengaluru Urban',
    state: 'Karnataka',
    center: [12.9716, 77.5946],
    zoom: 11,
    vegetationIndexNdvi: {
      current: 0.38,
      trend5YearPct: -4.1,
      status: 'declining',
    },
    forestCoverPct: 9.8,
    urbanBuiltUpPct: 78.4,
    surfaceHeatAnomalyC: 2.8,
    observationDate: '2024-03-15',
    lastUpdatedDate: '2024-10-01',
    sensor: 'Sentinel-2 Multispectral Instrument (MSI) & Landsat 8/9 TIRS',
    dataSource: 'Copernicus Open Access Hub & USGS/NASA Landsat Program',
    sourceUrl: 'https://browser.dataspace.copernicus.eu/',
    geographicCoverage: 'Bengaluru Metropolitan Region (741 sq km)',
    isLive: false,
    monitoringStations: [
      { name: 'Cubbon Park Station', coords: [12.9763, 77.5929], aqi: 74, dominantPollutant: 'PM2.5', canopyCoverPct: 48 },
      { name: 'Whitefield Tech Corridor', coords: [12.9698, 77.7499], aqi: 112, dominantPollutant: 'PM10', canopyCoverPct: 14 },
      { name: 'Peenya Industrial Zone', coords: [13.0285, 77.5195], aqi: 148, dominantPollutant: 'NO2', canopyCoverPct: 8 },
      { name: 'Jayanagar Urban Ward', coords: [12.9299, 77.5824], aqi: 82, dominantPollutant: 'PM2.5', canopyCoverPct: 26 },
    ],
  },
  delhi: {
    regionId: 'delhi',
    name: 'National Capital Territory of Delhi',
    state: 'Delhi',
    center: [28.6139, 77.2090],
    zoom: 11,
    vegetationIndexNdvi: {
      current: 0.29,
      trend5YearPct: 1.2,
      status: 'stable',
    },
    forestCoverPct: 13.2,
    urbanBuiltUpPct: 81.6,
    surfaceHeatAnomalyC: 3.6,
    observationDate: '2024-04-10',
    lastUpdatedDate: '2024-10-15',
    sensor: 'NASA MODIS Terra/Aqua Surface Reflectance & Sentinel-2',
    dataSource: 'NASA Earthdata / LAADS DAAC & Forest Survey of India (ISFR)',
    sourceUrl: 'https://earthdata.nasa.gov/',
    geographicCoverage: 'NCT Delhi (1,483 sq km)',
    isLive: false,
    monitoringStations: [
      { name: 'Central Ridge Forest', coords: [28.6012, 77.1852], aqi: 125, dominantPollutant: 'PM2.5', canopyCoverPct: 62 },
      { name: 'Anand Vihar Transport Hub', coords: [28.6473, 77.3160], aqi: 284, dominantPollutant: 'PM10', canopyCoverPct: 6 },
      { name: 'Lodhi Garden Station', coords: [28.5931, 77.2197], aqi: 138, dominantPollutant: 'PM2.5', canopyCoverPct: 42 },
      { name: 'IGI Airport Zone', coords: [28.5562, 77.1000], aqi: 195, dominantPollutant: 'PM2.5', canopyCoverPct: 12 },
    ],
  },
  mumbai: {
    regionId: 'mumbai',
    name: 'Mumbai Metropolitan Region',
    state: 'Maharashtra',
    center: [19.0760, 72.8777],
    zoom: 11,
    vegetationIndexNdvi: {
      current: 0.44,
      trend5YearPct: -1.8,
      status: 'stable',
    },
    forestCoverPct: 20.4, // Includes Sanjay Gandhi National Park & Mangroves
    urbanBuiltUpPct: 71.2,
    surfaceHeatAnomalyC: 2.1,
    observationDate: '2024-02-28',
    lastUpdatedDate: '2024-09-20',
    sensor: 'Sentinel-2 MSI & Landsat 9 OLI-2',
    dataSource: 'European Space Agency Copernicus & ISRO Bhuvan Portal',
    sourceUrl: 'https://bhuvan.nrsc.gov.in/',
    geographicCoverage: 'Greater Mumbai & Coastal Mangrove Belt (603 sq km)',
    isLive: false,
    monitoringStations: [
      { name: 'Sanjay Gandhi National Park', coords: [19.2288, 72.9182], aqi: 62, dominantPollutant: 'PM2.5', canopyCoverPct: 78 },
      { name: 'Bandra-Kurla Complex (BKC)', coords: [19.0657, 72.8687], aqi: 142, dominantPollutant: 'PM10', canopyCoverPct: 11 },
      { name: 'Colaba Coastal Station', coords: [18.9067, 72.8147], aqi: 88, dominantPollutant: 'PM2.5', canopyCoverPct: 22 },
      { name: 'Navi Mumbai Urban Belt', coords: [19.0330, 73.0297], aqi: 118, dominantPollutant: 'PM10', canopyCoverPct: 18 },
    ],
  },
  hyderabad: {
    regionId: 'hyderabad',
    name: 'Hyderabad Urban Agglomeration',
    state: 'Telangana',
    center: [17.3850, 78.4867],
    zoom: 11,
    vegetationIndexNdvi: {
      current: 0.35,
      trend5YearPct: 2.4, // Telanganaku Haritha Haram greening program impact
      status: 'improving',
    },
    forestCoverPct: 8.6,
    urbanBuiltUpPct: 74.0,
    surfaceHeatAnomalyC: 2.9,
    observationDate: '2024-03-20',
    lastUpdatedDate: '2024-10-05',
    sensor: 'Sentinel-2 MSI & NASA MODIS',
    dataSource: 'Copernicus Open Access & Telangana Remote Sensing Applications Centre (TRAC)',
    sourceUrl: 'https://dataspace.copernicus.eu/',
    geographicCoverage: 'GHMC Greater Hyderabad (650 sq km)',
    isLive: false,
    monitoringStations: [
      { name: 'KBR National Park', coords: [17.4265, 78.4208], aqi: 68, dominantPollutant: 'PM2.5', canopyCoverPct: 65 },
      { name: 'HITEC City Tech Corridor', coords: [17.4474, 78.3762], aqi: 124, dominantPollutant: 'PM10', canopyCoverPct: 15 },
      { name: 'Charminar Heritage Ward', coords: [17.3616, 78.4747], aqi: 135, dominantPollutant: 'PM2.5', canopyCoverPct: 8 },
    ],
  },
};
