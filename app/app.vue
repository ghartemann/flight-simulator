<template>
    <UApp class="relative">
        <div class="absolute top-4 right-4 z-999">
            <UColorModeButton>
                <template #fallback>
                    <UButton loading variant="ghost" color="neutral" />
                </template>
            </UColorModeButton>
        </div>

        <NuxtPage></NuxtPage>
    </UApp>
</template>

<script setup>

</script>