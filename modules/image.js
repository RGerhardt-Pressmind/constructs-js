module['exports'] = function(constructs){
    const self = this;

    self.getImage = function(options){
        const type = (options && options.type) ? options.type : 'avatar';

        if(type === 'animal'){
            return self.getAnimalImage();
        } else if(type === 'city') {
            return self.getCityImage();
        } else if(type === 'human') {
            return self.getHumanImage();
        } else if(type === 'nature') {
            return self.getNatureImage();
        } else if(type === 'technic') {
            return self.getTechnicImage();
        }

        return self.getAvatarImage()
    }

    self.getAvatarImage = function(){
        const maxImages = 74;
        return ['https://d22kzm8dnmp26q.cloudfront.net/avatar/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }

    self.getAnimalImage = function(){
        const maxImages = 22;
        return ['https://d22kzm8dnmp26q.cloudfront.net/animal/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }

    self.getCityImage = function(){
        const maxImages = 22;
        return ['https://d22kzm8dnmp26q.cloudfront.net/city/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }

    self.getHumanImage = function(){
        const maxImages = 17;
        return ['https://d22kzm8dnmp26q.cloudfront.net/human/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }

    self.getNatureImage = function(){
        const maxImages = 40;
        return ['https://d22kzm8dnmp26q.cloudfront.net/nature/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }

    self.getTechnicImage = function(){
        const maxImages = 22;
        return ['https://d22kzm8dnmp26q.cloudfront.net/technic/'+(Math.floor(Math.random() * (maxImages - 1 + 1) + 1))+'.jpg'];
    }
}
