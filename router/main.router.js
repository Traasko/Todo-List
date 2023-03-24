const router = require('express').Router();
const authorization = require('../middlewares/auth.mid');
const isListIdInDB = require('../middlewares/isListIdInDB.mid');
const isTodoIdInDB = require('../middlewares/isTodoIdInDB.mid');
const List = require('../models/list.model');

// liste des tâches
let tasks = [];

// Left sidebar
router.get('/list', authorization, async (req, res, next) => {
    try {
        const foundLists = await List.find();
        res.status(200).json(foundLists);
    } catch (error) {
        next(error);
    }
});

router.get('/:listId', async (req, res, next) => {
    try {
        const { listId } = req.params;
        const foundList = await List.findById(listId);
        if (!foundList) {
            return res.status(404).json({ message: 'list not found' });
        }
        res.status(200).json(foundList);
    } catch (error) {
        next(error);
    }
});

router.post('/list/create', async (req, res, next) => {
    try {
        const list = req.body;
        const listModelKeys = ['userId', 'title'];
        const isEveryKeyInRequest = requiredListKeys.every((key) =>
            Object.keys(list).includes(key)
        );
        if (!isEveryKeyInRequest) {
            return res.status(422).json({
                message: 'need 1 key : userId',
            });
        }
        const ans = await List.create(List);
        res.status(201).json(ans);
    } catch (error) {
        next(error);
    }
});

router.patch(
    '/:listId',
    authorization,
    isListIdInDB,
    async (req, res, next) => {
        try {
            const todoFromRequest = req.body; // TODO: Faire fichier service pour éviter de répéter le code
            const todoModelKeys = ['listId', 'content', 'text'];
            const isKeysValid = Object.keys(req.body).every((bodyKey) =>
                requiredListKeys.includes(bodyKey)
            );
            if (!isKeysValid) {
                return res.status(422).json({
                    message: 'authorized keys',
                });
            }
            const ans = await List.findByIdAndUpdate(
                req.params.listId,
                req.body,
                {
                    new: true,
                }
            );
            res.status(200).json({
                message: 'todo updated !',
                updatedList: ans,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/:listId', isListIdInDB, async (req, res, next) => {
    try {
        await List.findByIdAndDelete(req.params.listId);
        return res.status(202).json({ message: 'todo deleted !' });
    } catch (error) {
        next(error);
    }
});

// Main content
router.get('/', (req, res) => {
    res.send(`
        <h1>Section principale</h1>
        <p>Cette région se situe au centre de la page et permet d'afficher toutes les tâches d'une liste sélectionnée depuis la left sidebar.</p>
        <ul>
          ${tasks.map((task) => `<li>${task.description}</li>`).join('')}
        </ul>
        <form method="post" action="/tasks">
          <h2>Créer une tâche</h2>
          <label>Description courte (obligatoire)</label>
          <input type="text" name="description" required>
          <label>Description longue (optionnelle)</label>
          <input type="text" name="details">
          <label>Date d'échéance (obligatoire)</label>
          <input type="date" name="dueDate" required>
          <button type="submit">Créer</button>
        </form>
      `);
});

router.post('/tasks', (req, res) => {
    const { description, details, dueDate } = req.body;
    tasks.push({ description, details, dueDate, done: false });
    res.redirect('/');
});

router.post('/tasks/:id/fini', (req, res) => {
    const id = parseInt(req.params.id);
    tasks[id].done = true;
    res.redirect('/task/:id');
});

router.get('/fini', (req, res) => {
    const doneTasks = tasks.filter((task) => task.done);
    res.send(`
        <h1>Mes tâches terminées</h1>
        <ul>
          ${doneTasks.map((task) => `<li>${task.description}</li>`).join('')}
        </ul>
        <form method="post" action="/tasks/${doneTasks.length}">
          <button type="submit">Retourner une tâche</button>
        </form>
      `);
});

router.post('/tasks/:id/pasfini', (req, res) => {
    const id = parseInt(req.params.id);
    tasks[id].done = false;
    res.redirect('/tasks/:id');
});

router.get('/taches/:id', (req, res) => {
    const taskId = req.params.id;
    const tache = {
        nom: 'Nom de la tâche',
        description: 'Description de la tâche',
        date: new Date(),
        id: taskId,
    };
    res.send(`
    <h1>${tache.nom}</h1>
    <p>${tache.description}</p>
    <p>Créée le ${tache.date.toLocaleDateString()}</p>
    <form action="/taches/${tache.id}" method="post">
      <button type="submit" onclick="return confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')">Supprimer</button>
      <input type="hidden" name="_method" value="DELETE">
    </form>
  `);
});

router.delete('/taches/:id', (req, res) => {
    const taskId = req.params.id;
    res.redirect('/taches');
});

module.exports = router;
