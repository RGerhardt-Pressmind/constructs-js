(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.construct = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function Construct(locale){
    let self    =   this;

    self.loadedLocales  =   {
        'de': require('./locales/de')
    };

    if(!self.loadedLocales[locale]){
        throw 'locale "'+locale+'" not available';
    }

    self.locale         =   locale;
    self.allowedResults =   ['json', 'xml'];

    let ug  =   require('./modules/ug');

    self.ug =   new ug(self.loadedLocales, locale);

    self.resultOutput   =   function(output){
        if(self.template.output.result === 'output') {
            if(self.template.output.type === 'json') {
                return JSON.stringify(output);
            } else if(self.template.output.type === 'xml'){
                return self.objectToXML(output, true);
            }
        }
    }

    self.objectToXML    =   function(obj, first = false) {
        let xml = (first ? '<items>' : '<item>');

        for (let prop in obj) {
            xml += obj[prop] instanceof Array ? '' : "<" + prop + ">";

            if (obj[prop] instanceof Array) {
                for (let array in obj[prop]) {
                    xml += "<" + prop + ">";
                    xml += self.objectToXML(new Object(obj[prop][array]));
                    xml += "</" + prop + ">";
                }
            } else if (typeof obj[prop] == "object") {
                xml += self.objectToXML(new Object(obj[prop]));
            } else {
                xml += obj[prop];
            }

            xml += obj[prop] instanceof Array ? '' : "</" + prop + ">";
        }

        xml = xml.replace(/<\/?[0-9]{1,}>/g, '');

        return xml+(first ? '</items>' : '</item>');
    }

    self.buildParameters    =   function(parameter, element){
        if(parameter === undefined){
            return null;
        }

        parameter   =   String(parameter);

        let hasError    =   false;
        parameter       =   parameter.substring(1, (parameter.length - 1)).split(',');

        parameter.forEach((p, index)=>{
            if(p.indexOf(':') !== -1){
                let g = p.split(':');

                parameter[index]  =   {};

                parameter[index][g[0]]  =   g[1];
                return false;
            }

            Object.keys(element).forEach((key)=>{
                if(typeof element[key] === 'string')
                {
                    parameter[index]   =   parameter[index].replace('{'+key+'}', element[key]);
                }
            });

            if(parameter[index].indexOf('{') !== -1) {
                hasError    =   true;
                return true;
            }
        });

        return (hasError) ? null : parameter;
    }

    self.typing =   function(s){
        if(!isNaN(s)){
            if(Number(s) == s && s % 1 !== 0){
                return parseFloat(s);
            } else if(Number(s) == s && s % 1 === 0){
                return parseInt(s);
            }
        }

        return s;
    }

    self.getMask    =   function(mask){
        const regex = /(\[([(a-z_A-Z0-9)]+):([a-z_A-Z0-9]+)(\(.*\))?\])/gm;

        let result  =   [];

        let m;

        while ((m = regex.exec(mask)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            result.push({module: m[2], method: m[3], parameter: m[4], mask: m[1]});
        }

        return result;
    }

    self.generateData   =   function(max = 0){
        let output  =   [];
        let mr      =   {};

        self.template.structure.forEach((field, index)=>{
            let masks = self.getMask(field.mask);

            mr[index] = masks;

            if(masks.length > 0) {
                masks.forEach((m)=>{
                    if(!self[m['module']]){
                        throw 'Module '+m['module']+' not exist';
                    }
                });
            }
        });

        let maxRecords  =   (max > 0) ? max : self.template.output.limit;

        for(let i = 0; i < maxRecords; ++i){
            let element =   {};

            self.template.structure.forEach((field, index)=>{
                let v   =   field.mask;

                if(mr[index].length > 0) {
                    let masks   =   mr[index];

                    masks.forEach((mask)=>{
                        let c = self[mask['module']];
                        let m = mask['method'];

                        let r;

                        if(typeof c[m] === 'undefined'){
                            r = c.get.apply(c, [m].concat(self.buildParameters(mask['parameter'], element)));
                        } else {
                            r = c[m].apply(c, self.buildParameters(mask['parameter'], element));
                        }

                        v   =   v.replace(mask.mask, r);
                    });
                }

                element[field.name] = self.typing(v);
            });

            self.template.structure.forEach((field, index)=>{
                Object.keys(element).forEach((key)=>{
                    if(typeof element[field.name] === 'string')
                    {
                        element[field.name]   =   element[field.name].replace('{'+key+'}', element[key]);
                    }
                });
            });

            output.push(element);
        }

        return self.resultOutput(output);
    }

    self.validateTemplateFileContent    =   function(){
        const propertiesCheck    =   ['name', 'structure', 'output'];

        propertiesCheck.forEach((property)=>{
            if(!self.template.hasOwnProperty(property)) {
                throw  'template has not property "'+property+'"';
            }
        });

        if(!Array.isArray(self.template.structure)) {
            throw 'template "structure" is not a array';
        }

        self.template.structure.forEach((row)=>{
            if(!row.hasOwnProperty('name')){
                throw 'structure property "name" not exist';
            } else if(!row.hasOwnProperty('mask')){
                throw 'structure property "mask" not exist';
            }
        });

        if(typeof self.template.output !== 'object') {
            throw 'template "output" is not a object';
        }

        const output            =   self.template.output;
        const outputPropertys   =   ['result', 'type', 'limit'];

        outputPropertys.forEach((property)=>{
            if(!output.hasOwnProperty(property)) {
                throw 'template "output" property "'+property+'" not exist';
            }
        });

        if(!['output', 'insert'].includes(output.result)) {
            throw 'template "output->result" has not allowed value';
        }

        if(output.result === 'output' && !self.allowedResults.includes(output.type)){
            throw 'output "type" is not allowed.';
        }

        if(parseInt(output.limit) > 1000000) {
            self.template.output.limit    =   1000000;
        }
    }

    self.generateUniqData   =   function(template){
        self.template   =   template;

        self.validateTemplateFileContent();

        if(self.template.output.result === 'output') {
            return self.generateData();
        } else{
            //@todo generate data and insert to database
        }
    }
}

module['exports']  =   Construct;

},{"./locales/de":17,"./modules/ug":26}],2:[function(require,module,exports){
var Construct = require('./construct');
var construct = new Construct('de');
module['exports'] = construct;

},{"./construct":1}],3:[function(require,module,exports){
module['exports']  =   {
    items: ['[STREET] [STREET_NUMBER], [CITY] [ZIP_CODE] [COUNTRY]']
};

},{}],4:[function(require,module,exports){
module['exports']  =   {
    items: ['#', '##', '###', '##a', '##b']
};

},{}],5:[function(require,module,exports){
module['exports'] = {
    items: ['+49-1##-#######', '+49-1###-#######']
}

},{}],6:[function(require,module,exports){
module['exports']  =   {
    items: ['{city:prefix} {first_name:default}{city:suffix}', '{city:prefix} {first_name:default}', '{first_name:default}{city:suffix}', '{sur_name:default}{city:suffix}']
};

},{}],7:[function(require,module,exports){
module['exports'] = {
    items: ["Nord","Ost","West","Süd","Neu","Alt","Bad"]
};

},{}],8:[function(require,module,exports){
module['exports'] = {
    items: ["stadt","dorf","land","scheid","burg"]
};

},{}],9:[function(require,module,exports){
module['exports'] = {
    items: ['GbR', 'e.K.', 'OHG', 'KG', 'GmbH', 'AG', 'GmbH & Co KG']
}

},{}],10:[function(require,module,exports){
module['exports'] = {
    items: ['{sur_name:default} {company:suffix}', '{sur_name:default}-{sur_name:default}', '{sur_name:default}, {sur_name:default} und {sur_name:default}']
};

},{}],11:[function(require,module,exports){
module['exports']  =   {
    items: ['Deutschland']
};

},{}],12:[function(require,module,exports){
module['exports'] = {
    items: ['gmail.com', 'yahoo.com', 'web.de', 'freemail.de', 'ok.de', 'gmx.net', 'freenet.de']
}

},{}],13:[function(require,module,exports){
module['exports'] = {
    items: ['{first_name:default}@{email:suffix}']
}

},{}],14:[function(require,module,exports){
module['exports'] =   {
    items: ["Aaron","Abdul","Abdullah","Adam","Adrian","Adriano","Ahmad","Ahmed","Ahmet","Alan","Albert","Alessandro","Alessio","Alex","Alexander","Alfred","Ali","Amar","Amir","Amon","Andre","Andreas","Andrew","Angelo","Ansgar","Anthony","Anton","Antonio","Arda","Arian","Armin","Arne","Arno","Arthur","Artur","Arved","Arvid","Ayman","Baran","Baris","Bastian","Batuhan","Bela","Ben","Benedikt","Benjamin","Bennet","Bennett","Benno","Bent","Berat","Berkay","Bernd","Bilal","Bjarne","Björn","Bo","Boris","Brandon","Brian","Bruno","Bryan","Burak","Calvin","Can","Carl","Carlo","Carlos","Caspar","Cedric","Cedrik","Cem","Charlie","Chris","Christian","Christiano","Christoph","Christopher","Claas","Clemens","Colin","Collin","Conner","Connor","Constantin","Corvin","Curt","Damian","Damien","Daniel","Danilo","Danny","Darian","Dario","Darius","Darren","David","Davide","Davin","Dean","Deniz","Dennis","Denny","Devin","Diego","Dion","Domenic","Domenik","Dominic","Dominik","Dorian","Dustin","Dylan","Ecrin","Eddi","Eddy","Edgar","Edwin","Efe","Ege","Elia","Eliah","Elias","Elijah","Emanuel","Emil","Emilian","Emilio","Emir","Emirhan","Emre","Enes","Enno","Enrico","Eren","Eric","Erik","Etienne","Fabian","Fabien","Fabio","Fabrice","Falk","Felix","Ferdinand","Fiete","Filip","Finlay","Finley","Finn","Finnley","Florian","Francesco","Franz","Frederic","Frederick","Frederik","Friedrich","Fritz","Furkan","Fynn","Gabriel","Georg","Gerrit","Gian","Gianluca","Gino","Giuliano","Giuseppe","Gregor","Gustav","Hagen","Hamza","Hannes","Hanno","Hans","Hasan","Hassan","Hauke","Hendrik","Hennes","Henning","Henri","Henrick","Henrik","Henry","Hugo","Hussein","Ian","Ibrahim","Ilias","Ilja","Ilyas","Immanuel","Ismael","Ismail","Ivan","Iven","Jack","Jacob","Jaden","Jakob","Jamal","James","Jamie","Jan","Janek","Janis","Janne","Jannek","Jannes","Jannik","Jannis","Jano","Janosch","Jared","Jari","Jarne","Jarno","Jaron","Jason","Jasper","Jay","Jayden","Jayson","Jean","Jens","Jeremias","Jeremie","Jeremy","Jermaine","Jerome","Jesper","Jesse","Jim","Jimmy","Joe","Joel","Joey","Johann","Johannes","John","Johnny","Jon","Jona","Jonah","Jonas","Jonathan","Jonte","Joost","Jordan","Joris","Joscha","Joschua","Josef","Joseph","Josh","Joshua","Josua","Juan","Julian","Julien","Julius","Juri","Justin","Justus","Kaan","Kai","Kalle","Karim","Karl","Karlo","Kay","Keanu","Kenan","Kenny","Keno","Kerem","Kerim","Kevin","Kian","Kilian","Kim","Kimi","Kjell","Klaas","Klemens","Konrad","Konstantin","Koray","Korbinian","Kurt","Lars","Lasse","Laurence","Laurens","Laurenz","Laurin","Lean","Leander","Leandro","Leif","Len","Lenn","Lennard","Lennart","Lennert","Lennie","Lennox","Lenny","Leo","Leon","Leonard","Leonardo","Leonhard","Leonidas","Leopold","Leroy","Levent","Levi","Levin","Lewin","Lewis","Liam","Lian","Lias","Lino","Linus","Lio","Lion","Lionel","Logan","Lorenz","Lorenzo","Loris","Louis","Luan","Luc","Luca","Lucas","Lucian","Lucien","Ludwig","Luis","Luiz","Luk","Luka","Lukas","Luke","Lutz","Maddox","Mads","Magnus","Maik","Maksim","Malik","Malte","Manuel","Marc","Marcel","Marco","Marcus","Marek","Marian","Mario","Marius","Mark","Marko","Markus","Marlo","Marlon","Marten","Martin","Marvin","Marwin","Mateo","Mathis","Matis","Mats","Matteo","Mattes","Matthias","Matthis","Matti","Mattis","Maurice","Max","Maxim","Maximilian","Mehmet","Meik","Melvin","Merlin","Mert","Michael","Michel","Mick","Miguel","Mika","Mikail","Mike","Milan","Milo","Mio","Mirac","Mirco","Mirko","Mohamed","Mohammad","Mohammed","Moritz","Morten","Muhammed","Murat","Mustafa","Nathan","Nathanael","Nelson","Neo","Nevio","Nick","Niclas","Nico","Nicolai","Nicolas","Niels","Nikita","Niklas","Niko","Nikolai","Nikolas","Nils","Nino","Noah","Noel","Norman","Odin","Oke","Ole","Oliver","Omar","Onur","Oscar","Oskar","Pascal","Patrice","Patrick","Paul","Peer","Pepe","Peter","Phil","Philip","Philipp","Pierre","Piet","Pit","Pius","Quentin","Quirin","Rafael","Raik","Ramon","Raphael","Rasmus","Raul","Rayan","René","Ricardo","Riccardo","Richard","Rick","Rico","Robert","Robin","Rocco","Roman","Romeo","Ron","Ruben","Ryan","Said","Salih","Sam","Sami","Sammy","Samuel","Sandro","Santino","Sascha","Sean","Sebastian","Selim","Semih","Shawn","Silas","Simeon","Simon","Sinan","Sky","Stefan","Steffen","Stephan","Steve","Steven","Sven","Sönke","Sören","Taha","Tamino","Tammo","Tarik","Tayler","Taylor","Teo","Theo","Theodor","Thies","Thilo","Thomas","Thorben","Thore","Thorge","Tiago","Til","Till","Tillmann","Tim","Timm","Timo","Timon","Timothy","Tino","Titus","Tizian","Tjark","Tobias","Tom","Tommy","Toni","Tony","Torben","Tore","Tristan","Tyler","Tyron","Umut","Valentin","Valentino","Veit","Victor","Viktor","Vin","Vincent","Vito","Vitus","Wilhelm","Willi","William","Willy","Xaver","Yannic","Yannick","Yannik","Yannis","Yasin","Youssef","Yunus","Yusuf","Yven","Yves","Ömer","Aaliyah","Abby","Abigail","Ada","Adelina","Adriana","Aileen","Aimee","Alana","Alea","Alena","Alessa","Alessia","Alexa","Alexandra","Alexia","Alexis","Aleyna","Alia","Alica","Alice","Alicia","Alina","Alisa","Alisha","Alissa","Aliya","Aliyah","Allegra","Alma","Alyssa","Amalia","Amanda","Amelia","Amelie","Amina","Amira","Amy","Ana","Anabel","Anastasia","Andrea","Angela","Angelina","Angelique","Anja","Ann","Anna","Annabel","Annabell","Annabelle","Annalena","Anne","Anneke","Annelie","Annemarie","Anni","Annie","Annika","Anny","Anouk","Antonia","Arda","Ariana","Ariane","Arwen","Ashley","Asya","Aurelia","Aurora","Ava","Ayleen","Aylin","Ayse","Azra","Betty","Bianca","Bianka","Caitlin","Cara","Carina","Carla","Carlotta","Carmen","Carolin","Carolina","Caroline","Cassandra","Catharina","Catrin","Cecile","Cecilia","Celia","Celina","Celine","Ceyda","Ceylin","Chantal","Charleen","Charlotta","Charlotte","Chayenne","Cheyenne","Chiara","Christin","Christina","Cindy","Claire","Clara","Clarissa","Colleen","Collien","Cora","Corinna","Cosima","Dana","Daniela","Daria","Darleen","Defne","Delia","Denise","Diana","Dilara","Dina","Dorothea","Ecrin","Eda","Eileen","Ela","Elaine","Elanur","Elea","Elena","Eleni","Eleonora","Eliana","Elif","Elina","Elisa","Elisabeth","Ella","Ellen","Elli","Elly","Elsa","Emelie","Emely","Emilia","Emilie","Emily","Emma","Emmely","Emmi","Emmy","Enie","Enna","Enya","Esma","Estelle","Esther","Eva","Evelin","Evelina","Eveline","Evelyn","Fabienne","Fatima","Fatma","Felicia","Felicitas","Felina","Femke","Fenja","Fine","Finia","Finja","Finnja","Fiona","Flora","Florentine","Francesca","Franka","Franziska","Frederike","Freya","Frida","Frieda","Friederike","Giada","Gina","Giulia","Giuliana","Greta","Hailey","Hana","Hanna","Hannah","Heidi","Helen","Helena","Helene","Helin","Henriette","Henrike","Hermine","Ida","Ilayda","Imke","Ina","Ines","Inga","Inka","Irem","Isa","Isabel","Isabell","Isabella","Isabelle","Ivonne","Jacqueline","Jamie","Jamila","Jana","Jane","Janin","Janina","Janine","Janna","Janne","Jara","Jasmin","Jasmina","Jasmine","Jella","Jenna","Jennifer","Jenny","Jessica","Jessy","Jette","Jil","Jill","Joana","Joanna","Joelina","Joeline","Joelle","Johanna","Joleen","Jolie","Jolien","Jolin","Jolina","Joline","Jona","Jonah","Jonna","Josefin","Josefine","Josephin","Josephine","Josie","Josy","Joy","Joyce","Judith","Judy","Jule","Julia","Juliana","Juliane","Julie","Julienne","Julika","Julina","Juna","Justine","Kaja","Karina","Karla","Karlotta","Karolina","Karoline","Kassandra","Katarina","Katharina","Kathrin","Katja","Katrin","Kaya","Kayra","Kiana","Kiara","Kim","Kimberley","Kimberly","Kira","Klara","Korinna","Kristin","Kyra","Laila","Lana","Lara","Larissa","Laura","Laureen","Lavinia","Lea","Leah","Leana","Leandra","Leann","Lee","Leila","Lena","Lene","Leni","Lenia","Lenja","Lenya","Leona","Leoni","Leonie","Leonora","Leticia","Letizia","Levke","Leyla","Lia","Liah","Liana","Lili","Lilia","Lilian","Liliana","Lilith","Lilli","Lillian","Lilly","Lily","Lina","Linda","Lindsay","Line","Linn","Linnea","Lisa","Lisann","Lisanne","Liv","Livia","Liz","Lola","Loreen","Lorena","Lotta","Lotte","Louisa","Louise","Luana","Luca","Lucia","Lucie","Lucienne","Lucy","Luisa","Luise","Luka","Luna","Luzie","Lya","Lydia","Lyn","Lynn","Madeleine","Madita","Madleen","Madlen","Magdalena","Maike","Mailin","Maira","Maja","Malena","Malia","Malin","Malina","Mandy","Mara","Marah","Mareike","Maren","Maria","Mariam","Marie","Marieke","Mariella","Marika","Marina","Marisa","Marissa","Marit","Marla","Marleen","Marlen","Marlena","Marlene","Marta","Martha","Mary","Maryam","Mathilda","Mathilde","Matilda","Maxi","Maxima","Maxine","Maya","Mayra","Medina","Medine","Meike","Melanie","Melek","Melike","Melina","Melinda","Melis","Melisa","Melissa","Merle","Merve","Meryem","Mette","Mia","Michaela","Michelle","Mieke","Mila","Milana","Milena","Milla","Mina","Mira","Miray","Miriam","Mirja","Mona","Monique","Nadine","Nadja","Naemi","Nancy","Naomi","Natalia","Natalie","Nathalie","Neele","Nela","Nele","Nelli","Nelly","Nia","Nicole","Nika","Nike","Nikita","Nila","Nina","Nisa","Noemi","Nora","Olivia","Patricia","Patrizia","Paula","Paulina","Pauline","Penelope","Philine","Phoebe","Pia","Rahel","Rania","Rebecca","Rebekka","Riana","Rieke","Rike","Romina","Romy","Ronja","Rosa","Rosalie","Ruby","Sabrina","Sahra","Sally","Salome","Samantha","Samia","Samira","Sandra","Sandy","Sanja","Saphira","Sara","Sarah","Saskia","Selin","Selina","Selma","Sena","Sidney","Sienna","Silja","Sina","Sinja","Smilla","Sofia","Sofie","Sonja","Sophia","Sophie","Soraya","Stefanie","Stella","Stephanie","Stina","Sude","Summer","Susanne","Svea","Svenja","Sydney","Tabea","Talea","Talia","Tamara","Tamia","Tamina","Tanja","Tara","Tarja","Teresa","Tessa","Thalea","Thalia","Thea","Theresa","Tia","Tina","Tomke","Tuana","Valentina","Valeria","Valerie","Vanessa","Vera","Veronika","Victoria","Viktoria","Viola","Vivian","Vivien","Vivienne","Wibke","Wiebke","Xenia","Yara","Yaren","Yasmin","Ylvi","Ylvie","Yvonne","Zara","Zehra","Zeynep","Zoe","Zoey","Zoé"]
};

},{}],15:[function(require,module,exports){
module['exports'] = {
    items: ['Herr', 'Frau', 'Diverses']
};

},{}],16:[function(require,module,exports){
module['exports'] = {
    run: function(parameter = null){
        let maxImages   =   74;
        let folder      =   'avatar';

        if(parameter && parameter.type)
        {
            folder  =   parameter.type;

            switch(parameter.type)
            {
                case 'animal':

                    maxImages   =   22;

                break;
                case 'city':

                    maxImages   =   22;

                break;
                case 'human':

                    maxImages   =   17;

                break;
                case 'nature':

                    maxImages   =   40;

                break;
                case 'technic':

                    maxImages   =   22;

                break;
            }
        }

        return ['https://d22kzm8dnmp26q.cloudfront.net/'+folder+'/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }
};

},{}],17:[function(require,module,exports){
var de = {};
module['exports'] = de;
de.address          =   require('./address');
de.building_number  =   require('./building_number');
de.city             =   require('./city');
de.city_suffix      =   require('./city/suffix');
de.city_prefix      =   require('./city/prefix');
de.country          =   require('./country');
de.first_name       =   require('./first_name');
de.postcode         =   require('./postcode');
de.state            =   require('./state');
de.street           =   require('./street');
de.sur_name         =   require('./sur_name');
de.name             =   require('./name');
de.title            =   require('./title');
de.gender           =   require('./gender');
de.image            =   require('./image');
de.email            =   require('./email');
de.email_suffix     =   require('./email/email_suffix');
de.company          =   require('./company');
de.company_suffix   =   require('./company/company_suffix');
de.cell_phone       =   require('./cell_phone');
de.phone            =   require('./phone');
de.loremIpsum       =   require('./loremIpsum');

},{"./address":3,"./building_number":4,"./cell_phone":5,"./city":6,"./city/prefix":7,"./city/suffix":8,"./company":10,"./company/company_suffix":9,"./country":11,"./email":13,"./email/email_suffix":12,"./first_name":14,"./gender":15,"./image":16,"./loremIpsum":18,"./name":19,"./phone":20,"./postcode":21,"./state":22,"./street":23,"./sur_name":24,"./title":25}],18:[function(require,module,exports){
module['exports'] = {
    items: ['lorem','ipsum','dolor','sit','amet','consetetur','sadipscing','elitr','sed','diam','nonumy','eirmod','tempor','invidunt','ut','labore','et','dolore','magna','aliquyam','erat','sed','diam','voluptua','at','vero','eos','et','accusam','et','justo','duo','dolores','et','ea','rebum','Stet','clita','kasd','gubergren','no','sea','takimata','sanctus','est','lorem','ipsum','dolor','sit','amet','lorem','ipsum','dolor','sit','amet','consetetur','sadipscing','elitr','sed','diam','nonumy','eirmod','tempor','invidunt','ut','labore','et','dolore','magna','aliquyam','erat','sed','diam','voluptua','At','vero','eos','et','accusam','et','justo','duo','dolores','et','ea','rebum','stet','clita','kasd','gubergren','no','sea','takimata','sanctus','est','lorem','ipsum','dolor','sit','amet','lorem','ipsum','dolor','sit','amet','consetetur','sadipscing','elitr','sed','diam','nonumy','eirmod','tempor','invidunt','ut','labore','et','dolore','magna','aliquyam','erat','sed','diam','voluptua','At','vero','eos','et','accusam','et','justo','duo','dolores','et','ea','rebum','stet','clita','kasd','gubergren','no','sea','takimata','sanctus','est','lorem','ipsum','dolor','sit','amet','duis','autem','vel','eum','iriure','dolor','in','hendrerit','in','vulputate','velit','esse','molestie','consequat','vel','illum','dolore','eu','feugiat','nulla','facilisis','at','vero','eros','et','accumsan','et','iusto','odio','dignissim','qui','blandit','praesent','luptatum','zzril','delenit','augue','duis','dolore','te','feugait','nulla','facilisi','lorem','ipsum','dolor','sit','amet','consectetuer','adipiscing','elit','sed','diam','nonummy','nibh','euismod','tincidunt','ut','laoreet','dolore','magna','aliquam','erat','volutpat','ut','wisi','enim','ad','minim','veniam','quis','nostrud','exerci','tation','ullamcorper','suscipit','lobortis','nisl','ut','aliquip','ex','ea','commodo','consequat','duis','autem','vel','eum','iriure','dolor','in','hendrerit','in','vulputate','velit','esse','molestie','consequat','vel','illum','dolore','eu','feugiat','nulla','facilisis','at','vero','eros','et','accumsan','et','iusto','odio','dignissim','qui','blandit','praesent','luptatum','zzril','delenit','augue','duis','dolore','te','feugait','nulla','facilisi','nam','liber','tempor','cum','soluta','nobis','eleifend','option','congue','nihil','imperdiet','doming','id','quod','mazim','placerat','facer','possim','assum','lorem','ipsum','dolor','sit','amet','consectetuer','adipiscing','elit','sed','diam','nonummy','nibh','euismod','tincidunt','ut','laoreet','dolore','magna','aliquam','erat','volutpat','ut','wisi','enim','ad','minim','veniam','quis','nostrud','exerci','tation','ullamcorper','suscipit','lobortis','nisl','ut','aliquip','ex','ea','commodo','consequat','duis','autem','vel','eum','iriure','dolor','in','hendrerit','in','vulputate','velit','esse','molestie','consequat','vel','illum','dolore','eu','feugiat','nulla','facilisis','at','vero','eos','et','accusam','et','justo','duo','dolores','et','ea','rebum','stet','clita','kasd','gubergren','no','sea','takimata','sanctus','est','lorem','ipsum','dolor','sit','amet','Lorem','ipsum','dolor','sit','amet','consetetur','sadipscing','elitr','sed','diam','nonumy','eirmod','tempor','invidunt','ut','labore','et','dolore','magna','aliquyam','erat','sed','diam','voluptua','At','vero','eos','et','accusam','et','justo','duo','dolores','et','ea','rebum','stet','clita','kasd','gubergren','no','sea','takimata','sanctus','est','Lorem','ipsum','dolor','sit','amet','lorem','ipsum','dolor','sit','amet','consetetur','sadipscing','elitr','At','accusam','aliquyam','diam','diam','dolore','dolores','duo','eirmod','eos','erat','et','nonumy','sed','tempor','et','et','invidunt','justo','labore','stet','clita','ea','et','gubergren','kasd','magna','no','rebum','sanctus','sea','sed','takimata','ut','vero','voluptua','est','lorem','ipsum','dolor','sit','amet','lorem','ipsum','dolor','sit','amet','consetetur'],

    run: function(parameter = null){
        let self    =   this;
        let words   =   60;

        if(parameter && parameter.words){
            words   =   parameter.words;
        }

        let allWords = [];

        for(let i = 0; ++i <= words;)
        {
            let str = self.items[Math.floor(Math.random()*self.items.length)];

            if(allWords.length === 0){
                str = str.charAt(0).toUpperCase()+str.slice(1);
            }

            allWords.push(str);
        }

        return [allWords.join(' ')+'.'];
    }
}

},{}],19:[function(require,module,exports){
module['exports'] = {
    items: ['{first_name:default} {sur_name:default}', '{gender:default} {first_name:default} {sur_name:default}', '{title:default} {first_name:default} {sur_name:default}', '{gender:default} {title:default} {first_name:default} {sur_name:default}']
};

},{}],20:[function(require,module,exports){
module['exports'] = {
    items: ['(0###) #########', '(0####) #######', '+49-###-#######',  '+49-####-########']
}

},{}],21:[function(require,module,exports){
module['exports'] = {
    items: ['#####']
}

},{}],22:[function(require,module,exports){
module['exports'] = {
    items: ["Baden-Württemberg","Bayern","Berlin","Brandenburg","Bremen","Hamburg","Hessen","Mecklenburg-Vorpommern","Niedersachsen","Nordrhein-Westfalen","Rheinland-Pfalz","Saarland","Sachsen","Sachsen-Anhalt","Schleswig-Holstein","Thüringen"]
};

},{}],23:[function(require,module,exports){
module['exports'] = {
    items: ["Ackerweg","Adalbert-Stifter-Str.","Adalbertstr.","Adolf-Baeyer-Str.","Adolf-Kaschny-Str.","Adolf-Reichwein-Str.","Adolfsstr.","Ahornweg","Ahrstr.","Akazienweg","Albert-Einstein-Str.","Albert-Schweitzer-Str.","Albertus-Magnus-Str.","Albert-Zarthe-Weg","Albin-Edelmann-Str.","Albrecht-Haushofer-Str.","Aldegundisstr.","Alexanderstr.","Alfred-Delp-Str.","Alfred-Kubin-Str.","Alfred-Stock-Str.","Alkenrather Str.","Allensteiner Str.","Alsenstr.","Alt Steinbücheler Weg","Alte Garten","Alte Heide","Alte Landstr.","Alte Ziegelei","Altenberger Str.","Altenhof","Alter Grenzweg","Altstadtstr.","Am Alten Gaswerk","Am Alten Schafstall","Am Arenzberg","Am Benthal","Am Birkenberg","Am Blauen Berg","Am Borsberg","Am Brungen","Am Büchelter Hof","Am Buttermarkt","Am Ehrenfriedhof","Am Eselsdamm","Am Falkenberg","Am Frankenberg","Am Gesundheitspark","Am Gierlichshof","Am Graben","Am Hagelkreuz","Am Hang","Am Heidkamp","Am Hemmelrather Hof","Am Hofacker","Am Hohen Ufer","Am Höllers Eck","Am Hühnerberg","Am Jägerhof","Am Junkernkamp","Am Kemperstiegel","Am Kettnersbusch","Am Kiesberg","Am Klösterchen","Am Knechtsgraben","Am Köllerweg","Am Köttersbach","Am Kreispark","Am Kronefeld","Am Küchenhof","Am Kühnsbusch","Am Lindenfeld","Am Märchen","Am Mittelberg","Am Mönchshof","Am Mühlenbach","Am Neuenhof","Am Nonnenbruch","Am Plattenbusch","Am Quettinger Feld","Am Rosenhügel","Am Sandberg","Am Scherfenbrand","Am Schokker","Am Silbersee","Am Sonnenhang","Am Sportplatz","Am Stadtpark","Am Steinberg","Am Telegraf","Am Thelenhof","Am Vogelkreuz","Am Vogelsang","Am Vogelsfeldchen","Am Wambacher Hof","Am Wasserturm","Am Weidenbusch","Am Weiher","Am Weingarten","Am Werth","Amselweg","An den Irlen","An den Rheinauen","An der Bergerweide","An der Dingbank","An der Evangelischen Kirche","An der Evgl. Kirche","An der Feldgasse","An der Fettehenne","An der Kante","An der Laach","An der Lehmkuhle","An der Lichtenburg","An der Luisenburg","An der Robertsburg","An der Schmitten","An der Schusterinsel","An der Steinrütsch","An St. Andreas","An St. Remigius","Andreasstr.","Ankerweg","Annette-Kolb-Str.","Apenrader Str.","Arnold-Ohletz-Str.","Atzlenbacher Str.","Auerweg","Auestr.","Auf dem Acker","Auf dem Blahnenhof","Auf dem Bohnbüchel","Auf dem Bruch","Auf dem End","Auf dem Forst","Auf dem Herberg","Auf dem Lehn","Auf dem Stein","Auf dem Weierberg","Auf dem Weiherhahn","Auf den Reien","Auf der Donnen","Auf der Grieße","Auf der Ohmer","Auf der Weide","Auf'm Berg","Auf'm Kamp","Augustastr.","August-Kekulé-Str.","A.-W.-v.-Hofmann-Str.","Bahnallee","Bahnhofstr.","Baltrumstr.","Bamberger Str.","Baumberger Str.","Bebelstr.","Beckers Kämpchen","Beerenstr.","Beethovenstr.","Behringstr.","Bendenweg","Bensberger Str.","Benzstr.","Bergische Landstr.","Bergstr.","Berliner Platz","Berliner Str.","Bernhard-Letterhaus-Str.","Bernhard-Lichtenberg-Str.","Bernhard-Ridder-Str.","Bernsteinstr.","Bertha-Middelhauve-Str.","Bertha-von-Suttner-Str.","Bertolt-Brecht-Str.","Berzeliusstr.","Bielertstr.","Biesenbach","Billrothstr.","Birkenbergstr.","Birkengartenstr.","Birkenweg","Bismarckstr.","Bitterfelder Str.","Blankenburg","Blaukehlchenweg","Blütenstr.","Boberstr.","Böcklerstr.","Bodelschwinghstr.","Bodestr.","Bogenstr.","Bohnenkampsweg","Bohofsweg","Bonifatiusstr.","Bonner Str.","Borkumstr.","Bornheimer Str.","Borsigstr.","Borussiastr.","Bracknellstr.","Brahmsweg","Brandenburger Str.","Breidenbachstr.","Breslauer Str.","Bruchhauser Str.","Brückenstr.","Brucknerstr.","Brüder-Bonhoeffer-Str.","Buchenweg","Bürgerbuschweg","Burgloch","Burgplatz","Burgstr.","Burgweg","Bürriger Weg","Burscheider Str.","Buschkämpchen","Butterheider Str.","Carl-Duisberg-Platz","Carl-Duisberg-Str.","Carl-Leverkus-Str.","Carl-Maria-von-Weber-Platz","Carl-Maria-von-Weber-Str.","Carlo-Mierendorff-Str.","Carl-Rumpff-Str.","Carl-von-Ossietzky-Str.","Charlottenburger Str.","Christian-Heß-Str.","Claasbruch","Clemens-Winkler-Str.","Concordiastr.","Cranachstr.","Dahlemer Str.","Daimlerstr.","Damaschkestr.","Danziger Str.","Debengasse","Dechant-Fein-Str.","Dechant-Krey-Str.","Deichtorstr.","Dhünnberg","Dhünnstr.","Dianastr.","Diedenhofener Str.","Diepental","Diepenthaler Str.","Dieselstr.","Dillinger Str.","Distelkamp","Dohrgasse","Domblick","Dönhoffstr.","Dornierstr.","Drachenfelsstr.","Dr.-August-Blank-Str.","Dresdener Str.","Driescher Hecke","Drosselweg","Dudweilerstr.","Dünenweg","Dünfelder Str.","Dünnwalder Grenzweg","Düppeler Str.","Dürerstr.","Dürscheider Weg","Düsseldorfer Str.","Edelrather Weg","Edmund-Husserl-Str.","Eduard-Spranger-Str.","Ehrlichstr.","Eichenkamp","Eichenweg","Eidechsenweg","Eifelstr.","Eifgenstr.","Eintrachtstr.","Elbestr.","Elisabeth-Langgässer-Str.","Elisabethstr.","Elisabeth-von-Thadden-Str.","Elisenstr.","Elsa-Brändström-Str.","Elsbachstr.","Else-Lasker-Schüler-Str.","Elsterstr.","Emil-Fischer-Str.","Emil-Nolde-Str.","Engelbertstr.","Engstenberger Weg","Entenpfuhl","Erbelegasse","Erftstr.","Erfurter Str.","Erich-Heckel-Str.","Erich-Klausener-Str.","Erich-Ollenhauer-Str.","Erlenweg","Ernst-Bloch-Str.","Ernst-Ludwig-Kirchner-Str.","Erzbergerstr.","Eschenallee","Eschenweg","Esmarchstr.","Espenweg","Euckenstr.","Eulengasse","Eulenkamp","Ewald-Flamme-Str.","Ewald-Röll-Str.","Fährstr.","Farnweg","Fasanenweg","Faßbacher Hof","Felderstr.","Feldkampstr.","Feldsiefer Weg","Feldsiefer Wiesen","Feldstr.","Feldtorstr.","Felix-von-Roll-Str.","Ferdinand-Lassalle-Str.","Fester Weg","Feuerbachstr.","Feuerdornweg","Fichtenweg","Fichtestr.","Finkelsteinstr.","Finkenweg","Fixheider Str.","Flabbenhäuschen","Flensburger Str.","Fliederweg","Florastr.","Florianweg","Flotowstr.","Flurstr.","Föhrenweg","Fontanestr.","Forellental","Fortunastr.","Franz-Esser-Str.","Franz-Hitze-Str.","Franz-Kail-Str.","Franz-Marc-Str.","Freiburger Str.","Freiheitstr.","Freiherr-vom-Stein-Str.","Freudenthal","Freudenthaler Weg","Fridtjof-Nansen-Str.","Friedenberger Str.","Friedensstr.","Friedhofstr.","Friedlandstr.","Friedlieb-Ferdinand-Runge-Str.","Friedrich-Bayer-Str.","Friedrich-Bergius-Platz","Friedrich-Ebert-Platz","Friedrich-Ebert-Str.","Friedrich-Engels-Str.","Friedrich-List-Str.","Friedrich-Naumann-Str.","Friedrich-Sertürner-Str.","Friedrichstr.","Friedrich-Weskott-Str.","Friesenweg","Frischenberg","Fritz-Erler-Str.","Fritz-Henseler-Str.","Fröbelstr.","Fürstenbergplatz","Fürstenbergstr.","Gabriele-Münter-Str.","Gartenstr.","Gebhardstr.","Geibelstr.","Gellertstr.","Georg-von-Vollmar-Str.","Gerhard-Domagk-Str.","Gerhart-Hauptmann-Str.","Gerichtsstr.","Geschwister-Scholl-Str.","Gezelinallee","Gierener Weg","Ginsterweg","Gisbert-Cremer-Str.","Glücksburger Str.","Gluckstr.","Gneisenaustr.","Goetheplatz","Goethestr.","Golo-Mann-Str.","Görlitzer Str.","Görresstr.","Graebestr.","Graf-Galen-Platz","Gregor-Mendel-Str.","Greifswalder Str.","Grillenweg","Gronenborner Weg","Große Kirchstr.","Grunder Wiesen","Grundermühle","Grundermühlenhof","Grundermühlenweg","Grüner Weg","Grunewaldstr.","Grünstr.","Günther-Weisenborn-Str.","Gustav-Freytag-Str.","Gustav-Heinemann-Str.","Gustav-Radbruch-Str.","Gut Reuschenberg","Gutenbergstr.","Haberstr.","Habichtgasse","Hafenstr.","Hagenauer Str.","Hahnenblecher","Halenseestr.","Halfenleimbach","Hallesche Str.","Halligstr.","Hamberger Str.","Hammerweg","Händelstr.","Hannah-Höch-Str.","Hans-Arp-Str.","Hans-Gerhard-Str.","Hans-Sachs-Str.","Hans-Schlehahn-Str.","Hans-von-Dohnanyi-Str.","Hardenbergstr.","Haselweg","Hauptstr.","Haus-Vorster-Str.","Hauweg","Havelstr.","Havensteinstr.","Haydnstr.","Hebbelstr.","Heckenweg","Heerweg","Hegelstr.","Heidberg","Heidehöhe","Heidestr.","Heimstättenweg","Heinrich-Böll-Str.","Heinrich-Brüning-Str.","Heinrich-Claes-Str.","Heinrich-Heine-Str.","Heinrich-Hörlein-Str.","Heinrich-Lübke-Str.","Heinrich-Lützenkirchen-Weg","Heinrichstr.","Heinrich-Strerath-Str.","Heinrich-von-Kleist-Str.","Heinrich-von-Stephan-Str.","Heisterbachstr.","Helenenstr.","Helmestr.","Hemmelrather Weg","Henry-T.-v.-Böttinger-Str.","Herderstr.","Heribertstr.","Hermann-Ehlers-Str.","Hermann-Hesse-Str.","Hermann-König-Str.","Hermann-Löns-Str.","Hermann-Milde-Str.","Hermann-Nörrenberg-Str.","Hermann-von-Helmholtz-Str.","Hermann-Waibel-Str.","Herzogstr.","Heymannstr.","Hindenburgstr.","Hirzenberg","Hitdorfer Kirchweg","Hitdorfer Str.","Höfer Mühle","Höfer Weg","Hohe Str.","Höhenstr.","Höltgestal","Holunderweg","Holzer Weg","Holzer Wiesen","Hornpottweg","Hubertusweg","Hufelandstr.","Hufer Weg","Humboldtstr.","Hummelsheim","Hummelweg","Humperdinckstr.","Hüscheider Gärten","Hüscheider Str.","Hütte","Ilmstr.","Im Bergischen Heim","Im Bruch","Im Buchenhain","Im Bühl","Im Burgfeld","Im Dorf","Im Eisholz","Im Friedenstal","Im Frohental","Im Grunde","Im Hederichsfeld","Im Jücherfeld","Im Kalkfeld","Im Kirberg","Im Kirchfeld","Im Kreuzbruch","Im Mühlenfeld","Im Nesselrader Kamp","Im Oberdorf","Im Oberfeld","Im Rosengarten","Im Rottland","Im Scheffengarten","Im Staderfeld","Im Steinfeld","Im Weidenblech","Im Winkel","Im Ziegelfeld","Imbach","Imbacher Weg","Immenweg","In den Blechenhöfen","In den Dehlen","In der Birkenau","In der Dasladen","In der Felderhütten","In der Hartmannswiese","In der Höhle","In der Schaafsdellen","In der Wasserkuhl","In der Wüste","In Holzhausen","Insterstr.","Jacob-Fröhlen-Str.","Jägerstr.","Jahnstr.","Jakob-Eulenberg-Weg","Jakobistr.","Jakob-Kaiser-Str.","Jenaer Str.","Johannes-Baptist-Str.","Johannes-Dott-Str.","Johannes-Popitz-Str.","Johannes-Wislicenus-Str.","Johannisburger Str.","Johann-Janssen-Str.","Johann-Wirtz-Weg","Josefstr.","Jüch","Julius-Doms-Str.","Julius-Leber-Str.","Kaiserplatz","Kaiserstr.","Kaiser-Wilhelm-Allee","Kalkstr.","Kämpchenstr.","Kämpenwiese","Kämper Weg","Kamptalweg","Kanalstr.","Kandinskystr.","Kantstr.","Kapellenstr.","Karl-Arnold-Str.","Karl-Bosch-Str.","Karl-Bückart-Str.","Karl-Carstens-Ring","Karl-Friedrich-Goerdeler-Str.","Karl-Jaspers-Str.","Karl-König-Str.","Karl-Krekeler-Str.","Karl-Marx-Str.","Karlstr.","Karl-Ulitzka-Str.","Karl-Wichmann-Str.","Karl-Wingchen-Str.","Käsenbrod","Käthe-Kollwitz-Str.","Katzbachstr.","Kerschensteinerstr.","Kiefernweg","Kieler Str.","Kieselstr.","Kiesweg","Kinderhausen","Kleiberweg","Kleine Kirchstr.","Kleingansweg","Kleinheider Weg","Klief","Kneippstr.","Knochenbergsweg","Kochergarten","Kocherstr.","Kockelsberg","Kolberger Str.","Kolmarer Str.","Kölner Gasse","Kölner Str.","Kolpingstr.","Königsberger Platz","Konrad-Adenauer-Platz","Köpenicker Str.","Kopernikusstr.","Körnerstr.","Köschenberg","Köttershof","Kreuzbroicher Str.","Kreuzkamp","Krummer Weg","Kruppstr.","Kuhlmannweg","Kump","Kumper Weg","Kunstfeldstr.","Küppersteger Str.","Kursiefen","Kursiefer Weg","Kurtekottenweg","Kurt-Schumacher-Ring","Kyllstr.","Langenfelder Str.","Längsleimbach","Lärchenweg","Legienstr.","Lehner Mühle","Leichlinger Str.","Leimbacher Hof","Leinestr.","Leineweberstr.","Leipziger Str.","Lerchengasse","Lessingstr.","Libellenweg","Lichstr.","Liebigstr.","Lindenstr.","Lingenfeld","Linienstr.","Lippe","Löchergraben","Löfflerstr.","Loheweg","Lohrbergstr.","Lohrstr.","Löhstr.","Lortzingstr.","Lötzener Str.","Löwenburgstr.","Lucasstr.","Ludwig-Erhard-Platz","Ludwig-Girtler-Str.","Ludwig-Knorr-Str.","Luisenstr.","Lupinenweg","Lurchenweg","Lützenkirchener Str.","Lycker Str.","Maashofstr.","Manforter Str.","Marc-Chagall-Str.","Maria-Dresen-Str.","Maria-Terwiel-Str.","Marie-Curie-Str.","Marienburger Str.","Mariendorfer Str.","Marienwerderstr.","Marie-Schlei-Str.","Marktplatz","Markusweg","Martin-Buber-Str.","Martin-Heidegger-Str.","Martin-Luther-Str.","Masurenstr.","Mathildenweg","Maurinusstr.","Mauspfad","Max-Beckmann-Str.","Max-Delbrück-Str.","Max-Ernst-Str.","Max-Holthausen-Platz","Max-Horkheimer-Str.","Max-Liebermann-Str.","Max-Pechstein-Str.","Max-Planck-Str.","Max-Scheler-Str.","Max-Schönenberg-Str.","Maybachstr.","Meckhofer Feld","Meisenweg","Memelstr.","Menchendahler Str.","Mendelssohnstr.","Merziger Str.","Mettlacher Str.","Metzer Str.","Michaelsweg","Miselohestr.","Mittelstr.","Mohlenstr.","Moltkestr.","Monheimer Str.","Montanusstr.","Montessoriweg","Moosweg","Morsbroicher Str.","Moselstr.","Moskauer Str.","Mozartstr.","Mühlenweg","Muhrgasse","Muldestr.","Mülhausener Str.","Mülheimer Str.","Münsters Gäßchen","Münzstr.","Müritzstr.","Myliusstr.","Nachtigallenweg","Nauener Str.","Neißestr.","Nelly-Sachs-Str.","Netzestr.","Neuendriesch","Neuenhausgasse","Neuenkamp","Neujudenhof","Neukronenberger Str.","Neustadtstr.","Nicolai-Hartmann-Str.","Niederblecher","Niederfeldstr.","Nietzschestr.","Nikolaus-Groß-Str.","Nobelstr.","Norderneystr.","Nordstr.","Ober dem Hof","Obere Lindenstr.","Obere Str.","Oberölbach","Odenthaler Str.","Oderstr.","Okerstr.","Olof-Palme-Str.","Ophovener Str.","Opladener Platz","Opladener Str.","Ortelsburger Str.","Oskar-Moll-Str.","Oskar-Schlemmer-Str.","Oststr.","Oswald-Spengler-Str.","Otto-Dix-Str.","Otto-Grimm-Str.","Otto-Hahn-Str.","Otto-Müller-Str.","Otto-Stange-Str.","Ottostr.","Otto-Varnhagen-Str.","Otto-Wels-Str.","Ottweilerstr.","Oulustr.","Overfeldweg","Pappelweg","Paracelsusstr.","Parkstr.","Pastor-Louis-Str.","Pastor-Scheibler-Str.","Pastorskamp","Paul-Klee-Str.","Paul-Löbe-Str.","Paulstr.","Peenestr.","Pescher Busch","Peschstr.","Pestalozzistr.","Peter-Grieß-Str.","Peter-Joseph-Lenné-Str.","Peter-Neuenheuser-Str.","Petersbergstr.","Peterstr.","Pfarrer-Jekel-Str.","Pfarrer-Klein-Str.","Pfarrer-Röhr-Str.","Pfeilshofstr.","Philipp-Ott-Str.","Piet-Mondrian-Str.","Platanenweg","Pommernstr.","Porschestr.","Poststr.","Potsdamer Str.","Pregelstr.","Prießnitzstr.","Pützdelle","Quarzstr.","Quettinger Str.","Rat-Deycks-Str.","Rathenaustr.","Ratherkämp","Ratiborer Str.","Raushofstr.","Regensburger Str.","Reinickendorfer Str.","Renkgasse","Rennbaumplatz","Rennbaumstr.","Reuschenberger Str.","Reusrather Str.","Reuterstr.","Rheinallee","Rheindorfer Str.","Rheinstr.","Rhein-Wupper-Platz","Richard-Wagner-Str.","Rilkestr.","Ringstr.","Robert-Blum-Str.","Robert-Koch-Str.","Robert-Medenwald-Str.","Rolandstr.","Romberg","Röntgenstr.","Roonstr.","Ropenstall","Ropenstaller Weg","Rosenthal","Rostocker Str.","Rotdornweg","Röttgerweg","Rückertstr.","Rudolf-Breitscheid-Str.","Rudolf-Mann-Platz","Rudolf-Stracke-Str.","Ruhlachplatz","Ruhlachstr.","Rüttersweg","Saalestr.","Saarbrücker Str.","Saarlauterner Str.","Saarstr.","Salamanderweg","Samlandstr.","Sanddornstr.","Sandstr.","Sauerbruchstr.","Schäfershütte","Scharnhorststr.","Scheffershof","Scheidemannstr.","Schellingstr.","Schenkendorfstr.","Schießbergstr.","Schillerstr.","Schlangenhecke","Schlebuscher Heide","Schlebuscher Str.","Schlebuschrath","Schlehdornstr.","Schleiermacherstr.","Schloßstr.","Schmalenbruch","Schnepfenflucht","Schöffenweg","Schöllerstr.","Schöne Aussicht","Schöneberger Str.","Schopenhauerstr.","Schubertplatz","Schubertstr.","Schulberg","Schulstr.","Schumannstr.","Schwalbenweg","Schwarzastr.","Sebastianusweg","Semmelweisstr.","Siebelplatz","Siemensstr.","Solinger Str.","Sonderburger Str.","Spandauer Str.","Speestr.","Sperberweg","Sperlingsweg","Spitzwegstr.","Sporrenberger Mühle","Spreestr.","St. Ingberter Str.","Starenweg","Stauffenbergstr.","Stefan-Zweig-Str.","Stegerwaldstr.","Steglitzer Str.","Steinbücheler Feld","Steinbücheler Str.","Steinstr.","Steinweg","Stephan-Lochner-Str.","Stephanusstr.","Stettiner Str.","Stixchesstr.","Stöckenstr.","Stralsunder Str.","Straßburger Str.","Stresemannplatz","Strombergstr.","Stromstr.","Stüttekofener Str.","Sudestr.","Sürderstr.","Syltstr.","Talstr.","Tannenbergstr.","Tannenweg","Taubenweg","Teitscheider Weg","Telegrafenstr.","Teltower Str.","Tempelhofer Str.","Theodor-Adorno-Str.","Theodor-Fliedner-Str.","Theodor-Gierath-Str.","Theodor-Haubach-Str.","Theodor-Heuss-Ring","Theodor-Storm-Str.","Theodorstr.","Thomas-Dehler-Str.","Thomas-Morus-Str.","Thomas-von-Aquin-Str.","Tönges Feld","Torstr.","Treptower Str.","Treuburger Str.","Uhlandstr.","Ulmenweg","Ulmer Str.","Ulrichstr.","Ulrich-von-Hassell-Str.","Umlag","Unstrutstr.","Unter dem Schildchen","Unterölbach","Unterstr.","Uppersberg","Van\\'t-Hoff-Str.","Veit-Stoß-Str.","Vereinsstr.","Viktor-Meyer-Str.","Vincent-van-Gogh-Str.","Virchowstr.","Voigtslach","Volhardstr.","Völklinger Str.","Von-Brentano-Str.","Von-Diergardt-Str.","Von-Eichendorff-Str.","Von-Ketteler-Str.","Von-Knoeringen-Str.","Von-Pettenkofer-Str.","Von-Siebold-Str.","Wacholderweg","Waldstr.","Walter-Flex-Str.","Walter-Hempel-Str.","Walter-Hochapfel-Str.","Walter-Nernst-Str.","Wannseestr.","Warnowstr.","Warthestr.","Weddigenstr.","Weichselstr.","Weidenstr.","Weidfeldstr.","Weiherfeld","Weiherstr.","Weinhäuser Str.","Weißdornweg","Weißenseestr.","Weizkamp","Werftstr.","Werkstättenstr.","Werner-Heisenberg-Str.","Werrastr.","Weyerweg","Widdauener Str.","Wiebertshof","Wiehbachtal","Wiembachallee","Wiesdorfer Platz","Wiesenstr.","Wilhelm-Busch-Str.","Wilhelm-Hastrich-Str.","Wilhelm-Leuschner-Str.","Wilhelm-Liebknecht-Str.","Wilhelmsgasse","Wilhelmstr.","Willi-Baumeister-Str.","Willy-Brandt-Ring","Winand-Rossi-Str.","Windthorststr.","Winkelweg","Winterberg","Wittenbergstr.","Wolf-Vostell-Str.","Wolkenburgstr.","Wupperstr.","Wuppertalstr.","Wüstenhof","Yitzhak-Rabin-Str.","Zauberkuhle","Zedernweg","Zehlendorfer Str.","Zehntenweg","Zeisigweg","Zeppelinstr.","Zschopaustr.","Zum Claashäuschen","Zündhütchenweg","Zur Alten Brauerei","Zur alten Fabrik"]
};

},{}],24:[function(require,module,exports){
module['exports'] = {
    items: ["Abel","Abicht","Abraham","Abramovic","Abt","Achilles","Achkinadze","Ackermann","Adam","Adams","Ade","Agostini","Ahlke","Ahrenberg","Ahrens","Aigner","Albert","Albrecht","Alexa","Alexander","Alizadeh","Allgeyer","Amann","Amberg","Anding","Anggreny","Apitz","Arendt","Arens","Arndt","Aryee","Aschenbroich","Assmus","Astafei","Auer","Axmann","Baarck","Bachmann","Badane","Bader","Baganz","Bahl","Bak","Balcer","Balck","Balkow","Balnuweit","Balzer","Banse","Barr","Bartels","Barth","Barylla","Baseda","Battke","Bauer","Bauermeister","Baumann","Baumeister","Bauschinger","Bauschke","Bayer","Beavogui","Beck","Beckel","Becker","Beckmann","Bedewitz","Beele","Beer","Beggerow","Beh","Behr","Behrenbruch","Belz","Bender","Benecke","Benner","Benninger","Benzing","Berends","Berger","Berner","Berning","Bertenbreiter","Best","Bethke","Betz","Beushausen","Beutelspacher","Beyer","Biba","Bichler","Bickel","Biedermann","Bieler","Bielert","Bienasch","Bienias","Biesenbach","Bigdeli","Birkemeyer","Bittner","Blank","Blaschek","Blassneck","Bloch","Blochwitz","Blockhaus","Blum","Blume","Bock","Bode","Bogdashin","Bogenrieder","Bohge","Bolm","Borgschulze","Bork","Bormann","Bornscheuer","Borrmann","Borsch","Boruschewski","Bos","Bosler","Bourrouag","Bouschen","Boxhammer","Boyde","Bozsik","Brand","Brandenburg","Brandis","Brandt","Brauer","Braun","Brehmer","Breitenstein","Bremer","Bremser","Brenner","Brettschneider","Breu","Breuer","Briesenick","Bringmann","Brinkmann","Brix","Broening","Brosch","Bruckmann","Bruder","Bruhns","Brunner","Bruns","Bräutigam","Brömme","Brüggmann","Buchholz","Buchrucker","Buder","Bultmann","Bunjes","Burger","Burghagen","Burkhard","Burkhardt","Burmeister","Busch","Buschbaum","Busemann","Buss","Busse","Bussmann","Byrd","Bäcker","Böhm","Bönisch","Börgeling","Börner","Böttner","Büchele","Bühler","Büker","Büngener","Bürger","Bürklein","Büscher","Büttner","Camara","Carlowitz","Carlsohn","Caspari","Caspers","Chapron","Christ","Cierpinski","Clarius","Cleem","Cleve","Co","Conrad","Cordes","Cornelsen","Cors","Cotthardt","Crews","Cronjäger","Crosskofp","Da","Dahm","Dahmen","Daimer","Damaske","Danneberg","Danner","Daub","Daubner","Daudrich","Dauer","Daum","Dauth","Dautzenberg","De","Decker","Deckert","Deerberg","Dehmel","Deja","Delonge","Demut","Dengler","Denner","Denzinger","Derr","Dertmann","Dethloff","Deuschle","Dieckmann","Diedrich","Diekmann","Dienel","Dies","Dietrich","Dietz","Dietzsch","Diezel","Dilla","Dingelstedt","Dippl","Dittmann","Dittmar","Dittmer","Dix","Dobbrunz","Dobler","Dohring","Dolch","Dold","Dombrowski","Donie","Doskoczynski","Dragu","Drechsler","Drees","Dreher","Dreier","Dreissigacker","Dressler","Drews","Duma","Dutkiewicz","Dyett","Dylus","Dächert","Döbel","Döring","Dörner","Dörre","Dück","Eberhard","Eberhardt","Ecker","Eckhardt","Edorh","Effler","Eggenmueller","Ehm","Ehmann","Ehrig","Eich","Eifert","Einert","Eisenlauer","Ekpo","Elbe","Eleyth","Elss","Emert","Emmelmann","Ender","Engel","Engelen","Engelmann","Eplinius","Erdmann","Erhardt","Erlei","Erm","Ernst","Ertl","Erwes","Esenwein","Esser","Evers","Everts","Ewald","Fahner","Faller","Falter","Farber","Fassbender","Faulhaber","Fehrig","Feld","Felke","Feller","Fenner","Fenske","Feuerbach","Fietz","Figl","Figura","Filipowski","Filsinger","Fincke","Fink","Finke","Fischer","Fitschen","Fleischer","Fleischmann","Floder","Florczak","Flore","Flottmann","Forkel","Forst","Frahmeke","Frank","Franke","Franta","Frantz","Franz","Franzis","Franzmann","Frauen","Frauendorf","Freigang","Freimann","Freimuth","Freisen","Frenzel","Frey","Fricke","Fried","Friedek","Friedenberg","Friedmann","Friedrich","Friess","Frisch","Frohn","Frosch","Fuchs","Fuhlbrügge","Fusenig","Fust","Förster","Gaba","Gabius","Gabler","Gadschiew","Gakstädter","Galander","Gamlin","Gamper","Gangnus","Ganzmann","Garatva","Gast","Gastel","Gatzka","Gauder","Gebhardt","Geese","Gehre","Gehrig","Gehring","Gehrke","Geiger","Geisler","Geissler","Gelling","Gens","Gerbennow","Gerdel","Gerhardt","Gerschler","Gerson","Gesell","Geyer","Ghirmai","Ghosh","Giehl","Gierisch","Giesa","Giesche","Gilde","Glatting","Goebel","Goedicke","Goldbeck","Goldfuss","Goldkamp","Goldkühle","Goller","Golling","Gollnow","Golomski","Gombert","Gotthardt","Gottschalk","Gotz","Goy","Gradzki","Graf","Grams","Grasse","Gratzky","Grau","Greb","Green","Greger","Greithanner","Greschner","Griem","Griese","Grimm","Gromisch","Gross","Grosser","Grossheim","Grosskopf","Grothaus","Grothkopp","Grotke","Grube","Gruber","Grundmann","Gruning","Gruszecki","Gröss","Grötzinger","Grün","Grüner","Gummelt","Gunkel","Gunther","Gutjahr","Gutowicz","Gutschank","Göbel","Göckeritz","Göhler","Görlich","Görmer","Götz","Götzelmann","Güldemeister","Günther","Günz","Gürbig","Haack","Haaf","Habel","Hache","Hackbusch","Hackelbusch","Hadfield","Hadwich","Haferkamp","Hahn","Hajek","Hallmann","Hamann","Hanenberger","Hannecker","Hanniske","Hansen","Hardy","Hargasser","Harms","Harnapp","Harter","Harting","Hartlieb","Hartmann","Hartwig","Hartz","Haschke","Hasler","Hasse","Hassfeld","Haug","Hauke","Haupt","Haverney","Heberstreit","Hechler","Hecht","Heck","Hedermann","Hehl","Heidelmann","Heidler","Heinemann","Heinig","Heinke","Heinrich","Heinze","Heiser","Heist","Hellmann","Helm","Helmke","Helpling","Hengmith","Henkel","Hennes","Henry","Hense","Hensel","Hentel","Hentschel","Hentschke","Hepperle","Herberger","Herbrand","Hering","Hermann","Hermecke","Herms","Herold","Herrmann","Herschmann","Hertel","Herweg","Herwig","Herzenberg","Hess","Hesse","Hessek","Hessler","Hetzler","Heuck","Heydemüller","Hiebl","Hildebrand","Hildenbrand","Hilgendorf","Hillard","Hiller","Hingsen","Hingst","Hinrichs","Hirsch","Hirschberg","Hirt","Hodea","Hoffman","Hoffmann","Hofmann","Hohenberger","Hohl","Hohn","Hohnheiser","Hold","Holdt","Holinski","Holl","Holtfreter","Holz","Holzdeppe","Holzner","Hommel","Honz","Hooss","Hoppe","Horak","Horn","Horna","Hornung","Hort","Howard","Huber","Huckestein","Hudak","Huebel","Hugo","Huhn","Hujo","Huke","Huls","Humbert","Huneke","Huth","Häber","Häfner","Höcke","Höft","Höhne","Hönig","Hördt","Hübenbecker","Hübl","Hübner","Hügel","Hüttcher","Hütter","Ibe","Ihly","Illing","Isak","Isekenmeier","Itt","Jacob","Jacobs","Jagusch","Jahn","Jahnke","Jakobs","Jakubczyk","Jambor","Jamrozy","Jander","Janich","Janke","Jansen","Jarets","Jaros","Jasinski","Jasper","Jegorov","Jellinghaus","Jeorga","Jerschabek","Jess","John","Jonas","Jossa","Jucken","Jung","Jungbluth","Jungton","Just","Jürgens","Kaczmarek","Kaesmacher","Kahl","Kahlert","Kahles","Kahlmeyer","Kaiser","Kalinowski","Kallabis","Kallensee","Kampf","Kampschulte","Kappe","Kappler","Karhoff","Karrass","Karst","Karsten","Karus","Kass","Kasten","Kastner","Katzinski","Kaufmann","Kaul","Kausemann","Kawohl","Kazmarek","Kedzierski","Keil","Keiner","Keller","Kelm","Kempe","Kemper","Kempter","Kerl","Kern","Kesselring","Kesselschläger","Kette","Kettenis","Keutel","Kick","Kiessling","Kinadeter","Kinzel","Kinzy","Kirch","Kirst","Kisabaka","Klaas","Klabuhn","Klapper","Klauder","Klaus","Kleeberg","Kleiber","Klein","Kleinert","Kleininger","Kleinmann","Kleinsteuber","Kleiss","Klemme","Klimczak","Klinger","Klink","Klopsch","Klose","Kloss","Kluge","Kluwe","Knabe","Kneifel","Knetsch","Knies","Knippel","Knobel","Knoblich","Knoll","Knorr","Knorscheidt","Knut","Kobs","Koch","Kochan","Kock","Koczulla","Koderisch","Koehl","Koehler","Koenig","Koester","Kofferschlager","Koha","Kohle","Kohlmann","Kohnle","Kohrt","Koj","Kolb","Koleiski","Kolokas","Komoll","Konieczny","Konig","Konow","Konya","Koob","Kopf","Kosenkow","Koster","Koszewski","Koubaa","Kovacs","Kowalick","Kowalinski","Kozakiewicz","Krabbe","Kraft","Kral","Kramer","Krauel","Kraus","Krause","Krauspe","Kreb","Krebs","Kreissig","Kresse","Kreutz","Krieger","Krippner","Krodinger","Krohn","Krol","Kron","Krueger","Krug","Kruger","Krull","Kruschinski","Krämer","Kröckert","Kröger","Krüger","Kubera","Kufahl","Kuhlee","Kuhnen","Kulimann","Kulma","Kumbernuss","Kummle","Kunz","Kupfer","Kupprion","Kuprion","Kurnicki","Kurrat","Kurschilgen","Kuschewitz","Kuschmann","Kuske","Kustermann","Kutscherauer","Kutzner","Kwadwo","Kähler","Käther","Köhler","Köhrbrück","Köhre","Kölotzei","König","Köpernick","Köseoglu","Kúhn","Kúhnert","Kühn","Kühnel","Kühnemund","Kühnert","Kühnke","Küsters","Küter","Laack","Lack","Ladewig","Lakomy","Lammert","Lamos","Landmann","Lang","Lange","Langfeld","Langhirt","Lanig","Lauckner","Lauinger","Laurén","Lausecker","Laux","Laws","Lax","Leberer","Lehmann","Lehner","Leibold","Leide","Leimbach","Leipold","Leist","Leiter","Leiteritz","Leitheim","Leiwesmeier","Lenfers","Lenk","Lenz","Lenzen","Leo","Lepthin","Lesch","Leschnik","Letzelter","Lewin","Lewke","Leyckes","Lg","Lichtenfeld","Lichtenhagen","Lichtl","Liebach","Liebe","Liebich","Liebold","Lieder","Lienshöft","Linden","Lindenberg","Lindenmayer","Lindner","Linke","Linnenbaum","Lippe","Lipske","Lipus","Lischka","Lobinger","Logsch","Lohmann","Lohre","Lohse","Lokar","Loogen","Lorenz","Losch","Loska","Lott","Loy","Lubina","Ludolf","Lufft","Lukoschek","Lutje","Lutz","Löser","Löwa","Lübke","Maak","Maczey","Madetzky","Madubuko","Mai","Maier","Maisch","Malek","Malkus","Mallmann","Malucha","Manns","Manz","Marahrens","Marchewski","Margis","Markowski","Marl","Marner","Marquart","Marschek","Martel","Marten","Martin","Marx","Marxen","Mathes","Mathies","Mathiszik","Matschke","Mattern","Matthes","Matula","Mau","Maurer","Mauroff","May","Maybach","Mayer","Mebold","Mehl","Mehlhorn","Mehlorn","Meier","Meisch","Meissner","Meloni","Melzer","Menga","Menne","Mensah","Mensing","Merkel","Merseburg","Mertens","Mesloh","Metzger","Metzner","Mewes","Meyer","Michallek","Michel","Mielke","Mikitenko","Milde","Minah","Mintzlaff","Mockenhaupt","Moede","Moedl","Moeller","Moguenara","Mohr","Mohrhard","Molitor","Moll","Moller","Molzan","Montag","Moormann","Mordhorst","Morgenstern","Morhelfer","Moritz","Moser","Motchebon","Motzenbbäcker","Mrugalla","Muckenthaler","Mues","Muller","Mulrain","Mächtig","Mäder","Möcks","Mögenburg","Möhsner","Möldner","Möllenbeck","Möller","Möllinger","Mörsch","Mühleis","Müller","Münch","Nabein","Nabow","Nagel","Nannen","Nastvogel","Nau","Naubert","Naumann","Ne","Neimke","Nerius","Neubauer","Neubert","Neuendorf","Neumair","Neumann","Neupert","Neurohr","Neuschwander","Newton","Ney","Nicolay","Niedermeier","Nieklauson","Niklaus","Nitzsche","Noack","Nodler","Nolte","Normann","Norris","Northoff","Nowak","Nussbeck","Nwachukwu","Nytra","Nöh","Oberem","Obergföll","Obermaier","Ochs","Oeser","Olbrich","Onnen","Ophey","Oppong","Orth","Orthmann","Oschkenat","Osei","Osenberg","Ostendarp","Ostwald","Otte","Otto","Paesler","Pajonk","Pallentin","Panzig","Paschke","Patzwahl","Paukner","Peselman","Peter","Peters","Petzold","Pfeiffer","Pfennig","Pfersich","Pfingsten","Pflieger","Pflügner","Philipp","Pichlmaier","Piesker","Pietsch","Pingpank","Pinnock","Pippig","Pitschugin","Plank","Plass","Platzer","Plauk","Plautz","Pletsch","Plotzitzka","Poehn","Poeschl","Pogorzelski","Pohl","Pohland","Pohle","Polifka","Polizzi","Pollmächer","Pomp","Ponitzsch","Porsche","Porth","Poschmann","Poser","Pottel","Prah","Prange","Prediger","Pressler","Preuk","Preuss","Prey","Priemer","Proske","Pusch","Pöche","Pöge","Raabe","Rabenstein","Rach","Radtke","Rahn","Ranftl","Rangen","Ranz","Rapp","Rath","Rau","Raubuch","Raukuc","Rautenkranz","Rehwagen","Reiber","Reichardt","Reichel","Reichling","Reif","Reifenrath","Reimann","Reinberg","Reinelt","Reinhardt","Reinke","Reitze","Renk","Rentz","Renz","Reppin","Restle","Restorff","Retzke","Reuber","Reumann","Reus","Reuss","Reusse","Rheder","Rhoden","Richards","Richter","Riedel","Riediger","Rieger","Riekmann","Riepl","Riermeier","Riester","Riethmüller","Rietmüller","Rietscher","Ringel","Ringer","Rink","Ripken","Ritosek","Ritschel","Ritter","Rittweg","Ritz","Roba","Rockmeier","Rodehau","Rodowski","Roecker","Roggatz","Rohländer","Rohrer","Rokossa","Roleder","Roloff","Roos","Rosbach","Roschinsky","Rose","Rosenauer","Rosenbauer","Rosenthal","Rosksch","Rossberg","Rossler","Roth","Rother","Ruch","Ruckdeschel","Rumpf","Rupprecht","Ruth","Ryjikh","Ryzih","Rädler","Räntsch","Rödiger","Röse","Röttger","Rücker","Rüdiger","Rüter","Sachse","Sack","Saflanis","Sagafe","Sagonas","Sahner","Saile","Sailer","Salow","Salzer","Salzmann","Sammert","Sander","Sarvari","Sattelmaier","Sauer","Sauerland","Saumweber","Savoia","Scc","Schacht","Schaefer","Schaffarzik","Schahbasian","Scharf","Schedler","Scheer","Schelk","Schellenbeck","Schembera","Schenk","Scherbarth","Scherer","Schersing","Scherz","Scheurer","Scheuring","Scheytt","Schielke","Schieskow","Schildhauer","Schilling","Schima","Schimmer","Schindzielorz","Schirmer","Schirrmeister","Schlachter","Schlangen","Schlawitz","Schlechtweg","Schley","Schlicht","Schlitzer","Schmalzle","Schmid","Schmidt","Schmidtchen","Schmitt","Schmitz","Schmuhl","Schneider","Schnelting","Schnieder","Schniedermeier","Schnürer","Schoberg","Scholz","Schonberg","Schondelmaier","Schorr","Schott","Schottmann","Schouren","Schrader","Schramm","Schreck","Schreiber","Schreiner","Schreiter","Schroder","Schröder","Schuermann","Schuff","Schuhaj","Schuldt","Schult","Schulte","Schultz","Schultze","Schulz","Schulze","Schumacher","Schumann","Schupp","Schuri","Schuster","Schwab","Schwalm","Schwanbeck","Schwandke","Schwanitz","Schwarthoff","Schwartz","Schwarz","Schwarzer","Schwarzkopf","Schwarzmeier","Schwatlo","Schweisfurth","Schwennen","Schwerdtner","Schwidde","Schwirkschlies","Schwuchow","Schäfer","Schäffel","Schäffer","Schäning","Schöckel","Schönball","Schönbeck","Schönberg","Schönebeck","Schönenberger","Schönfeld","Schönherr","Schönlebe","Schötz","Schüler","Schüppel","Schütz","Schütze","Seeger","Seelig","Sehls","Seibold","Seidel","Seiders","Seigel","Seiler","Seitz","Semisch","Senkel","Sewald","Siebel","Siebert","Siegling","Sielemann","Siemon","Siener","Sievers","Siewert","Sihler","Sillah","Simon","Sinnhuber","Sischka","Skibicki","Sladek","Slotta","Smieja","Soboll","Sokolowski","Soller","Sollner","Sommer","Somssich","Sonn","Sonnabend","Spahn","Spank","Spelmeyer","Spiegelburg","Spielvogel","Spinner","Spitzmüller","Splinter","Sporrer","Sprenger","Spöttel","Stahl","Stang","Stanger","Stauss","Steding","Steffen","Steffny","Steidl","Steigauf","Stein","Steinecke","Steinert","Steinkamp","Steinmetz","Stelkens","Stengel","Stengl","Stenzel","Stepanov","Stephan","Stern","Steuk","Stief","Stifel","Stoll","Stolle","Stolz","Storl","Storp","Stoutjesdijk","Stratmann","Straub","Strausa","Streck","Streese","Strege","Streit","Streller","Strieder","Striezel","Strogies","Strohschank","Strunz","Strutz","Stube","Stöckert","Stöppler","Stöwer","Stürmer","Suffa","Sujew","Sussmann","Suthe","Sutschet","Swillims","Szendrei","Sören","Sürth","Tafelmeier","Tang","Tasche","Taufratshofer","Tegethof","Teichmann","Tepper","Terheiden","Terlecki","Teufel","Theele","Thieke","Thimm","Thiomas","Thomas","Thriene","Thränhardt","Thust","Thyssen","Thöne","Tidow","Tiedtke","Tietze","Tilgner","Tillack","Timmermann","Tischler","Tischmann","Tittman","Tivontschik","Tonat","Tonn","Trampeli","Trauth","Trautmann","Travan","Treff","Tremmel","Tress","Tsamonikian","Tschiers","Tschirch","Tuch","Tucholke","Tudow","Tuschmo","Tächl","Többen","Töpfer","Uhlemann","Uhlig","Uhrig","Uibel","Uliczka","Ullmann","Ullrich","Umbach","Umlauft","Umminger","Unger","Unterpaintner","Urban","Urbaniak","Urbansky","Urhig","Vahlensieck","Van","Vangermain","Vater","Venghaus","Verniest","Verzi","Vey","Viellehner","Vieweg","Voelkel","Vogel","Vogelgsang","Vogt","Voigt","Vokuhl","Volk","Volker","Volkmann","Von","Vona","Vontein","Wachenbrunner","Wachtel","Wagner","Waibel","Wakan","Waldmann","Wallner","Wallstab","Walter","Walther","Walton","Walz","Wanner","Wartenberg","Waschbüsch","Wassilew","Wassiluk","Weber","Wehrsen","Weidlich","Weidner","Weigel","Weight","Weiler","Weimer","Weis","Weiss","Weller","Welsch","Welz","Welzel","Weniger","Wenk","Werle","Werner","Werrmann","Wessel","Wessinghage","Weyel","Wezel","Wichmann","Wickert","Wiebe","Wiechmann","Wiegelmann","Wierig","Wiese","Wieser","Wilhelm","Wilky","Will","Willwacher","Wilts","Wimmer","Winkelmann","Winkler","Winter","Wischek","Wischer","Wissing","Wittich","Wittl","Wolf","Wolfarth","Wolff","Wollenberg","Wollmann","Woytkowska","Wujak","Wurm","Wyludda","Wölpert","Wöschler","Wühn","Wünsche","Zach","Zaczkiewicz","Zahn","Zaituc","Zandt","Zanner","Zapletal","Zauber","Zeidler","Zekl","Zender","Zeuch","Zeyen","Zeyhle","Ziegler","Zimanyi","Zimmer","Zimmermann","Zinser","Zintl","Zipp","Zipse","Zschunke","Zuber","Zwiener","Zümsande","Östringer","Überacker"]
};

},{}],25:[function(require,module,exports){
module['exports'] = {
    items: ['Prof.', 'Dr.']
};

},{}],26:[function(require,module,exports){
function ug(loadedLocales, locale){
    let self    =   this;

    self.loadedLists    =   [];

    self.fallbackLocale =   'de';

    self.locale         =   locale;
    self.loadedLocales  =   loadedLocales;

    self.id =   function(min = 1, max = 1000000){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    self.get    =   function(folder, parameter, locale, resultClear = false){
        if(!locale){
            locale  =   self.locale;
        }

        if(!resultClear)
        {
            if(folder === 'address'){
                return self.address(locale);
            }
        }

        const items =   self.loadItems(folder, locale, parameter);

        return self.getRandomItem(items, locale);
    }

    self.building_number    =   function(locale){
        return self.getRandomItem(self.loadItems('building_number', locale), locale, false);
    }

    self.address    =   function(locale){
        let val         =   self.get('address', null, locale, true);

        const street    =   self.get('street', null, locale);
        const bn        =   self.building_number(locale);
        const postcode  =   self.get('postcode', null, locale);
        const country   =   self.get('country', null, locale);
        const city      =   self.get('city', null, locale);

        return val
                    .replace('[STREET]', street)
                    .replace('[STREET_NUMBER]',bn)
                    .replace('[CITY]', city)
                    .replace('[ZIP_CODE]', postcode)
                    .replace('[COUNTRY]', country);
    }

    self.schemaBuild    =   function(str, locale){
        if(!locale){
            locale  =   self.locale;
        }

        const regex = /({(.*?):(.*?)})/gm;

        let m;

        let replacer    =   {};

        while ((m = regex.exec(str)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            let folder  =   m[2];
            let call    =   m[3];

            if(call !== 'default'){
                folder  +=  '_'+call;
            }

            let items = self.loadItems(folder, locale);

            if(!replacer[m[1]])
            {
                replacer[m[1]]  =   [];
            }

            replacer[m[1]].push(self.getRandomItem(items, locale));
        }

        Object.keys(replacer).forEach((key)=>{
            replacer[key].forEach((e)=>{
                str =   str.replace(key, e);
            });
        })

        return str;
    }

    self.getRandomItem  =   function(items, locale, withZero = true, char = '#'){
        return self.generateRandomNumberByChar(self.schemaBuild(items[Math.floor(Math.random()*items.length)], locale), char, withZero);
    }

    self.datetime   =   function(min = null, max = null){
        const gd    =   self.generateDate(min, max);

        return gd.getFullYear()+'-'+((gd.getMonth() <= 8) ? '0' : '')+(gd.getMonth()+1)+'-'+((gd.getDate() <= 9) ? '0' : '')+gd.getDate()+' '+((gd.getHours() <= 9) ? '0' : '')+gd.getHours()+':'+((gd.getMinutes() <= 9) ? '0' : '')+gd.getMinutes()+':'+((gd.getSeconds() <= 9) ? '0' : '')+gd.getSeconds();
    }

    self.date   =   function(max = null, min = null){
         const gd    =   self.generateDate(min, max);

        return gd.getFullYear()+'-'+((gd.getMonth() <= 8) ? '0' : '')+(gd.getMonth()+1)+'-'+((gd.getDate() <= 9) ? '0' : '')+gd.getDate();
    }

    self.diffYearNow    =   function(date){
        if(!date){
            return;
        }

        let parts   =   date.split('-');

        const cd    =   new Date();
        const d     =   new Date(parts[0], (parts[1] - 1), parts[2]);

        let age = cd.getFullYear() - d.getFullYear();
        let m = cd.getMonth() - d.getMonth();

        if (m < 0 || (m === 0 && cd.getDate() < d.getDate())) {
            age--;
        }

        return age;
    }

    self.generateRandomNumberByChar =   function(str, char, withZero = true){
        if(char === ''){
            return str;
        }

        str =   String(str);

        while(true){
            if(str.indexOf(char) === -1){
                break;
            }

            str =   str.replace(char, ''+self.id((withZero ? 0 : 1),9));
        }

        return str;
    }

    self.generateDate   =   function(min, max){
        let start =  new Date(2000, 0, 1);
        let end   =  new Date();

        if(min){
            let s   =   min.split('-');

            start   =   new Date(s[0], (s[1]-1), s[2]);
        }

        if(max){
            let s   =   max.split('-');

            end   =   new Date(s[0], (s[1]-1), s[2]);
        }

        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    self.loadItems  =   function(folder, locale, parameter = null){
        if(!locale){
            locale  =   self.locale;
        }

        if(!self.loadedLocales[locale] || !self.loadedLocales[locale][folder]){
            if(!self.loadedLocales[self.fallbackLocale] || !self.loadedLocales[self.fallbackLocale][folder]){
                throw 'folder "'+folder+'" by locale "'+locale+'" not available';
            } else {
                locale  =   this.fallbackLocale;
            }
        }

        if(self.loadedLocales[locale][folder].hasOwnProperty('run')){
            return self.loadedLocales[locale][folder].run(parameter);
        }

        return self.loadedLocales[locale][folder].items;
    }
}

module['exports']  =   ug;

},{}]},{},[2])(2)
});
