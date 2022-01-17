module['exports'] = function(constructs){
    const self = this;

    self.getWords = function(options){
        const maxWords = (options && options.max) ? options.max : 10;

        const items = constructs.loadItems('loremIpsum');

        let allWords = [];

        for(let i = 0; ++i <= maxWords;)
        {
            let str = items[Math.floor(Math.random()*items.length)];

            if(allWords.length === 0){
                str = str.charAt(0).toUpperCase()+str.slice(1);
            }

            allWords.push(str);
        }

        return [allWords.join(' ')+'.'];
    }
}
