import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import productRouter from "./src/routes/rutasProductos.js";
import { contenedorDaoChat } from "./daos/index.js";
import { normalize, schema } from "normalizr";
import { conectMongo } from "./conect/mongo.js";

conectMongo()
const claseChats = contenedorDaoChat


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = app.listen(8080, () => {
    console.log("server on port 8080")
})

const io = new Server(server)

//Schema normalizr
//schema para author
const authorEsquema = new schema.Entity("authors", {}, { idAttribute: "email" })
//Schema para mensajes
const schemaMessage = new schema.Entity("messages", { author: authorEsquema })
//Schema global
const schemaGlobal = new schema.Entity("globalChat", {
    messages: [schemaMessage]
}, { idAttribute: "id" })

//Funcion para normalizar datos
const dataNormalizer = (data) => {
    const normalizeData = normalize({ id: "chatHistory", messages: data }, schemaGlobal)
    return normalizeData
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const carritoRouter = require("./routes/routerCarts")
// app.use("/api/productos-test", productTest)
// app.use("/api/carrito", cartRout)
// app.use("/api/productos", productRout)
app.engine("handlebars", engine());
app.set("views", "./src/views")
app.set("view engine", "handlebars")
app.use("/", productRouter)
app.use(express.static(__dirname + "/src/views/layouts"))

io.on("connection", async (socket) => {
    try {
        const chatNormalizer = await claseChats.obtenerMensajes()

        const historicoDelChat = dataNormalizer(chatNormalizer)
        //     socket.on("envioProducto", async (datoRecibido) => {
        //         try {
        //             // await contenedorProducts.save(datoRecibido)
        //             // actualizarProductos = await contenedorProducts.getAll()
        //             socket.emit("todosLosProductos", actualizarProductos)
        //         } catch (error) {
        //             res.status(500).send("Hubo un error en el Servidor")
        //         }
        //     })
        socket.broadcast.emit("newUser", socket.id)
        if (historicoDelChat) {
            socket.emit("todosLosMensajes", historicoDelChat)
        }
        socket.on("envioMensajesFront", async (datoCliente) => {
            try {
                await claseChats.agregarMensaje(datoCliente)
                const chatNormalizer = await claseChats.obtenerMensajes()
                const allChats = dataNormalizer(chatNormalizer)
                io.sockets.emit("todosLosMensajes", allChats)
            } catch (error) {
                console.log(error)
            }
        })
    } catch (error) {
        console.log(error)
    }
})
