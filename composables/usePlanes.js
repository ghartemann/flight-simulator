import { reactive, ref } from 'vue';

export function usePlanes() {
    const containerEl = ref(null);
    const containerSize = reactive({ width: 0, height: 0 });

    const flyingPlanes = ref([]);

    let nextFlyingPlaneId = 1;
    const animationFrameId = ref(null);

    function updateContainerSize() {
        if (!containerEl.value) {
            return;
        }

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

        const headingDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
        const angleDeg = headingDeg + 45; // match icon orientation per current UI

        const id = nextFlyingPlaneId++;

        flyingPlanes.value.push({
            id,
            x,
            y,
            vx,
            vy,
            angle: angleDeg,
            trail: [{ x, y }],
            iconVisible: true,
            frozen: false
        });
    }

    function startAnimation() {
        let lastFrameTime = performance.now();

        function animate(currentTime) {
            const deltaMs = currentTime - lastFrameTime;
            const deltaSeconds = Math.min(0.05, deltaMs / 1000);
            lastFrameTime = currentTime;

            if (flyingPlanes.value.length > 0) {
                const width = containerSize.width;
                const height = containerSize.height;
                const margin = 24;

                flyingPlanes.value.forEach(fp => {
                    if (fp.frozen) {
                        return;
                    }

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

    function cleanup() {
        if (animationFrameId.value) {
            cancelAnimationFrame(animationFrameId.value);
        }

        animationFrameId.value = null;
        window.removeEventListener('resize', updateContainerSize);
    }

    return {
        containerEl,
        containerSize,
        flyingPlanes,
        spawnFlyingPlane,
        startAnimation,
        updateContainerSize,
        cleanup,
    };
}
