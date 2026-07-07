function seiraUudiseid() {
  // Loeme võtme turvalisest Script Properties alast
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    throw new Error("API võti puudub! Palun sisesta see Script Properties alla.");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rssUrl = "https://www.err.ee/rss"; 

  const response = UrlFetchApp.fetch(rssUrl);
  const xml = XmlService.parse(response.getContentText());
  const entries = xml.getRootElement().getChild('channel').getChildren('item');

  for (let i = 0; i < Math.min(5, entries.length); i++) {
    let title = entries[i].getChildText('title');
    let link = entries[i].getChildText('link');
    
    // Kontrollime, et topelt ei lisaks (eeldab, et link on C-veerus)
    let data = sheet.getDataRange().getValues();
    let olemas = data.some(row => row[2] === link);

    if (!olemas) {
      let aiVastus = kusiGemini(title, apiKey);
      sheet.appendRow([new Date(), title, link, aiVastus]);
    }
  }
}

function kusiGemini(tekst, apiKey) {
  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  
  const prompt = "Oled ekspert. Analüüsi uudist: '" + tekst + "'. 1) Mõju noortele (1 lause). 2) Tonaalsus. Vasta: Mõju | Tonaalsus";

  const payload = {
    "contents": [{ "parts": [{ "text": prompt }] }]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const res = UrlFetchApp.fetch(apiUrl, options);
  const json = JSON.parse(res.getContentText());
  
  return json.candidates[0].content.parts[0].text;
}
