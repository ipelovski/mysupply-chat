import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar } from "quasar";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";
import "quasar/src/css/index.sass";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: {},
});

app.mount("#app");
