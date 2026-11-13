import type { ReactNode } from "react";
import { ENTREPRISE } from "./config/entreprise";
import { Entete, Pied } from "./components/Cadre";

const A_COMPLETER = <mark className="rounded bg-orange px-1 text-encre">à compléter</mark>;
const val = (v: string) => (v ? v : A_COMPLETER);

function Page({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <>
      <Entete />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <p className="pt-6">
          <a className="lien text-[0.95rem]" href="./">
            Retour au calculateur
          </a>
        </p>
        <h1 className="titre mt-5 text-[clamp(2.4rem,9vw,3.6rem)]">{titre}</h1>
        <div className="carte mt-8 space-y-6 p-5 text-[1.02rem] leading-relaxed text-craie/90 sm:p-8 [&_h2]:titre [&_h2]:text-[1.3rem] [&_h2]:text-craie [&_li]:marker:text-orange [&_p]:max-w-[68ch] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
          {children}
        </div>
      </main>
      <Pied />
    </>
  );
}

export function MentionsLegales() {
  const l = ENTREPRISE.legal;
  return (
    <Page titre="Mentions légales">
      <section>
        <h2>Éditeur du site</h2>
        <ul>
          <li>Nom : {val(l.raisonSociale)}</li>
          {l.formeJuridique && <li>Forme juridique : {l.formeJuridique}</li>}
          <li>Adresse : {val(l.adresseSiege)}</li>
          <li>Numéro d'entreprise (BCE) : {val(l.numeroEntreprise)}</li>
          <li>TVA : {l.numeroTVA || "non assujetti"}</li>
          <li>
            Téléphone : {ENTREPRISE.telephoneAffiche}, e-mail : {ENTREPRISE.email}
          </li>
        </ul>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>Le site est hébergé par one.com (www.one.com).</p>
      </section>
      <section>
        <h2>Prix affichés</h2>
        <p>
          Les prix donnés par le calculateur sont des estimations établies automatiquement à partir de notre grille tarifaire et de
          la distance par la route. Ils sont confirmés par {ENTREPRISE.nom} avant toute prestation. Une demande envoyée par
          WhatsApp ou SMS ne vaut pas réservation tant qu'elle n'a pas été confirmée.
        </p>
      </section>
      <section>
        <h2>Cartographie</h2>
        <p>
          Les adresses et distances proviennent des données OpenStreetMap (© contributeurs OpenStreetMap, licence ODbL), via les
          services Photon et OSRM.
        </p>
      </section>
    </Page>
  );
}

export function Confidentialite() {
  return (
    <Page titre="Vie privée">
      <section>
        <h2>En bref</h2>
        <p>
          Ce site n'utilise ni cookies, ni outil de statistiques, ni publicité. Il n'enregistre aucune donnée : le calcul du prix se
          fait dans votre navigateur. Vos informations ne nous parviennent que si vous nous envoyez vous-même votre demande par
          WhatsApp, SMS ou téléphone.
        </p>
      </section>
      <section>
        <h2>Responsable du traitement</h2>
        <p>
          {ENTREPRISE.legal.raisonSociale}, {ENTREPRISE.legal.adresseSiege || A_COMPLETER}. Contact : {ENTREPRISE.email}.
        </p>
      </section>
      <section>
        <h2>Quelles données, pourquoi</h2>
        <ul>
          <li>
            <strong>Votre position GPS</strong>, seulement si vous touchez « Utiliser ma position ». Elle sert à trouver l'adresse
            d'enlèvement.
          </li>
          <li>
            <strong>Les adresses tapées</strong> sont envoyées au service Photon (komoot, Allemagne) pour proposer les adresses, puis au
            service de calcul d'itinéraire OSRM pour mesurer la distance. Ces services ne reçoivent ni votre nom, ni votre numéro.
          </li>
          <li>
            <strong>Votre demande</strong> (adresses, date, prénom, précisions, numéro de téléphone) nous parvient quand vous l'envoyez
            par WhatsApp ou SMS. Nous l'utilisons uniquement pour organiser le transport et vous recontacter.
          </li>
        </ul>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>
          Les demandes sans suite sont supprimées après 12 mois. Les données liées à une prestation réalisée sont conservées le temps
          imposé par nos obligations comptables.
        </p>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>
          Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à {ENTREPRISE.email}. Si vous
          estimez que vos droits ne sont pas respectés, vous pouvez contacter l'Autorité de protection des données
          (autoriteprotectiondonnees.be).
        </p>
      </section>
    </Page>
  );
}
