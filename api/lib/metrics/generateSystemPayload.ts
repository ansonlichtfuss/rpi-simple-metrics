import { sheets_v4 } from 'googleapis';

/**
 * Types
 */
type ChartData = {
  id: string;
  data: { x: string | number; y: number }[];
};
type CpuCoreValuesType = ChartData[];

/**
 * Constants
 */
const SYSTEM = 'system';
const TIMESTAMP = 'timestamp';
const UPTIME = 'uptime';
const CPU = 'cpu';
const CPU_TOTAL = 'cpuTotal';
const CPU_CORES = 'cpuCores';

const MEMORY = 'memory';
const MEMORY_SWAP = 'memorySwap';
const DISK = 'disk';
const TEMPERATURE = 'temperature';

/**
 * Function
 */
export function generateSystemPayload(data: sheets_v4.Schema$ValueRange) {
  // Find column keys for data types
  const [keys, ...rows] = data.values || [];
  const timestampIndex = keys.findIndex((key) => key === TIMESTAMP);
  const uptimeIndex = keys.findIndex((key) => key === UPTIME);
  const cpuIndex = keys.findIndex((key) => key === CPU);

  // Set up overall
  const systemValues = {
    lastReportTime: rows[rows.length - 1][timestampIndex],
    uptime: rows[rows.length - 1][uptimeIndex],
    cpu: {
      physicalCores: -1,
    },
    memory: {
      total: -1,
      swapTotal: -1,
    },
    disk: {
      total: -1,
    },
  };

  // Set up child objects
  const cpuTotalValues: ChartData = {
    id: CPU_TOTAL,
    data: [],
  };
  const cpuCoresArray: number[] = JSON.parse(rows[0][cpuIndex]).coresPercent;
  const cpuCoreValues: CpuCoreValuesType = cpuCoresArray.map((_, index) => ({
    id: `core${index}`,
    data: [],
  }));
  const memoryValues: ChartData = {
    id: MEMORY,
    data: [],
  };
  const memorySwapValues: ChartData = {
    id: MEMORY_SWAP,
    data: [],
  };
  const diskValues: ChartData = {
    id: DISK,
    data: [],
  };
  const temperatureValues: ChartData = {
    id: TEMPERATURE,
    data: [],
  };

  // Convert arrays to objects, with keys from first row
  rows.forEach((row) => {
    const timestamp = row[timestampIndex];

    keys.forEach((key, index) => {
      let cellData = row[index];

      switch (key) {
        case CPU: {
          const data = JSON.parse(cellData);
          systemValues.cpu.physicalCores = data.physicalCores;
          cpuTotalValues.data.push({
            x: timestamp,
            y: data.totalPercent[0],
          });
          data.coresPercent.forEach((core, index) => {
            cpuCoreValues[index].data.push({
              x: timestamp,
              y: core,
            });
          });
          break;
        }
        case MEMORY: {
          const data = JSON.parse(cellData);
          systemValues.memory.total = data.total;
          systemValues.memory.swapTotal = data.swapTotal;
          memoryValues.data.push({
            x: timestamp,
            y: data.used,
          });
          memorySwapValues.data.push({
            x: timestamp,
            y: data.swapTotal - data.swapFree,
          });
          break;
        }
        case DISK: {
          const data = JSON.parse(cellData);
          systemValues.disk.total = data.total;
          diskValues.data.push({
            x: timestamp,
            y: data.used,
          });
          break;
        }
        case TEMPERATURE:
          temperatureValues.data.push({
            x: timestamp,
            y: cellData,
          });
          break;
        default:
          break;
      }
    });
  });

  return {
    [SYSTEM]: systemValues,
    [CPU_TOTAL]: cpuTotalValues,
    [CPU_CORES]: cpuCoreValues,
    [MEMORY]: memoryValues,
    [DISK]: diskValues,
    [TEMPERATURE]: temperatureValues,
  };
}
