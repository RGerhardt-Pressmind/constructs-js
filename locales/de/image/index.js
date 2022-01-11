module['exports'] = {
    run: function(parameter = null){
        let maxImages   =   74;
        let folder      =   'avatar';

        if(parameter && parameter.type)
        {
            folder  =   parameter.type;

            switch(parameter.type)
            {
                case 'animal':

                    maxImages   =   22;

                break;
                case 'city':

                    maxImages   =   22;

                break;
                case 'human':

                    maxImages   =   17;

                break;
                case 'nature':

                    maxImages   =   40;

                break;
                case 'technic':

                    maxImages   =   22;

                break;
            }
        }

        return ['https://d22kzm8dnmp26q.cloudfront.net/'+folder+'/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }
};
