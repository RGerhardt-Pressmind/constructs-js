function Constructs(locale){
    let self    =   this;

    self.fallbackLocale = 'de';

    if(!locale){
        locale  =   self.fallbackLocale;
    }

    self.loadedLocales  =   {
        'af_ZA':    require('./locales/af_ZA'), // South Africa
        'ar':       require('./locales/ar'), // Argentina
        'az':       require('./locales/az'), // Azerbaijan
        'cz':       require('./locales/cz'), // Czech Republic
        'de':       require('./locales/de'), // German
        'de_AT':    require('./locales/de_AT'), // Austria
        'de_CH':    require('./locales/de_CH'), // Switzerland
        'en':       require('./locales/en'), // United States of America
        'en_GB':    require('./locales/en_GB'), // Great Britain
        'es':       require('./locales/es'), // Spain
        'fr':       require('./locales/fr'), // France
        'ge':       require('./locales/ge'), // Georgia
        'gr':       require('./locales/gr'), // Greece
        'hr':       require('./locales/hr'), // Croatia
        'id':       require('./locales/id'), // Indonesia
        'il':       require('./locales/il'), // Israel
        'ir':       require('./locales/ir'), // Iran
        'it':       require('./locales/it'), // Italia
        'jp':       require('./locales/jp'), // Japan
        'lv':       require('./locales/lv'), // Latvia
        'pl':       require('./locales/pl'), // Poland
    };

    if(!self.loadedLocales[locale]){
        throw 'locale "'+locale+'" not available';
    }

    self.locale         =   locale;
    self.allowedResults =   ['json', 'xml'];

    const address       =   require('./modules/address');
    self.address        =   new address(self);

    const city              = require('./modules/city');
    self.city               = new city(self);

    const company           = require('./modules/company');
    self.company            = new company(self);

    const country           = require('./modules/country');
    self.country            = new country(self);

    const email             = require('./modules/email');
    self.email              = new email(self);

    const image             = require('./modules/image');
    self.image              = new image(self);

    const loremIpsum        = require('./modules/loremIpsum');
    self.loremIpsum         = new loremIpsum(self);

    const name              = require('./modules/name');
    self.name               = new name(self);

    const phone             = require('./modules/phone');
    self.phone              = new phone(self);

    self.resultOutput   =   function(output){
        if(self.template.output.result === 'output') {
            if(self.template.output.type === 'json') {
                return JSON.stringify(output);
            } else if(self.template.output.type === 'xml'){
                return self.objectToXML(output, true);
            }
        }
    }

    self.id =   function(min = 1, max = 1000000){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    self.datetime   =   function(max = null, min = null){
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

        let parameterNew = [];

        parameter.forEach((p, index)=>{
            if(p.indexOf(':') !== -1){
                let g = p.split(':');

                parameterNew[g[0]]  =   g[1];
                return false;
            }

            Object.keys(element).forEach((key)=>{
                if(typeof element[key] === 'string')
                {
                    let v = (!parameterNew[index] ? parameter[index] : parameterNew[index]);

                    parameterNew[index]   =   v.replace('{'+key+'}', element[key]);
                }
            });

            if(parameterNew[index].indexOf('{') !== -1) {
                hasError    =   true;
                return true;
            }
        });

        return (hasError) ? null : parameterNew;
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
        const regex = /(\[([(a-z_A-Z0-9)]+)(:([a-z_A-Z0-9]+))?(\(.*\))?\])/gm;

        let result  =   [];

        let m;

        while ((m = regex.exec(mask)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            result.push({module: m[2], method: m[4], parameter: m[5], mask: m[1]});
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

                v = self.maskReplacer(v, element, mr[index]);

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

    self.maskReplacer = function(v, element, masks){
        if(masks && masks.length > 0) {
            masks.forEach((mask)=>{
                let c = self[mask['module']];
                let m = mask['method'];

                let params = self.buildParameters(mask['parameter'], element);
                let r;

                if(!m) {
                    r = c.apply(self, params);

                    if(r){
                        v   =   v.replace(mask.mask, r);
                    } else {
                        return false;
                    }
                } else {
                    let options =   {constructs: self};

                    if(params){
                        Object.keys(params).forEach(function(k){
                            options[k] = params[k];
                        });
                    }

                    r = c[m](options);

                    v   =   v.replace(mask.mask, r);
                }
            });
        }

        return v;
    }

    self.validateTemplateFileContent    =   function(){
        const propertiesCheck    =   ['structure', 'output'];

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

    self.loadRessource  =   function(folder, method = 'items', options = null){
        let locale = self.locale;

        if(!self.loadedLocales[locale] || !self.loadedLocales[locale][folder] || !self.loadedLocales[locale][folder][method]){
            if(!self.loadedLocales[self.fallbackLocale] || !self.loadedLocales[self.fallbackLocale][folder] || !self.loadedLocales[self.fallbackLocale][folder][method]){
                throw 'folder "'+folder+'" with method "'+method+'" by locale "'+locale+'" not available';
            } else {
                locale  =   this.fallbackLocale;
            }
        }

        let items   =   [];

        if(typeof self.loadedLocales[locale][folder][method] === 'function'){
            items   =   self.loadedLocales[locale][folder][method](options);
        } else if(typeof self.loadedLocales[locale][folder][method] === 'object'){
            items   =   self.loadedLocales[locale][folder][method];
        }

        let withZero    =   (!options || (options && options.withZero));
        let charReplace =   (!options || (options && !options.char) ? '#' : options.char);

        return self.generateRandomNumberByChar(self.schemaBuild(items[Math.floor(Math.random()*items.length)]), charReplace, withZero);
    }

    self.loadItems = function(folder){
        let locale = self.locale;

        if(!self.loadedLocales[locale] || !self.loadedLocales[locale][folder] || !self.loadedLocales[locale][folder]['items']){
            if(!self.loadedLocales[self.fallbackLocale] || !self.loadedLocales[self.fallbackLocale][folder] || !self.loadedLocales[self.fallbackLocale][folder]['items']){
                throw 'folder "'+folder+'" by locale "'+locale+'" not available';
            } else {
                locale  =   this.fallbackLocale;
            }
        }

        return self.loadedLocales[locale][folder].items;
    }

    self.schemaBuild    =   function(str){
        const regex = /({(.*?):(.*?)})/gm;

        let m;

        let replacer    =   {};

        while ((m = regex.exec(str)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            let folder  =   m[2];
            let call    =   m[3];

            let c = self[folder];

            if(c === undefined){
                throw '"'+folder+'" not exist';
            }

            if(!replacer[m[1]])
            {
                replacer[m[1]]  =   [];
            }

            let r;

            if(typeof c[call] === 'undefined'){
                r = self.loadRessource(folder, call);
            } else {
                r = c[call]();
            }

            replacer[m[1]].push(r);
        }

        Object.keys(replacer).forEach((key)=>{
            replacer[key].forEach((e)=>{
                str =   str.replace(key, e);
            });
        })

        return str;
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
}

module['exports']  =   Constructs;
