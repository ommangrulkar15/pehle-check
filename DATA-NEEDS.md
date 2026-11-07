# What real price estimates need

The site runs on a demo dataset (`COMPS` in `js/price.js`). Those numbers are invented. No live source is connected, so no real estimate exists yet.

## Needed before any estimate is live
- An authorized source of **completed sale prices** for used phones in India (partner feed, licensed dataset or own transaction log). Asking prices alone are not enough. They stay a separate, reference-only series.
- Per record: exact model, storage, condition grade, battery health band, repair history, accessories, city, price, price type (sold or asking), sale date.
- Freshness rule (suggest: sales from the last 30 to 60 days) and a minimum comparable count per model, storage and city (the demo uses 5 completed sales).
- City-level data. The demo is not city-specific, and the form only records the city.
- Real adjustment factors (age, condition, battery, repairs, accessories) fitted from data. The demo factors in `OPT` are placeholders.

## Not connected, so never shown as verified
- IMEI status, account lock, network lock, EMI or device-finance lock. These are buyer-checked answers only. The page says "No official verification is connected".

## AI
- No AI service is called. The listing paste box is a regex parser in the browser. The explanation text is a template.
- If an AI service is added later: send only enum values (model, storage, condition bands). Never send IMEI, serial numbers, seller contact details or the raw listing. Rupee values always come from `est()`, never from a model.
