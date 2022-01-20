module['exports'] = function(constructs){
    const self = this;

    self.getNumber = function(options){
        let type = (options && options.hasOwnProperty('type') ? options.type : null);

        if(type === null){
            type = constructs.id(1,4);
        }

        switch(type)
        {
            case 1:
            case 'maestro':

                return self.getMaestro();

            case 2:
            case 'mastercard':

                return self.getMastercard();

            case 3:
            case 'visa':

                return self.getVisa();

            case 'amex':
            default:

                return self.getAmex();
        }
    }

    self.getMaestro = function(){
        return constructs.loadRessource('credit_card', 'maestro');
    };

    self.getMastercard = function(){
        return constructs.loadRessource('credit_card', 'mastercard');
    };

    self.getAmex = function(){
        return constructs.loadRessource('credit_card');
    };

    self.getVisa = function(){
        return constructs.loadRessource('credit_card', 'visa');
    };
};
