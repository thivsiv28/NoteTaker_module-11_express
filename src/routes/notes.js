const notes = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const {
  readFromFile,
  readAndAppend,
  writeToFile,
} = require('../helpers/fsUtils');

// GET Route for retrieving all the notes
// see here, we have promise. annoying. express allows async aeasily
notes.get('/', async (req, res) => { //mark as asyn
  res.json(await getDbData());
});

// GET Route for a specific note
notes.get('/:id', async (req, res) => {
  const noteId = req.params.id;
  const json = await getDbData();

  const result = json.filter((note) => note.id === noteId);
  return result.length > 0
    ? res.json(result)
    : res.json('No note with that ID');
});


// DELETE Route for a specific note
notes.delete('/:id', async (req, res) => {
  const noteId = req.params.id;
  const json = await getDbData();

  // Make a new array of all notes except the one with the ID provided in the URL
  const result = json.filter((note) => note.id !== noteId);

  // Save that array to the filesystem
  writeToFile('./src/db/db.json', result);

  // Respond to the DELETE request
  res.json(`Note ${noteId} has been deleted 🗑️`);
});

// POST Route for a new UX/UI note
notes.post('/', (req, res) => {
  console.log(req.body);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    readAndAppend(newNote, './src/db/db.json');
    res.json(`Note added successfully 🚀`);
  } else {
    res.error('Error in adding note');
  }
});

// convinient method
const getDbData = async () => {
  const data = await readFromFile('./src/db/db.json');
  const json = JSON.parse(data);

  return json;
};

module.exports = notes;
