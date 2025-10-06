<template>
    <div class="w-full min-h-screen flex flex-col justify-center items-center overflow-hidden relative pb-16" ref="containerEl">
        <UCard variant="soft"
               class="z-50 w-1/3 backdrop-blur-md rounded-xl p-4"
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
                <table class="w-full">
                    <tbody>
                        <tr>
                            <td>
                                Nb. of planes
                            </td>

                            <td>
                                {{ activePlanes.length }}
                            </td>
                        </tr>

                        <tr>
                            <td class="pt-4">
                                Fuel burned per second
                            </td>

                            <td class="pt-4">
                                {{ useFormat().number(totalFuelPerSecond, 2, 2) }} L/s
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Fuel burned so far
                            </td>

                            <td>
                                {{ useFormat().number(totalFuelBurned, 2, 2) }} L
                            </td>
                        </tr>

                        <tr>
                            <td class="pt-4">
                                CO2 produced per second
                            </td>

                            <td class="pt-4">
                                {{ useFormat().number((totalFuelPerSecond * 2.5), 2, 2) }} kg CO₂/s
                            </td>
                        </tr>

                        <tr>
                            <td>
                                CO2 produced so far
                            </td>

                            <td>
                                {{ useFormat().number((totalFuelBurned * 2.5), 2, 2) }} kg CO₂
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Quantity remaining until the annual levels (2023)
                            </td>

                            <td>
                                {{ useFormat().number((CO2_PRODUCED_2023 - (totalFuelBurned * 2.5)), 2, 2) }} kg CO₂
                            </td>
                        </tr>
                    </tbody>
                </table>
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
                    class="text-white/50"
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
            class="absolute will-change-transform"
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: `translate(-50%, -50%) rotate(${fp.angle}deg)`
            }"
        >
            <LucidePlaneIcon></LucidePlaneIcon>
        </div>

        <CreatedBy class="absolute bottom-0"></CreatedBy>
    </div>
</template>

<script setup>
import { usePlanes } from '~/composables/usePlanes.js';
import planesData from '~/constants/planesData.js';
import CardPlane from '~/pages/components/CardPlane.vue';
import LucidePlaneIcon from '~/pages/components/svg/LucidePlaneIcon.vue';

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

const loading = computed(() => planes.value.length === 0);

const totalFuelPerSecond = computed(() => {
    const total = activePlanes.value.map(ap => ap.litersPerSecond);

    if (total.length === 0) {
        return 0;
    }

    return total.reduce((a, b) => a + b);
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
        spawnFlyingPlane();
    }
}

function addAllPlanes() {
    while(activePlanes.value.length < REAL_WORLD_PLANES_IN_THE_SKY) {
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