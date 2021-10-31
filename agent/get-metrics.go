package main

import (
	"encoding/json"
	"time"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/mem"
)

type CpuMetrics struct {
	PhysicalCores int       `json:"physicalCores"`
	TotalPercent  []float64 `json:"totalPercent"`
	CoresPercent  []float64 `json:"coresPercent"`
}

type MemoryMetrics struct {
	Total     uint64 `json:"total"`
	Used      uint64 `json:"used"`
	SwapTotal uint64 `json:"swapTotal"`
	SwapFree  uint64 `json:"swapFree"`
}

type DiskMetrics struct {
	Total uint64 `json:"total"`
	Used  uint64 `json:"used"`
}

func getMetrics() []interface{} {
	var metrics []interface{}

	// Version
	metrics = append(metrics, "v0.1")

	// Timestamp
	metrics = append(metrics, time.Now().Format(time.RFC3339))

	// Uptime
	uptime, _ := host.Uptime()
	metrics = append(metrics, uptime)

	// CPU
	percentPerCore, _ := cpu.Percent(time.Second, true)
	percentTotal, _ := cpu.Percent(time.Second, false)
	physicalCores, _ := cpu.Counts(false)
	cpuMetrics := CpuMetrics{
		PhysicalCores: physicalCores,
		TotalPercent:  percentTotal,
		CoresPercent:  percentPerCore,
	}
	cpuMetricsJson, err := json.Marshal(cpuMetrics)
	check(err, "Metrics error")
	metrics = append(metrics, string(cpuMetricsJson))

	// Memory
	mem, _ := mem.VirtualMemory()
	memoryMetrics := MemoryMetrics{
		Total:     mem.Total,
		Used:      mem.Used,
		SwapTotal: mem.SwapTotal,
		SwapFree:  mem.SwapFree,
	}
	memoryMetricsJson, err := json.Marshal(memoryMetrics)
	check(err, "Metrics error")
	metrics = append(metrics, string(memoryMetricsJson))

	// Disk
	dsk, _ := disk.Usage("/")
	diskMetrics := DiskMetrics{
		Total: dsk.Total,
		Used:  dsk.Used,
	}
	diskMetricsJson, err := json.Marshal(diskMetrics)
	check(err, "Metrics error")
	metrics = append(metrics, string(diskMetricsJson))

	// Temperature
	temps, _ := host.SensorsTemperatures()
	var cpuTemp float64 = -1
	for _, temp := range temps {
		if temp.SensorKey == "cpu_thermal_input" {
			cpuTemp = temp.Temperature
		}
	}
	metrics = append(metrics, cpuTemp)

	return metrics
}
