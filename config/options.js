
import { chatModels } from "../mongo/models/chat.js"

const options = {


    mongo: {
        chat: chatModels,
    },
    fileSystem: {
        chat: "chat.txt"
    }
}

export { options }