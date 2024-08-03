const express = require('express')
const app = express();
const http = require("http")
const path = require("path")

const socketio = require("socket.io")
const server = http.createServer(app);
const io = socketio(server)

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))

/**
 * Handles socket.io connections and events.
 */
io.on("connection", function (socket) {
    /**
     * Listens for the "send-location" event from the client.
     * Emits the "receive-location" event to all connected clients with the location data.
     *
     * @param {Object} data - The location data sent by the client.
     */
    socket.on("send-location", function (data) {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    console.log("connected");

    /**
     * Listens for the "disconnect" event from the client.
     * Emits the "user-disconnected" event to all connected clients with the disconnected user's socket ID.
     */
    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id);
    });
});

/**
 * Route handler for the root path ("/").
 * Renders the "index" view.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get("/", function (req, res) {
    res.render("index");
});

server.listen(3000)