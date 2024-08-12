let users = [
    {
        id:'1',
        name:'Juan',
        apellido:'Perez'
    },
    {
        id:'2',
        name:'Maria',
        apellido:'Gomez'
    },
    {
        id:'3',
        mane:'Mabel',
        apellido:'Sanchez'
    },
    {
        id:'4',
        mane:'Lucia',
        apellido:'Vallejo'
    },
    {
        id:'5',
        mane:'Miguel',
        apellido:'Devabter'
    }
]

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


/*
const http = require('http');
const app = http.createServer((request,response)=>{
    response.writeHead(200,{'Content-type':'application/json'});
    response.end(JSON.stringify(respJson));
});


app.listen(PORT);
console.log(`Servidor escuchando en el puerto ${PORT}`);
*/
//COnfigurando variables de entorno


require('dotenv').config();
//Server con Express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

//Gestion de Midleware Libreiria
const morgan = require('morgan');
app.use(morgan('tiny'));

const htmlResp = `
        <p style="color:red;">Hola mundo</p>
`

app.get('/',(req,res)=>{
    res.send(htmlResp)
});

app.get('/api/users',(req,res)=>{
    res.send(users);
});


app.get('/api/users/:id',(req,res)=>{
    const id = req.params.id;
    const user = users.find((user)=> user.id === id);
    if(!user) return res.status(404).send({'error':'User not found.'})
    res.send(user);
});

//DELETE
app.delete('/api/users/:id',(req,res)=>{
    const id = req.params.id;
    users = users.filter((user)=> user.id !== id);
    console.log(users);
    res.status(204).send(users);
});

//POST
app.use(express.json()); //Parsear JSON
//MIDLEWARE
const requestData = (req,res,next) => {
    //console.log(req.method)
    //console.log(req.path)
    //console.log(req.body)
    next();
};

//app.use(requestData);

app.post('/api/users',(req,res)=>{
    const user = req.body;
    //console.log(user);
    const maxID = Math.max(...users.map(u => Number(u.id))); 
    user.id = (maxID +1).toString();    
    users.push(user);
    res.send(users);
});


//Practica
//Uso de base de datos Moongo DB
const mongoose = require('mongoose');
const url = process.env.MONGODB_URI//`mongodb+srv://jairom94:R6vy5ex5VGJDNuYK@clustermongotest.blhdvos.mongodb.net/?retryWrites=true&w=majority&appName=clustermongotest`
mongoose.set('strictQuery',false);
mongoose.connect(url)
.then(()=>{
    console.log('Conectado a la base de datos.')
})
.catch((error)=>{
    console.log('No se pudo conectar a la base de datos.', error)
});
const personSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:3
    },
    number:{
        type:String,
        required:true,
        minlength:8,
        validate:{
            validator:function(v){
                return /^\d{2,3}-\d{7,8}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    }    
});


const Person = mongoose.model('Person',personSchema);


//ALL persons
app.get('/api/persons',(req,res)=>{
    Person.find({},'-__v').then((persons_)=>{
        res.json(persons_);
        //mongoose.connection.close();
    })    
});

//INfo 
app.get('/api/info',(req,res)=>{
    const totalPersons = persons.length;
    const date = new Date();
    res.send(`Phonebook has info for ${totalPersons} people <br> ${date}`)
});
//Obtener un elemento
app.get('/api/persons/:id',(req,res,next)=>{    
    const id = req.params.id;
    //persons.find(p => p.id === id);
    //let person = null;
    Person.findById(id,'-__v')
    .then((person_)=>{
        if(person_){
            res.json(person_);
        }else{
            res.status(404).end();
        }
    })
    .catch((error)=>{
        //console.log(error);
        //res.status(400).send('Not found.').end();
        //Enviar a gestion por midlelware
        next(error);
    })
    /*
    if(!person) return res.status(404).send({'error':'Person not found.'})
    res.send(person);
    */
});
//DELETE
app.delete('/api/persons/:id',(req,res,next)=>{
    const id = (req.params.id);
    /*const auxPerson = persons.find(p => p.id === id);
    if(!auxPerson) return res.status(404).send({'error':'Person not found.'});
    persons = persons.filter(p => p.id !== id);    
    res.json(persons);*/
    Person.findByIdAndDelete(id)
    .then(result =>{
        res.status(204).end();
    })
    .catch(error => next(error));
    
});

function generateID(data){
    const maxID = Math.max(...data.map(u => Number(u.id))); 
    return (maxID +1);
}

function isRequired(modelField,dataRequest){    
    const fieldsRequired = Object.keys(modelField);
    const fieldRequest = Object.keys(dataRequest);
    const errorRequired = {}
    fieldsRequired.forEach((freq) => {
        if(!fieldRequest.includes(freq) && freq !== 'id'){
            errorRequired[freq] = `${freq} is required.`;
        }
    })
    return errorRequired;     
}

function fieldExist(data,dataRequest){
    const keysDataRequest = Object.keys(dataRequest);
    const fieldsExist = {}
    for(let row of data){
        //console.log(row)
        for(index of keysDataRequest){
            //console.log(row[index], dataRequest[index])
            if(row[index] === dataRequest[index]){
                //console.log(row[index], dataRequest[index])
                fieldsExist[index] = `${index} already exists.`;                
                //return true;                
            }                
        }
    }
    return fieldsExist;
}
//Create person
app.post('/api/persons',(req,res,next)=>{
    const person = req.body;    
    const person_ = new Person({
        name:person.name,
        number:person.number
    })
    person_.save()
    .then(personSave => {
        res.json(personSave);
    })
    .catch(error => next(error))
});

app.put('/api/persons/:id',(req,res,next)=>{
    const id = req.params.id;
    const {name,number} = req.body;
    const person_ = {
        name:req.body.name,
        number:req.body.number
    }
    Person.findByIdAndUpdate(id,{name,number},{new:true,runValidators:true}) 
    .then(result => {
        res.json(result)
    })
    .catch(error => next(error));
})

//RUTAS NO ENCONTRADAS
const unknowEndpoint = (req,res) => {
    res.status(404).send({'error':'Endpoint not found.'});
}





app.use(unknowEndpoint);
//MIDLEWARE gestion de errores
const errorHandler = (error, req, res, next) => {
    console.error(error.message);
    if(error.name === 'CastError'){
        return res.status(404).send({error:'malformatted id'});
    }
    if(error.name === 'ValidationError'){
        return res.status(400).json({error:error.message});
    }
    next(error);
}
app.use(errorHandler);



app.listen(PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});