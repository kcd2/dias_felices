// La portada como un cuarto oscuro: tres escenas sobre el stage compartido (js/stage.js).
// Todo se conduce con el scroll nativo; sin GSAP o con movimiento reducido queda la composición final.

// Primer acto: el título se apaga, sube el papel y la cita se revela palabra a palabra
Scenes.revelado = (root, opts = {}) => {
    const cita = root.querySelector('[data-develop]');

    const trocear = () => {
        if (cita.dataset.troceada) return [...cita.querySelectorAll('[data-palabra]')];
        const texto = cita.textContent.trim();
        const paraLector = document.createElement('span');
        paraLector.className = 'sr-only';
        paraLector.textContent = texto;
        const visibles = document.createElement('span');
        visibles.setAttribute('aria-hidden', 'true');
        texto.split(/\s+/).forEach((palabra, i, todas) => {
            const s = document.createElement('span');
            s.dataset.palabra = '';
            s.textContent = palabra;
            visibles.append(s, i < todas.length - 1 ? ' ' : '');
        });
        cita.replaceChildren(paraLector, visibles);
        cita.dataset.troceada = '1';
        return [...visibles.querySelectorAll('[data-palabra]')];
    };

    return Stage.scene(root, {
        hold: opts.hold ?? 2,
        build(tl, { q, phone }) {
            const palabras = trocear();
            const papel = q('.copia')[0];
            const pie = papel.querySelector('figcaption');

            tl.to(q('.hero'), { yPercent: -7, autoAlpha: 0, duration: 0.24 }, 0.03)
                .to(q('.revelado-foto img'), { scale: 1.14, duration: 0.5 }, 0)
                .to(q('.revelado-velo'), { opacity: 0.86, duration: 0.3 }, 0.02)
                .fromTo(papel,
                    { xPercent: -50, yPercent: -50, y: () => innerHeight * 0.95, rotation: phone ? 3 : 5, autoAlpha: 1 },
                    { xPercent: -50, yPercent: -50, y: 0, rotation: phone ? -0.8 : -1.4, ease: 'power2.out', duration: 0.36 }, 0.12)
                .fromTo(q('.copia-tono'), { opacity: 0.92 }, { opacity: 0, duration: 0.36 }, 0.42)
                .fromTo(palabras, { opacity: 0.16 }, { opacity: 1, duration: 0.12, stagger: 0.28 / palabras.length }, 0.44)
                .fromTo(pie, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.08 }, 0.84);
        },
    });
};

// Segundo acto: la cámara viaja entre las copias colgadas; lo único que se mueve es el mundo
Scenes.vuelo = (root, opts = {}) => Stage.scene(root, {
    hold: opts.hold ?? 4,
    build(tl, { q, phone }) {
        const planos = q('.vp');
        const paso = phone ? 720 : 980;
        const recorrido = (planos.length - 1) * paso;
        const anchoX = phone ? 0.3 : 1;

        planos.forEach((plano, i) => {
            gsap.set(plano, {
                xPercent: -50, yPercent: -50,
                x: () => innerWidth * (Number(plano.dataset.x) / 100) * anchoX,
                y: () => innerHeight * (Number(plano.dataset.y) / 100),
                z: -i * paso,
                rotation: i % 2 ? -1.6 : 1.2,
            });
            // Cuando la cámara llega a su profundidad, cada plano ha estado visible y se aparta a tiempo
            const llega = (i * paso) / recorrido;
            const margen = paso / recorrido;
            if (i === planos.length - 1) {
                // El último plano lleva un enlace: sigue en el orden de tabulación aunque aún no se vea
                gsap.set(plano, { pointerEvents: 'none' });
                tl.fromTo(plano, { opacity: 0 }, { opacity: 1, duration: margen * 0.9 }, llega - margen * 2);
                tl.set(plano, { pointerEvents: 'auto' }, llega - margen * 0.4);
                return;
            }
            if (i > 0) tl.fromTo(plano, { autoAlpha: 0 }, { autoAlpha: 1, duration: margen * 0.9 }, Math.max(0, llega - margen * 2));
            tl.to(plano, { autoAlpha: 0, duration: margen * 0.34 }, llega + margen * 0.12);
        });

        tl.fromTo(q('.vuelo-mundo'), { z: 0 }, { z: recorrido, duration: 1 }, 0)
            .fromTo(q('.vuelo-fondo'), { scale: 1 }, { scale: 1.18, duration: 1 }, 0);
    },
});

// Tercer acto: la ventana se abre hasta llenar la pantalla de color
Scenes.ventana = (root, opts = {}) => Stage.scene(root, {
    hold: opts.hold ?? 1,
    build(tl, { q, phone }) {
        const inicio = phone ? 'inset(24% 8% 24% 8%)' : 'inset(20% 28% 20% 28%)';
        tl.fromTo(q('.ventana-campo'), { clipPath: inicio }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.72 }, 0)
            .fromTo(q('.muro-wall'), { y: '4%' }, { y: '-2%', duration: 1 }, 0)
            .fromTo(q('.note'), { y: 40, rotation: -7, autoAlpha: 0 }, { y: 0, rotation: -2, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0.5);
    },
});

(() => {
    Stage.smooth();
    Stage.init();

    // El teclado nunca debe quedarse en algo tapado: la escena se coloca donde su enlace se ve entero
    document.querySelectorAll('.vuelo, .ventana').forEach((escena) => {
        escena.addEventListener('focusin', (e) => {
            if (!escena.classList.contains('is-live') || !e.target.matches(':focus-visible')) return;
            const fin = escena.getBoundingClientRect().bottom + scrollY - innerHeight;
            if (Stage.lenis) Stage.lenis.scrollTo(fin, { immediate: true, force: true });
            else scrollTo({ top: fin, behavior: 'instant' });
        });
    });

    // Con sesión, las copias de texto muestran lo último del muro; sin ella, se quedan los apodos
    const copias = document.querySelectorAll('[data-post]');
    const conMuro = async () => {
        if (!copias.length || typeof supabaseClient === 'undefined') return;
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;
        const { data: posts, error } = await supabaseClient
            .from('blog')
            .select('contenido, amigos ( nombre_real )')
            .order('created_at', { ascending: false })
            .limit(copias.length);
        if (error || !posts) return;
        posts.filter((post) => post.contenido).forEach((post, i) => {
            const copia = copias[i];
            copia.classList.add('es-post');
            copia.querySelector('.vp-cuerpo').textContent = post.contenido;
            copia.querySelector('.vp-pie').textContent = post.amigos?.nombre_real || 'Alguien de la muchachada';
        });
    };
    conMuro().catch((error) => console.error(error));
})();
