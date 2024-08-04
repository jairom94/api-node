const mongoose = require('mongoose');
const notesstatics = [
    {
        content:'Css es difícil.',
        important:true
    },
    {
        content:'Mongoose hace las cosas por nosotros.',
        important:true
    },
    {
        content:'React es muy fácil de aprender.',
        important:true
    }
];

const TYPE_MODEL = {
    note:'note',
    person:'person',
    read:'read'
}


if(process.argv.length < 3){
    console.log('Dame un tipo de modelo como argumentos');
    process.exit(1);
}

//jairom94
//R6vy5ex5VGJDNuYK

const typeModel = process.argv[2];

//const password = process.argv[2];
const url = `mongodb+srv://jairom94:R6vy5ex5VGJDNuYK@clustermongotest.blhdvos.mongodb.net/?retryWrites=true&w=majority&appName=clustermongotest`
mongoose.set('strictQuery',false);
mongoose.connect(url);

let schema = {}
let nameModel = ''
if(TYPE_MODEL.person === typeModel){
    schema.name = String;
    schema.number = String;
    nameModel = 'Person';
}
else if(typeModel === TYPE_MODEL.note){
    schema.content = String;
    schema.important = Boolean;
    nameModel = 'Note'    
}

const modelSchema = new mongoose.Schema(schema);

const Model = mongoose.model(nameModel,modelSchema);

if(process.argv[3] === 'read'){
    console.log(Model);
    console.log(nameModel);
    Model.find({}).then((result)=>{
        console.log(result);
        mongoose.connection.close();
    });
    //process.exit(1);
    return;
}


const data = {}
for(let i = 3; i < process.argv.length;i++){
    data[Object.keys(schema)[i-3]] = process.argv[i];    
}

const model = new Model(data);

model.save()
    .then((result)=>{
        console.log(`${nameModel} guardada.`);
        mongoose.connection.close();
    });
