<template>
    <div class="w-full min-h-screen flex overflow-hidden relative pb-16" ref="containerEl">
        <div class="w-1/2">
            <!--            <CardPlane-->
            <!--                v-for="(plane, index) in planes"-->
            <!--                :key="index"-->
            <!--                @add-plane="addPlane(plane)"-->
            <!--                :plane="plane"-->
            <!--            ></CardPlane>-->
            <UButton
                @click="addPlane"
            >
                Take off
            </UButton>

            <USelect
                v-model="selectedPlaneSlug"
                :items="planes"
                value-key="slug"
                class="w-full"
            >
                <template v-slot:item="{ item }">
                    <CardPlane
                        :plane="item"
                        class="w-full"
                    ></CardPlane>
                </template>
            </USelect>
        </div>

        <div class="w-1/2">
            nbplanes: {{ activePlanes.length }}<br>
            total: {{ totalFuelPerSecond }}
        </div>

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
            class="absolute will-change-transform -translate-x-1/2 -translate-y-1/2"
            :style="{
                left: fp.x + 'px',
                top: fp.y + 'px',
                transform: `translate(-50%, -50%) rotate(${fp.angle}deg)`
            }"
        >
            <UIcon name="i-lucide-plane" class="text-white" :size="24" />
        </div>

        <CreatedBy class="absolute bottom-0"></CreatedBy>
    </div>
</template>

<script setup>
import planesData from '~/constants/planesData.js';
import CardPlane from '~/pages/components/CardPlane.vue';

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

const rate = ref(10);
const timeElapsed = ref(0); // in seconds
const lastUpdateTime = ref(Date.now());
const animationFrameId = ref(null);

const containerEl = ref(null);
const containerSize = reactive({ width: 0, height: 0 });

const flyingPlanes = ref([]);
let nextFlyingPlaneId = 1;

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
    if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);
    window.removeEventListener('resize', updateContainerSize);
});

function startAnimation() {
    let lastFrameTime = performance.now();

    function animate(currentTime) {
        const deltaMs = currentTime - lastFrameTime;
        const deltaSeconds = Math.min(0.05, deltaMs / 1000); // cap large steps
        lastFrameTime = currentTime;

        // Update flying planes positions and trails
        if (flyingPlanes.value.length > 0) {
            const width = containerSize.width;
            const height = containerSize.height;
            const margin = 24; // allow a small off-screen margin before removal

            flyingPlanes.value.forEach(fp => {
                if (fp.frozen) return;

                fp.x += fp.vx * deltaSeconds;
                fp.y += fp.vy * deltaSeconds;

                const headingDeg = (Math.atan2(fp.vy, fp.vx) * 180) / Math.PI;
                fp.angle = headingDeg + 45;

                fp.trail.push({ x: fp.x, y: fp.y });

                const inBounds = (
                    fp.x >= -margin && fp.x <= width + margin &&
                    fp.y >= -margin && fp.y <= height + margin
                );
                if (!inBounds) {
                    fp.iconVisible = false;
                    fp.frozen = true;
                }
            });
        }

        animationFrameId.value = requestAnimationFrame(animate);
    }

    animationFrameId.value = requestAnimationFrame(animate);
}

function updateContainerSize() {
    if (!containerEl.value) return;
    const rect = containerEl.value.getBoundingClientRect();
    containerSize.width = Math.floor(rect.width);
    containerSize.height = Math.floor(rect.height);
}

function spawnFlyingPlane() {
    const width = containerSize.width || window.innerWidth;
    const height = containerSize.height || window.innerHeight;

    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0, angleRad = 0;

    const rand = (min, max) => Math.random() * (max - min) + min;

    if (edge === 0) { // top
        x = rand(0, width);
        y = 0;
        angleRad = rand(Math.PI / 6, (5 * Math.PI) / 6);
    } else if (edge === 1) { // right
        x = width;
        y = rand(0, height);
        angleRad = rand((5 * Math.PI) / 6, (7 * Math.PI) / 6);
    } else if (edge === 2) { // bottom
        x = rand(0, width);
        y = height;
        angleRad = rand((-5 * Math.PI) / 6, (-1 * Math.PI) / 6);
    } else { // left
        x = 0;
        y = rand(0, height);
        angleRad = rand((-1 * Math.PI) / 6, (1 * Math.PI) / 6);
    }

    const speedPixelsPerSecond = rand(10, 30);
    const vx = Math.cos(angleRad) * speedPixelsPerSecond;
    const vy = Math.sin(angleRad) * speedPixelsPerSecond;

    // Base angle derived from velocity; adjust by +90 to match icon orientation
    const angleDeg = ((Math.atan2(vy, vx) * 180) / Math.PI) + 90;

    const id = nextFlyingPlaneId++;
    flyingPlanes.value.push({ id, x, y, vx, vy, angle: angleDeg, trail: [{ x, y }], iconVisible: true, frozen: false });
}

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
    spawnFlyingPlane();

    if (selectedPlaneSlug.value) {
        activePlanes.value.push(selectedPlane.value);
    }
}
</script>

<style scoped>

</style>
