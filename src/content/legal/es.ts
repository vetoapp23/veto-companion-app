import type { LegalBundle } from "./types";
import { LEGAL_ENTITY as E } from "./types";

const UPDATED = "20 de noviembre de 2026";

const ATTRIBUTION =
  "Adaptado a partir de plantillas redactadas por abogados y publicadas por General Legal, PC bajo licencia CC0 1.0. Se ofrecen solo como referencia general y no constituyen asesoramiento jurídico ni crean una relación abogado-cliente.";

export const legalEs: LegalBundle = {
  privacy: {
    title: "Política de privacidad",
    metaDescription:
      "Política de privacidad de VetoCrm — tratamiento de datos personales del SaaS de gestión clínica veterinaria (RGPD, Stripe, subencargados, derechos).",
    lastUpdated: UPDATED,
    intro: `${E.companyFormalName} (« ${E.brand} », « nosotros ») proporciona software en la nube de gestión para clínicas veterinarias (clientes, animales, citas, historiales, vacunas, stock, granjas y módulos relacionados) en ${E.website} y aplicaciones asociadas (el « Servicio »). Esta Política describe cómo tratamos la información personal recogida a través del Servicio, nuestras actividades de marketing y otras actividades aquí descritas. Usuarios europeos: véase la sección RGPD más abajo.`,
    sections: [
      {
        id: "roles",
        title: "1. Roles: responsable y encargado del tratamiento",
        paragraphs: [`${E.brand} actúa en dos roles distintos:`],
        bullets: [
          "Responsable del tratamiento de los datos de cuenta, suscripción, facturación, soporte, marketing (cuando haya consentimiento) y uso de la plataforma relativos al personal de la clínica (admins, asistentes, super-admins).",
          `Encargado del tratamiento de los datos de clientes, animales, historiales, citas, recetas, granjas, stock y documentos introducidos por una clínica: la clínica (organización) es responsable; ${E.brand} trata esos datos solo para prestar el Servicio según las instrucciones de la clínica.`,
        ],
      },
      {
        id: "controller",
        title: "2. Quiénes somos",
        paragraphs: [
          `Editor / prestador: ${E.companyFormalName} (marca ${E.brand}).`,
          `Sitio: ${E.website}`,
          `Contacto / privacidad: ${E.privacyEmail}`,
          `Correspondencia: ${E.address}`,
          `LinkedIn: ${E.linkedin} · Instagram: ${E.instagram}`,
          "Los datos de identificación también figuran en el Aviso legal.",
        ],
      },
      {
        id: "collect",
        title: "3. Información personal que recopilamos",
        paragraphs: ["Según el uso, podemos tratar:"],
        bullets: [
          "Datos de contacto y cuenta: nombre, correo, teléfono, rol, idioma, contraseña hasheada.",
          "Datos de clínica / organización: nombre, dirección, ajustes, códigos de invitación, miembros.",
          "Contenido profesional de la clínica (como encargado): propietarios, animales, consultas, vacunas, antiparasitarios, recetas, granjas, stock, contabilidad interna, fotos y adjuntos.",
          "Metadatos de pago: IDs de cliente/suscripción Stripe, plan, estado, historial (no almacenamos números completos de tarjeta ni CVC).",
          "Comunicaciones: mensajes de soporte y correos transaccionales.",
          "Datos de dispositivo y actividad: IP, navegador/dispositivo, páginas vistas, ubicación aproximada, registros de seguridad y uso.",
          "Cookies e identificadores similares: véase la Política de cookies.",
        ],
      },
      {
        id: "sources",
        title: "4. Fuentes",
        bullets: [
          "Usted y su equipo (formularios, CRM, cargas).",
          "Recogida automática al usar el Servicio (logs, cookies, analytics si hay consentimiento).",
          "Proveedores que actúan por nosotros (pago, hosting, correo).",
          "Socios de operaciones corporativas (fusión, financiación, etc.) si aplica.",
        ],
      },
      {
        id: "use",
        title: "5. Cómo usamos la información",
        bullets: [
          "Prestar, asegurar y operar el Servicio (cuentas, aislamiento multi-tenant, sincronización, soporte).",
          "Procesar suscripciones y facturas vía Stripe.",
          "Personalizar preferencias (idioma, UI) y mejorar el producto con analytics agregadas.",
          "Enviar anuncios del servicio, alertas de seguridad y (con consentimiento si procede) marketing.",
          "Detectar fraude, abusos e incidentes; cumplir la ley.",
          "Como encargado: alojar y tratar el contenido clínico solo para prestar el Servicio a esa clínica.",
        ],
      },
      {
        id: "legal-bases",
        title: "6. Bases jurídicas (RGPD / UK GDPR)",
        bullets: [
          "Ejecución del contrato (art. 6(1)(b)): cuenta, CRM, autenticación, facturación.",
          "Interés legítimo (art. 6(1)(f)): seguridad, prevención del fraude, mejora del producto, analytics agregadas — sujeto a sus derechos.",
          "Obligación legal (art. 6(1)(c)): facturación y respuestas a autoridades.",
          "Consentimiento (art. 6(1)(a)): cookies/analytics no esenciales y marketing opcional — revocable en cualquier momento.",
        ],
      },
      {
        id: "sharing",
        title: "7. Cómo compartimos la información",
        paragraphs: [
          "No vendemos información personal. La compartimos solo para operar el Servicio:",
        ],
        bullets: [
          "Dentro de su organización (miembros según roles).",
          "Proveedores / subencargados bajo contrato: Supabase (base, auth, archivos); Vercel (hosting, Analytics y Speed Insights si están activos); Stripe (pagos); proveedores de correo transaccional.",
          "Asesores profesionales bajo confidencialidad.",
          "Autoridades cuando la ley lo exija o para proteger derechos y seguridad.",
          "Sucesores en una operación corporativa (con salvaguardas adecuadas).",
        ],
      },
      {
        id: "transfers",
        title: "8. Transferencias internacionales",
        paragraphs: [
          "Según los proveedores, los datos pueden tratarse fuera de su país (incluido fuera del EEE/Reino Unido). Cuando proceda, nos basamos en salvaguardas adecuadas (CCT de la UE, decisiones de adecuación, etc.) y medidas técnicas.",
          `Las clínicas de la UE/EEE pueden solicitar un acuerdo de encargo (DPA) en ${E.contactEmail}.`,
        ],
      },
      {
        id: "retention",
        title: "9. Conservación",
        bullets: [
          "Cuenta y organización: duración del contrato y luego borrado o anonimización en un plazo razonable tras el cierre (salvo obligación legal más larga).",
          "Facturación: plazos legales contables.",
          "Registros de seguridad: periodo limitado necesario para detectar incidentes.",
          "Cookies: según el tipo (Política de cookies).",
        ],
      },
      {
        id: "security",
        title: "10. Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas y organizativas adecuadas al riesgo: TLS, control de acceso por roles, aislamiento de organizaciones, hash de contraseñas, copias de seguridad y registro de accesos.",
          "Ningún sistema es perfecto. Si una violación de datos personales puede causar un alto riesgo, notificaremos a las personas y autoridades según la ley aplicable (incluido el RGPD).",
        ],
      },
      {
        id: "rights",
        title: "11. Sus derechos",
        paragraphs: [
          "Según su ubicación, puede tener derechos de acceso, rectificación, borrado, limitación, oposición, portabilidad y a reclamar ante una autoridad de control.",
          `Datos de cuenta / personal: ${E.privacyEmail} o ${E.supportEmail}.`,
          "Datos de propietarios / pacientes en un espacio de clínica: contacte primero a la clínica (responsable). Asistimos como encargado.",
        ],
      },
      {
        id: "us-state",
        title: "12. Avisos de privacidad de estados de EE. UU.",
        paragraphs: [
          "Si reside en California, Colorado, Connecticut, Virginia, Nevada u otro estado de EE. UU. con ley de privacidad integral, puede tener derechos a conocer, acceder, corregir, eliminar, obtener una copia de la información y a oponerse a la venta/compartición o a la publicidad dirigida, según corresponda.",
          `${E.brand} no vende información personal y no la usa para publicidad conductual entre contextos más allá de las herramientas de analytics con consentimiento descritas en la Política de cookies.`,
          `Para ejercer derechos: ${E.privacyEmail}.`,
        ],
      },
      {
        id: "deletion",
        title: "13. Eliminación de cuenta",
        paragraphs: [
          `Puede solicitar la eliminación de su cuenta desde ajustes o escribiendo a ${E.supportEmail}. La eliminación finaliza el acceso; algunos registros pueden conservarse temporalmente por motivos legales, de seguridad o de litigio.`,
          "Los admins de clínica pueden solicitar exportación y luego borrado de los datos de la organización.",
        ],
      },
      {
        id: "children",
        title: "14. Menores",
        paragraphs: [
          "El Servicio está destinado a profesionales veterinarios y personal de clínica. No está dirigido a menores de 16 años (o la edad local de consentimiento digital). No creamos conscientemente cuentas de usuario para menores.",
        ],
      },
      {
        id: "cookies",
        title: "15. Cookies y seguimiento",
        paragraphs: [
          "Usamos cookies y tecnologías similares para autenticación, preferencias, seguridad y, con consentimiento cuando sea necesario, analytics (incluidos Vercel Analytics y Speed Insights). Detalles: Política de cookies.",
        ],
      },
      {
        id: "changes",
        title: "16. Cambios",
        paragraphs: [
          "Podemos actualizar esta Política. Cambiará la fecha de «Última actualización». En cambios materiales podemos avisarle en el producto o por correo.",
        ],
      },
      {
        id: "contact",
        title: "17. Contacto",
        paragraphs: [
          `Privacidad: ${E.privacyEmail}`,
          `Soporte: ${E.supportEmail}`,
          `Sitio: ${E.website}`,
        ],
      },
      {
        id: "attribution",
        title: "18. Atribución de la plantilla",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  terms: {
    title: "Términos de uso",
    metaDescription:
      "Términos de uso de VetoCrm — acceso, suscripciones, uso aceptable, responsabilidad y ley aplicable.",
    lastUpdated: UPDATED,
    intro: `Estos Términos de uso (« Términos ») regulan el acceso a ${E.website} y al Servicio ${E.brand} operado por ${E.companyFormalName} (« ${E.brand} », « nosotros »). Al crear una cuenta, hacer clic en « Acepto » o usar el Servicio, usted acepta estos Términos en su nombre o en el de la entidad que representa. Debe tener al menos 18 años y estar autorizado a obligar a la clínica/organización. Si no está de acuerdo, no use el Servicio.`,
    sections: [
      {
        id: "service",
        title: "1. El Servicio",
        paragraphs: [
          `${E.brand} ofrece herramientas cloud de gestión para clínicas veterinarias (clientes, animales, agenda, consultas, vacunas, stock, granjas, contabilidad según el plan) para equipos multiusuario.`,
          "Podemos modificar, suspender o discontinuar funciones con aviso razonable cuando sea posible. El Servicio se presta con diligencia comercialmente razonable, excluyendo mantenimiento planificado y causa de fuerza mayor.",
        ],
      },
      {
        id: "accounts",
        title: "2. Cuentas y seguridad",
        bullets: [
          "Proporcione información de registro exacta y manténgala actualizada.",
          "Mantenga la confidencialidad de las credenciales; usted es responsable de la actividad bajo su cuenta.",
          "Los admins de la organización gestionan invitaciones, roles y accesos.",
          "Notifíquenos de inmediato cualquier acceso no autorizado. Las cuentas demo son limitadas y pueden reiniciarse.",
        ],
      },
      {
        id: "license",
        title: "3. Licencia y restricciones",
        paragraphs: [
          "Sujeto a estos Términos y a su plan, le otorgamos una licencia limitada, no exclusiva, intransferible y revocable para acceder y usar el Servicio con fines profesionales internos de su clínica.",
        ],
        bullets: [
          "No venda, alquile, sublicencie ni explote comercialmente el Servicio sin acuerdo escrito.",
          "No realice ingeniería inversa, eluda la seguridad, haga scraping masivo ni cree un producto competidor a partir de nuestros materiales.",
          "No acceda a datos de otra organización sin autorización.",
          "Conserve los avisos de propiedad en cualquier copia permitida.",
        ],
      },
      {
        id: "plans",
        title: "4. Planes, precios e impuestos",
        paragraphs: [
          "Se ofrecen planes gratuitos y de pago con cuotas (usuarios, almacenamiento, funciones). Los precios pueden excluir impuestos y variar según moneda (MAD, EUR, USD) y ciclo.",
          "Podemos cambiar precios con aviso razonable; los cambios aplican en la siguiente renovación salvo indicación contraria.",
        ],
      },
      {
        id: "stripe",
        title: "5. Pago mediante Stripe",
        paragraphs: [
          "Los planes de pago se facturan a través de Stripe. Al suscribirse autoriza cargos recurrentes. Un fallo de pago puede suspender funciones de pago tras aviso.",
          "Facturas/recibos vía portal de facturación o bajo petición. Las suscripciones vía tiendas móviles siguen las reglas de la tienda.",
        ],
      },
      {
        id: "cancel",
        title: "6. Cancelación y reembolsos",
        paragraphs: [
          "Puede cancelar o bajar de plan en cualquier momento; el efecto suele ser al final del periodo prepagado. Detalles: Política de reembolsos.",
        ],
      },
      {
        id: "privacy",
        title: "7. Privacidad y cookies",
        paragraphs: [
          `Su uso también se rige por la Política de privacidad (${E.website}/privacy) y la Política de cookies (${E.website}/cookies), incorporadas por referencia. En caso de conflicto sobre el tratamiento de datos personales, prevalece la Política de privacidad.`,
        ],
      },
      {
        id: "customer-data",
        title: "8. Datos de la clínica",
        paragraphs: [
          "Usted conserva los derechos sobre los datos que introduce. Nos concede una licencia limitada para alojarlos y tratarlos solo para prestar el Servicio.",
          "Garantiza disponer de una base legal para tratar datos de propietarios y registros relacionados. Actuamos como encargado; un DPA está disponible bajo petición.",
        ],
      },
      {
        id: "feedback",
        title: "9. Comentarios",
        paragraphs: [
          "Si comparte sugerencias, nos otorga una licencia perpetua, irrevocable, mundial y libre de regalías para usarlas sin atribución. No envíe información que considere confidencial.",
        ],
      },
      {
        id: "third-party",
        title: "10. Servicios de terceros",
        paragraphs: [
          "El Servicio puede enlazar o integrarse con terceros (p. ej. Stripe, hosting). No los controlamos; se aplican sus términos. Usted los usa bajo su propio riesgo.",
        ],
      },
      {
        id: "disclaimer",
        title: "11. Aviso profesional y « tal cual »",
        paragraphs: [
          `${E.brand} es una ayuda de gestión para profesionales veterinarios. No es un dispositivo médico y no sustituye el juicio clínico, el diagnóstico, la prescripción ni las obligaciones regulatorias. Usted es el único responsable de las decisiones profesionales.`,
          "EL SERVICIO SE PROPORCIONA « TAL CUAL » Y « SEGÚN DISPONIBILIDAD ». EN LA MEDIDA PERMITIDA POR LA LEY, EXCLUIMOS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN PARTICULAR, TÍTULO Y NO INFRACCIÓN. NO GARANTIZAMOS UN FUNCIONAMIENTO ININTERRUMPIDO O SIN ERRORES.",
        ],
      },
      {
        id: "liability",
        title: "12. Limitación de responsabilidad",
        paragraphs: [
          "En la máxima medida permitida por la ley, no respondemos por daños indirectos, consecuentes, incidentales, especiales o punitivos, lucro cesante ni pérdida de datos por mal uso o fallos de terceros.",
          "Nuestra responsabilidad agregada relativa al Servicio está limitada a las cantidades que nos haya pagado efectivamente en los 12 meses anteriores a la reclamación (o el equivalente a 100 EUR en un plan gratuito).",
        ],
      },
      {
        id: "indemnity",
        title: "13. Indemnización",
        paragraphs: [
          "Acepta defendernos e indemnizarnos frente a reclamaciones y costes razonables derivados de su uso del Servicio, sus datos clínicos, su incumplimiento de estos Términos o de la ley — en la medida permitida por el derecho aplicable.",
        ],
      },
      {
        id: "termination",
        title: "14. Suspensión y terminación",
        paragraphs: [
          "Podemos suspender o terminar el acceso si incumple estos Términos, no paga o genera riesgo legal/de seguridad. Tras la terminación, finaliza la licencia; las cláusulas supervivientes continúan.",
        ],
      },
      {
        id: "law",
        title: "15. Ley aplicable y disputas",
        paragraphs: [
          `Sin perjuicio de protecciones imperativas de su país, estos Términos se rigen por las leyes de ${E.country}. Son competentes los tribunales de Rabat, salvo normas imperativas en contrario.`,
          `Antes de un procedimiento formal, contacte ${E.contactEmail} para intentar una resolución amistosa.`,
        ],
      },
      {
        id: "general",
        title: "16. General",
        bullets: [
          "Podemos actualizar estos Términos; los cambios materiales pueden notificarse en el producto o por correo.",
          "Estos Términos, junto con las políticas de Privacidad, Cookies, Reembolsos y Divulgación, constituyen el acuerdo íntegro sobre el Servicio.",
          "Si una disposición es inválida, se modificará en la medida mínima necesaria; el resto sigue vigente.",
          "No puede ceder estos Términos sin nuestro consentimiento; nosotros podemos cederlos en una operación corporativa.",
          `Contacto: ${E.contactEmail} — ${E.website}`,
        ],
      },
      {
        id: "attribution",
        title: "17. Atribución de la plantilla",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  legal: {
    title: "Aviso legal",
    metaDescription: "Aviso legal de VetoCrm — editor, hosting, contacto e identificación.",
    lastUpdated: UPDATED,
    intro: "Identificación del editor del servicio en línea VetoCrm.",
    sections: [
      {
        id: "publisher",
        title: "1. Editor",
        paragraphs: [
          `Marca / servicio: ${E.brand}`,
          `Nombre: ${E.companyFormalName}`,
          `Sitio: ${E.website}`,
          `Contacto: ${E.contactEmail}`,
          `Correspondencia: ${E.address}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
        ],
      },
      {
        id: "director",
        title: "2. Director de la publicación",
        paragraphs: [`Director de la publicación: ${E.publicationDirector}, en ${E.contactEmail}.`],
      },
      {
        id: "hosting",
        title: "3. Hosting",
        paragraphs: [
          `Aplicación (front): ${E.hostingApp}.`,
          `Datos y backend: ${E.hostingData}.`,
          `Consultas: ${E.supportEmail}.`,
        ],
      },
      {
        id: "ip",
        title: "4. Propiedad intelectual",
        paragraphs: [
          "Los materiales del sitio y la app (textos, gráficos, logo, software) están protegidos. Queda prohibida la reproducción no autorizada.",
        ],
      },
      {
        id: "med",
        title: "5. Aviso profesional",
        paragraphs: [
          "VetoCrm es software de gestión para profesionales veterinarios. No es un dispositivo médico y no sustituye la experiencia clínica. Véase también la página de Divulgación.",
        ],
      },
    ],
  },

  cookies: {
    title: "Política de cookies",
    metaDescription:
      "Política de cookies de VetoCrm — cookies esenciales, preferencias, Vercel Analytics / Speed Insights y gestión del consentimiento.",
    lastUpdated: UPDATED,
    intro: `Esta Política explica cómo ${E.brand} (« nosotros ») usa cookies y tecnologías similares en ${E.website} y en la app, de acuerdo con nuestra Política de privacidad. Está adaptada de la Cookie Notice de General Legal a nuestro stack real.`,
    sections: [
      {
        id: "what",
        title: "1. ¿Qué es una cookie?",
        paragraphs: [
          "Una cookie es un pequeño archivo que se coloca en su dispositivo al visitar un sitio. También podemos usar almacenamiento local del navegador y píxeles. Usamos cookies de sesión y persistentes.",
          "Las cookies de primera parte las depositamos nosotros; las de terceros pueden depositarlas proveedores (p. ej. analytics tras el consentimiento).",
        ],
      },
      {
        id: "types",
        title: "2. Tipos que usamos",
        bullets: [
          "Esenciales / técnicas: sesión de autenticación (p. ej. Supabase), seguridad, balanceo — necesarias para el Servicio. No requieren consentimiento.",
          "Preferencias / funcionalidad: idioma (vetocrm-lang), elección de cookies (vetocrm_cookie_consent), estado de UI.",
          "Analytics / rendimiento (solo si acepta cookies no esenciales): Vercel Analytics y Vercel Speed Insights — audiencia agregada y Core Web Vitals.",
          "Publicidad / redes sociales: no se usan actualmente en vetocrm.com. Si se añaden, actualizaremos esta Política y pediremos consentimiento cuando proceda.",
        ],
      },
      {
        id: "providers",
        title: "3. Quién las sirve",
        bullets: [
          `${E.brand} / primera parte — preferencias y consentimiento.`,
          "Supabase — cookies/tokens de auth esenciales para usuarios conectados.",
          "Vercel — hosting; scripts de Analytics y Speed Insights solo tras consentimiento del banner.",
          "Stripe — puede establecer cookies en páginas de pago.",
        ],
      },
      {
        id: "choices",
        title: "4. Sus opciones",
        paragraphs: [
          "En la primera visita mostramos un banner: puede aceptar o rechazar cookies no esenciales. Las esenciales siguen activas.",
          "Puede borrar datos del sitio o bloquear cookies en el navegador; bloquear las esenciales puede impedir el inicio de sesión.",
          "Para revisar el consentimiento: borre la clave vetocrm_cookie_consent del almacenamiento local del sitio y recargue — o contáctenos.",
        ],
      },
      {
        id: "other",
        title: "5. Otras tecnologías",
        paragraphs: [
          "Podemos usar almacenamiento local para idioma y consentimiento. No usamos Flash LSO ni herramientas de session-replay (p. ej. FullStory) hoy.",
          "Los correos transaccionales pueden incluir medición de apertura/clic para fiabilidad de entrega.",
        ],
      },
      {
        id: "duration",
        title: "6. Duración",
        paragraphs: [
          "Las cookies de sesión expiran al cerrar el navegador. Las de preferencia suelen durar hasta 12 meses salvo renovación. Los identificadores de analytics siguen la retención del proveedor cuando están activos.",
        ],
      },
      {
        id: "changes",
        title: "7. Cambios",
        paragraphs: [
          "Podemos actualizar esta Política. Consulte la fecha de actualización. Los cambios materiales pueden destacarse en el banner o en la Política de privacidad.",
        ],
      },
      {
        id: "contact",
        title: "8. Contacto",
        paragraphs: [`Preguntas: ${E.privacyEmail}. Más sobre usos de datos: Política de privacidad.`],
      },
      {
        id: "attribution",
        title: "9. Atribución de la plantilla",
        paragraphs: [ATTRIBUTION],
      },
    ],
  },

  refund: {
    title: "Política de reembolsos y cancelación",
    metaDescription:
      "Cancelación y reembolsos de suscripciones VetoCrm vía Stripe y tiendas — pruebas, renovaciones y bajadas de plan.",
    lastUpdated: UPDATED,
    intro: `Esta Política complementa los Términos de uso y explica la cancelación y los reembolsos de las suscripciones ${E.brand}, incluidos Stripe y las tiendas de apps.`,
    sections: [
      {
        id: "cancel",
        title: "1. Cancelación",
        paragraphs: [
          `Puede cancelar una suscripción de pago en cualquier momento desde facturación/ajustes o contactando ${E.supportEmail}.`,
          "Salvo indicación contraria, la cancelación surte efecto al final del periodo pagado en curso; conserva el acceso de pago hasta entonces.",
          "Después puede aplicarse un plan gratuito o funciones reducidas según cuotas.",
        ],
      },
      {
        id: "refunds",
        title: "2. Reembolsos (Stripe / web)",
        paragraphs: [
          "Por regla general, los periodos de facturación iniciados no son reembolsables a prorrata.",
          "Como gesto comercial, puede concederse un reembolso íntegro en los 14 días siguientes al primer pago de un plan anual si la cuenta no ha usado de forma sustancial el Servicio (caso por caso).",
          `Solicitudes: ${E.contactEmail} con el correo de la cuenta y prueba de pago. Los reembolsos de Stripe aparecen según los plazos bancarios (a menudo 5–10 días hábiles).`,
        ],
      },
      {
        id: "stores",
        title: "3. App Store / Google Play",
        paragraphs: [
          "Si se suscribió vía Apple o Google, la cancelación y los reembolsos los gestiona principalmente la tienda. VetoCrm no siempre puede reembolsar una compra in-app directamente.",
        ],
      },
      {
        id: "trials",
        title: "4. Pruebas y planes gratuitos",
        paragraphs: [
          "Las pruebas gratuitas, si se ofrecen, se convierten en suscripción de pago salvo cancelación antes del fin de la prueba. Los planes gratuitos no son reembolsables.",
        ],
      },
      {
        id: "chargebacks",
        title: "5. Disputas de pago",
        paragraphs: [
          "Antes de un chargeback bancario, contacte a soporte para una resolución amistosa. Las disputas abusivas pueden conllevar suspensión de cuenta.",
        ],
      },
      {
        id: "contact",
        title: "6. Contacto de facturación",
        paragraphs: [`${E.supportEmail} — ${E.website}`],
      },
    ],
  },

  disclosure: {
    title: "Divulgación",
    metaDescription:
      "Divulgaciones de VetoCrm — aviso profesional, transparencia publicitaria, alianzas y afiliados.",
    lastUpdated: UPDATED,
    intro: `Esta Divulgación explica limitaciones importantes y prácticas de transparencia de ${E.brand}. Complementa los Términos de uso, la Política de privacidad y el Aviso legal.`,
    sections: [
      {
        id: "professional",
        title: "1. Aviso profesional / médico",
        paragraphs: [
          `${E.brand} es software para organizar la práctica veterinaria (CRM, agenda, historiales, stock, etc.). No es un dispositivo médico, no ofrece consejo veterinario y no diagnostica, trata ni prescribe.`,
          "Los veterinarios y el personal de clínica son los únicos responsables de las decisiones clínicas, recetas, bienestar animal y obligaciones regulatorias.",
          "El contenido del sitio de marketing y del blog (« Monde Veto ») es informativo y educativo. No sustituye una consulta profesional.",
        ],
      },
      {
        id: "results",
        title: "2. Resultados y testimonios",
        paragraphs: [
          "Ejemplos, capturas, casos o testimonios describen experiencias individuales. Los resultados varían según la clínica y el uso. El rendimiento pasado no garantiza resultados futuros.",
        ],
      },
      {
        id: "advertising",
        title: "3. Publicidad y marketing",
        paragraphs: [
          "Podemos promocionar VetoCrm mediante el sitio, correo, redes, Product Hunt, búsqueda o anuncios de pago (p. ej. Meta). Los anuncios se etiquetan cuando las plataformas lo exigen.",
          "Si un contenido incluye una asociación de pago, un enlace de afiliado o un emplazamiento patrocinado, divulgaremos claramente esa conexión material (p. ej. « Patrocinado », « Socio », « Afiliado »).",
        ],
      },
      {
        id: "affiliates",
        title: "4. Afiliados y referidos",
        paragraphs: [
          "Si ofrecemos programas de referidos o afiliados, los participantes pueden ganar una comisión o crédito cuando alguien se suscribe mediante su enlace. El precio final para el cliente no aumenta solo por ese enlace, salvo que indiquemos lo contrario.",
        ],
      },
      {
        id: "third-party",
        title: "5. Herramientas y marcas de terceros",
        paragraphs: [
          "Las menciones de Stripe, Supabase, Vercel, Apple, Google u otras marcas son solo identificativas. No estamos afiliados ni respaldados por esas empresas salvo declaración expresa. Sus marcas les pertenecen.",
        ],
      },
      {
        id: "ai",
        title: "6. IA y contenido automatizado",
        paragraphs: [
          "Podemos usar herramientas de software (incluida redacción asistida por IA) para textos de marketing o de interfaz. Los datos clínicos que introduce siguen tratándose según la Política de privacidad y las instrucciones de su clínica; no los vendemos para entrenar modelos de IA públicos.",
        ],
      },
      {
        id: "contact",
        title: "7. Contacto",
        paragraphs: [
          `Preguntas sobre esta Divulgación: ${E.contactEmail}`,
          `Privacidad: ${E.privacyEmail}`,
          `Sitio: ${E.website}`,
        ],
      },
    ],
  },
};
