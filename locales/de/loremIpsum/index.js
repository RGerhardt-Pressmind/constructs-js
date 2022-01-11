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
