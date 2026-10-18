/* autonoME — decide, antes da primeira pintura, se a abertura será exibida.
   Uma vez por sessão; ?intro força a exibição. Movimento reduzido: sem abertura. */
(() => {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let seen = false;
  try { seen = sessionStorage.getItem('autonome-intro') === '1'; } catch (e) { /* armazenamento bloqueado */ }
  if (seen && !/[?&]intro\b/.test(location.search)) return;
  root.classList.add('js-intro', 'intro-playing');
})();
