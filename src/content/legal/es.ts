import type { LegalBundle } from "./types";
import { LEGAL_ENTITY as E } from "./types";

const UPDATED = "5 de agosto de 2026";

export const legalEs: LegalBundle = {
  privacy: {
    title: "Política de privacidad",
    metaDescription:
      "Política de privacidad de VetoCrm — tratamiento de datos (RGPD), pagos Stripe, subencargados y derechos de los usuarios.",
    lastUpdated: UPDATED,
    intro: `Esta Política explica cómo ${E.brand} (« nosotros ») recopila, utiliza, conserva y protege los datos personales al prestar su software SaaS de gestión para clínicas veterinarias en ${E.website} y aplicaciones asociadas. Está alineada con el Reglamento (UE) 2016/679 (RGPD), la normativa marroquí aplicable y las expectativas de Stripe y las tiendas de aplicaciones (App Store / Google Play).`,
    sections: [
      {
        id: "roles",
        title: "1. Roles: responsable y encargado del tratamiento",
        paragraphs: [`${E.brand} actúa en dos roles distintos:`],
        bullets: [
          "Responsable del tratamiento de los datos de cuenta, suscripción, facturación, soporte y uso de la plataforma (administradores, asistentes, super-admins).",
          `Encargado del tratamiento de los datos de clientes, animales, historiales, citas y documentos introducidos por una clínica: la clínica (organización) es responsable; ${E.brand} solo los trata para prestar el servicio según sus instrucciones.`,
        ],
      },
      {
        id: "controller",
        title: "2. Identidad del editor / responsable",
        paragraphs: [
          `Editor del servicio: ${E.companyFormalName} (marca ${E.brand}).`,
          `Sitio web: ${E.website}`,
          `Contacto general: ${E.contactEmail}`,
          `Privacidad: ${E.privacyEmail}`,
          `Dirección de correspondencia: ${E.address}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
          "Los datos societarios completos (forma jurídica, registro, domicilio social) figuran en el Aviso legal y se actualizarán al finalizar la entidad mercantil.",
        ],
      },
      {
        id: "data",
        title: "3. Categorías de datos",
        paragraphs: ["Según el uso, podemos tratar:"],
        bullets: [
          "Datos de identidad y cuenta: nombre, correo, contraseña (hash), teléfono, rol, idioma.",
          "Datos de clínica / organización: nombre, dirección, ajustes, códigos de invitación, equipo.",
          "Datos profesionales de la clínica (como encargado): propietarios, animales, consultas, vacunas, antiparasitarios, recetas, granjas, stock, contabilidad interna, archivos.",
          "Datos de pago y suscripción: IDs de cliente Stripe, plan, estado, historial (no almacenamos el número completo de tarjeta).",
          "Datos técnicos: registros de acceso, IP, dispositivo/navegador, cookies e identificadores similares, métricas de uso.",
          "Comunicaciones: correos transaccionales y soporte.",
        ],
      },
      {
        id: "purposes",
        title: "4. Finalidades y bases jurídicas (RGPD)",
        bullets: [
          "Ejecución del contrato: cuenta, CRM, autenticación, sincronización, soporte (art. 6.1.b).",
          "Interés legítimo: seguridad, fraude, mejora del producto, analítica agregada (art. 6.1.f).",
          "Obligación legal: facturación, conservación contable, requerimientos de autoridades (art. 6.1.c).",
          "Consentimiento: cookies no esenciales y marketing si aplica (art. 6.1.a).",
        ],
      },
      {
        id: "payments",
        title: "5. Pagos (Stripe)",
        paragraphs: [
          "Los pagos de suscripción los procesa Stripe. Los datos de tarjeta se recogen directamente en entornos seguros de Stripe; VetoCrm no recibe ni almacena PAN/CVC completos.",
          "Política de Stripe: https://stripe.com/privacy",
          "Conservamos metadatos de suscripción necesarios (customer ID, subscription ID, estado, importes, MAD/EUR/USD).",
        ],
      },
      {
        id: "processors",
        title: "6. Destinatarios y subencargados",
        paragraphs: [
          "Acceso limitado al personal autorizado de VetoCrm bajo confidencialidad.",
          "Subencargados técnicos habituales:",
        ],
        bullets: [
          "Supabase — base de datos, autenticación, almacenamiento de archivos.",
          "Stripe — pagos y facturación.",
          "Proveedores de correo / conectores para emails transaccionales.",
          "Infraestructura cloud subyacente.",
        ],
      },
      {
        id: "transfers",
        title: "7. Transferencias internacionales",
        paragraphs: [
          "Según el hosting y proveedores, los datos pueden tratarse fuera de su país (incluido fuera del EEE), con garantías adecuadas (CTC de la UE, decisiones de adecuación u equivalentes) y medidas de seguridad.",
          "Para clínicas en la UE/EEE, un acuerdo de encargo (DPA) está disponible bajo petición en privacy@vetocrm.com.",
        ],
      },
      {
        id: "retention",
        title: "8. Conservación",
        bullets: [
          "Cuenta y organización: durante el contrato y luego eliminación o anonimización en un plazo razonable tras el cierre.",
          "Facturación: plazos legales contables.",
          "Registros de seguridad: periodo limitado necesario.",
          "Cookies: según su tipo (véase Cookies).",
        ],
      },
      {
        id: "security",
        title: "9. Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas y organizativas adecuadas: TLS, control de acceso por roles, aislamiento multi-tenant, hash de contraseñas, copias de seguridad de infraestructura, registro de accesos sensibles.",
          "Ante una violación de datos con alto riesgo, informaremos conforme al RGPD.",
        ],
      },
      {
        id: "rights",
        title: "10. Sus derechos",
        paragraphs: [
          "Conforme al RGPD: acceso, rectificación, supresión, limitación, oposición, portabilidad y reclamación ante una autoridad de control.",
          `Para ejercer derechos sobre su cuenta VetoCrm: ${E.privacyEmail} o ${E.supportEmail}.`,
          "Para datos de pacientes/clientes de una clínica: contacte primero a la clínica (responsable). Nosotros asistiremos como encargado.",
        ],
      },
      {
        id: "deletion",
        title: "11. Eliminación de cuenta (App Store / plataformas)",
        paragraphs: [
          "Puede solicitar la eliminación de su cuenta desde ajustes/perfil o por correo a support@vetocrm.com. Algunas datos pueden conservarse temporalmente por obligación legal o litigios.",
          "Los administradores pueden solicitar exportación y luego eliminación de los datos de su organización.",
        ],
      },
      {
        id: "children",
        title: "12. Menores",
        paragraphs: [
          "El servicio está dirigido a profesionales veterinarios, no a menores de 16 años (o la edad local de consentimiento digital).",
        ],
      },
      {
        id: "cookies",
        title: "13. Cookies",
        paragraphs: [
          "Usamos cookies y tecnologías similares para autenticación, preferencias, seguridad y, en su caso, analítica. Detalles en la Política de cookies.",
        ],
      },
      {
        id: "changes",
        title: "14. Cambios",
        paragraphs: [
          "Podemos actualizar esta Política. La fecha de «Última actualización» se revisará. En cambios materiales podremos avisarle en el producto o por correo.",
        ],
      },
      {
        id: "contact",
        title: "15. Contacto",
        paragraphs: [
          `Privacidad: ${E.privacyEmail}`,
          `Soporte: ${E.supportEmail}`,
          `Web: ${E.website}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
        ],
      },
    ],
  },

  terms: {
    title: "Condiciones de uso",
    metaDescription:
      "Condiciones de uso de VetoCrm — suscripciones, pagos Stripe, responsabilidad, baja y uso aceptable.",
    lastUpdated: UPDATED,
    intro: `Estas Condiciones regulan el acceso y uso de ${E.brand}, software SaaS para clínicas veterinarias. Al crear una cuenta o usar el servicio, acepta estas Condiciones.`,
    sections: [
      {
        id: "service",
        title: "1. Objeto del servicio",
        paragraphs: [
          `${E.brand} ofrece herramientas de gestión en la nube (clientes, animales, agenda, consultas, vacunas, stock, granjas, contabilidad según el plan).`,
          "El servicio se presta con obligación de medios, salvo mantenimiento planificado o incidentes ajenos a nuestro control razonable.",
        ],
      },
      {
        id: "eligibility",
        title: "2. Elegibilidad y cuentas",
        bullets: [
          "Declara ser mayor de edad y estar autorizado a vincular a la clínica/organización.",
          "Es responsable de la exactitud de los datos y de la confidencialidad de las credenciales.",
          "El administrador gestiona invitaciones, roles y accesos del equipo.",
          "Las cuentas demo son de evaluación y pueden reiniciarse o limitarse.",
        ],
      },
      {
        id: "plans",
        title: "3. Planes, precios e impuestos",
        paragraphs: [
          "Hay planes gratuitos y de pago. Los precios pueden mostrarse sin impuestos y variar según moneda (MAD, EUR, USD) y ciclo.",
          "Pueden aplicarse impuestos (IVA u equivalentes) según su ubicación.",
          "Podemos cambiar precios con preaviso razonable, aplicables en la siguiente renovación salvo indicación contraria.",
        ],
      },
      {
        id: "stripe",
        title: "4. Pago mediante Stripe",
        paragraphs: [
          "Los pagos los procesa Stripe. Al suscribirse autoriza los cargos recurrentes del ciclo elegido.",
          "Si falla el pago, podemos suspender funciones de pago tras aviso.",
          "Facturas/recibos: portal de facturación o soporte.",
        ],
      },
      {
        id: "cancel",
        title: "5. Baja y reembolsos",
        paragraphs: [
          "Puede cancelar o bajar de plan en cualquier momento; el efecto suele ser al final del periodo ya pagado (véase Política de reembolsos).",
        ],
      },
      {
        id: "acceptable",
        title: "6. Uso aceptable",
        paragraphs: ["Queda prohibido, entre otros:"],
        bullets: [
          "Uso ilegal o lesivo de derechos de terceros.",
          "Acceso no autorizado a datos de otras organizaciones.",
          "Eludir medidas de seguridad o sobrecargar el servicio.",
          "Revender el servicio sin acuerdo escrito o hacer scraping masivo.",
          "Almacenar contenidos ilícitos.",
        ],
      },
      {
        id: "customer-data",
        title: "7. Datos de la clínica",
        paragraphs: [
          "Conserva los derechos sobre los datos que introduce y nos concede una licencia limitada para alojarlos y tratarlos al prestar el servicio.",
          "Garantiza disponer de base legal para tratar datos de propietarios y registros asociados.",
          "Actuamos como encargado; un DPA está disponible bajo petición.",
        ],
      },
      {
        id: "ip",
        title: "8. Propiedad intelectual",
        paragraphs: [
          "El software, la marca VetoCrm, el diseño y la documentación son nuestra propiedad o de licenciantes. Solo se concede licencia de uso del servicio.",
        ],
      },
      {
        id: "liability",
        title: "9. Responsabilidad",
        paragraphs: [
          "VetoCrm es una ayuda de gestión y no sustituye el criterio clínico veterinario.",
          "En la medida permitida por la ley, nuestra responsabilidad agregada se limita a lo efectivamente pagado en los 12 meses anteriores (o 100 € / equivalente en plan gratuito).",
          "No respondemos de daños indirectos (lucro cesante, pérdida de datos por mal uso, fuerza mayor, fallos de terceros).",
        ],
      },
      {
        id: "apps",
        title: "10. Apps / tiendas",
        paragraphs: [
          "Si descarga desde App Store o Google Play, aplican condiciones adicionales de la tienda. En suscripciones facturadas por la tienda, sus reglas de pago/reembolso pueden prevalecer.",
        ],
      },
      {
        id: "law",
        title: "11. Ley aplicable",
        paragraphs: [
          "Salvo normas imperativas de protección, estas Condiciones se rigen por la ley marroquí y los tribunales de Rabat, sin perjuicio de fueros imperativos (p. ej. ciertos litigios B2C en la UE).",
        ],
      },
      {
        id: "contact",
        title: "12. Contacto",
        paragraphs: [`${E.contactEmail} — ${E.website}`],
      },
    ],
  },

  legal: {
    title: "Aviso legal",
    metaDescription: "Aviso legal de VetoCrm — editor, alojamiento, contacto e identificación.",
    lastUpdated: UPDATED,
    intro: "Información de identificación del editor del servicio VetoCrm.",
    sections: [
      {
        id: "publisher",
        title: "1. Editor",
        paragraphs: [
          `Marca / servicio: ${E.brand}`,
          `Denominación: ${E.companyFormalName}`,
          `Web: ${E.website}`,
          `Contacto: ${E.contactEmail}`,
          `Dirección: ${E.address}`,
          `LinkedIn: ${E.linkedin}`,
          `Instagram: ${E.instagram}`,
          "Forma jurídica, capital y registro mercantil: a completar tras la inscripción definitiva. Mientras tanto, el contacto anterior vale para requerimientos legales.",
        ],
      },
      {
        id: "director",
        title: "2. Dirección de la publicación",
        paragraphs: [
          "Director de la publicación: el representante legal del editor, contactable en contact@vetocrm.com.",
        ],
      },
      {
        id: "hosting",
        title: "3. Alojamiento",
        paragraphs: [
          "Aplicación y datos: infraestructura cloud, en particular Supabase (base de datos, auth, almacenamiento) y hosting/CDN del dominio vetocrm.com.",
          "Detalles de región: support@vetocrm.com.",
        ],
      },
      {
        id: "ip",
        title: "4. Propiedad intelectual",
        paragraphs: [
          "Los elementos del sitio y la app están protegidos. Queda prohibida su reproducción no autorizada.",
        ],
      },
      {
        id: "med",
        title: "5. Aviso profesional",
        paragraphs: [
          "VetoCrm es software de gestión para profesionales veterinarios. No es un producto sanitario ni sustituye la pericia clínica.",
        ],
      },
    ],
  },

  cookies: {
    title: "Política de cookies",
    metaDescription: "Política de cookies de VetoCrm — esenciales, preferencias, analítica y consentimiento.",
    lastUpdated: UPDATED,
    intro: `Esta página explica cómo ${E.brand} usa cookies y tecnologías similares en ${E.website} y en la aplicación.`,
    sections: [
      {
        id: "what",
        title: "1. ¿Qué es una cookie?",
        paragraphs: [
          "Una cookie es un pequeño archivo en su dispositivo. Pueden usarse tecnologías similares (local storage, píxeles).",
        ],
      },
      {
        id: "types",
        title: "2. Tipos de cookies",
        bullets: [
          "Esenciales / técnicas: sesión de autenticación, seguridad, balanceo — necesarias para el servicio.",
          "Preferencias: idioma (p. ej. vetocrm-lang), estado de UI (sidebar).",
          "Analíticas (si se activan): medición agregada — con consentimiento si no son estrictamente necesarias.",
          "Marketing (si se activan): solo con consentimiento previo.",
        ],
      },
      {
        id: "manage",
        title: "3. Gestionar opciones",
        paragraphs: [
          "Puede borrar o bloquear cookies en el navegador. Bloquear las esenciales puede impedir el inicio de sesión.",
          "Si hay banner de consentimiento, puede aceptar, rechazar o personalizar las no esenciales.",
        ],
      },
      {
        id: "duration",
        title: "4. Duración",
        paragraphs: [
          "Las de sesión caducan al cerrar el navegador. Las persistentes tienen duración limitada (p. ej. idioma hasta 1 año; sidebar hasta 7 días).",
        ],
      },
      {
        id: "third",
        title: "5. Terceros",
        paragraphs: [
          "Stripe puede depositar cookies en páginas de pago: https://stripe.com/cookies",
          "Proveedores de auth/hosting pueden usar cookies técnicas de seguridad.",
        ],
      },
      {
        id: "contact",
        title: "6. Contacto",
        paragraphs: [`${E.privacyEmail}`],
      },
    ],
  },

  refund: {
    title: "Política de reembolsos y cancelación",
    metaDescription:
      "Cancelación de suscripción y reembolsos VetoCrm vía Stripe y App Store — pruebas, renovaciones y bajadas de plan.",
    lastUpdated: UPDATED,
    intro: `Esta Política complementa las Condiciones y detalla la cancelación y los reembolsos de suscripciones ${E.brand}, incluidos Stripe y tiendas de apps.`,
    sections: [
      {
        id: "cancel",
        title: "1. Cancelación",
        paragraphs: [
          "Puede cancelar en cualquier momento desde facturación/ajustes o escribiendo a support@vetocrm.com.",
          "Salvo indicación contraria, la baja surte efecto al final del periodo ya pagado.",
          "Después puede aplicar un plan gratuito o funciones reducidas según cuotas.",
        ],
      },
      {
        id: "refunds",
        title: "2. Reembolsos (Stripe / web)",
        paragraphs: [
          "Por regla general, los periodos ya iniciados no se reembolsan a prorrata.",
          "Como gesto comercial, puede otorgarse reembolso total en los 14 días siguientes al primer pago de un plan anual si el uso del servicio no ha sido sustancial (caso por caso).",
          "Solicitudes: support@vetocrm.com con el correo de la cuenta y prueba de pago. Los reembolsos Stripe aparecen según los plazos de su banco.",
        ],
      },
      {
        id: "stores",
        title: "3. Compras App Store / Google Play",
        paragraphs: [
          "Si la suscripción se hizo vía Apple o Google, la cancelación y el reembolso los gestiona principalmente la tienda.",
          "VetoCrm no siempre puede reembolsar una compra in-app; podemos orientarle al procedimiento Apple/Google.",
        ],
      },
      {
        id: "trials",
        title: "4. Pruebas y planes gratuitos",
        paragraphs: [
          "Las pruebas gratuitas, si existen, se convierten en pago salvo cancelación antes del fin. Los planes gratuitos no dan derecho a reembolso.",
        ],
      },
      {
        id: "chargebacks",
        title: "5. Controversias de pago",
        paragraphs: [
          "Antes de un chargeback bancario, contacte a soporte. Los abusos pueden conllevar suspensión de la cuenta.",
        ],
      },
      {
        id: "contact",
        title: "6. Contacto facturación",
        paragraphs: [`${E.supportEmail} — ${E.website}`],
      },
    ],
  },
};
