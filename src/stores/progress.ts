import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { allLessons } from "../data/course";
import { emptyProgress, loadProgress, saveProgress, type ProjectMode } from "../lib/storage";

export const useProgressStore = defineStore("progress", () => {
  const initial = loadProgress();
  const completed = ref<string[]>(initial.completed);
  const checks = ref<Record<string, boolean>>(initial.checks);
  const lastLessonId = ref<string | null>(initial.lastLessonId);
  const projectMode = ref<ProjectMode>(initial.projectMode);
  const githubRepo = ref<string | null>(initial.githubRepo);
  const slideMode = ref(initial.slideMode);

  const completedCount = computed(
    () => allLessons.filter((l) => completed.value.includes(l.id)).length,
  );
  const percent = computed(() => Math.round((completedCount.value / allLessons.length) * 100));
  const allDone = computed(() => completedCount.value === allLessons.length);

  function isCompleted(id: string) {
    return completed.value.includes(id);
  }
  function setCompleted(id: string, done: boolean) {
    const others = completed.value.filter((x) => x !== id);
    completed.value = done ? [...others, id] : others;
  }
  function visit(id: string) {
    lastLessonId.value = id;
  }
  function isChecked(key: string) {
    return checks.value[key] === true;
  }
  function setChecked(key: string, value: boolean) {
    checks.value = { ...checks.value, [key]: value };
  }
  function setProjectMode(mode: ProjectMode) {
    projectMode.value = mode;
  }
  function setGithubRepo(repo: string | null) {
    githubRepo.value = repo;
  }
  function setSlideMode(on: boolean) {
    slideMode.value = on;
  }
  function reset() {
    const e = emptyProgress();
    completed.value = e.completed;
    checks.value = e.checks;
    lastLessonId.value = e.lastLessonId;
    projectMode.value = e.projectMode;
    githubRepo.value = e.githubRepo;
  }

  watch(
    [completed, checks, lastLessonId, projectMode, githubRepo, slideMode],
    () =>
      saveProgress({
        completed: completed.value,
        checks: checks.value,
        lastLessonId: lastLessonId.value,
        projectMode: projectMode.value,
        githubRepo: githubRepo.value,
        slideMode: slideMode.value,
      }),
    { deep: true },
  );

  return {
    completed,
    checks,
    lastLessonId,
    projectMode,
    githubRepo,
    slideMode,
    completedCount,
    percent,
    allDone,
    isCompleted,
    setCompleted,
    visit,
    isChecked,
    setChecked,
    setProjectMode,
    setGithubRepo,
    setSlideMode,
    reset,
  };
});

// 開発中にストアを書き換えても、開いているページのストアを差し替える
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProgressStore, import.meta.hot));
}
