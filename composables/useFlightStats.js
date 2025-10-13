import { ref, computed } from 'vue';

const REFRESH_RATE = 50;
const CO2_PRODUCED_2023 = 882000000000; // in kg

export function useFlightStats() {
    const timeElapsed = ref(0);
    const lastUpdateTime = ref(Date.now());
    const activePlanes = ref([]);
    const totalFuelBurned = ref(0);

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

    const displayedData = computed(() => {
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
                        value: useFormat().number(totalFuelPerSecond.value * 2.5, 2, 2),
                        unit: 'kg CO₂/s',
                        tgvEquivalent: {
                            title: 'TGV equivalent',
                            value: (totalFuelPerSecond.value * 2.5) / 0.15,
                            unit: 'TGV'
                        }
                    },
                    {
                        title: 'Produced so far',
                        value: useFormat().number(totalFuelBurned.value * 2.5, 2, 2),
                        unit: 'kg CO₂'
                    },
                    {
                        title: 'Remaining to reach 2023 annual total',
                        value: useFormat().number(CO2_PRODUCED_2023 - (totalFuelBurned.value * 2.5), 2, 2),
                        unit: 'kg CO₂'
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

        // Computed
        totalNbPlanes,
        totalNbSeats,
        totalFuelPerSecond,
        displayedData,

        // Methods
        startStatsTimer,
        stopStatsTimer,
        addPlane,
        reset
    };
}