# components/zbulime/ — Komponentët e faqes Zbulime

**Qëllimi:** Paraqitja e lidhjeve mes moduleve që kthen `GET /insights`.

**Përmban:**
- `InsightCard.tsx` — `rp-card` për një `Insight`: ikonë sipas `kind`
  (`sleep_spend→IconMoon`, `weekday_spend→IconReceipt`, `payday_window→IconBanknote`,
  `fitness_habits→IconActivity`), `title` i theksuar, `detail` në `text-text-mid`, dhe
  një etiketë besueshmërie (pikë ngjyre + tekst: e ulët/gri, mesatare/accent,
  e lartë/success) plus `{data_points} pika` në mono.

**Lidhet me:** `lib/api` (`Insight`), `lib/cn`, `components/icons`.
