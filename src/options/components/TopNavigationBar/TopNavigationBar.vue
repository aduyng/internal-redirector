<template>
  <div class="TopNavigationBar">
    <header class="mdc-top-app-bar">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
          <a href="#" class="material-icons mdc-top-app-bar__navigation-icon">menu</a>
          <span class="mdc-top-app-bar__title">{{title}}</span>
        </section>
      </div>
    </header>
  </div>
</template>

<script>
import { MDCTopAppBar } from "@material/top-app-bar/index";
import "@material/top-app-bar/mdc-top-app-bar.scss";

export default {
  data() {
    return {
      title: "Hello World"
    };
  },
  mounted() {
    const header = this.$el.querySelector('.mdc-top-app-bar');
    this.topAppBar = new MDCTopAppBar(header);
  }
};
</script>