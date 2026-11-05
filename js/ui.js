// Detalles de interfaz compartidos: teclado en menús, avisos, entradas y progreso de lectura
document.documentElement.classList.add('js');


document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const abierto = document.querySelector('.nav-dropdown-content.show-gestion, .dropdown-content-custom.show');
    if (!abierto) return;
    const toggle = abierto.parentElement.querySelector('[aria-expanded]');
    abierto.classList.remove('show-gestion', 'show');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.focus();
});

// Avisos: los alert() de la aplicación se muestran como una copia que sube desde abajo.
// Si la página redirige justo después, el aviso se guarda y sigue en la página siguiente.
(() => {
    const CLAVE = 'df-avisos';
    const DURACION = 5200;
    const leer = () => {
        try { return JSON.parse(sessionStorage.getItem(CLAVE)) || []; } catch { return []; }
    };
    const guardar = (lista) => {
        try { sessionStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento, el aviso solo vive aquí */ }
    };

    let zona;
    const obtenerZona = () => {
        if (zona) return zona;
        zona = document.createElement('div');
        zona.className = 'avisos';
        zona.setAttribute('role', 'status');
        zona.setAttribute('aria-live', 'polite');
        document.body.append(zona);
        return zona;
    };

    const pintar = (aviso) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'aviso';
        el.textContent = aviso.texto;
        el.setAttribute('aria-label', `${aviso.texto} Pulsa para cerrar este aviso.`);
        const quitar = () => {
            clearTimeout(reloj);
            guardar(leer().filter((a) => a.id !== aviso.id));
            el.classList.remove('is-in');
            setTimeout(() => el.remove(), 220);
        };
        const restante = Math.max(1500, DURACION - (Date.now() - aviso.momento));
        const reloj = setTimeout(quitar, restante);
        el.addEventListener('click', quitar);
        obtenerZona().append(el);
        el.getBoundingClientRect();
        el.classList.add('is-in');
    };

    window.alert = (mensaje) => {
        const aviso = { id: `${Date.now()}-${Math.random()}`, texto: String(mensaje), momento: Date.now() };
        guardar([...leer(), aviso]);
        if (document.body) pintar(aviso);
    };

    const pendientes = leer().filter((a) => Date.now() - a.momento < DURACION);
    guardar(pendientes);
    pendientes.forEach(pintar);
})();

// Encuestas: la opción pulsada se queda marcada, con la misma respuesta inmediata que el aviso
document.addEventListener('click', (e) => {
    const opcion = e.target.closest?.('.btn-option');
    if (!opcion) return;
    opcion.parentElement.querySelectorAll('.btn-option').forEach((b) => b.classList.toggle('is-elegida', b === opcion));
});

// Barra de progreso de lectura en las páginas largas
(() => {
    const barra = document.createElement('div');
    barra.className = 'progreso';
    barra.setAttribute('aria-hidden', 'true');
    document.body.append(barra);
    const soportaCSS = CSS.supports('animation-timeline: scroll()');
    const raiz = document.documentElement;
    let pendiente = false;
    const medir = () => {
        pendiente = false;
        const recorrido = raiz.scrollHeight - innerHeight;
        barra.classList.toggle('is-on', recorrido > innerHeight * 0.75);
        if (!soportaCSS && recorrido > 0) barra.style.transform = `scaleX(${Math.min(1, scrollY / recorrido)})`;
    };
    const pedir = () => {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(medir);
    };
    addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    if ('ResizeObserver' in window) new ResizeObserver(pedir).observe(document.body);
    pedir();
})();

// La tinta de la navegación sigue al capítulo que tiene debajo
(() => {
    const capitulos = document.querySelectorAll('[data-ink]');
    if (!capitulos.length || !('IntersectionObserver' in window)) return;
    const contenedor = document.getElementById('menu-container');
    const activos = new Set();
    const io = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => (e.isIntersecting ? activos.add(e.target) : activos.delete(e.target)));
        const actual = [...activos][0];
        if (actual) contenedor.dataset.ink = actual.dataset.ink;
        else delete contenedor.dataset.ink;
    }, { rootMargin: '0px 0px -94% 0px' });
    capitulos.forEach((c) => io.observe(c));
})();

// Entradas: una sola vez, nunca con el contenido oculto si el script falla
(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const raiz = document.documentElement;
    raiz.classList.add('motion');

    const aparece = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add('is-in');
            aparece.unobserve(entrada.target);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    document.querySelectorAll('[data-reveal], [data-mask]').forEach((pieza) => aparece.observe(pieza));

    // Lo que llega de Supabase se revela como una copia al entrar en pantalla.
    // Al recargar el muro tras publicar, solo se revela lo que no se había visto.
    const REVELABLE = '.post-card, .ranking-item, .poll-card, .stat-item';
    const vistos = new Set();
    const revela = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add('is-revelada');
            revela.unobserve(entrada.target);
        });
    }, { rootMargin: '0px 0px -6% 0px' });
    const preparar = (el) => {
        const huella = el.textContent.trim();
        if (vistos.has(huella)) return;
        vistos.add(huella);
        el.classList.add('por-revelar');
        const orden = [...el.parentElement.children].indexOf(el) % 4;
        el.style.setProperty('--orden', orden);
        revela.observe(el);
    };
    const buscar = (nodo) => {
        if (nodo.nodeType !== 1) return;
        if (nodo.matches(REVELABLE)) preparar(nodo);
        nodo.querySelectorAll(REVELABLE).forEach(preparar);
    };
    document.querySelectorAll(REVELABLE).forEach(preparar);
    new MutationObserver((cambios) => {
        cambios.forEach((c) => c.addedNodes.forEach(buscar));
    }).observe(document.body, { childList: true, subtree: true });
})();
