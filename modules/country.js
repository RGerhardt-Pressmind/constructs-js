module['exports'] = function(constructs){
    const self = this;

    self.getDefaultCountry = function(){
        return constructs.loadRessource('country', 'default');
    }

    self.getCountry = function(){
        return constructs.loadRessource('country');
    }
}
