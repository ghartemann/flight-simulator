<template>
    <UCard>
        <div class="flex items-center justify-between">
            <div>
                <div>
                    {{ plane.model }}
                </div>

                <div class="italic text-neutral-400">
                    {{ plane.firstFlight }}
                </div>
            </div>

            <UButton @click="addPlane">Add</UButton>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps({
    plane: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['add-plane']);

function addPlane() {
    emit('add-plane');
}
</script>

<style scoped>

</style>