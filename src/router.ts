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
  scrollBehavior: (to) => {
    if (!to.hash) return { top: 0 };
    // レッスン本文は遅れて読み込まれるので、見出しが現れるのを少し待ってから移動する
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(document.querySelector(to.hash) ? { el: to.hash, top: 96 } : { top: 0 });
      }, 300);
    });
  },
});
