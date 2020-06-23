const express = require('express')
const fetch = require('node-fetch')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000;

let songData = []

const lookup = async (term, media, entity, attribute) => {
    const query = `https://itunes.apple.com/search?term=${term}&media=${media}&entity=${entity}&attribute=${attribute}&limit=200`;
    const fetchRes = await fetch(query);
    if (!fetchRes.ok) {
        throw new Error();
    }
    return (await fetchRes.json()).results;
}

const term = "lamb of god"
const attribute = "artistTerm"
const entity = "song"
const media = "music"

lookup(term, media, entity, attribute).then(result => {
    songData = result.map((item, i) => {
        if (i === 0) {
            console.log(item)
        }
        return {
            id: item.trackId,
            name: item.trackName,
            albumName: item.collectionName,
            albumId: item.collectionId,
        }
    });
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
}).catch(error => {
    console.log(error)
})


app.get("/songs", (req, res) => {
    const { name, albumId, albumName } = req.query;


    let songReturn = [...songData];

    if (name) {
        songReturn = songReturn.filter((song) => {
            return song.name.toUpperCase().includes(name.toUpperCase())
        })
    }
    if (albumId) {
        songReturn = songReturn.filter((song) => {
            return song.albumId == albumId;
        })
    }
    if (albumName) {
        songReturn = songReturn.filter((song) => {
            return song.albumName.toUpperCase().includes(albumName.toUpperCase())
        })
    }
    res.send(songReturn)

})

app.get("/songs/:id", (req, res) => {
    const result = songData.find(item => item.id == req.params.id)
    if (result) {
        res.send(result)
    } else {
        res.sendStatus(404)
    }
})


app.patch("/songs/:id", bodyParser.json(), (req, res) => {

    const result = songData.find(item => item.id == req.params.id);
    result.name = req.body.name || result.name;
    result.albumName = req.body.albumName || result.albumName;
    result.albumId = req.body.albumId || result.albumId;
    res.sendStatus(200);
})

app.delete("/songs/:id", (req, res) => {
    songData = songData.filter(item => item.id != req.params.id);
    res.status(200).send(`${req.params.id} deleted`);
})

app.post("/songs", bodyParser.json(), (req, res) => {
    const newData = {
        id: Math.floor((Math.random() * 10 ** 10)),
        name: req.body.name,
        albumName: req.body.albumName,
        albumId: req.body.albumId,
    }
    songData.push(newData) 
    res.send({newItemUrl:`http://localhost:3000/songs/${newData.id}`})
})