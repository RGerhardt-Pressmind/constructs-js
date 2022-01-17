module['exports'] = function(constructs){
    const self = this;

    self.getName = function(){
        return constructs.loadRessource('name');
    }

    self.getFirstName = function(){
        let fn = constructs.loadRessource('name', 'first_names');

        return fn.charAt(0).toUpperCase()+fn.substr(1);
    }

    self.getSurName = function(){
        let sn = constructs.loadRessource('name', 'sur_names');

        return sn.charAt(0).toUpperCase()+sn.substr(1);
    }

    self.getSalutation = function(){
        return constructs.loadRessource('name', 'salutations');
    }

    self.getTitle = function(){
        return constructs.loadRessource('name', 'titles');
    }
}

