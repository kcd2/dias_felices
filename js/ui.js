// Detalles de interfaz compartidos: cerrar menús con teclado y, en la portada, la pila de carteles
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const abierto = document.querySelector('.nav-dropdown-content.show-gestion, .dropdown-content-custom.show');
    if (!abierto) return;
    const toggle = abierto.parentElement.querySelector('[aria-expanded]');
    abierto.classList.remove('show-gestion', 'show');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
});

(() => {
    const carteles = [...document.querySelectorAll('.poster')];
    if (!carteles.length) return;

    const raiz = document.documentElement;
    const reducido = matchMedia('(prefers-reduced-motion: reduce)');
    if (reducido.matches) return;

    // Un cartel más alto que la pantalla se deja leer hasta abajo antes de quedarse pegado
    const pila = () => {
        const arriba = parseFloat(getComputedStyle(raiz).getPropertyValue('--stick-top')) || 0;
        carteles.forEach((cartel) => {
            cartel.style.setProperty('--stick', `${Math.min(arriba, innerHeight - cartel.offsetHeight)}px`);
        });
    };
    raiz.classList.add('stack');
    pila();
    addEventListener('resize', pila);
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(pila);
        carteles.forEach((cartel) => ro.observe(cartel));
    }

    // Al tabular hacia atrás, el foco puede caer en un cartel ya tapado: se vuelve a su sitio
    document.addEventListener('focusin', (e) => {
        if (!e.target.matches(':focus-visible')) return;
        const cartel = e.target.closest('.poster');
        if (!cartel || !cartel.parentElement.matches('.wall')) return;
        const siguiente = cartel.nextElementSibling;
        if (!siguiente || siguiente.getBoundingClientRect().top >= e.target.getBoundingClientRect().bottom) return;
        let y = cartel.parentElement.offsetTop;
        for (let c = cartel.previousElementSibling; c; c = c.previousElementSibling) y += c.offsetHeight;
        scrollTo({ top: y, behavior: 'instant' });
    });

    // La cita se tiñe palabra a palabra
    if (CSS.supports('animation-timeline: view()')) {
        document.querySelectorAll('[data-fill]').forEach((el) => {
            const palabras = el.textContent.trim().split(/\s+/);
            el.setAttribute('aria-label', el.textContent.trim());
            el.textContent = '';
            palabras.forEach((palabra, i) => {
                const s = document.createElement('span');
                s.setAttribute('aria-hidden', 'true');
                s.style.setProperty('--i', i);
                s.textContent = palabra;
                el.append(s, i < palabras.length - 1 ? ' ' : '');
            });
            el.classList.add('is-filling');
        });
    }

    // Entradas de cada capítulo, una sola vez
    if (!('IntersectionObserver' in window)) return;
    const piezas = document.querySelectorAll('[data-reveal], [data-mask]');
    raiz.classList.add('motion');
    const io = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add('is-in');
            io.unobserve(entrada.target);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    piezas.forEach((pieza) => io.observe(pieza));
})();
