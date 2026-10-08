export type Lang = "fr" | "en" | "es";
export const REPLY_TO_EMAIL = "contact@vetocrm.com";

type Copy = {
  subject: string;
  eyebrow: string;
  title: string;
  intro: string;
  detail: string;
  cta: string;
  hello: string;
  linkFallback: string;
  autoNote: string;
  ignoreNote: string;
  footerTag: string;
};

export const COPY: Record<Lang, Record<string, Copy>> = {
  fr: {
    signup: {
      subject: "Confirmez votre compte VetoCrm",
      eyebrow: "Bienvenue",
      title: "Activez votre espace clinique",
      intro:
        "Merci de rejoindre VetoCrm, le CRM pensé pour les vétérinaires. Une dernière étape : confirmez votre adresse e-mail pour sécuriser votre clinique.",
      detail:
        "Après confirmation, vous pourrez gérer clients, patients, rendez-vous, consultations, vaccins et plus encore.",
      cta: "Confirmer mon e-mail",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
    recovery: {
      subject: "Réinitialisation du mot de passe — VetoCrm",
      eyebrow: "Sécurité",
      title: "Réinitialisez votre mot de passe",
      intro:
        "Vous avez demandé à réinitialiser le mot de passe de votre compte VetoCrm. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
      detail: "Ce lien est temporaire et à usage unique pour protéger votre clinique.",
      cta: "Choisir un nouveau mot de passe",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
    invite: {
      subject: "Invitation à rejoindre une clinique — VetoCrm",
      eyebrow: "Invitation",
      title: "Vous êtes invité(e) sur VetoCrm",
      intro:
        "Une clinique vous invite à rejoindre son équipe sur VetoCrm. Acceptez l’invitation pour accéder à l’espace partagé.",
      detail: "Vous pourrez ensuite vous connecter avec vos identifiants.",
      cta: "Accepter l’invitation",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
    magiclink: {
      subject: "Votre lien de connexion VetoCrm",
      eyebrow: "Connexion",
      title: "Connectez-vous en un clic",
      intro: "Voici votre lien magique pour accéder à votre espace clinique VetoCrm.",
      detail: "Si vous n’avez pas demandé ce lien, ignorez cet e-mail.",
      cta: "Accéder à mon espace",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
    email_change: {
      subject: "Confirmez votre nouvelle adresse e-mail — VetoCrm",
      eyebrow: "Compte",
      title: "Confirmez le changement d’e-mail",
      intro:
        "Une demande de changement d’adresse e-mail a été initiée sur votre compte VetoCrm. Confirmez pour finaliser la modification.",
      detail: "Sans confirmation, votre adresse actuelle reste inchangée.",
      cta: "Confirmer mon e-mail",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
    reauthentication: {
      subject: "Code de vérification VetoCrm",
      eyebrow: "Vérification",
      title: "Votre code de sécurité",
      intro: "Utilisez le code ci-dessous pour confirmer cette action sensible sur VetoCrm.",
      detail: "Ne partagez jamais ce code. Il expire rapidement.",
      cta: "Code de vérification",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
    default: {
      subject: "Notification VetoCrm",
      eyebrow: "VetoCrm",
      title: "Action requise",
      intro: "Cliquez sur le bouton ci-dessous pour continuer.",
      detail: "",
      cta: "Continuer",
      hello: "Bonjour",
      linkFallback: "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
      autoNote: `Cet e-mail est envoyé automatiquement. Pour nous joindre : ${REPLY_TO_EMAIL}.`,
      ignoreNote:
        "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — aucun changement ne sera effectué.",
      footerTag: "CRM vétérinaire pour cliniques et cabinets",
    },
  },
  en: {
    signup: {
      subject: "Confirm your VetoCrm account",
      eyebrow: "Welcome",
      title: "Activate your clinic workspace",
      intro:
        "Thanks for joining VetoCrm, the CRM built for veterinarians. One last step: confirm your email to secure your clinic.",
      detail:
        "After confirmation you can manage clients, patients, appointments, consultations, vaccines and more.",
      cta: "Confirm my email",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
    recovery: {
      subject: "Reset your VetoCrm password",
      eyebrow: "Security",
      title: "Reset your password",
      intro:
        "You requested a password reset for your VetoCrm account. Click the button below to choose a new password.",
      detail: "This link is temporary and single-use to protect your clinic.",
      cta: "Choose a new password",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
    invite: {
      subject: "Invitation to join a clinic — VetoCrm",
      eyebrow: "Invitation",
      title: "You’re invited to VetoCrm",
      intro: "A clinic invited you to join their team on VetoCrm. Accept to access the shared workspace.",
      detail: "You can then sign in with your credentials.",
      cta: "Accept invitation",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
    magiclink: {
      subject: "Your VetoCrm sign-in link",
      eyebrow: "Sign in",
      title: "Sign in with one click",
      intro: "Here’s your magic link to access your VetoCrm clinic workspace.",
      detail: "If you didn’t request this link, ignore this email.",
      cta: "Open my workspace",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
    email_change: {
      subject: "Confirm your new email — VetoCrm",
      eyebrow: "Account",
      title: "Confirm email change",
      intro: "An email change was requested on your VetoCrm account. Confirm to finish the update.",
      detail: "Without confirmation, your current email stays unchanged.",
      cta: "Confirm my email",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
    reauthentication: {
      subject: "VetoCrm verification code",
      eyebrow: "Verification",
      title: "Your security code",
      intro: "Use the code below to confirm this sensitive action on VetoCrm.",
      detail: "Never share this code. It expires quickly.",
      cta: "Verification code",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
    default: {
      subject: "VetoCrm notification",
      eyebrow: "VetoCrm",
      title: "Action required",
      intro: "Click the button below to continue.",
      detail: "",
      cta: "Continue",
      hello: "Hello",
      linkFallback: "If the button doesn’t work, copy this link into your browser:",
      autoNote: `This email was sent automatically. Contact us at ${REPLY_TO_EMAIL}.`,
      ignoreNote: "If you didn’t request this, ignore this email — nothing will change.",
      footerTag: "Veterinary CRM for clinics and practices",
    },
  },
  es: {
    signup: {
      subject: "Confirme su cuenta VetoCrm",
      eyebrow: "Bienvenido",
      title: "Active su espacio de clínica",
      intro:
        "Gracias por unirse a VetoCrm, el CRM pensado para veterinarios. Un último paso: confirme su correo para proteger su clínica.",
      detail:
        "Tras la confirmación podrá gestionar clientes, pacientes, citas, consultas, vacunas y más.",
      cta: "Confirmar mi correo",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
    recovery: {
      subject: "Restablecer contraseña — VetoCrm",
      eyebrow: "Seguridad",
      title: "Restablezca su contraseña",
      intro:
        "Solicitó restablecer la contraseña de su cuenta VetoCrm. Pulse el botón para elegir una nueva.",
      detail: "Este enlace es temporal y de un solo uso para proteger su clínica.",
      cta: "Elegir una nueva contraseña",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
    invite: {
      subject: "Invitación a una clínica — VetoCrm",
      eyebrow: "Invitación",
      title: "Está invitado a VetoCrm",
      intro: "Una clínica le invita a unirse a su equipo en VetoCrm. Acepte para acceder al espacio compartido.",
      detail: "Después podrá iniciar sesión con sus credenciales.",
      cta: "Aceptar invitación",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
    magiclink: {
      subject: "Su enlace de acceso VetoCrm",
      eyebrow: "Acceso",
      title: "Inicie sesión con un clic",
      intro: "Aquí tiene su enlace mágico para acceder a su espacio clínico VetoCrm.",
      detail: "Si no solicitó este enlace, ignore este correo.",
      cta: "Abrir mi espacio",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
    email_change: {
      subject: "Confirme su nuevo correo — VetoCrm",
      eyebrow: "Cuenta",
      title: "Confirme el cambio de correo",
      intro: "Se solicitó un cambio de correo en su cuenta VetoCrm. Confirme para finalizarlo.",
      detail: "Sin confirmación, su correo actual no cambia.",
      cta: "Confirmar mi correo",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
    reauthentication: {
      subject: "Código de verificación VetoCrm",
      eyebrow: "Verificación",
      title: "Su código de seguridad",
      intro: "Use el código siguiente para confirmar esta acción sensible en VetoCrm.",
      detail: "No comparta este código. Caduca pronto.",
      cta: "Código de verificación",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
    default: {
      subject: "Notificación VetoCrm",
      eyebrow: "VetoCrm",
      title: "Acción requerida",
      intro: "Pulse el botón para continuar.",
      detail: "",
      cta: "Continuar",
      hello: "Hola",
      linkFallback: "Si el botón no funciona, copie este enlace en su navegador:",
      autoNote: `Este correo se envió automáticamente. Contáctenos en ${REPLY_TO_EMAIL}.`,
      ignoreNote: "Si no solicitó esto, ignore el correo: no se realizará ningún cambio.",
      footerTag: "CRM veterinario para clínicas y consultorios",
    },
  },
};


