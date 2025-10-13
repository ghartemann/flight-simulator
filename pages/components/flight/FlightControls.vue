<template>
    <div>
        <!-- Selected card -->
        <CardPlane
            v-if="selectedPlane"
            @click="emit('changePlane')"
            :plane="selectedPlane"
            edit-icon
            class="w-full cursor-pointer"
        />

        <!-- Dropdown -->
        <USelect
            v-if="dropdownShown"
            :model-value="modelValue"
            @update:model-value="emit('update:modelValue', $event)"
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
                @click="emit('addPlane')"
                icon="i-lucide-plane-takeoff"
                :disabled="!selectedPlane"
            >
                Take off
            </UButton>

            <UButton
                size="xl"
                variant="subtle"
                class="rounded-full"
                @click="emit('addAllPlanes')"
                icon="i-lucide-sparkles"
            >
                Match with the real world
            </UButton>
        </div>
    </div>
</template>

<script setup>
import CardPlane from '~/pages/components/CardPlane.vue';

defineProps({
    modelValue: {
        type: String,
        default: null
    },
    planes: {
        type: Array,
        required: true
    },
    selectedPlane: {
        type: Object,
        default: null
    },
    dropdownShown: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'addPlane', 'addAllPlanes', 'changePlane']);
</script>