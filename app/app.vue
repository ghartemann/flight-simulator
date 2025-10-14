<template>
    <UApp class="relative">
        <UColorModeButton class="absolute top-4 right-4">
            <template #fallback>
                <UButton loading variant="ghost" color="neutral" />
            </template>
        </UColorModeButton>

        <NuxtPage></NuxtPage>
    </UApp>
</template>

<script setup>

</script>