import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { assignSlides, clampSlide } from "../lib/slides";

const isBreak = (el: Element) => el.tagName === "H2" || el.hasAttribute("data-slide-break");

/**
 * レッスン本文をスライドとして1枚ずつ見せる。
 * 本文の直下の要素に印を付けて、今のスライド以外を隠す（本文の書き方は変えない）。
 * 今のスライド番号は URL の ?s= に持つ。
 */
export function useSlides(container: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
  const route = useRoute();
  const router = useRouter();
  const count = ref(0);
  const index = computed(() => clampSlide(route.query.s ?? 1, count.value));

  function elements(): HTMLElement[] {
    return container.value ? ([...container.value.children] as HTMLElement[]) : [];
  }

  function apply() {
    const els = elements();
    if (!enabled.value) {
      for (const el of els) el.removeAttribute("data-slide-hidden");
      count.value = 0;
      return;
    }
    const { slideOf, count: c } = assignSlides(els.map(isBreak));
    count.value = c;
    const cur = clampSlide(route.query.s ?? 1, c);
    els.forEach((el, i) => {
      if (slideOf[i] === cur) el.removeAttribute("data-slide-hidden");
      else el.setAttribute("data-slide-hidden", "");
    });
  }

  // 非同期で読み込まれるレッスン本文や、v-if の切り替えで要素が入れ替わったら付け直す
  let observer: MutationObserver | null = null;
  watch(
    container,
    (el) => {
      observer?.disconnect();
      if (!el) return;
      observer = new MutationObserver(() => apply());
      observer.observe(el, { childList: true });
      apply();
    },
    { immediate: true },
  );
  watch([enabled, () => route.query.s], () => nextTick(apply));
  onBeforeUnmount(() => observer?.disconnect());

  function go(n: number) {
    if (n < 0 || n >= count.value) return;
    void router.replace({ query: { ...route.query, s: String(n + 1) } });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const next = () => go(index.value + 1);
  const prev = () => go(index.value - 1);

  /** スクロール表示に戻すとき、今のスライドの先頭を表示する */
  function firstElementOfCurrent(): HTMLElement | undefined {
    const els = elements();
    const { slideOf } = assignSlides(els.map(isBreak));
    return els[slideOf.indexOf(index.value)];
  }

  function onKey(e: KeyboardEvent) {
    if (!enabled.value || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("input, textarea, select, [contenteditable], [data-no-slide-keys]")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    }
  }
  onMounted(() => window.addEventListener("keydown", onKey));
  onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

  return { count, index, go, next, prev, firstElementOfCurrent };
}
