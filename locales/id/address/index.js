module['exports']= {
    items: ['{address:getStreet} no {address:getBuildingNumber}, {city:getCity} {address:getPostcode} {country:getDefaultCountry}'],
    postcodes: ['#####'],
    building_numbers: ['#', '##'],
    states: ["Aceh","Sumatera Utara","Sumatera Barat","Jambi","Bangka Belitung","Riau","Kepulauan Riau","Bengkulu","Sumatera Selatan","Lampung","Banten","DKI Jakarta","Jawa Barat","Jawa Tengah","Jawa Timur","Nusa Tenggara Timur","DI Yogyakarta","Bali","Nusa Tenggara Barat","Kalimantan Barat","Kalimantan Tengah","Kalimantan Selatan","Kalimantan Timur","Kalimantan Utara","Sulawesi Selatan","Sulawesi Utara","Gorontalo","Sulawesi Tengah","Sulawesi Barat","Sulawesi Tenggara","Maluku","Maluku Utara","Papua Barat","Papua"],
    streets: ["{address:street_prefix} {name:getFirstName}", "{address:street_prefix} {name:getSurName}"],
    street_prefix: ["Ds.","Dk.","Gg.","Jln.","Jr.","Kpg.","Ki.","Psr."]
}
