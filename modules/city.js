module['exports'] = function(constructs){
    const self  =   this;

    self.getCity =   function(){
        return constructs.loadRessource('city');
    };

    self.getPrefix  =   function(){
        return constructs.loadRessource('city', 'prefix')
    };

    self.getSuffix  =   function(){
        return constructs.loadRessource('city', 'suffix')
    };
}
