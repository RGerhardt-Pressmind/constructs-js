# constructs.js - creates extremely large amount of random data for browser and node.js

## Demo
[https://rgerhardt-pressmind.github.io/constructs-js](https://rgerhardt-pressmind.github.io/constructs-js)

[![npm version](https://badge.fury.io/js/constructs-js.svg)](https://www.npmjs.com/package/constructs-js)
![locales](https://img.shields.io/badge/locales%20available-21-blue)

## Table of contents

- [Demo](#demo)
- [Introduction](#introduction)
  * [Browser](#browser)
  * [NodeJS](#nodejs)
  * [Angular 2+](#angular-2-)
  * [locales available](#locales-available)
- [Usage template](#usage-template)
  * [Example](#example)
  * [Output](#output)
- [API](#api)
  * [Standalone](#standalone)
    + [address](#address)
      - [getAddress](#getaddress)
      - [getStreet](#getstreet)
      - [getBuildingNumber](#getbuildingnumber)
      - [getPostcode](#getpostcode)
      - [getState](#getstate)
    + [city](#city)
      - [getCity](#getcity)
      - [getPrefix](#getprefix)
      - [getSuffix](#getsuffix)
    + [company](#company)
      - [getCompany](#getcompany)
      - [getSuffix](#getsuffix-1)
    + [country](#country)
      - [getCountry](#getcountry)
      - [getDefaultCountry](#getdefaultcountry)
    + [email](#email)
      - [getEmail](#getemail)
      - [getSuffix](#getsuffix-2)
    + [image](#image)
      - [getImage](#getimage)
        * [Animal](#animal)
        * [Avatar](#avatar)
        * [City](#city)
        * [Human](#human)
        * [Nature](#nature)
        * [Technic](#technic)
    + [loremIpsum](#loremipsum)
      - [getWords](#getwords)
    + [name](#name)
      - [getName](#getname)
      - [getFirstName](#getfirstname)
      - [getSurName](#getsurname)
      - [getSalutation](#getsalutation)
      - [getTitle](#gettitle)
    + [phone](#phone)
      - [getCellPhoneNumber](#getcellphonenumber)
      - [getPhoneNumber](#getphonenumber)
  * [Template](#template)
  * [Template masks](#template-masks)
  * [Module functions](#module-functions)
    + [Global modules](#global-modules)
      - [[id]](#-id-)
      - [[date]](#-date-)
      - [[datetime]](#-datetime-)
      - [[diffYearNow]](#-diffyearnow-)
    + [address](#address-1)
      - [[address:getAddress]](#-address-getaddress-)
      - [[address:getStreet]](#-address-getstreet-)
      - [[address:getBuildingNumber]](#-address-getbuildingnumber-)
      - [[address:getPostcode]](#-address-getpostcode-)
      - [[address:getState]](#-address-getstate-)
    + [city](#city-1)
      - [[city:getCity]](#-city-getcity-)
      - [[city:getPrefix]](#-city-getprefix-)
      - [[city:getSuffix]](#-city-getsuffix-)
    + [company](#company-1)
      - [[company:getCompany]](#-company-getcompany-)
      - [[company:getSuffix]](#-company-getsuffix-)
    + [country](#country-1)
      - [[country:getCountry]](#-country-getcountry-)
      - [[country:getDefaultCountry]](#-country-getdefaultcountry-)
    + [email](#email-1)
      - [[email:getEmail]](#-email-getemail-)
      - [[email:getSuffix]](#-email-getsuffix-)
    + [[image]](#-image-)
      - [[image:getImage]](#-image-getimage-)
      - [[image:getAvatarImage]](#-image-getavatarimage-)
      - [[image:getAnimalImage]](#-image-getanimalimage-)
      - [[image:getCityImage]](#-image-getcityimage-)
      - [[image:getHumanImage]](#-image-gethumanimage-)
      - [[image:getNatureImage]](#-image-getnatureimage-)
      - [[image:getTechnicImage]](#-image-gettechnicimage-)
    + [loremIpsum](#loremipsum-1)
      - [[loremIpsum:getWords]](#-loremipsum-getwords-)
    + [name](#name-1)
      - [[name:getName]](#-name-getname-)
      - [[name:getFirstName]](#-name-getfirstname-)
      - [[name:getSurName]](#-name-getsurname-)
      - [[name:getSalutation]](#-name-getsalutation-)
      - [[name:getTitle]](#-name-gettitle-)
    + [phone](#phone-1)
      - [[phone:getPhoneNumber]](#-phone-getphonenumber-)
      - [[phone:getCellPhoneNumber]](#-phone-getcellphonenumber-)

## Introduction

### Browser

Download [latest stable](https://github.com/RGerhardt-Pressmind/constructs-js/releases/latest) version.

```html
<script src = "dist/constructs.min.js" type = "text/javascript"></script>
<script>
    var constructs = new constructs("de"); // de = locale (fallback locale is "de")

    let uniqFirstName = constructs.name.getFirstName(); // Maik
    let uniqSurName   = constructs.name.getSurName(); // Raschel
    let uniqEmail     = constructs.email.getEmail(); // max@gmail.com
</script>
```

### NodeJS

Install
```
npm install constructs-js --save
```

Usage

```javascript
const Constructs    =   require('./construct');
let construct      =   new Constructs('de'); // de = locale (fallback locale is "de")

let first_name = constructs.name.getFirstName();
let sur_name   = constructs.name.getSurName();
let email      = constructs.email.getEmail();
```

### Angular 2+

Install
```
npm install constructs-js --save
```

Usage

Add the constructs.min.js in the angular.json at the scripts block
```json
{
  "scripts": [
    "node_modules/constructs-js/dist/constructs.min.js"
  ]
}
```

Test e.g. in the app.component.ts if the script is reachable:

```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() {
    let constructs = window['constructs']('de');
    
    console.log('First name: '+constructs.name.getFirstName());
  }
}
```

### locales available
- **af_ZA** _(South Africa)_
- **ar** _(Argentina)_
- **az** _(Azerbaijan)_
- **cz** _(Czech Republic)_
- **de** _(Germany - **Fallback locale**)_
- **de_AT** _(Austria)_
- **de_CH** _(Switzerland)_
- **en** _(United States of America)_
- **en_GB** _(United Kingdom)_
- **es** _(Spain)_
- **fr** _(France)_
- **ge** _(Georgia)_
- **gr** _(Greece)_
- **hr** _(Croatia)_
- **id** _(Indonesia)_
- **il** _(Israel)_
- **ir** _(Iran)_
- **it** _(Italia)_
- **jp** _(Japan)_
- **lv** _(Latvia)_
- **pl** _(Poland)_

## Usage template

constructs.js can generate multiple random data at once based on object templates. These data packages can then be used e.g. for grids or displays.

### Example
```javascript
let template = {
    name: "Example template",
    structure: [
        {
            name: "id",
            mask: "[id]"
        },
        {
            name: "first_name",
            mask: "[name:getFirstName]"
        },
        {
            name: "sur_name",
            mask: "[name:getSurName]"
        },
        {
            name: "name",
            mask: "{first_name} {sur_name}" // Merge field content from {"name": "first_name"} and {"name": "sur_name"}
        },
        {
            name: "birthday",
            mask: "[date(1990-01-01, 1970-01-01)]" // Generate date from 01.01.1970 and 01.01.1990
        },
        {
            name: "age",
            mask: "[diffYearNow({birthday})]" // Returns the difference in years from the field content {"name": "birthday"} returns
        },
        {
            name: "created_date",
            mask: "[datetime]"
        }
    ],
    output: {
        result: "output", // Use for API (Allowed: output, insert)
        type: "json", // Result json object (Allowed: json, xml)
        limit: 5 // Generate 5 items
    }
};

let generatedData = constructs.generateUniqData(template);

console.log(generatedData);
```

### Output

```json
[
  {
    "id": 99848,
    "first_name": "Henrik",
    "sur_name": "Ranz",
    "name": "Henrik Ranz",
    "birthday": "1979-03-08",
    "age": 42,
    "created_date": "2014-10-28 19:19:09"
  },
  {
    "id": 52560,
    "first_name": "Timothy",
    "sur_name": "Frantz",
    "name": "Timothy Frantz",
    "birthday": "1981-03-14",
    "age": 40,
    "created_date": "2007-07-25 16:11:18"
  },
  {
    "id": 232936,
    "first_name": "Elli",
    "sur_name": "Behrenbruch",
    "name": "Elli Behrenbruch",
    "birthday": "1971-09-06",
    "age": 50,
    "created_date": "2012-04-30 11:14:32"
  },
  {
    "id": 500971,
    "first_name": "Lennart",
    "sur_name": "Fink",
    "name": "Lennart Fink",
    "birthday": "1983-04-06",
    "age": 38,
    "created_date": "2010-03-30 15:40:03"
  },
  {
    "id": 34174,
    "first_name": "Darleen",
    "sur_name": "Töpfer",
    "name": "Darleen Töpfer",
    "birthday": "1973-06-28",
    "age": 48,
    "created_date": "2017-01-18 04:24:38"
  }
]
```

## API

### Standalone

#### address

##### getAddress
Generate random address. The structure of the address depends on the respective locale.
```javascript
let address = constructs.address.getAddress();
```
```
Am Neuenhof 53a, Baryllastadt 82559 Deutschland
Am Nonnenbruch 716, Nord Tillmannscheid 97817 Deutschland
Karlstr. 42b, Süd Emrescheid 07554 Deutschland
```

##### getStreet
Returns a random street based on the locale.
```javascript
let street      = constructs.address.getStreet();
```
```
Friedrich-List-Str.
Am Knechtsgraben
Montanusstr.
```

##### getBuildingNumber
Generates a building number based on the defined scheme in locale.
```javascript
let building_number = constructs.address.getBuildingNumber();
```
```
244
997b
520a
```

##### getPostcode
Returns a random zip code based on the locale.
```javascript
let postcode      = constructs.address.getPostcode();
```
```
03884
57392
82411
```

##### getState
Returns a random state based on the locale.
```javascript
let state      = constructs.address.getState();
```
```
Thüringen
Bremen
Niedersachsen
```

#### city

##### getCity
Generates a fictitious city name based on the first name and last name list from the locales.
```javascript
let city = constructs.city.getCity();
```
```
Jankescheid
Davinburg
Gregerdorf
```

##### getPrefix
Returns a random prefix from the locale.
```javascript
let city_prefix = constructs.city.getPrefix();
```
```
Nord
Ost
West
```

##### getSuffix
Returns a random suffix from the locale.
```javascript
let city_suffix = constructs.city.getSuffix();
```
```
stadt
dorf
land
```

#### company

##### getCompany
Generates a fictitious company name based on the first name and last name list from locales.
```javascript
let company = constructs.company.getCompany();
```
```
Loogen GmbH
Wartenberg, Helm und Többen
Noack GmbH & Co KG
```

##### getSuffix
Returns a random prefix from the locale.
```javascript
let company_suffix = constructs.company.getSuffix();
```
```
GmbH
GbR
AG
```

#### country

##### getCountry
Returns a random country which is stored in locale
```javascript
let country = constructs.country.getCountry();
```
```
Italien
```

##### getDefaultCountry
Returns the default country
```javascript
let country_default = constructs.country.getDefaultCountry();
```
```
Deutschland
```

#### email

##### getEmail
Returns a random email address based on a random last name from the locale and a random defined domain.
```javascript
let email = constructs.email.getEmail();
```
```
micha@gmail.com
frenke@yahoo.com
```

##### getSuffix
Returns a random suffix from the locale.
```javascript
let email_suffix = constructs.email.getSuffix();
```
```
@gmail.com
@yahoo.com
```
#### image

##### getImage
Returns a random image based on the type in the local. By default the type "avatar" is set.  The images have a maximum size of 500x500 pixels.
```javascript
let animal  = constructs.image.getAnimalImage(); // or .image.getImage({type: 'animal'})
let avatar  = constructs.image.getAvatarImage(); // or .image.getImage({type: 'avatar'})
let city    = constructs.image.getCityImage(); // or .image.getImage({type: 'city'})
let human   = constructs.image.getHumanImage(); // or .image.getImage({type: 'human'})
let nature  = constructs.image.getNatureImage(); // or .image.getImage({type: 'nature'})
let technic = constructs.image.getTechnicImage(); // or .image.getImage({type: 'technic'})
```

###### Animal
<img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/animal/15.jpg">

###### Avatar
<img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/avatar/33.jpg">

###### City
<img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/city/17.jpg">

###### Human
<img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/human/5.jpg">

###### Nature
<img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/nature/32.jpg">

###### Technic
<img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/technic/1.jpg">

#### loremIpsum

##### getWords
Returns a random sentence based on the words from the "Lorem ipsum" text. The number of words can be limited/extended by the "words" parameter.
```javascript
let loremIpsum      = constructs.loremIpsum.getWords(); // return default 60 words
let loremIpsum10    = constructs.loremIpsum.getWords({max: 10}); // return 10 words
```
```
60 words:
Amet vero ullamcorper sea lorem dolor clita voluptua accusam dolores justo labore facilisis clita At dolor takimata facilisis consetetur erat sadipscing nibh diam tincidunt autem justo invidunt dolores magna vulputate blandit lorem aliquip mazim no molestie ipsum exerci vel dolor consectetuer facilisis nonumy ut takimata dolore rebum nisl dolor vero illum consequat facilisi feugiat ad option amet amet stet diam.

10 words:
Sadipscing elitr aliquam est et accusam sadipscing assum eum molestie.
```
#### name

##### getName
Returns a random name based on the first name and last name list of the locale. Titles (doctor or professor) can also precede the names. 
```javascript
let name      = constructs.name.getName();
```
```
Enes Kette
Frau Prof. Jolie Polifka
Dr. Vito Kempter
```

##### getFirstName
Returns a random first name from the list of locales.
```javascript
let first_name = constructs.name.getFirstName();
```
```
Maxel
Frank
Ben
```

##### getSurName
Returns a random surname based on the locale.
```javascript
let sur_name      = constructs.name.getSurName();
```
```
Bremser
Ritosek
Lott
```

##### getSalutation
Returns a random salutation based on the locale. 
```javascript
let gender = constructs.name.getSalutation();
```
```
Herr
Frau
Diverses
```

##### getTitle
Returns a random title based on the locale.
```javascript
let title      = constructs.name.getTitle();
```
```
Dr.
Prof.
```
#### phone

##### getCellPhoneNumber
Creates a random cell phone number based on the scheme in locale.
```javascript
let cell_phone = constructs.phone.getCellPhoneNumber();
```
```
+49-152-1664339
+49-1739-9267441
```

##### getPhoneNumber
Returns a randomly generated phone number based on the local scheme.
```javascript
let phone      = constructs.phone.getPhoneNumber();
```
```
(0183) 837993227
(01294) 4479364
+49-174-9347731
+49-1834-99411402
```

### Template

The template scheme is structured as follows and must be maintained.

```
{
    structure: [
        {
            name: "id", // Field name
            mask: "[id]" // Mask
        }
    ],
    output: {
        result: "output", // Use for API (Allowed: output, insert)
        type: "json", // Result json object (Allowed: json, xml)
        limit: 5 // Generate 5 items
    }
}
```

### Template masks

The mask is always structured according to the scheme 
```
[module:function]
```
module: Class module
function: function call

Function calls can also include parameters that can be processed further.

Several [module:function] can also be listed in the masks.
```
Prof. Dr. [name:getFirstName] [name:getSurName]
```
So different masks can be combined in the input mask and normal text can be used.

Other field contents can also be accessed in the masks.
For example, one has built a structure that looks like this:
```
{
    "name": "birthday",
    "mask": "[date]"
},
{
    "name": "age"
    "mask": "[diffYearNow({birthday})]"
}
```
Then you can see that in the mask at the field **age** the field content **{birthday}** is accessed. It doesn't matter where the field is defined in the structure.

### Module functions

#### Global modules

##### [id]
Returns a random generated number which can be further restricted with the parameters **min** and **max**. 
```
[id(min = 1, max = 1000000)]
```

##### [date]
Returns a random generated date which can be further restricted with the parameters **min** (schema: 1970-01-01) and **max** (schema: 1970-01-01). 
```
[date(min = null, max = null)]
```

##### [datetime]
Returns a random generated datetime which can be further restricted with the parameters **min** (schema: 1970-01-01) and **max** (schema: 1970-01-01). 
```
[datetime(min = null, max = null)]
```

##### [diffYearNow]
Calculates the year which lies between the passed date and today's date.
(schema: 1970-01-01 or 1970-01-01 00:00:00)
```
[diffYearNow(date)]
```

#### address

##### [address:getAddress]
Returns an address based on the locale.
```
[address:getAddress]
```

##### [address:getStreet]
Returns a street based on the locale.
```
[address:getStreet]
```

##### [address:getBuildingNumber]
Returns a building number based on the locales
```
[address:getBuildingNumber]
```

##### [address:getPostcode]
Returns a post code based on the locales
```
[address:getPostcode]
```

##### [address:getState]
Returns a state based on the locales
```
[address:getState]
```

#### city

##### [city:getCity]
Returns a city based on the locales
```
[city:getCity]
```

##### [city:getPrefix]
Returns a prefix based on the locales
```
[city:getPrefix]
```

##### [city:getSuffix]
Returns a suffix based on the locales
```
[city:getSuffix]
```

#### company

##### [company:getCompany]
Returns a company based on the locales
```
[company:getCompany]
```

##### [company:getSuffix]
Returns a suffix based on the locales
```
[company:getSuffix]
```

#### country

##### [country:getCountry]
Returns a country based on the locales
```
[country:getCountry]
```

##### [country:getDefaultCountry]
Returns the default country of the locale
```
[country:getDefaultCountry]
```

#### email

##### [email:getEmail]
Returns a email based on the locales
```
[email:getEmail]
```

##### [email:getSuffix]
Returns a suffix based on the locales
```
[email:getSuffix]
```

#### [image]

##### [image:getImage]
Returns a image based on the locale. The type parameter defines from which image pool a random image should come back. Existing image pools: animal, avatar(default), city, human, nature and technic
```
[image:getImage(type: null)]
```

##### [image:getAvatarImage]
Returns a avatar image based on the locales
```
[image:getAvatarImage]
```

##### [image:getAnimalImage]
Returns a animal image based on the locales
```
[image:getAnimalImage]
```

##### [image:getCityImage]
Returns a city image based on the locales
```
[image:getCityImage]
```

##### [image:getHumanImage]
Returns a human image based on the locales
```
[image:getHumanImage]
```

##### [image:getNatureImage]
Returns a nature image based on the locales
```
[image:getNatureImage]
```

##### [image:getTechnicImage]
Returns a technic image based on the locales
```
[image:getTechnicImage]
```

#### loremIpsum

##### [loremIpsum:getWords]
Returns a random Lorem ipsum text based on the locale. The parameter "max" can be used to specify the length of the returned sentence. By default the length is 60 words.
```
[loremIpsum:getWords(max: null)]
```

#### name

##### [name:getName]
Returns a name based on the locales
```
[name:getName]
```

##### [name:getFirstName]
Returns a first name based on the locales
```
[name:getFirstName]
```

##### [name:getSurName]
Returns a sur name based on the locales
```
[name:getSurName]
```

##### [name:getSalutation]
Returns a salutation based on the locales
```
[name:getSalutation]
```

##### [name:getTitle]
Returns a title based on the locales
```
[name:getTitle]
```

#### phone

##### [phone:getPhoneNumber]
Returns a phone number based on the locales
```
[name:getPhoneNumber]
```

##### [phone:getCellPhoneNumber]
Returns a cell phone number based on the locales
```
[name:getCellPhoneNumber]
```
