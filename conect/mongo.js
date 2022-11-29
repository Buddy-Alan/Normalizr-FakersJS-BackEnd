import mongoose from "mongoose";

export const conectMongo = () => {
    const url = "mongodb://127.0.0.1:27017/chatMongo"
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
        error => {
            if (error) throw new Error(`Conexion fallida ${error}`);
            console.log("conexion base de datos exitosa!")
        })

    console.log("base de datos conectada")
}

