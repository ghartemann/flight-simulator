<template>
    <div class="w-full min-h-screen flex flex-col justify-center items-center overflow-hidden relative pb-16"
         ref="containerEl"
         @click="onContainerClick"
    >
        <UCard
            variant="soft"
            class="z-50 w-1/2 backdrop-blur-md rounded-xl p-4"
            @click.stop
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
                    :disabled="!selectedPlane"
                >
                    Take off
                </UButton>

                <UButton
                    size="xl"
                    variant="subtle"
                    class="rounded-full"
                    @click="addAllPlanes"
                    icon="i-lucide-sparkles"
                >
                    Match with the real world
                </UButton>
            </div>

            <UCard variant="outline">
                <TableData :data="displayedData"></TableData>
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
            @click.stop
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: `translate(-50%, -50%) rotate(${fp.angle}deg)`
            }"
            @pointerdown="onPointerDown($event, fp)"
            @pointerup="onPointerUp($event, fp)"
            @pointercancel="onPointerCancel($event)"
            @mouseenter="onMouseEnter(fp)"
            @mouseleave="onMouseLeave(fp)"
        >
            <LucidePlaneIcon></LucidePlaneIcon>
        </div>

        <PlaneTooltip
            v-if="hoveredPlane || clickedPlane"
            :hovered-plane="hoveredPlane || clickedPlane"
        ></PlaneTooltip>

        <CreatedBy class="absolute bottom-0"></CreatedBy>
    </div>
</template>

<script setup>
import { usePlanes } from '~/composables/usePlanes.js';
import planesData from '~/constants/planesData.js';
import CardPlane from '~/pages/components/CardPlane.vue';
import PlaneTooltip from '~/pages/components/PlaneTooltip.vue';
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
const clickedPlane = ref(null);

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

function onMouseEnter(fp) {
    if (clickedPlane.value && clickedPlane.value !== fp) {
        clickedPlane.value = null;
    }

    hoveredPlane.value = fp;
}

function onMouseLeave(fp) {
    if (hoveredPlane.value === fp) {
        hoveredPlane.value = null;
    }
}

function onContainerClick(e) {
    if (e.target === containerEl.value || e.target.closest('svg')) {
        clickedPlane.value = null;
        hoveredPlane.value = null;
    }
}

const globalUpHandlers = new WeakMap();

function onPointerDown(e, fp) {
    try {
        e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {
        // ignore if not supported
    }

    const onGlobalUp = () => {
        if (clickedPlane.value === fp) {
            clickedPlane.value = null;
            hoveredPlane.value = null;
        } else {
            selectedPlane.value = fp;
            clickedPlane.value = fp;
            hoveredPlane.value = fp;
        }
        globalUpHandlers.delete(e.currentTarget);
    };

    globalUpHandlers.set(e.currentTarget, onGlobalUp);
    window.addEventListener('pointerup', onGlobalUp, { once: true });
}

function onPointerUp(e, fp) {
    if (clickedPlane.value === fp) {
        clickedPlane.value = null;
        hoveredPlane.value = null;
    } else {
        selectedPlane.value = fp;
        clickedPlane.value = fp;
        hoveredPlane.value = fp;
    }

    try {
        e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {
    }

    const handler = globalUpHandlers.get(e.currentTarget);
    if (handler) {
        window.removeEventListener('pointerup', handler);
        globalUpHandlers.delete(e.currentTarget);
    }
}

function onPointerCancel(e) {
    const handler = globalUpHandlers.get(e.currentTarget);
    if (handler) {
        window.removeEventListener('pointerup', handler);
        globalUpHandlers.delete(e.currentTarget);
    }
}

watch(selectedPlaneSlug, (newVal) => {
    if (newVal) {
        dropdownShown.value = false;
    }
});
</script>