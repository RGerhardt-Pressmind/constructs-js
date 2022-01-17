module['exports'] = function(constructs){
    const self = this;

    self.getEmail = function(){
        let email = constructs.loadRessource('email');

        return email.charAt(0).toLowerCase()+email.substr(1);
    };

    self.getSuffix = function(){
        return constructs.loadRessource('email', 'suffix');
    }
}
