import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { allLessons } from "../data/course";
import { emptyProgress, loadProgress, saveProgress, type ProjectMode } from "../lib/storage";

export const useProgressStore = defineStore("progress", () => {
  const initial = loadProgress();
  const completed = ref<string[]>(initial.completed);
  const checks = ref<Record<string, boolean>>(initial.checks);
  const lastLessonId = ref<string | null>(initial.lastLessonId);
  const projectMode = ref<ProjectMode>(initial.projectMode);

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
  function reset() {
    const e = emptyProgress();
    completed.value = e.completed;
    checks.value = e.checks;
    lastLessonId.value = e.lastLessonId;
    projectMode.value = e.projectMode;
  }

  watch(
    [completed, checks, lastLessonId, projectMode],
    () =>
      saveProgress({
        completed: completed.value,
        checks: checks.value,
        lastLessonId: lastLessonId.value,
        projectMode: projectMode.value,
      }),
    { deep: true },
  );

  return {
    completed,
    checks,
    lastLessonId,
    projectMode,
    completedCount,
    percent,
    allDone,
    isCompleted,
    setCompleted,
    visit,
    isChecked,
    setChecked,
    setProjectMode,
    reset,
  };
});
