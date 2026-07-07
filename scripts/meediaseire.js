// Meediaseire ja analüüsi skript
function seiraUudiseid() {
  const apiKey = "SISESTA_SIA_GEMINI_API_VOTI"; 
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rssUrl = "https://www.err.ee/rss"; 

  const response = UrlFetchApp.fetch(rssUrl);
  const xml = XmlService.parse(response.getContentText());
  const entries = xml.getRootElement().getChild('channel').getChildren('item');

  for (let i = 0; i < Math.min(5, entries.length); i++) {
    let title = entries[i].getChildText('title');
    let link = entries[i].getChildText('link');
    
    // Siia saab lisada kontrolli, kas link on juba tabelis
    let aiVastus = kusiGemini(title, apiKey);
    sheet.appendRow([new Date(), title, link, aiVastus]);
  }
}
