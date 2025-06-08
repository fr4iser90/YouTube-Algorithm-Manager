# Aufgabenplan: Webapp "Train Algorithm" – Tab-Öffnung & Extension-Integration

## Ziel
Beim Klick auf "Train Algorithm" in der Webapp soll automatisch ein neuer Tab mit YouTube geöffnet werden. Die Browser-Extension übernimmt im neuen Tab das Training. Headless-Training ist im User-Browser nicht möglich, sondern nur über externe Automatisierung (z.B. Puppeteer).

---

## Aufgaben

1. **Webapp: Tab-Öffnung implementieren**
   - Im Event-Handler für "Train Algorithm" (`handleTrainPreset` oder entsprechende Komponente) per `window.open('https://www.youtube.com', '_blank')` einen neuen Tab öffnen.
   - Optional: Preset-Parameter als URL-Query anhängen, falls die Extension diese auslesen kann.

2. **Extension-Trigger im neuen Tab**
   - Sicherstellen, dass die Extension im neuen Tab automatisch das Training startet, sobald YouTube geladen ist.
   - Falls nötig: Mechanismus implementieren, damit die Extension erkennt, dass sie im neuen Tab aktiv werden soll (z.B. über Storage, BroadcastChannel oder URL-Parameter).

3. **User-Feedback**
   - In der Webapp nach Klick auf "Train Algorithm" eine Info anzeigen: "YouTube-Tab wurde geöffnet. Das Training startet automatisch, sobald die Extension aktiv ist."
   - Fehlerbehandlung: Falls die Extension nicht installiert ist, klaren Hinweis anzeigen.

4. **Headless-Option (nur für Entwickler/Server)**
   - Hinweis in der UI oder Doku: Headless-Training ist nur mit externen Tools wie Puppeteer/Selenium möglich, nicht im User-Browser.
   - Optional: Link zu Beispielskript oder Doku für Headless-Training ergänzen.

---

5. **Headless-Option aus User-UI und Typen entfernen**
   - In allen UI-Komponenten, Settings und Typen, die für Endnutzer bestimmt sind, die Headless-Option entfernen.
   - Nur in dedizierten Automatisierungs-Skripten (z.B. für Entwickler/Server) darf die Option erhalten bleiben.
   - In der Doku/README klarstellen, dass Headless nur für Entwickler/Server relevant ist.

---

## Hinweise & Limitationen

- **Browser-Extension:** Kann nicht headless arbeiten, sondern läuft immer sichtbar im User-Browser.
- **Automatisierung:** Headless-Training ist nur außerhalb des User-Browsers möglich (Node.js, Puppeteer, etc.).
- **Sicherheit:** Die Extension darf nur auf YouTube und die eigene Webapp zugreifen, keine anderen Seiten automatisieren.
- **Kompatibilität:** Tab-Öffnung funktioniert in allen modernen Browsern, kann aber durch Popup-Blocker verhindert werden.

---

## Technischer Hintergrund

- Die Webapp steuert das User-Training, indem sie einen neuen Tab öffnet und die Extension im Tab das Training übernimmt.
- Headless-Optionen im Code sind für Entwickler/Server gedacht, nicht für Endnutzer.
- Die Extension kann über Storage, BroadcastChannel oder URL-Parameter mit der Webapp kommunizieren.

---

**Nächste Schritte:**  
- [ ] Tab-Öffnung in der Webapp implementieren  
- [ ] Extension-Trigger im neuen Tab sicherstellen  
- [ ] User-Feedback ergänzen  
- [ ] Hinweise zu Headless/Automatisierung dokumentieren  
- [ ] Headless-Option aus User-UI und Typen entfernen
