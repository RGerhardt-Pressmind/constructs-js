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
}

module['exports']  =   Construct;
