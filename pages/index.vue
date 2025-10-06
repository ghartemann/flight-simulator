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

            <div class="flex justify-center my-4">
                <UButton
                    size="xl"
                    class="rounded-full"
                    @click="addPlane"
                    icon="i-lucide-plane-takeoff"
                >
                    Take off
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
                            <td>
                                Fuel burned per second
                            </td>

                            <td>
                                {{ totalFuelPerSecond }} L/s
                            </td>
                        </tr>

                        <tr>
                            <td class="pt-4">
                                Fuel burned so far
                            </td>

                            <td class="pt-4">
                                {{ 0 }} L
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

const rate = ref(10);
const timeElapsed = ref(0); // in seconds
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

const loading = computed(() => planes.value.length === 0);

const totalFuelPerSecond = computed(() => {
    const total = activePlanes.value.map(ap => ap.litersPerSecond);

    if (total.length === 0) {
        return 0;
    }

    return total.reduce((a, b) => a + b);
});

onMounted(() => {
    initPlanes();
    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    startAnimation();
});

onBeforeUnmount(() => {
    cleanup();
    window.removeEventListener('resize', updateContainerSize);
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

    spawnFlyingPlane();
    activePlanes.value.push(selectedPlane.value);
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