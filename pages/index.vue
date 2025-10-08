<template>
    <div class="w-full min-h-screen flex flex-col justify-center items-center overflow-hidden relative pb-16" ref="containerEl">
        <UCard variant="soft"
               class="z-50 w-1/2 backdrop-blur-md rounded-xl p-4"
        >
            <!-- Selected card -->
            <CardPlane
                v-if="selectedPlane"
                @click="changePlane"
                :plane="selectedPlane"
                edit-icon
                class="w-full cursor-pointer"
            ></CardPlane>

            <!-- Dropdown -->
            <USelect
                v-if="dropdownShown"
                v-model="selectedPlaneSlug"
                :items="planes"
                value-key="slug"
                class="w-full mt-2"
                placeholder="Select Plane"
            >
                <template #item="{ item }">
                    <CardPlane :plane="item" class="w-full" />
                </template>
            </USelect>

            <div class="flex justify-center my-4 gap-4">
                <UButton
                    size="xl"
                    class="rounded-full"
                    @click="addPlane"
                    icon="i-lucide-plane-takeoff"
                >
                    Take off
                </UButton>

                <UButton
                    size="xl"
                    class="rounded-full"
                    @click="addAllPlanes"
                    icon="i-lucide-plane-takeoff"
                >
                    Match with the real world
                </UButton>
            </div>

            <UCard variant="outline">
                <TableData :data="displayedData"></TableData>


<!--                <div class="flex flex-col gap-4">-->
<!--                    <BlockData-->
<!--                        v-for="(data, index) in displayedData"-->
<!--                        :key="index"-->
<!--                        :data="data"-->
<!--                    ></BlockData>-->
<!--                </div>-->
            </UCard>
        </UCard>

        <!-- Trails SVG overlay -->
        <svg
            class="absolute inset-0 pointer-events-none"
            :width="containerSize.width"
            :height="containerSize.height"
            :viewBox="`0 0 ${containerSize.width} ${containerSize.height}`"
        >
            <g v-for="fp in flyingPlanes" :key="fp.id">
                <polyline
                    v-if="fp.trail.length > 1"
                    :points="fp.trail.map(p => `${p.x},${p.y}`).join(' ')"
                    stroke="currentColor"
                    class="dark:text-white/40 light:text-gray-900/30"
                    stroke-width="1"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>
        </svg>

        <!-- Plane icons overlay -->
        <div
            v-for="fp in flyingPlanes.filter(p => p.iconVisible)"
            :key="`icon-${fp.id}`"
            class="absolute will-change-transform cursor-pointer"
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: `translate(-50%, -50%) rotate(${fp.angle}deg)`
            }"
            @mouseenter="hoveredPlane = fp"
            @mouseleave="hoveredPlane = null"
        >
            <LucidePlaneIcon></LucidePlaneIcon>
        </div>

        <!-- Flight info tooltip -->
        <div
            v-if="hoveredPlane"
            class="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700 pointer-events-none"
            :style="{
                left: hoveredPlane.x + 30 + 'px',
                top: hoveredPlane.y - 10 + 'px',
                transform: 'translateY(-50%)'
            }"
        >
            <div class="text-sm font-semibold text-blue-300 mb-2">
                {{ hoveredPlane.flightData.flightNumber }}
            </div>
            
            <div class="text-xs font-medium text-gray-300 mb-2">
                {{ hoveredPlane.flightData.brand }} {{ hoveredPlane.flightData.model }}
            </div>

            <div class="text-xs space-y-1">
                <div>
                    <span class="text-gray-400">Route:</span>
                    {{ hoveredPlane.flightData.origin }} → {{ hoveredPlane.flightData.destination }}
                </div>

                <div>
                    <span class="text-gray-400">Flight time:</span>
                    {{ hoveredPlane.flightData.flightTime }}
                </div>

                <div>
                    <span class="text-gray-400">Altitude:</span>
                    {{ hoveredPlane.flightData.altitude.toLocaleString() }} ft.
                </div>

                <div>
                    <span class="text-gray-400">Speed:</span>
                    {{ hoveredPlane.flightData.speed }} km/h
                </div>
                
                <div v-if="hoveredPlane.flightData.plane">
                    <span class="text-gray-400">Seats:</span>
                    {{ hoveredPlane.flightData.plane.seats }}
                </div>
                
                <div v-if="hoveredPlane.flightData.plane">
                    <span class="text-gray-400">Range:</span>
                    {{ hoveredPlane.flightData.plane.sectorKm.toLocaleString() }} km
                </div>
            </div>
        </div>

        <CreatedBy class="absolute bottom-0"></CreatedBy>
    </div>
</template>

<script setup>
import { usePlanes } from '~/composables/usePlanes.js';
import planesData from '~/constants/planesData.js';
import BlockData from '~/pages/components/BlockData.vue';
import CardPlane from '~/pages/components/CardPlane.vue';
import LucidePlaneIcon from '~/pages/components/svg/LucidePlaneIcon.vue';
import TableData from '~/pages/components/TableData.vue';

const REFRESH_RATE = 50;
const MAX_VISUAL_PLANES = 200;
const REAL_WORLD_PLANES_IN_THE_SKY = 14000;

const CO2_PRODUCED_2023 = 882000000000; // in kg

const meta = {
    title: 'Flight Simulator',
    description: 'It\'s just a template.'
    // image: 'https://trickledown.ghartemann.fr/3d-money.jpg',
    // url: 'https://trickledown.ghartemann.fr/'
};

useSeoMeta({
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogImage: meta.image,
    ogUrl: meta.url,
    twitterTitle: meta.title,
    twitterDescription: meta.description,
    twitterImage: meta.image,
    twitterCard: 'summary'
});

useHead({
    link: [
        { rel: 'canonical', href: meta.url }
    ]
});

const {
    containerEl,
    containerSize,
    flyingPlanes,
    spawnFlyingPlane,
    startAnimation,
    updateContainerSize,
    cleanup
} = usePlanes();

const timeElapsed = ref(0);
const lastUpdateTime = ref(Date.now());

const dropdownShown = ref(true);

const planes = ref([]);

const selectedPlaneSlug = ref(null);
const selectedPlane = computed(() => {
    if (!selectedPlaneSlug.value) {
        return null;
    }

    return planes.value.find((p) => p.slug === selectedPlaneSlug.value);
});

const activePlanes = ref([]);
const totalFuelBurned = ref(0);
const hoveredPlane = ref(null);

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

const loading = computed(() => planes.value.length === 0);

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
                        // 1.702kg/km×0.0889km/s=0.151kg/s
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

let fuelTimer = null;

function update() {
    const now = Date.now();
    const delta = (now - lastUpdateTime.value) / 1000;
    lastUpdateTime.value = now;

    timeElapsed.value += delta;

    totalFuelBurned.value += totalFuelPerSecond.value * delta;
}

onMounted(() => {
    initPlanes();
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    startAnimation();

    fuelTimer = setInterval(update, REFRESH_RATE);
});

onBeforeUnmount(() => {
    cleanup();
    window.removeEventListener('resize', updateContainerSize);

    if (fuelTimer) {
        clearInterval(fuelTimer);
    }
});

function initPlanes() {
    loading.value = true;

    const p = [];

    planesData.forEach((item) => {
        p.push(item);
    });

    planes.value = p;
    loading.value = false;
}

function addPlane() {
    if (!selectedPlaneSlug.value) {
        return;
    }

    activePlanes.value.push(selectedPlane.value);

    if (activePlanes.value.length <= MAX_VISUAL_PLANES) {
        spawnFlyingPlane(selectedPlane.value);
    }
}

function addAllPlanes() {
    while (activePlanes.value.length < REAL_WORLD_PLANES_IN_THE_SKY) {
        addPlane();
    }
}

function changePlane() {
    selectedPlaneSlug.value = null;
    dropdownShown.value = true;
}

watch(selectedPlaneSlug, (newVal) => {
    if (newVal) {
        dropdownShown.value = false;
    }
});
</script>

<style scoped>

</style>