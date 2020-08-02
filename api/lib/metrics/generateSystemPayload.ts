import { sheets_v4 } from 'googleapis';

/**
 * Types
 */
type UptimeValuesType = {
  timestamp: string;
  uptime: number;
}[];

type CpuValuesType = {
  timestamp: string;
  physicalCores: number;
  totalPercent: number[];
  coresPercent: number[];
}[];

type MemoryValuesType = {
  timestamp: string;
  total: number;
  used: number;
  swapTotal: number;
  swapFree: number;
}[];

type DiskValuesType = {
  timestamp: string;
  total: number;
  used: number;
}[];

type TemperatureValuesType = {
  timestamp: string;
  temperature: number;
}[];

/**
 * Constants
 */
const VERSION = 'version';
const TIMESTAMP = 'timestamp';
const UPTIME = 'uptime';
const CPU = 'cpu';
const MEMORY = 'memory';
const DISK = 'disk';
const TEMPERATURE = 'temperature';

/**
 * Function
 */
export function generateSystemPayload(data: sheets_v4.Schema$ValueRange) {
  const [keys, ...rows] = data.values || [];

  const timestampIndex = keys.findIndex((key) => key === TIMESTAMP);

  const uptimeValues: UptimeValuesType = [];
  const cpuValues: CpuValuesType = [];
  const memoryValues: MemoryValuesType = [];
  const diskValues: DiskValuesType = [];
  const temperatureValues: TemperatureValuesType = [];

  // Convert arrays to objects, with keys from first row
  rows.forEach((row) => {
    const timestamp = row[timestampIndex];

    keys.forEach((key, index) => {
      let cellData = row[index];

      switch (key) {
        case UPTIME:
          uptimeValues.push({
            timestamp,
            uptime: cellData,
          });
          break;
        case CPU:
          cpuValues.push({
            timestamp,
            ...JSON.parse(cellData),
          });
          break;
        case MEMORY:
          memoryValues.push({
            timestamp,
            ...JSON.parse(cellData),
          });
          break;
        case DISK:
          diskValues.push({
            timestamp,
            ...JSON.parse(cellData),
          });
          break;
        case TEMPERATURE:
          temperatureValues.push({
            timestamp,
            temperature: cellData,
          });
          break;
        default:
          break;
      }
    });
  });

  return {
    [UPTIME]: uptimeValues,
    [CPU]: cpuValues,
    [MEMORY]: memoryValues,
    [DISK]: diskValues,
    [TEMPERATURE]: temperatureValues,
  };
}
