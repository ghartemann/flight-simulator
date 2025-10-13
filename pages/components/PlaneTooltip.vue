<template>
    <div
        class="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700 pointer-events-none"
        :style="
        {
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
                <span class="text-gray-400">
                    Route:
                </span>

                {{ hoveredPlane.flightData.origin }} → {{ hoveredPlane.flightData.destination }}
            </div>

            <div>
                <span class="text-gray-400">
                    ETA:
                </span>

                {{ hoveredPlane.flightData.flightTime }}
            </div>

            <div>
                <span class="text-gray-400">
                    Altitude:
                </span>

                {{ hoveredPlane.flightData.altitude.toLocaleString() }} ft.
            </div>

            <div>
                <span class="text-gray-400">
                    Speed:
                </span>

                {{ hoveredPlane.flightData.speed }} km/h
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    hoveredPlane: {
        type: Object,
        required: true
    }
});
</script>