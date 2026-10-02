export const UsloviKoriscenja = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-bold mb-6">Uslovi Korišćenja i Rezervacija</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Podaci o pružaocu usluga</h2>
        <ul className="space-y-1 text-slate-600">
          <li><strong>Puni naziv:</strong> Nada Šakan PR Dečja radionica i igraonica BAMBINO Novi Sad</li>
          <li><strong>Matični broj:</strong> 66785963</li>
          <li><strong>PIB:</strong> 113385301</li>
          <li><strong>Adresa sedišta:</strong> Veselina Masleše 32A, 21000 Novi Sad</li>
          <li><strong>Kontakt telefon:</strong> 021 382 7595 / 065 271 2676</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Rezervacija termina i uplaćivanje depozita</h2>
        <p className="text-slate-600 mb-2">
          Termin se smatra zvanično rezervisanim nakon uplate depozita u roku od <strong>7 dana</strong> od dana dogovora. 
          Ukoliko uplata depozita ne bude izvršena u navedenom roku, Igraonica Bambino zadržava pravo da termin ponudi drugom korisniku.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Otkazivanje i pomeranje termina</h2>
        <p className="text-slate-600 mb-2">
          Uplaćeni depozit služi kao potvrda rezervacije i <strong>ne vraća se</strong> u slučaju otkazivanja proslave od strane korisnika.
        </p>
        <p className="text-slate-600">
          Pomeranje termina proslave moguće je <strong>jednom</strong>, uz prethodni dogovor i u zavisnosti od raspoloživosti slobodnih termina, ukoliko nas obavestite najmanje <strong>7 dana unapred</strong>.
        </p>
      </section>
    </div>
  );
};