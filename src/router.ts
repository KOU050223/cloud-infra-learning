import { createRouter, createWebHistory } from "vue-router";
import { findLesson } from "./data/course";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: () => import("./views/HomeView.vue") },
    {
      path: "/lessons/:id",
      name: "lesson",
      component: () => import("./views/LessonView.vue"),
      beforeEnter: (to) => (findLesson(String(to.params.id)) ? true : { name: "home" }),
    },
    { path: "/glossary", name: "glossary", component: () => import("./views/GlossaryView.vue") },
    { path: "/complete", name: "complete", component: () => import("./views/CompleteView.vue") },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
