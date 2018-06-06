<template>
  <div class="Layout">
    <TopNavigationBar />
  </div>
</template>

<script>
import TopNavigationBar from '../TopNavigationBar/TopNavigationBar.vue';

module.exports = {
  data: () => {
    return {
      title: "Hello World"
    };
  },
  components: {
    TopNavigationBar
  }
};
</script>