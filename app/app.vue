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
const meta = {
    title: 'Flight Simulator',
    description: 'It\'s just a template.'
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
</script>