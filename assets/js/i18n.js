// Textos de la interfaz en los 6 idiomas del sitio.
// El idioma se elige según el navegador; el visitante puede cambiarlo desde el menú.

export const IDIOMAS = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
};

const T = {
  es: {
    proyectos: 'Proyectos', viajes: 'Viajes', trabajos: 'Trabajos', experiencia: 'Experiencia', estudios: 'Estudios', cv: 'Currículum',
    inicio: 'Inicio', contacto: 'Contacto', menu_abrir: 'Abrir menú', menu_cerrar: 'Cerrar menú', idioma: 'Idioma',
    seguir: 'Bajar', mensaje_de: 'Mensaje de',
    proyectos_bajada: 'Lo que voy creando. Los más nuevos primero.',
    viajes_l1: 'Álbum', viajes_l2: 'de viajes', viajes_bajada: 'Ciudades del mundo que conocí. Elegí una para ver sus fotos.',
    trabajos_l1: 'Portfolio', trabajos_l2: 'de diseño', trabajos_bajada: 'Piezas y proyectos de diseño que realicé.',
    exp_l1: 'Experiencia', exp_l2: 'laboral', exp_bajada: 'Dónde trabajé y qué hice.',
    est_l1: 'Mis', est_l2: 'estudios', est_bajada: 'Formación, cursos y certificaciones.',
    ver_album: 'Ver álbum', ver_proyecto: 'Ver proyecto', ver_trabajo: 'Ver trabajo', ver_cv: 'Ver currículum completo',
    visitar: 'Visitar', volver: 'Volver al inicio',
    foto: ['foto', 'fotos'], imagen: ['imagen', 'imágenes'], documento: ['documento', 'documentos'], pagina: ['página', 'páginas'],
    para_leer: 'Para leer', imagenes: 'Imágenes', imagenes_proyecto: 'Imágenes del proyecto',
    escribime: 'Escribime', contacto_bajada: 'Dejame tu mensaje y te respondo a la brevedad.',
    nombre: 'Nombre', email: 'Tu email', mensaje: 'Mensaje', enviar: 'Enviar mensaje', enviando: 'Enviando…',
    enviado: 'Mensaje enviado. ¡Gracias! Te respondo pronto.', error_envio: 'No se pudo enviar. Revisá tu conexión y probá de nuevo.',
    sin_config: 'El formulario todavía no está activado.', campos: 'Completá nombre, email y mensaje.',
    cerrar: 'Cerrar', anterior: 'Anterior', siguiente: 'Siguiente', pag_ant: 'Página anterior', pag_sig: 'Página siguiente',
    ir_pagina: 'Ir a la página', descargar: 'Descargar', abriendo: 'Abriendo…', error_abrir: 'No se pudo abrir este archivo.',
    error_abrir_det: 'Probá descargarlo con el botón de arriba.', letra_menos: 'Letra más chica', letra_mas: 'Letra más grande',
    frase_final: 'Hablemos.', redes: 'Redes', secciones: 'Secciones', derechos: 'Todos los derechos reservados.',
    vacio_t: 'Todavía no hay nada acá', vacio_d: 'Subí una carpeta a {c}/ en GitHub y aparecerá en esta sección.',
    no_encontrado: 'Esta página no existe', no_encontrado_d: 'Puede que la carpeta haya cambiado de nombre.',
    sin_datos: 'Falta manifest.json', sin_datos_d: 'Se genera solo con la acción de GitHub incluida. Revisá la pestaña Actions del repositorio.',
    actualidad: 'Actualidad', habilidades: 'Habilidades', idiomas_cv: 'Idiomas', leer_cv: 'Leer el CV', descargar_cv: 'Descargar PDF',
    linkedin_cv: 'Ver en LinkedIn', arrastrar: 'Deslizá para ver más',
  },
  en: {
    proyectos: 'Projects', viajes: 'Trips', trabajos: 'Work', experiencia: 'Experience', estudios: 'Education', cv: 'Résumé',
    inicio: 'Home', contacto: 'Contact', menu_abrir: 'Open menu', menu_cerrar: 'Close menu', idioma: 'Language',
    seguir: 'Scroll', mensaje_de: 'Message from',
    proyectos_bajada: 'Things I keep building. Newest first.',
    viajes_l1: 'Travel', viajes_l2: 'album', viajes_bajada: 'Cities around the world I have visited. Pick one to see its photos.',
    trabajos_l1: 'Design', trabajos_l2: 'portfolio', trabajos_bajada: 'Design pieces and projects I have made.',
    exp_l1: 'Work', exp_l2: 'experience', exp_bajada: 'Where I have worked and what I did.',
    est_l1: 'My', est_l2: 'education', est_bajada: 'Degrees, courses and certifications.',
    ver_album: 'View album', ver_proyecto: 'View project', ver_trabajo: 'View work', ver_cv: 'View full résumé',
    visitar: 'Visit', volver: 'Back to home',
    foto: ['photo', 'photos'], imagen: ['image', 'images'], documento: ['document', 'documents'], pagina: ['page', 'pages'],
    para_leer: 'To read', imagenes: 'Images', imagenes_proyecto: 'Project images',
    escribime: 'Write to me', contacto_bajada: 'Leave me a message and I will get back to you soon.',
    nombre: 'Name', email: 'Your email', mensaje: 'Message', enviar: 'Send message', enviando: 'Sending…',
    enviado: 'Message sent. Thank you! I will reply soon.', error_envio: 'The message could not be sent. Check your connection and try again.',
    sin_config: 'The contact form is not active yet.', campos: 'Please fill in name, email and message.',
    cerrar: 'Close', anterior: 'Previous', siguiente: 'Next', pag_ant: 'Previous page', pag_sig: 'Next page',
    ir_pagina: 'Go to page', descargar: 'Download', abriendo: 'Opening…', error_abrir: 'This file could not be opened.',
    error_abrir_det: 'Try downloading it with the button above.', letra_menos: 'Smaller text', letra_mas: 'Larger text',
    frase_final: 'Let’s talk.', redes: 'Social', secciones: 'Sections', derechos: 'All rights reserved.',
    vacio_t: 'Nothing here yet', vacio_d: 'Upload a folder to {c}/ on GitHub and it will appear in this section.',
    no_encontrado: 'This page does not exist', no_encontrado_d: 'The folder may have been renamed.',
    sin_datos: 'manifest.json is missing', sin_datos_d: 'It is generated by the included GitHub action. Check the repository Actions tab.',
    actualidad: 'Present', habilidades: 'Skills', idiomas_cv: 'Languages', leer_cv: 'Read the résumé', descargar_cv: 'Download PDF',
    linkedin_cv: 'View on LinkedIn', arrastrar: 'Swipe to see more',
  },
  fr: {
    proyectos: 'Projets', viajes: 'Voyages', trabajos: 'Travaux', experiencia: 'Expérience', estudios: 'Formation', cv: 'CV',
    inicio: 'Accueil', contacto: 'Contact', menu_abrir: 'Ouvrir le menu', menu_cerrar: 'Fermer le menu', idioma: 'Langue',
    seguir: 'Défiler', mensaje_de: 'Message de',
    proyectos_bajada: 'Ce que je crée. Les plus récents d’abord.',
    viajes_l1: 'Album', viajes_l2: 'de voyages', viajes_bajada: 'Des villes du monde que j’ai visitées. Choisissez-en une pour voir ses photos.',
    trabajos_l1: 'Portfolio', trabajos_l2: 'de design', trabajos_bajada: 'Les pièces et projets de design que j’ai réalisés.',
    exp_l1: 'Expérience', exp_l2: 'professionnelle', exp_bajada: 'Où j’ai travaillé et ce que j’ai fait.',
    est_l1: 'Ma', est_l2: 'formation', est_bajada: 'Diplômes, cours et certifications.',
    ver_album: 'Voir l’album', ver_proyecto: 'Voir le projet', ver_trabajo: 'Voir le travail', ver_cv: 'Voir le CV complet',
    visitar: 'Visiter', volver: 'Retour à l’accueil',
    foto: ['photo', 'photos'], imagen: ['image', 'images'], documento: ['document', 'documents'], pagina: ['page', 'pages'],
    para_leer: 'À lire', imagenes: 'Images', imagenes_proyecto: 'Images du projet',
    escribime: 'Écrivez-moi', contacto_bajada: 'Laissez-moi un message, je vous répondrai rapidement.',
    nombre: 'Nom', email: 'Votre e-mail', mensaje: 'Message', enviar: 'Envoyer le message', enviando: 'Envoi…',
    enviado: 'Message envoyé. Merci ! Je vous réponds bientôt.', error_envio: 'Le message n’a pas pu être envoyé. Vérifiez votre connexion et réessayez.',
    sin_config: 'Le formulaire n’est pas encore activé.', campos: 'Remplissez le nom, l’e-mail et le message.',
    cerrar: 'Fermer', anterior: 'Précédent', siguiente: 'Suivant', pag_ant: 'Page précédente', pag_sig: 'Page suivante',
    ir_pagina: 'Aller à la page', descargar: 'Télécharger', abriendo: 'Ouverture…', error_abrir: 'Impossible d’ouvrir ce fichier.',
    error_abrir_det: 'Essayez de le télécharger avec le bouton ci-dessus.', letra_menos: 'Texte plus petit', letra_mas: 'Texte plus grand',
    frase_final: 'Parlons-en.', redes: 'Réseaux', secciones: 'Sections', derechos: 'Tous droits réservés.',
    vacio_t: 'Rien ici pour l’instant', vacio_d: 'Ajoutez un dossier dans {c}/ sur GitHub et il apparaîtra ici.',
    no_encontrado: 'Cette page n’existe pas', no_encontrado_d: 'Le dossier a peut-être été renommé.',
    sin_datos: 'manifest.json est absent', sin_datos_d: 'Il est généré par l’action GitHub incluse. Consultez l’onglet Actions du dépôt.',
    actualidad: 'Aujourd’hui', habilidades: 'Compétences', idiomas_cv: 'Langues', leer_cv: 'Lire le CV', descargar_cv: 'Télécharger le PDF',
    linkedin_cv: 'Voir sur LinkedIn', arrastrar: 'Faites glisser pour voir plus',
  },
  de: {
    proyectos: 'Projekte', viajes: 'Reisen', trabajos: 'Arbeiten', experiencia: 'Erfahrung', estudios: 'Ausbildung', cv: 'Lebenslauf',
    inicio: 'Start', contacto: 'Kontakt', menu_abrir: 'Menü öffnen', menu_cerrar: 'Menü schließen', idioma: 'Sprache',
    seguir: 'Scrollen', mensaje_de: 'Nachricht von',
    proyectos_bajada: 'Woran ich arbeite. Die neuesten zuerst.',
    viajes_l1: 'Reise', viajes_l2: 'album', viajes_bajada: 'Städte auf der ganzen Welt, die ich besucht habe. Wähle eine, um ihre Fotos zu sehen.',
    trabajos_l1: 'Design', trabajos_l2: 'portfolio', trabajos_bajada: 'Designarbeiten und Projekte, die ich umgesetzt habe.',
    exp_l1: 'Berufs', exp_l2: 'erfahrung', exp_bajada: 'Wo ich gearbeitet habe und was ich getan habe.',
    est_l1: 'Meine', est_l2: 'Ausbildung', est_bajada: 'Abschlüsse, Kurse und Zertifikate.',
    ver_album: 'Album ansehen', ver_proyecto: 'Projekt ansehen', ver_trabajo: 'Arbeit ansehen', ver_cv: 'Ganzen Lebenslauf ansehen',
    visitar: 'Besuchen', volver: 'Zurück zur Startseite',
    foto: ['Foto', 'Fotos'], imagen: ['Bild', 'Bilder'], documento: ['Dokument', 'Dokumente'], pagina: ['Seite', 'Seiten'],
    para_leer: 'Zum Lesen', imagenes: 'Bilder', imagenes_proyecto: 'Projektbilder',
    escribime: 'Schreib mir', contacto_bajada: 'Hinterlasse mir eine Nachricht, ich antworte dir bald.',
    nombre: 'Name', email: 'Deine E-Mail', mensaje: 'Nachricht', enviar: 'Nachricht senden', enviando: 'Wird gesendet…',
    enviado: 'Nachricht gesendet. Danke! Ich antworte bald.', error_envio: 'Die Nachricht konnte nicht gesendet werden. Prüfe deine Verbindung und versuche es erneut.',
    sin_config: 'Das Formular ist noch nicht aktiviert.', campos: 'Bitte Name, E-Mail und Nachricht ausfüllen.',
    cerrar: 'Schließen', anterior: 'Zurück', siguiente: 'Weiter', pag_ant: 'Vorherige Seite', pag_sig: 'Nächste Seite',
    ir_pagina: 'Zur Seite', descargar: 'Herunterladen', abriendo: 'Wird geöffnet…', error_abrir: 'Diese Datei konnte nicht geöffnet werden.',
    error_abrir_det: 'Lade sie mit der Schaltfläche oben herunter.', letra_menos: 'Kleinere Schrift', letra_mas: 'Größere Schrift',
    frase_final: 'Lass uns reden.', redes: 'Netzwerke', secciones: 'Bereiche', derechos: 'Alle Rechte vorbehalten.',
    vacio_t: 'Hier ist noch nichts', vacio_d: 'Lade einen Ordner nach {c}/ auf GitHub hoch, dann erscheint er hier.',
    no_encontrado: 'Diese Seite gibt es nicht', no_encontrado_d: 'Vielleicht wurde der Ordner umbenannt.',
    sin_datos: 'manifest.json fehlt', sin_datos_d: 'Die Datei wird von der enthaltenen GitHub-Action erzeugt. Sieh im Tab Actions des Repositorys nach.',
    actualidad: 'Heute', habilidades: 'Fähigkeiten', idiomas_cv: 'Sprachen', leer_cv: 'Lebenslauf lesen', descargar_cv: 'PDF herunterladen',
    linkedin_cv: 'Auf LinkedIn ansehen', arrastrar: 'Wischen für mehr',
  },
  pt: {
    proyectos: 'Projetos', viajes: 'Viagens', trabajos: 'Trabalhos', experiencia: 'Experiência', estudios: 'Formação', cv: 'Currículo',
    inicio: 'Início', contacto: 'Contato', menu_abrir: 'Abrir menu', menu_cerrar: 'Fechar menu', idioma: 'Idioma',
    seguir: 'Rolar', mensaje_de: 'Mensagem de',
    proyectos_bajada: 'O que venho criando. Os mais novos primeiro.',
    viajes_l1: 'Álbum', viajes_l2: 'de viagens', viajes_bajada: 'Cidades do mundo que conheci. Escolha uma para ver as fotos.',
    trabajos_l1: 'Portfólio', trabajos_l2: 'de design', trabajos_bajada: 'Peças e projetos de design que realizei.',
    exp_l1: 'Experiência', exp_l2: 'profissional', exp_bajada: 'Onde trabalhei e o que fiz.',
    est_l1: 'Minha', est_l2: 'formação', est_bajada: 'Diplomas, cursos e certificações.',
    ver_album: 'Ver álbum', ver_proyecto: 'Ver projeto', ver_trabajo: 'Ver trabalho', ver_cv: 'Ver currículo completo',
    visitar: 'Visitar', volver: 'Voltar ao início',
    foto: ['foto', 'fotos'], imagen: ['imagem', 'imagens'], documento: ['documento', 'documentos'], pagina: ['página', 'páginas'],
    para_leer: 'Para ler', imagenes: 'Imagens', imagenes_proyecto: 'Imagens do projeto',
    escribime: 'Escreva para mim', contacto_bajada: 'Deixe sua mensagem e respondo em breve.',
    nombre: 'Nome', email: 'Seu e-mail', mensaje: 'Mensagem', enviar: 'Enviar mensagem', enviando: 'Enviando…',
    enviado: 'Mensagem enviada. Obrigado! Respondo em breve.', error_envio: 'Não foi possível enviar. Verifique sua conexão e tente de novo.',
    sin_config: 'O formulário ainda não está ativado.', campos: 'Preencha nome, e-mail e mensagem.',
    cerrar: 'Fechar', anterior: 'Anterior', siguiente: 'Próxima', pag_ant: 'Página anterior', pag_sig: 'Próxima página',
    ir_pagina: 'Ir para a página', descargar: 'Baixar', abriendo: 'Abrindo…', error_abrir: 'Não foi possível abrir este arquivo.',
    error_abrir_det: 'Tente baixá-lo com o botão acima.', letra_menos: 'Letra menor', letra_mas: 'Letra maior',
    frase_final: 'Vamos conversar.', redes: 'Redes', secciones: 'Seções', derechos: 'Todos os direitos reservados.',
    vacio_t: 'Ainda não há nada aqui', vacio_d: 'Envie uma pasta para {c}/ no GitHub e ela aparecerá nesta seção.',
    no_encontrado: 'Esta página não existe', no_encontrado_d: 'Talvez a pasta tenha mudado de nome.',
    sin_datos: 'Falta o manifest.json', sin_datos_d: 'Ele é gerado pela ação do GitHub incluída. Verifique a aba Actions do repositório.',
    actualidad: 'Atual', habilidades: 'Habilidades', idiomas_cv: 'Idiomas', leer_cv: 'Ler o currículo', descargar_cv: 'Baixar PDF',
    linkedin_cv: 'Ver no LinkedIn', arrastrar: 'Deslize para ver mais',
  },
  it: {
    proyectos: 'Progetti', viajes: 'Viaggi', trabajos: 'Lavori', experiencia: 'Esperienza', estudios: 'Formazione', cv: 'Curriculum',
    inicio: 'Home', contacto: 'Contatti', menu_abrir: 'Apri menu', menu_cerrar: 'Chiudi menu', idioma: 'Lingua',
    seguir: 'Scorri', mensaje_de: 'Messaggio di',
    proyectos_bajada: 'Quello che sto creando. I più recenti per primi.',
    viajes_l1: 'Album', viajes_l2: 'di viaggio', viajes_bajada: 'Città del mondo che ho conosciuto. Scegline una per vedere le foto.',
    trabajos_l1: 'Portfolio', trabajos_l2: 'di design', trabajos_bajada: 'Lavori e progetti di design che ho realizzato.',
    exp_l1: 'Esperienza', exp_l2: 'lavorativa', exp_bajada: 'Dove ho lavorato e cosa ho fatto.',
    est_l1: 'I miei', est_l2: 'studi', est_bajada: 'Titoli, corsi e certificazioni.',
    ver_album: 'Vedi album', ver_proyecto: 'Vedi progetto', ver_trabajo: 'Vedi lavoro', ver_cv: 'Vedi il curriculum completo',
    visitar: 'Visita', volver: 'Torna alla home',
    foto: ['foto', 'foto'], imagen: ['immagine', 'immagini'], documento: ['documento', 'documenti'], pagina: ['pagina', 'pagine'],
    para_leer: 'Da leggere', imagenes: 'Immagini', imagenes_proyecto: 'Immagini del progetto',
    escribime: 'Scrivimi', contacto_bajada: 'Lasciami un messaggio e ti rispondo al più presto.',
    nombre: 'Nome', email: 'La tua email', mensaje: 'Messaggio', enviar: 'Invia messaggio', enviando: 'Invio…',
    enviado: 'Messaggio inviato. Grazie! Ti rispondo presto.', error_envio: 'Impossibile inviare. Controlla la connessione e riprova.',
    sin_config: 'Il modulo non è ancora attivo.', campos: 'Compila nome, email e messaggio.',
    cerrar: 'Chiudi', anterior: 'Precedente', siguiente: 'Successiva', pag_ant: 'Pagina precedente', pag_sig: 'Pagina successiva',
    ir_pagina: 'Vai alla pagina', descargar: 'Scarica', abriendo: 'Apertura…', error_abrir: 'Impossibile aprire questo file.',
    error_abrir_det: 'Prova a scaricarlo con il pulsante in alto.', letra_menos: 'Testo più piccolo', letra_mas: 'Testo più grande',
    frase_final: 'Parliamone.', redes: 'Social', secciones: 'Sezioni', derechos: 'Tutti i diritti riservati.',
    vacio_t: 'Qui non c’è ancora niente', vacio_d: 'Carica una cartella in {c}/ su GitHub e apparirà in questa sezione.',
    no_encontrado: 'Questa pagina non esiste', no_encontrado_d: 'Forse la cartella ha cambiato nome.',
    sin_datos: 'Manca manifest.json', sin_datos_d: 'Viene generato dall’azione GitHub inclusa. Controlla la scheda Actions del repository.',
    actualidad: 'Oggi', habilidades: 'Competenze', idiomas_cv: 'Lingue', leer_cv: 'Leggi il CV', descargar_cv: 'Scarica il PDF',
    linkedin_cv: 'Vedi su LinkedIn', arrastrar: 'Scorri per vedere altro',
  },
};

const LOCALES = { es: 'es-AR', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', it: 'it-IT' };

function detectar() {
  try {
    const guardado = localStorage.getItem('idioma');
    if (guardado && T[guardado]) return guardado;
  } catch (_) { /* sin almacenamiento */ }
  const preferidos = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'];
  for (const p of preferidos) {
    const corto = String(p).slice(0, 2).toLowerCase();
    if (T[corto]) return corto;
  }
  return 'en';
}

export let idioma = detectar();
export const locale = () => LOCALES[idioma];

export function cambiarIdioma(nuevo) {
  if (!T[nuevo]) return;
  idioma = nuevo;
  try { localStorage.setItem('idioma', nuevo); } catch (_) { /* nada */ }
  document.documentElement.lang = nuevo;
}
document.documentElement.lang = idioma;

// t('clave') o t('clave', {c: 'valor'})
export function t(clave, vars) {
  let v = (T[idioma] && T[idioma][clave]) ?? T.es[clave] ?? clave;
  if (Array.isArray(v)) v = v[1];
  if (vars) for (const [k, x] of Object.entries(vars)) v = v.replace(`{${k}}`, x);
  return v;
}

// n('foto', 3) -> "3 fotos"
export function n(clave, cantidad) {
  const formas = (T[idioma] && T[idioma][clave]) || T.es[clave];
  return `${cantidad} ${cantidad === 1 ? formas[0] : formas[1]}`;
}

// Elige la versión de un texto en el idioma actual.
// Acepta un texto simple o un objeto { es, en, fr, de, pt, it, _ }.
export function L(valor) {
  if (valor == null) return '';
  if (typeof valor !== 'object') return String(valor);
  return valor[idioma] ?? valor._ ?? valor.es ?? valor.en ?? Object.values(valor)[0] ?? '';
}
