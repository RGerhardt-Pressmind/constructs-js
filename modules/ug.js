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

        let item    =   self.getRandomItem(items, locale);

        return self.loadAfterHook(item, folder, locale);
    }

    self.address    =   function(locale){
        let val         =   self.get('address', null, locale, true);

        const street    =   self.get('street', null, locale);
        const bn        =   self.get('building_number', locale);
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

    self.loadAfterHook  =   function(item, folder, locale){
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

        if(self.loadedLocales[locale][folder].hasOwnProperty('after')){
            return self.loadedLocales[locale][folder].after(item);
        }

        return item;
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
