# construct.js - creates extremely large amount of random data for browser and node.js

<img src="https://uniqgenerator.s3-eu-west-1.amazonaws.com/logo_transparent_background.png" width="250">

## Demo
[https://rgerhardt-pressmind.github.io/construct.js](https://rgerhardt-pressmind.github.io/construct.js)

## Introduction

### Browser
```html
<script src = "dist/construct.min.js" type = "text/javascript"></script>
<script>
  let uniqFirstName = construct.ug.get('first_name'); // Maik
  let uniqSurName   = construct.ug.get('sur_name'); // Raschel
  let uniqEmail     = construct.ug.get('email'); // max@gmail.com
</script>
```

### NodeJS
```javascript
const Construct    =   require('./construct');
let construct      =   new Construct('de'); // de = locale (fallback locale is "de")

let first_name = construct.ug.get('first_name');
let sur_name   = construct.ug.get('sur_name');
let email      = construct.ug.get('email');
```

## Usage template

construct.js can generate multiple random data at once based on object templates. These data packages can then be used e.g. for grids or displays.

### Example
```javascript
let template = {
    name: "Example template",
    structure: [
        {
            name: "id",
            mask: "[ug:id]"
        },
        {
            name: "first_name",
            mask: "[ug:first_name]"
        },
        {
            name: "sur_name",
            mask: "[ug:sur_name]"
        },
        {
            name: "name",
            mask: "{first_name} {sur_name}" // Merge field content from {"name": "first_name"} and {"name": "sur_name"}
        },
        {
            name: "birthday",
            mask: "[ug:date(1990-01-01, 1970-01-01)]" // Generate date from 01.01.1970 and 01.01.1990
        },
        {
            name: "age",
            mask: "[ug:diffYearNow({birthday})]" // Returns the difference in years from the field content {"name": "birthday"} returns
        },
        {
            name: "created_date",
            mask: "[ug:datetime]"
        }
    ],
    output: {
        result: "output", // Use for API (Allowed: output, insert)
        type: "json", // Result json object (Allowed: json, xml)
        limit: 5 // Generate 5 items
    }
};

let generatedData = construct.generateUniqData(template);

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
Generate random address. The structure of the address depends on the respective locale.
```javascript
let address = construct.ug.get('address');
```
```
Am Neuenhof 53a, Baryllastadt 82559 Deutschland
Am Nonnenbruch 716, Nord Tillmannscheid 97817 Deutschland
Karlstr. 42b, Süd Emrescheid 07554 Deutschland
```

#### building_number
Generates a building number based on the defined scheme in locale.
```javascript
let building_number = construct.ug.get('building_number');
```
```
244
997b
520a
```

#### cell_phone
Creates a random cell phone number based on the scheme in locale.
```javascript
let cell_phone = construct.ug.get('cell_phone');
```
```
+49-152-1664339
+49-1739-9267441
```

#### city
Generates a fictitious city name based on the first name and last name list from the locales.
```javascript
let city = construct.ug.get('city');
```
```
Jankescheid
Davinburg
Gregerdorf
```

#### company
Generates a fictitious company name based on the first name and last name list from locales.
```javascript
let company = construct.ug.get('company');
```
```
Loogen GmbH
Wartenberg, Helm und Többen
Noack GmbH & Co KG
```

#### country
Returns a random country which is stored in locale
```javascript
let country = construct.ug.get('country');
```
```
Deutschland
```

#### email
Returns a random email address based on a random last name from the locale and a random defined domain.
```javascript
let email = construct.ug.get('email');
```
```
Micha@gmail.com
Frenke@yahoo.com
```

#### first_name
Returns a random first name from the list of locales.
```javascript
let first_name = construct.ug.get('first_name');
```
```
Maxel
Frank
Ben
```

#### gender
Returns a random salutation based on the locale. 
```javascript
let gender = construct.ug.get('gender');
```
```
Herr
Frau
Diverses
```

#### image
Returns a random image based on the type in the local. By default the type "avatar" is set.  The images have a maximum size of 500x500 pixels.
```javascript
let animal  = construct.ug.get('image', {type: 'animal'});
let avatar  = construct.ug.get('image');
let city    = construct.ug.get('image', {type: 'city'});
let human   = construct.ug.get('image', {type: 'human'});
let nature  = construct.ug.get('image', {type: 'nature'});
let technic = construct.ug.get('image', {type: 'technic'});
```

Animal
<br><img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/animal/15.jpg"><br>
Avatar
<br><img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/avatar/33.jpg"><br>
City
<br><img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/city/17.jpg"><br>
Human
<br><img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/human/5.jpg"><br>
Nature
<br><img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/nature/32.jpg"><br>
Technic
<br><img width="200" src="https://d22kzm8dnmp26q.cloudfront.net/technic/1.jpg"><br>

#### loremIpsum
Returns a random sentence based on the words from the "Lorem ipsum" text. The number of words can be limited/extended by the "words" parameter.
```javascript
let loremIpsum      = construct.ug.get('loremIpsum'); // return default 60 words
let loremIpsum10    = construct.ug.get('loremIpsum', {words: 10}); // return 10 words
```
```
60 words:
Amet vero ullamcorper sea lorem dolor clita voluptua accusam dolores justo labore facilisis clita At dolor takimata facilisis consetetur erat sadipscing nibh diam tincidunt autem justo invidunt dolores magna vulputate blandit lorem aliquip mazim no molestie ipsum exerci vel dolor consectetuer facilisis nonumy ut takimata dolore rebum nisl dolor vero illum consequat facilisi feugiat ad option amet amet stet diam.

10 words:
Sadipscing elitr aliquam est et accusam sadipscing assum eum molestie.
```

#### name
Returns a random name based on the first name and last name list of the locale. Titles (doctor or professor) can also precede the names. 
```javascript
let name      = construct.ug.get('name');
```
```
Enes Kette
Frau Prof. Jolie Polifka
Dr. Vito Kempter
```

#### phone
Returns a randomly generated phone number based on the local scheme.
```javascript
let phone      = construct.ug.get('phone');
```
```
(0183) 837993227
(01294) 4479364
+49-174-9347731
+49-1834-99411402
```

#### postcode
Returns a random zip code based on the locale.
```javascript
let postcode      = construct.ug.get('postcode');
```
```
03884
57392
82411
```

#### state
Returns a random state based on the locale.
```javascript
let state      = construct.ug.get('state');
```
```
Thüringen
Bremen
Niedersachsen
```

#### street
Returns a random street based on the locale.
```javascript
let street      = construct.ug.get('street');
```
```
Friedrich-List-Str.
Am Knechtsgraben
Montanusstr.
```

#### sur_name
Returns a random surname based on the locale.
```javascript
let sur_name      = construct.ug.get('sur_name');
```
```
Bremser
Ritosek
Lott
```

#### title
Returns a random title based on the locale.
```javascript
let title      = construct.ug.get('title');
```
```
Dr.
Prof.
```

### Template

The template scheme is structured as follows and must be maintained.

```
{
    structure: [
        {
            name: "id", // Field name
            mask: "[ug:id]" // Mask
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
Prof. Dr. [ug:first_name] [ug:surname]
```
So different masks can be combined in the input mask and normal text can be used.

Other field contents can also be accessed in the masks.
For example, one has built a structure that looks like this:
```
{
    "name": "birthday",
    "mask": "[ug:date]"
},
{
    "name": "age"
    "mask": "[ug:diffYearNow({birthday})]"
}
```
Then you can see that in the mask at the field **age** the field content **{birthday}** is accessed. It doesn't matter where the field is defined in the structure.

### Module functions

#### [ug:id]
Returns a random generated number which can be further restricted with the parameters **min** and **max**. 
```
[ug:id(min = 1, max = 1000000)]
```

#### [ug:date]
Returns a random generated date which can be further restricted with the parameters **min** (schema: 1970-01-01) and **max** (schema: 1970-01-01). 
```
[ug:date(min = null, max = null)]
```

#### [ug:datetime]
Returns a random generated datetime which can be further restricted with the parameters **min** (schema: 1970-01-01) and **max** (schema: 1970-01-01). 
```
[ug:datetime(min = null, max = null)]
```

#### [ug:diffYearNow]
Calculates the year which lies between the passed date and today's date.
(schema: 1970-01-01 or 1970-01-01 00:00:00)
```
[ug:diffYearNow(date)]
```

#### [ug:address]
Returns an address based on the locale.
```
[ug:address]
```

#### [ug:building_number]
Returns a building number based on the locales
```
[ug:building_number]
```

#### [ug:cell_phone]
Returns a cell phone number based on the locale
```
[ug:cell_phone]
```

#### [ug:city]
Returns a city based on the locale
```
[ug:city]
```

#### [ug:company]
Returns a company based on the locale
```
[ug:company]
```

#### [ug:country]
Returns a country based on the locale
```
[ug:country]
```

#### [ug:email]
Returns a email based on the locale
```
[ug:email]
```

#### [ug:first_name]
Returns a firstname based on the locale
```
[ug:first_name]
```

#### [ug:gender]
Returns a gender based on the locale
```
[ug:gender]
```

#### [ug:image]
Returns a image based on the locale. The type parameter defines from which image pool a random image should come back. Existing image pools: animal, avatar(default), city, human, nature and technic
```
[ug:image(type: null)]
```

#### [ug:loremIpsum]
Returns a random Lorem ipsum text based on the locale. The parameter "words" can be used to specify the length of the returned sentence. By default the length is 60 words.
```
[ug:loremIpsum(words: null)]
```

#### [ug:name]
Returns a random name based on the locale of the first name and last name list. 
```
[ug:name]
```

#### [ug:phone]
Returns a random phone number based on the locale. 
```
[ug:phone]
```

#### [ug:postcode]
Returns a random postcode based on the locale. 
```
[ug:postcode]
```

#### [ug:state]
Returns a random state based on the locale. 
```
[ug:state]
```

#### [ug:street]
Returns a random street based on the locale. 
```
[ug:street]
```

#### [ug:sur_name]
Returns a random surname based on the locale. 
```
[ug:sur_name]
```

#### [ug:title]
Returns a random title based on the locale. 
```
[ug:title]
```
