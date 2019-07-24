<template>
    <div id="app_main">
        <layout />
    </div>
</template>

<script>
import layout from '@/layout/layout'
export default {
    name: 'home',
    data() {
        return {

        }
    },
    components: {
        layout,
    }
}
</script>

<style lang="scss">
#app_main {
    height: 100%;
}
</style>



