module['exports'] = function(constructs){
    const self = this;

    self.getPhoneNumber = function(){
        return constructs.loadRessource('phone');
    }

    self.getCellPhoneNumber = function(){
        return constructs.loadRessource('phone', 'cell_phones');
    }
}
