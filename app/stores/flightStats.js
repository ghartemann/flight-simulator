import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const REFRESH_RATE = 50;

const CO2_PRODUCED_2023 = 882000000000; // in kg
const CO2_PER_TREE_PER_YEAR = 21; // kg CO₂ absorbed per tree per year (mature tree average)
const CO2_PER_CAR_PER_YEAR = 4600; // kg CO₂ per average car per year

export const useFlightStatsStore = defineStore('flightStats', () => {
    const timeElapsed = ref(0);
    const lastUpdateTime = ref(Date.now());
    const activePlanes = ref([]);
    const totalFuelBurned = ref(0);
    const totalFuelBurnedEasterEgg = ref(0);

    let fuelTimer = null;

    const totalNbPlanes = computed(() => {
        return activePlanes.value.length;
    });

    const totalNbSeats = computed(() => {
        const total = activePlanes.value.map(ap => ap.seats);

        if (total.length === 0) {
            return 0;
        }

        return total.reduce((a, b) => a + b);
    });

    const totalFuelPerSecond = computed(() => {
        const total = activePlanes.value.map(ap => ap.litersPerSecond);

        if (total.length === 0) {
            return 0;
        }

        return total.reduce((a, b) => a + b);
    });

    const totalFuelPerSecondEasterEgg = computed(() => {
        const plane = activePlanes.value.find(p => p.id === 'easter-egg-plane');

        return plane?.litersPerSecond ?? 0;
    });

    const displayedDataEasterEgg = computed(() => {
        const plane = activePlanes.value.find(p => p.id === 'easter-egg-plane');

        if (!plane) {
            return [];
        }

        return [
            {
                icon: 'i-lucide-fuel',
                title: 'Fuel',
                data: [
                    {
                        title: 'Burned per second',
                        value: useFormat().number(plane.litersPerSecond, 2, 2),
                        unit: 'L/s'
                    },
                    {
                        title: 'Burned so far',
                        value: useFormat().number(totalFuelBurnedEasterEgg.value, 2, 2),
                        unit: 'L'
                    }
                ]
            }
        ];
    });

    const displayedData = computed(() => {
        const co2perSec = totalFuelPerSecond.value * 2.5;
        const co2produced = totalFuelBurned.value * 2.5;

        return [
            {
                icon: 'i-lucide-plane',
                title: 'Planes',
                data: [
                    {
                        title: 'Nb. of planes',
                        value: totalNbPlanes.value
                    },
                    {
                        title: 'Nb. of seats',
                        value: totalNbSeats.value,
                        tgvEquivalent: {
                            title: 'TGV equivalent',
                            value: totalNbSeats.value / 740,
                            unit: 'TGV'
                        }
                    }
                ]
            },
            {
                icon: 'i-lucide-fuel',
                title: 'Fuel',
                data: [
                    {
                        title: 'Burned per second',
                        value: useFormat().number(totalFuelPerSecond.value, 2, 2),
                        unit: 'L/s'
                    },
                    {
                        title: 'Burned so far',
                        value: useFormat().number(totalFuelBurned.value, 2, 2),
                        unit: 'L'
                    }
                ]
            },
            {
                icon: 'i-lucide-cloud-fog',
                title: 'CO₂',
                data: [
                    {
                        title: 'Produced per second',
                        value: useFormat().number(co2perSec, 2, 2),
                        unit: 'kg CO₂/s',
                        tgvEquivalent: {
                            title: 'TGV equivalent',
                            value: co2perSec / 0.15,
                            unit: 'TGV'
                        }
                    },
                    {
                        title: 'Produced so far',
                        value: useFormat().number(co2produced, 2, 2),
                        unit: 'kg CO₂'
                    },
                    {
                        title: 'Trees needed to offset',
                        value: useFormat().number(CO2_PER_TREE_PER_YEAR * co2produced, 0, 0)
                    },
                    {
                        title: 'Equivalent car emissions',
                        value: useFormat().number(co2produced / CO2_PER_CAR_PER_YEAR, 2, 2),
                        unit: 'car-years'
                    }
                ]
            }
        ];
    });

    function update() {
        const now = Date.now();
        const delta = (now - lastUpdateTime.value) / 1000;
        lastUpdateTime.value = now;

        timeElapsed.value += delta;
        totalFuelBurned.value += totalFuelPerSecond.value * delta;
        totalFuelBurnedEasterEgg.value += totalFuelPerSecondEasterEgg.value * delta;
    }

    function startStatsTimer() {
        fuelTimer = setInterval(update, REFRESH_RATE);
    }

    function stopStatsTimer() {
        if (fuelTimer) {
            clearInterval(fuelTimer);
            fuelTimer = null;
        }
    }

    function addPlane(plane) {
        activePlanes.value.push(plane);
    }

    function reset() {
        activePlanes.value = [];
        totalFuelBurned.value = 0;
        timeElapsed.value = 0;
        lastUpdateTime.value = Date.now();
    }

    return {
        // State
        timeElapsed,
        activePlanes,
        totalFuelBurned,
        totalFuelBurnedEasterEgg,

        // Computed
        totalNbPlanes,
        totalNbSeats,
        totalFuelPerSecond,
        totalFuelPerSecondEasterEgg,
        displayedData,
        displayedDataEasterEgg,

        // Methods
        startStatsTimer,
        stopStatsTimer,
        addPlane,
        reset
    };
});
