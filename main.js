const {v4: uuidv4} = require("uuid");
const randomId = uuidv4(); //cada vez que llamamos a la variable randomID se llamara a la funcion que generara el ID
const fs = require("fs")  //para poder usar el archivo
const data = fs.readFileSync("./Clientes.json")  //Aqui agarramos TODA la info del archivo
const randomstring = require("randomstring"); 
const names = require("random-names-generator"); //una paqueteria que genera nombres random


//En un Json existente agrega un nuevo usuario a ese archivo

const createUser = () => {

    //Se crea el objeto Usuario con un objeto separado cuentas que se le agregara al objecto Usuario
    //(con ID, nombre, cuentas[folio, contraseña, saldo]) 

    const newUser = {
        id: randomId,
        name: names.random(),
        cuentas: [],
    }

    const cuentas = {
        folio: randomstring.generate(9),
        password: randomstring.generate(15),
        saldo : Math.floor(Math.random() * 10000) 
    }

    newUser.cuentas.push(cuentas);

    //Recuperamos la info del archivo JSON y a ese "Objeto" le agregamos el nuevo usuario

    const newData = JSON.parse(data)  //Como el data nos devolvera el raw data o puros numeros lo parseamos para que sea legible
    newData.users.push(newUser);

    //Y re-escribimos el archivo json con el nuevo objeto ya agregado

    fs.writeFile("./Clientes.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) throw err;
        console.log("The data has been saved!")
    })
}

const createAccount = (name) => {

    let isIn = false;  //Una variable tipo booleana que hace de sentinela para agregar la cuenta a un usuario

    //se genera una cuenta nueva

    const cuenta = {
        folio: randomstring.generate(9),
        password : randomstring.generate(15),
        saldo: Math.floor(Math.random() * 10000)
    }

    const newData = JSON.parse(data);

    //Checamos si el nombre proporsionado existe en el archivo iterando en cada nombre en el array de usuarios

    for (let user of newData.users){
        if (name == user.name) {
            user.cuentas.push(cuenta);
            isIn = true;
        }
    }

    //De no haber coincidencias imprimimos eso y salimos de la funcion

    if(!isIn){
        console.log("No hay coincidencias");
        return;
    }

    //En caso contrario se habra agregado la cuenta en el lugar correcto y guardamos el archivo

    fs.writeFile("./Clientes.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) throw err;
        console.log("The data has been saved!")
    })

}

//La funcion de Create en la que especificas si es crear un usuario o una cuenta para un usuario

const createClient = (choice, name) => {
    choice == "user" ? createUser() : createAccount(name);
}

//funcion para actaulizar la cuenta de un usuario (se actualiza el folio y el saldo dentro de la cuenta)

const updateAccount = (name, accountID) => {

    let isIn = false;
    const newData = JSON.parse(data);

    //una iteracion que primero checa que el nombre proporcionado exista y si se encuentra
    //otra iteracion que checa si el folio proporcionado se encuentra en el en la lista de cuentas del usuario

    for (let user of newData.users){
        if (name == user.name){
            for (let cuenta of newData.users.cuentas){
                if(accountID ==  cuenta.folio){
                    cuenta.folio = randomstring.generate(9);
                    cuenta.saldo = Math.floor(Math.random() * 5000);
                    isIn = true;
                }
            }
        } 
    }

    if(!isIn) {
        console.log("No hay coincidencias");
        return;
    }

    fs.writeFile("./Clientes.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) throw err;
        console.log("The data has been saved!")
    })


}

//Una funcion para cambiar el nombre del usuario

const updateUser = (name) => {

    let isIn = false;
    const newData = JSON.parse(data);
    
    //Buscar si el nombre proporcionado coincide con un usuario existente y si es asi cambiar el nombre

    for (let user of newData.users){
        if (name == user.name){
            user.name = names.random();
            isIn = true;
        }
    }

    if (!isIn) {
        console.log("No hay coincidencias");
        return;
    }

    fs.writeFile("./Clientes.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) throw err;
        console.log("The data has been saved!")
    })

}

//Funcion para elegir que queremos actualizar

const update= (choice, name, account) => {
    choice == "user" ? updateUser(name) : updateAccount(name, account);
}

//funcion que elimina a un usuario

const deleteUser = (name) => {
    let newData = JSON.parse(data);  //no es const porque quiero reasignarle un valor en caso de que sea necesario
    let saldo = 0;  //seria una condicional 
    let userTarget = {} //el objeto que sera un filtrador
    let isIn = false;

    //un iteracion que pasa por cada usuario y checa si los nombres coinciden en caso de no encontrarlo en cada ciclo simplemente 
    //saltara a la siguiente iteracion hasta que acabe 

    for (let user of newData.users){
        if(name != user.name) continue;
        userTarget = user;   //en caso de encontrar match se copiara el objeto al filtrador 
        isIn = true;
        for (let cuenta of user.cuentas){
            saldo += cuenta.saldo; //y se pasara por cada cuenta sumando su saldo para ser el condicional
        }
    }

    //En caso de que no se haya encontraro el usuario se saldra de la funcion

    if(!isIn){
        console.log("No existen coincidencias");
        return;
    }

    //En caso de que si exista el usuario pero el saldo de este en sus cuentas conjuntas no es cero no se le permitira eliminarla

    if(saldo != 0) {
        console.log(`Usted cuenta con un saldo de ${saldo} en todas sus cuentas, por lo tanto no puede eliminar la cuenta`);
        return;
    }

    //En caso de que los filtros hayan sido pasados se reasignara al objeto el valor pero filtrando los que coincidan con el user

    newData = newData.users.filter((user) => {
        return user != userTarget;
    })

    fs.writeFile("./Clientes.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) throw err;
        console.log(`El cliente ${userTarget.name} fue exitosamente eliminado`);
    })
    
}

const deleteAccount = (name,account) => {
    let newData = JSON.parse(data);
    let isIn = false;

    //Una iteracion que checa que si existe el usuario y dentro si existe la cuenta y si la cuenta esta en ceros

    for (let user of newData.users){
        if(name != user.name) continue;
        for (let cuenta of user.cuentas){
            if (account != cuenta.folio) continue;
            if (cuenta.saldo == 0) isIn = true;
        }
    }

    if(!isIn) {
        console.log(`La cuenta con el folio ${account} del usuario ${name} cuenta con Saldo por lo tanto no puede ser eliminada`);
        return;
    }

    newData = newData.users.cuentas.filter((cuenta) => {
        return cuenta.folio != account
    })

    fs.writeFile("./Clientes.json", JSON.stringify(newData, null, 2), (err) => {
        if(err) throw err;
        console.log(`El cliente ${userTarget.name} fue exitosamente eliminado`);
    })
}

//funcion para elegir que se quiere eliminar si usuario o una cuenta en especifico

const erase = (choice, name, account)=> {
    choice == "user" ? deleteUser(name) : deleteAccount(name, account);
}

//Funcion que regresa a todos los usuarios registrados hasta el momento 

const printUsers = () => {
    const Users = JSON.parse(data)
    for (let user of Users.users){
        console.log(user)
    }
}