const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require('mongoose');

const helmet=require('helmet');
const cors=require('cors');
const {check,validationResult}=require('express-validator')

const UsersSchemas=require('./Schema/users.js');
const bcrypt=require('bcryptjs');
const app=express()
app.use(cors());
app.use(bodyParser.json());

app.use(express.json({ extended: false }));

app.use(express.static('.'));
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }))
const DB = "mongodb+srv://afeef:afeef%401180@cluster0.ch7sc.mongodb.net/UserMan?retryWrites=true&w=majority";
const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB,{

            useNewUrlParser: true,
            useUnifiedTopology: true,
            

        })
        console.log("MongoDB is connected");
    } catch(error){
        console.log(error);

        process.exit(1);
    }
}
connectToDatabase();

app.get('/',(req,res)=>{
    res.json('it is working')
})
app.post('/readbyPass',
[
    check('username','type your username').not().isEmpty(),
    check('password','Password is required').not().isEmpty()

],
async (req,res)=>{
    try{
        const {username,password}=req.body;
        let user=await UsersSchemas.findOne({username:username});
        if (!user){
            return res.status(401).json('Not Found')
        }
        let ispasscorr=await bcrypt.compare(password,user.password);
        if (ispasscorr===true){
            res.json(user)
        }
        else{
            res.status(401).json('wrong password');
        }
    }catch(error){
        console.log(error.message)
        return res.status(500).json({msg:'server error ...'})
    }
    

    
})
app.post('/create',
[
    check('username','type your username').not().isEmpty(),
    check('password','Password is required').not().isEmpty(),
    check('name','Name is required').not().isEmpty(),
],
   async (req,res)=>{
    try{
    let {username,password,name}=req.body;
    let user= await UsersSchemas.findOne({username:username});
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(401).json({errors : errors.array()});
    }
    if (user){
        return res.status(401).json("present")
    }

    const salt=await bcrypt.genSalt(10);
    password=await bcrypt.hash(password,salt);
    user= new UsersSchemas(
        {
            username,
            password,
            name
        }
    )
    await user.save();

    res.json(user)

    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({msg:'server error ...'})
    }
});
app.post('/readbyId/:id', async(req,res) => {
    let {id}=req.params;
    let found=false;
    const user=await UsersSchemas.findById(id,{password:0});
    if(user){
        found=true;
        res.json(user);
    }
    if (! found){
        res.status(404).json('no such users')
    }

})
app.put('/update/:id',async(req,res)=>{
    const {id}=req.params;
    const {username,name}=req.body;
    let found=false;
    const user=await UsersSchemas.findById(id,{password:0});
    if(user){
        found=true;
        var data=await UsersSchemas.findByIdAndUpdate(id,{username,name},{new:true});
        const data2=await UsersSchemas.findById(id,{password:0});
        res.json(data2);
    }
    if (! found){
        res.status(404).json('no such users')
    }
})
app.post(
    '/delete',
    async (req,res) => {
        let {user_id} = req.body;

        var data = await UsersSchemas.findByIdAndDelete(user_id);
        var data2 = await UsersSchemas.findById(user_id);

        res.send(data2);
    }
);

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})