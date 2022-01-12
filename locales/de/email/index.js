module['exports'] = {
    items: ['{first_name:default}@{email:suffix}'],

    after: function(item){
        return item.charAt(0).toLowerCase()+item.slice(1);
    }
}
