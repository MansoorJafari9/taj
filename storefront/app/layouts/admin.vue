<template>
  <div class="min-h-screen bg-cream text-charcoal">
    <header class="border-b border-border bg-off-white px-6 py-4">
      <h1 class="font-semibold text-brown">{{ $t('admin.title') }}</h1>
    </header>
    <div class="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[15rem_1fr]">
      <aside class="border-b border-border p-5 md:min-h-[calc(100vh-57px)] md:border-b-0 md:border-e">
        <slot name="navigation" />
      </aside>
      <main class="p-5 sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
