module['exports']= {
    items: ['{address:getBuildingNumber} {address:getStreet}, {city:getCity} {address:getPostcode} {country:getDefaultCountry}'],
    postcodes: ['#####','#######'],
    building_numbers: ['#', '##', '###'],
    states: ["חיפה","רמת הגולן","הגדה המערבית","שומרון","השרון","יהודה","הנגב","השפלה","הערבה"],
    streets: ["{name:getFirstName} {address:street_suffix}", "{name:getSurName} {address:street_suffix}"],
    street_suffix: ["סִמטָה","שְׁדֵרָה","ענף","לְגַשֵׁר","נַחַל","ברוקס","בורג","בורגס","לַעֲקוֹף","מַחֲנֶה","קֶנִיוֹן","כַּף","שְׁבִיל","מֶרְכָּז","מרכזים","מעגל","מעגלים","צוּק","צוקים","מוֹעֲדוֹן","מְשׁוּתָף","פינה","פינות"]
}
