module['exports']= {
    items: ['{address:getStreet} {address:getBuildingNumber}, {city:getCity} {address:getPostcode} {country:getDefaultCountry}'],
    postcodes: ['##-###'],
    building_numbers: ['###', '####', '#####'],
    states: ["Dolnośląskie","Kujawsko-pomorskie","Lubelskie","Lubuskie","Łódzkie","Małopolskie","Mazowieckie","Opolskie","Podkarpackie","Podlaskie","Pomorskie","Śląskie","Świętokrzyskie","Warmińsko-mazurskie","Wielkopolskie","Zachodniopomorskie"],
    streets: ["{address:street_prefix} {name:getSurName}"],
    street_prefix: ["ul.","al."]
}
