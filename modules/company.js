module['exports'] = function(constructs){
    const self = this;

    self.getCompany = function(){
        return constructs.loadRessource('company');
    }

    self.getSuffix = function(){
        return constructs.loadRessource('company', 'suffix');
    }
}
