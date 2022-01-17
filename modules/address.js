module['exports'] = function(constructs){
    const self = this;

    self.getAddress =   function(){
        let address = constructs.loadRessource('address');

        return address.charAt(0).toUpperCase()+address.substr(1);
    };

    self.getStreet  =   function(){
        return constructs.loadRessource('address', 'streets');
    }

    self.getBuildingNumber  =   function(){
        return constructs.loadRessource('address', 'building_numbers');
    }

    self.getPostcode    =   function(){
        return constructs.loadRessource('address', 'postcodes');
    };

    self.getState = function(){
        return constructs.loadRessource('address', 'states');
    }
};
